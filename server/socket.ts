import { Server as SocketIOServer, Socket } from 'socket.io';
import { RoomManager } from './engine/RoomManager.ts';
import { store } from './storage/store.ts';
import {
  CreateRoomSchema,
  JoinRoomSchema,
  PlayerProgressSchema,
} from '../shared/types.ts';

export function setupSocketHandlers(io: SocketIOServer, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    // Authenticate user via handshake auth or create guest
    const authData = socket.handshake.auth || {};
    let userId = authData.userId;
    let username = authData.username || 'Racer';
    let isGuest = true;
    let carId = authData.carId || 'car-cyan';

    if (authData.token) {
      const decoded = store.verifyToken(authData.token);
      if (decoded) {
        userId = decoded.id;
        username = decoded.username;
        isGuest = decoded.isGuest;
        const profile = store.getUserById(userId);
        if (profile) {
          carId = profile.carId;
        }
      }
    }

    if (!userId) {
      const guest = store.createGuest(username, carId);
      userId = guest.user.id;
      username = guest.user.username;
    }

    const playerMeta = { id: userId, username, isGuest, carId, socketId: socket.id };

    // --- CREATE ROOM ---
    socket.on('room:create', (payload, callback) => {
      try {
        const parsed = CreateRoomSchema.parse(payload);
        const room = roomManager.createRoom(
          parsed.name,
          parsed.isPrivate,
          parsed.language,
          parsed.difficulty,
          parsed.maxPlayers,
          { ...playerMeta, carId: parsed.carId || playerMeta.carId }
        );

        socket.join(room.id);
        if (callback) callback({ success: true, room });
        socket.emit('room:state', room);
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message || 'Xona yaratishda xatolik' });
      }
    });

    // --- JOIN ROOM / QUICK PLAY ---
    socket.on('room:join', (payload, callback) => {
      try {
        const parsed = JoinRoomSchema.parse(payload);
        let room;

        if (parsed.codeOrId === 'quick_match') {
          room = roomManager.findOrCreatePublicRoom('uz', 'medium', {
            ...playerMeta,
            carId: parsed.carId || playerMeta.carId,
            username: parsed.username || playerMeta.username,
          });
        } else {
          room = roomManager.joinRoom(parsed.codeOrId, {
            ...playerMeta,
            carId: parsed.carId || playerMeta.carId,
            username: parsed.username || playerMeta.username,
          });
        }

        socket.join(room.id);
        if (callback) callback({ success: true, room });

        // Broadcast to everyone in room
        io.to(room.id).emit('room:state', room);
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message || 'Xonaga kirishda xatolik' });
      }
    });

    // --- TOGGLE READY ---
    socket.on('race:ready', (payload) => {
      try {
        const isReady = Boolean(payload?.isReady);
        const room = roomManager.setReady(socket.id, isReady);
        if (room) {
          io.to(room.id).emit('room:state', room);
        }
      } catch (err: any) {
        socket.emit('error:message', { code: 'READY_ERROR', message: err.message });
      }
    });

    // --- PLAYER PROGRESS UPDATE ---
    socket.on('player:progress', (payload) => {
      try {
        const parsed = PlayerProgressSchema.parse(payload);
        roomManager.updatePlayerProgress(socket.id, parsed);
      } catch {
        // Drop malformed progress payloads silently to prevent log spam
      }
    });

    // --- REMATCH / RESTART ---
    socket.on('race:rematch', () => {
      const room = roomManager.restartRace(socket.id);
      if (room) {
        io.to(room.id).emit('room:state', room);
      }
    });

    // --- LEAVE ROOM ---
    socket.on('room:leave', () => {
      const { room, leftPlayerId } = roomManager.leaveRoom(socket.id);
      if (room) {
        socket.leave(room.id);
        io.to(room.id).emit('room:state', room);
        if (leftPlayerId) {
          io.to(room.id).emit('player:left', { playerId: leftPlayerId, username: playerMeta.username, room });
        }
      }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      const { room, leftPlayerId } = roomManager.leaveRoom(socket.id);
      if (room) {
        io.to(room.id).emit('room:state', room);
        if (leftPlayerId) {
          io.to(room.id).emit('player:left', { playerId: leftPlayerId, username: playerMeta.username, room });
        }
      }
    });
  });
}
