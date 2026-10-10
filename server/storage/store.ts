import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RaceResultSummary, PlayerProfile } from '../../shared/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'typeracer_arena_super_secret_jwt_key_2026';

export interface DBUser {
  id: string;
  username: string;
  passwordHash?: string;
  isGuest: boolean;
  avatarUrl?: string;
  selectedCarId: string;
  createdAt: number;
}

export interface DBUserStats {
  userId: string;
  totalRaces: number;
  totalWins: number;
  avgWpm: number;
  bestWpm: number;
  avgAccuracy: number;
  xpPoints: number;
  updatedAt: number;
}

export interface DBRaceHistoryRecord {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  carId: string;
  rank: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorCount: number;
  finishTimeMs: number;
  createdAt: number;
}

class DataStore {
  private users: Map<string, DBUser> = new Map();
  private usersByUsername: Map<string, string> = new Map(); // lowercase username -> id
  private stats: Map<string, DBUserStats> = new Map(); // userId -> stats
  private raceResults: DBRaceHistoryRecord[] = [];

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    // Seed initial leaderboard legends
    const legends = [
      { id: 'legend-1', username: 'TurboSpeedster', carId: 'car-cyan', bestWpm: 124, avgWpm: 112, wins: 48, races: 60, xp: 5400 },
      { id: 'legend-2', username: 'NavoiyTyper', carId: 'car-purple', bestWpm: 118, avgWpm: 104, wins: 39, races: 55, xp: 4200 },
      { id: 'legend-3', username: 'ApexCoder', carId: 'car-crimson', bestWpm: 108, avgWpm: 98, wins: 27, races: 40, xp: 3300 },
      { id: 'legend-4', username: 'NeonRider', carId: 'car-emerald', bestWpm: 99, avgWpm: 89, wins: 18, races: 32, xp: 2100 },
    ];

    for (const leg of legends) {
      const user: DBUser = {
        id: leg.id,
        username: leg.username,
        isGuest: false,
        selectedCarId: leg.carId,
        createdAt: Date.now() - 86400000 * 7,
      };
      this.users.set(user.id, user);
      this.usersByUsername.set(user.username.toLowerCase(), user.id);
      this.stats.set(user.id, {
        userId: user.id,
        totalRaces: leg.races,
        totalWins: leg.wins,
        avgWpm: leg.avgWpm,
        bestWpm: leg.bestWpm,
        avgAccuracy: 98.4,
        xpPoints: leg.xp,
        updatedAt: Date.now(),
      });
    }
  }

  // --- Auth & Users ---
  async register(username: string, password: string, selectedCarId = 'car-cyan'): Promise<{ user: PlayerProfile; token: string }> {
    const normalized = username.trim();
    if (this.usersByUsername.has(normalized.toLowerCase())) {
      throw new Error('Foydalanuvchi nomi band. Boshqa nom tanlang.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const user: DBUser = {
      id,
      username: normalized,
      passwordHash,
      isGuest: false,
      selectedCarId,
      createdAt: Date.now(),
    };

    this.users.set(id, user);
    this.usersByUsername.set(normalized.toLowerCase(), id);

    const stats: DBUserStats = {
      userId: id,
      totalRaces: 0,
      totalWins: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      xpPoints: 0,
      updatedAt: Date.now(),
    };
    this.stats.set(id, stats);

    const token = this.generateToken(user);
    return { user: this.toProfile(user, stats), token };
  }

  async login(username: string, password: string): Promise<{ user: PlayerProfile; token: string }> {
    const normalized = username.trim().toLowerCase();
    const userId = this.usersByUsername.get(normalized);
    if (!userId) {
      throw new Error('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
    }

    const user = this.users.get(userId);
    if (!user || !user.passwordHash) {
      throw new Error('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new Error('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
    }

    const stats = this.stats.get(userId) || this.createEmptyStats(userId);
    const token = this.generateToken(user);
    return { user: this.toProfile(user, stats), token };
  }

  createGuest(preferredUsername?: string, carId = 'car-cyan'): { user: PlayerProfile; token: string } {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const username = preferredUsername ? preferredUsername.trim() : `Racer_${rand}`;
    const id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const user: DBUser = {
      id,
      username,
      isGuest: true,
      selectedCarId: carId,
      createdAt: Date.now(),
    };

    this.users.set(id, user);
    const stats = this.createEmptyStats(id);
    this.stats.set(id, stats);

    const token = this.generateToken(user);
    return { user: this.toProfile(user, stats), token };
  }

  getUserById(id: string): PlayerProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    const stats = this.stats.get(id) || this.createEmptyStats(id);
    return this.toProfile(user, stats);
  }

  updateSelectedCar(userId: string, carId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.selectedCarId = carId;
    return true;
  }

  verifyToken(token: string): { id: string; username: string; isGuest: boolean } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; isGuest: boolean };
      return decoded;
    } catch {
      return null;
    }
  }

  private generateToken(user: DBUser): string {
    return jwt.sign(
      { id: user.id, username: user.username, isGuest: user.isGuest },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  private createEmptyStats(userId: string): DBUserStats {
    const stats: DBUserStats = {
      userId,
      totalRaces: 0,
      totalWins: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      xpPoints: 0,
      updatedAt: Date.now(),
    };
    return stats;
  }

  private toProfile(user: DBUser, stats: DBUserStats): PlayerProfile {
    return {
      id: user.id,
      username: user.username,
      isGuest: user.isGuest,
      carId: user.selectedCarId,
      avatar: user.avatarUrl,
      avgWpm: Math.round(stats.avgWpm),
      bestWpm: Math.round(stats.bestWpm),
      avgAccuracy: stats.avgAccuracy,
      xpPoints: stats.xpPoints,
      racesCompleted: stats.totalRaces,
      racesWon: stats.totalWins,
    };
  }

  // --- Race Results & Stats Update (Transaction safety) ---
  saveRaceResults(roomId: string, results: RaceResultSummary[]): void {
    const now = Date.now();
    for (const res of results) {
      // Check duplicate
      const alreadySaved = this.raceResults.some(r => r.roomId === roomId && r.userId === res.userId);
      if (alreadySaved) continue;

      const record: DBRaceHistoryRecord = {
        id: `res_${now}_${Math.random().toString(36).substring(2, 6)}`,
        roomId,
        userId: res.userId,
        username: res.username,
        carId: res.carId,
        rank: res.rank,
        wpm: res.wpm,
        rawWpm: res.rawWpm,
        accuracy: res.accuracy,
        errorCount: res.errorCount,
        finishTimeMs: res.finishTimeMs,
        createdAt: now,
      };
      this.raceResults.unshift(record);

      // Update UserStats atomically
      let stats = this.stats.get(res.userId);
      if (!stats) {
        stats = this.createEmptyStats(res.userId);
        this.stats.set(res.userId, stats);
      }

      const isWin = res.rank === 1;
      const prevTotal = stats.totalRaces;
      stats.totalRaces += 1;
      if (isWin) stats.totalWins += 1;

      // New rolling averages
      stats.avgWpm = Number(((stats.avgWpm * prevTotal + res.wpm) / stats.totalRaces).toFixed(1));
      stats.avgAccuracy = Number(((stats.avgAccuracy * prevTotal + res.accuracy) / stats.totalRaces).toFixed(1));
      if (res.wpm > stats.bestWpm) {
        stats.bestWpm = Math.round(res.wpm);
      }

      // XP calculation: base 50 XP + WPM + win bonus 100 XP
      const gainedXp = 50 + Math.round(res.wpm) + (isWin ? 100 : 0);
      stats.xpPoints += gainedXp;
      stats.updatedAt = now;
    }
  }

  getUserHistory(userId: string, limit = 10): DBRaceHistoryRecord[] {
    return this.raceResults.filter(r => r.userId === userId).slice(0, limit);
  }

  getLeaderboard(sortBy: 'wpm' | 'wins' = 'wpm', timeframe: 'all' | 'weekly' | 'daily' = 'all', limit = 25) {
    const list: PlayerProfile[] = [];

    const now = Date.now();
    const timeframeThreshold =
      timeframe === 'daily'
        ? now - 86400000
        : timeframe === 'weekly'
        ? now - 86400000 * 7
        : 0;

    for (const [userId, stats] of this.stats.entries()) {
      const user = this.users.get(userId);
      if (!user) continue;

      if (timeframeThreshold > 0 && stats.updatedAt < timeframeThreshold) {
        continue;
      }

      list.push(this.toProfile(user, stats));
    }

    if (sortBy === 'wins') {
      list.sort((a, b) => (b.racesWon || 0) - (a.racesWon || 0) || (b.bestWpm || 0) - (a.bestWpm || 0));
    } else {
      list.sort((a, b) => (b.bestWpm || 0) - (a.bestWpm || 0) || (b.avgWpm || 0) - (a.avgWpm || 0));
    }

    return list.slice(0, limit);
  }
}

export const store = new DataStore();
