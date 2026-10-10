import { Server as SocketIOServer } from 'socket.io';
import {
  RoomState,
  RaceParticipant,
  SupportedLanguage,
  RaceDifficulty,
  RaceResultSummary,
  CAR_SKINS,
} from '../../shared/types.ts';
import { getRandomText } from './TextBank.ts';
import { RaceEngine } from './RaceEngine.ts';
import { store } from '../storage/store.ts';

export class RoomManager {
  private io: SocketIOServer;
  private rooms: Map<string, RoomState> = new Map(); // roomId -> RoomState
  private roomByCode: Map<string, string> = new Map(); // roomCode -> roomId
  private socketToRoom: Map<string, { roomId: string; participantId: string }> = new Map();
  private countdownTimers: Map<string, NodeJS.Timeout> = new Map();
  private broadcastIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(
    name: string,
    isPrivate: boolean,
    language: SupportedLanguage,
    difficulty: RaceDifficulty,
    maxPlayers: number,
    host: { id: string; username: string; isGuest: boolean; carId: string; socketId: string }
  ): RoomState {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let code = this.generateRoomCode();
    while (this.roomByCode.has(code)) {
      code = this.generateRoomCode();
    }

    const textItem = getRandomText(language, difficulty);

    const participant: RaceParticipant = {
      id: `p_${host.id}_${Date.now()}`,
      socketId: host.socketId,
      userId: host.id,
      username: host.username,
      isGuest: host.isGuest,
      carId: host.carId || CAR_SKINS[0].id,
      isReady: false,
      progress: 0,
      typedChars: 0,
      correctChars: 0,
      errorCount: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      isFinished: false,
    };

    const room: RoomState = {
      id: roomId,
      code,
      name: name || 'Speedway Arena',
      isPrivate,
      status: 'WAITING',
      hostId: host.id,
      maxPlayers: Math.max(2, Math.min(8, maxPlayers)),
      minPlayers: 2,
      language,
      difficulty,
      text: textItem,
      countdownSeconds: 3,
      startTime: null,
      endTime: null,
      participants: {
        [participant.id]: participant,
      },
      results: [],
    };

    this.rooms.set(roomId, room);
    this.roomByCode.set(code, roomId);
    this.socketToRoom.set(host.socketId, { roomId, participantId: participant.id });

    return room;
  }

  findOrCreatePublicRoom(
    language: SupportedLanguage,
    difficulty: RaceDifficulty,
    player: { id: string; username: string; isGuest: boolean; carId: string; socketId: string }
  ): RoomState {
    // Look for existing public room in WAITING state with free slot
    for (const room of this.rooms.values()) {
      const pCount = Object.keys(room.participants).length;
      if (
        !room.isPrivate &&
        room.status === 'WAITING' &&
        room.language === language &&
        pCount < room.maxPlayers
      ) {
        return this.joinRoom(room.id, player);
      }
    }

    // Otherwise create new public room
    return this.createRoom('Public Speedway', false, language, difficulty, 4, player);
  }

  joinRoom(
    roomIdOrCode: string,
    player: { id: string; username: string; isGuest: boolean; carId: string; socketId: string }
  ): RoomState {
    let roomId = roomIdOrCode;
    if (this.roomByCode.has(roomIdOrCode.toUpperCase())) {
      roomId = this.roomByCode.get(roomIdOrCode.toUpperCase())!;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Xona topilmadi.');
    }

    if (room.status !== 'WAITING') {
      throw new Error('O‘yin allaqachon boshlangan yoki yakunlangan.');
    }

    const participants = Object.values(room.participants);
    if (participants.length >= room.maxPlayers) {
      throw new Error('Xona to‘lgan (maksimum ' + room.maxPlayers + ' kishi).');
    }

    // Check if player already in room (reconnection or duplicate tab)
    const existing = participants.find(p => p.userId === player.id);
    if (existing) {
      existing.socketId = player.socketId;
      existing.disconnected = false;
      this.socketToRoom.set(player.socketId, { roomId: room.id, participantId: existing.id });
      return room;
    }

    // Assign unique car skin if player hasn't chosen a distinct one
    const usedCars = new Set(participants.map(p => p.carId));
    let assignedCar = player.carId;
    if (usedCars.has(assignedCar)) {
      const freeSkin = CAR_SKINS.find(s => !usedCars.has(s.id));
      if (freeSkin) assignedCar = freeSkin.id;
    }

    const participant: RaceParticipant = {
      id: `p_${player.id}_${Date.now()}`,
      socketId: player.socketId,
      userId: player.id,
      username: player.username,
      isGuest: player.isGuest,
      carId: assignedCar,
      isReady: false,
      progress: 0,
      typedChars: 0,
      correctChars: 0,
      errorCount: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      isFinished: false,
    };

    room.participants[participant.id] = participant;
    this.socketToRoom.set(player.socketId, { roomId: room.id, participantId: participant.id });

    return room;
  }

  leaveRoom(socketId: string): { room?: RoomState; leftPlayerId?: string } {
    const mapping = this.socketToRoom.get(socketId);
    if (!mapping) return {};

    const { roomId, participantId } = mapping;
    this.socketToRoom.delete(socketId);

    const room = this.rooms.get(roomId);
    if (!room) return {};

    const participant = room.participants[participantId];
    if (!participant) return {};

    if (room.status === 'WAITING') {
      delete room.participants[participantId];
      // If host left, assign new host or delete room
      const remaining = Object.values(room.participants);
      if (remaining.length === 0) {
        this.destroyRoom(roomId);
        return { leftPlayerId: participantId };
      }
      if (room.hostId === participant.userId) {
        room.hostId = remaining[0].userId;
      }
    } else {
      // Mark as disconnected during race
      participant.disconnected = true;
    }

    return { room, leftPlayerId: participantId };
  }

  setReady(socketId: string, isReady: boolean): RoomState | null {
    const mapping = this.socketToRoom.get(socketId);
    if (!mapping) return null;

    const room = this.rooms.get(mapping.roomId);
    if (!room || room.status !== 'WAITING') return null;

    const participant = room.participants[mapping.participantId];
    if (!participant) return null;

    participant.isReady = isReady;

    // Check if race should start:
    // If all participants are ready and at least 2 players (or 1 player for practice)
    const list = Object.values(room.participants);
    const allReady = list.length >= 1 && list.every(p => p.isReady);

    if (allReady) {
      this.startCountdown(room);
    }

    return room;
  }

  private startCountdown(room: RoomState) {
    if (room.status !== 'WAITING') return;

    room.status = 'COUNTDOWN';
    room.countdownSeconds = 3;

    let countdown = 3;
    this.io.to(room.id).emit('race:countdown', { seconds: countdown });

    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        room.countdownSeconds = countdown;
        this.io.to(room.id).emit('race:countdown', { seconds: countdown });
      } else {
        clearInterval(timer);
        this.countdownTimers.delete(room.id);
        this.startRace(room);
      }
    }, 1000);

    this.countdownTimers.set(room.id, timer);
  }

  private startRace(room: RoomState) {
    room.status = 'RACING';
    room.startTime = Date.now();
    room.endTime = null;
    room.results = [];

    // Reset participant progress
    for (const p of Object.values(room.participants)) {
      p.progress = 0;
      p.typedChars = 0;
      p.correctChars = 0;
      p.errorCount = 0;
      p.wpm = 0;
      p.rawWpm = 0;
      p.accuracy = 100;
      p.isFinished = false;
      delete p.rank;
      delete p.finishTimeMs;
    }

    this.io.to(room.id).emit('race:start', { startTime: room.startTime });
    this.io.to(room.id).emit('room:state', room);

    // Setup 100ms (10Hz) throttled broadcast loop for smooth car movement without network flooding
    const broadcastInterval = setInterval(() => {
      if (room.status !== 'RACING') {
        clearInterval(broadcastInterval);
        this.broadcastIntervals.delete(room.id);
        return;
      }

      const updates = Object.values(room.participants).map(p => ({
        id: p.id,
        progress: p.progress,
        wpm: p.wpm,
        accuracy: p.accuracy,
        isFinished: p.isFinished,
        rank: p.rank,
      }));

      this.io.to(room.id).emit('players:progress', { updates });
    }, 100);

    this.broadcastIntervals.set(room.id, broadcastInterval);
  }

  updatePlayerProgress(
    socketId: string,
    data: { typedLength: number; currentInput: string; errorCount: number; timestamp: number }
  ): boolean {
    const mapping = this.socketToRoom.get(socketId);
    if (!mapping) return false;

    const room = this.rooms.get(mapping.roomId);
    if (!room || room.status !== 'RACING' || !room.startTime) return false;

    const participant = room.participants[mapping.participantId];
    if (!participant || participant.isFinished) return false;

    // Server-Authoritative validation
    const now = Date.now();
    const result = RaceEngine.validateProgress(
      room.text.content,
      data.currentInput,
      data.errorCount,
      room.startTime,
      now
    );

    if (!result.isValid) {
      return false;
    }

    // Apply validated metrics
    participant.typedChars = data.currentInput.length;
    participant.correctChars = result.correctChars;
    participant.errorCount = data.errorCount;
    participant.progress = result.progress;
    participant.wpm = result.wpm;
    participant.rawWpm = result.rawWpm;
    participant.accuracy = result.accuracy;

    // Check if player just finished
    if (result.isFinished && !participant.isFinished) {
      participant.isFinished = true;
      const finishRank = room.results.length + 1;
      participant.rank = finishRank;
      participant.finishTimeMs = now - room.startTime;

      const summary: RaceResultSummary = {
        rank: finishRank,
        userId: participant.userId,
        username: participant.username,
        isGuest: participant.isGuest,
        carId: participant.carId,
        wpm: participant.wpm,
        rawWpm: participant.rawWpm,
        accuracy: participant.accuracy,
        errorCount: participant.errorCount,
        finishTimeMs: participant.finishTimeMs,
      };

      room.results.push(summary);

      // Notify room about player finish
      this.io.to(room.id).emit('player:finished', { player: participant, rank: finishRank });

      // Check if all players finished
      const allDone = Object.values(room.participants).every(p => p.isFinished || p.disconnected);
      if (allDone) {
        this.finishRace(room);
      }
    }

    return true;
  }

  private finishRace(room: RoomState) {
    if (room.status === 'FINISHED') return;

    room.status = 'FINISHED';
    room.endTime = Date.now();

    // Clear broadcast interval
    const interval = this.broadcastIntervals.get(room.id);
    if (interval) {
      clearInterval(interval);
      this.broadcastIntervals.delete(room.id);
    }

    // Save results to store (database)
    store.saveRaceResults(room.id, room.results);

    this.io.to(room.id).emit('race:finished', { results: room.results });
    this.io.to(room.id).emit('room:state', room);
  }

  restartRace(socketId: string): RoomState | null {
    const mapping = this.socketToRoom.get(socketId);
    if (!mapping) return null;

    const room = this.rooms.get(mapping.roomId);
    if (!room || room.status !== 'FINISHED') return null;

    // Pick a fresh text
    room.text = getRandomText(room.language, room.difficulty);
    room.status = 'WAITING';
    room.results = [];
    room.startTime = null;
    room.endTime = null;

    for (const p of Object.values(room.participants)) {
      p.isReady = false;
      p.progress = 0;
      p.typedChars = 0;
      p.correctChars = 0;
      p.errorCount = 0;
      p.wpm = 0;
      p.rawWpm = 0;
      p.accuracy = 100;
      p.isFinished = false;
      delete p.rank;
      delete p.finishTimeMs;
    }

    this.io.to(room.id).emit('room:state', room);
    return room;
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocket(socketId: string): RoomState | undefined {
    const mapping = this.socketToRoom.get(socketId);
    if (!mapping) return undefined;
    return this.rooms.get(mapping.roomId);
  }

  private destroyRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.roomByCode.delete(room.code);
      this.rooms.delete(roomId);
    }
  }

  getPublicRoomsSummary() {
    return Array.from(this.rooms.values())
      .filter(r => !r.isPrivate && r.status === 'WAITING')
      .map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        playerCount: Object.keys(r.participants).length,
        maxPlayers: r.maxPlayers,
        language: r.language,
        difficulty: r.difficulty,
      }));
  }
}
