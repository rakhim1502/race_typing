import { z } from 'zod';

export type SupportedLanguage = 'uz' | 'en' | 'ru';
export type RaceDifficulty = 'easy' | 'medium' | 'hard';
export type RoomStatus = 'WAITING' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'CANCELLED';

export interface CarVisual {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  badge: string;
}

export const CAR_SKINS: CarVisual[] = [
  { id: 'car-cyan', name: 'Cyber Neon GT', primaryColor: '#06b6d4', secondaryColor: '#3b82f6', glowColor: 'rgba(6,182,212,0.6)', badge: 'GT' },
  { id: 'car-purple', name: 'Phantom Violet', primaryColor: '#a855f7', secondaryColor: '#ec4899', glowColor: 'rgba(168,85,247,0.6)', badge: 'VX' },
  { id: 'car-crimson', name: 'Crimson Fury', primaryColor: '#ef4444', secondaryColor: '#f97316', glowColor: 'rgba(239,68,68,0.6)', badge: 'RS' },
  { id: 'car-emerald', name: 'Emerald Drift', primaryColor: '#10b981', secondaryColor: '#14b8a6', glowColor: 'rgba(16,185,129,0.6)', badge: 'EV' },
  { id: 'car-amber', name: 'Solar Flash', primaryColor: '#f59e0b', secondaryColor: '#eab308', glowColor: 'rgba(245,158,11,0.6)', badge: 'SX' },
  { id: 'car-blue', name: 'Cobalt Apex', primaryColor: '#2563eb', secondaryColor: '#6366f1', glowColor: 'rgba(37,99,235,0.6)', badge: 'APX' },
  { id: 'car-rose', name: 'Hyper Rose', primaryColor: '#f43f5e', secondaryColor: '#fb7185', glowColor: 'rgba(244,63,94,0.6)', badge: 'HR' },
  { id: 'car-stealth', name: 'Stealth Onyx', primaryColor: '#64748b', secondaryColor: '#94a3b8', glowColor: 'rgba(148,163,184,0.6)', badge: 'NX' },
];

export interface TypingTextItem {
  id: string;
  content: string;
  title: string;
  author?: string;
  language: SupportedLanguage;
  difficulty: RaceDifficulty;
  length: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  isGuest: boolean;
  carId: string;
  avatar?: string;
  avgWpm?: number;
  bestWpm?: number;
  avgAccuracy?: number;
  xpPoints?: number;
  racesCompleted?: number;
  racesWon?: number;
}

export interface RaceParticipant {
  id: string;
  socketId: string;
  userId: string;
  username: string;
  isGuest: boolean;
  carId: string;
  isReady: boolean;
  progress: number; // 0 - 100 %
  typedChars: number;
  correctChars: number;
  errorCount: number;
  wpm: number;
  rawWpm: number;
  accuracy: number; // 0 - 100 %
  rank?: number;
  finishTimeMs?: number;
  isFinished: boolean;
  disconnected?: boolean;
}

export interface RaceResultSummary {
  rank: number;
  userId: string;
  username: string;
  isGuest: boolean;
  carId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorCount: number;
  finishTimeMs: number;
}

export interface RoomState {
  id: string;
  code: string;
  name: string;
  isPrivate: boolean;
  status: RoomStatus;
  hostId: string;
  maxPlayers: number;
  minPlayers: number;
  language: SupportedLanguage;
  difficulty: RaceDifficulty;
  text: TypingTextItem;
  countdownSeconds: number;
  startTime: number | null;
  endTime: number | null;
  participants: Record<string, RaceParticipant>;
  results: RaceResultSummary[];
}

// Socket Events Contract
export interface ServerToClientEvents {
  'room:state': (room: RoomState) => void;
  'player:joined': (data: { player: RaceParticipant; room: RoomState }) => void;
  'player:left': (data: { playerId: string; username: string; room: RoomState }) => void;
  'race:countdown': (data: { seconds: number }) => void;
  'race:start': (data: { startTime: number }) => void;
  'players:progress': (data: { updates: Array<{ id: string; progress: number; wpm: number; accuracy: number; isFinished: boolean; rank?: number }> }) => void;
  'player:finished': (data: { player: RaceParticipant; rank: number }) => void;
  'race:finished': (data: { results: RaceResultSummary[] }) => void;
  'race:cancelled': (data: { reason: string }) => void;
  'error:message': (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { name: string; isPrivate: boolean; language: SupportedLanguage; difficulty: RaceDifficulty; maxPlayers: number; carId: string }, callback?: (res: { success: boolean; room?: RoomState; error?: string }) => void) => void;
  'room:join': (data: { codeOrId: string; carId: string; username?: string }, callback?: (res: { success: boolean; room?: RoomState; error?: string }) => void) => void;
  'room:leave': () => void;
  'race:ready': (data: { isReady: boolean }) => void;
  'player:progress': (data: { typedLength: number; currentInput: string; errorCount: number; timestamp: number }) => void;
  'race:rematch': () => void;
}

// Zod Schemas
export const CreateRoomSchema = z.object({
  name: z.string().min(2).max(30).default('Fast Track Arena'),
  isPrivate: z.boolean().default(false),
  language: z.enum(['uz', 'en', 'ru']).default('uz'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  maxPlayers: z.number().int().min(2).max(8).default(4),
  carId: z.string().default('car-cyan'),
});

export const JoinRoomSchema = z.object({
  codeOrId: z.string().min(1),
  carId: z.string().default('car-cyan'),
  username: z.string().min(2).max(20).optional(),
});

export const PlayerProgressSchema = z.object({
  typedLength: z.number().int().nonnegative(),
  currentInput: z.string(),
  errorCount: z.number().int().nonnegative(),
  timestamp: z.number(),
});

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username harf, son yoki pastki chiziqdan iborat bolishi kerak'),
  password: z.string().min(6).max(100),
});

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
