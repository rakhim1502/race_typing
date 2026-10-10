import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import {
  PlayerProfile,
  RoomState,
  SupportedLanguage,
  RaceDifficulty,
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../shared/types.ts';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface RaceStoreState {
  // Auth & Profile
  user: PlayerProfile | null;
  token: string | null;
  isAuthLoading: boolean;

  // Socket & Room
  socket: TypedSocket | null;
  isConnected: boolean;
  currentRoom: RoomState | null;
  publicRooms: any[];
  isLoadingRoom: boolean;
  errorMessage: string | null;

  // Actions
  initAuth: () => Promise<void>;
  login: (username: string, pass: string) => Promise<void>;
  register: (username: string, pass: string, carId: string) => Promise<void>;
  playGuest: (preferredUsername?: string) => Promise<void>;
  logout: () => void;
  updateCar: (carId: string) => Promise<void>;

  connectSocket: () => void;
  quickMatch: () => void;
  createRoom: (params: {
    name: string;
    isPrivate: boolean;
    language: SupportedLanguage;
    difficulty: RaceDifficulty;
    maxPlayers: number;
    carId: string;
  }) => void;
  joinRoom: (codeOrId: string) => void;
  leaveRoom: () => void;
  toggleReady: (isReady: boolean) => void;
  sendProgress: (typedLength: number, currentInput: string, errorCount: number) => void;
  requestRematch: () => void;
  fetchPublicRooms: () => Promise<void>;
  clearError: () => void;
}

export const useRaceStore = create<RaceStoreState>((set, get) => {
  let progressThrottleTimeout: NodeJS.Timeout | null = null;
  let lastProgressPayload: { typedLength: number; currentInput: string; errorCount: number } | null = null;

  return {
    user: null,
    token: null,
    isAuthLoading: true,
    socket: null,
    isConnected: false,
    currentRoom: null,
    publicRooms: [],
    isLoadingRoom: false,
    errorMessage: null,

    initAuth: async () => {
      const savedToken = localStorage.getItem('typeracer_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          const data = await res.json();
          if (data.success && data.user) {
            set({ user: data.user, token: savedToken, isAuthLoading: false });
            get().connectSocket();
            return;
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('typeracer_token');
        }
      }

      // Automatically initialize temporary guest session so user can race instantly
      try {
        const res = await fetch('/api/auth/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId: 'car-cyan' }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('typeracer_token', data.token);
          set({ user: data.user, token: data.token, isAuthLoading: false });
          get().connectSocket();
        }
      } catch {
        set({ isAuthLoading: false });
      }
    },

    login: async (username: string, pass: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      localStorage.setItem('typeracer_token', data.token);
      set({ user: data.user, token: data.token });
      get().connectSocket();
    },

    register: async (username: string, pass: string, carId: string) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass, carId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      localStorage.setItem('typeracer_token', data.token);
      set({ user: data.user, token: data.token });
      get().connectSocket();
    },

    playGuest: async (preferredUsername?: string) => {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredUsername, carId: get().user?.carId || 'car-cyan' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('typeracer_token', data.token);
        set({ user: data.user, token: data.token });
        get().connectSocket();
      }
    },

    logout: () => {
      localStorage.removeItem('typeracer_token');
      const { socket } = get();
      if (socket) socket.disconnect();
      set({ user: null, token: null, socket: null, isConnected: false, currentRoom: null });
      get().initAuth();
    },

    updateCar: async (carId: string) => {
      const { token, user } = get();
      if (!token) return;
      try {
        const res = await fetch('/api/auth/car', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ carId }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          set({ user: data.user });
        }
      } catch {
        // Fallback local update
        if (user) set({ user: { ...user, carId } });
      }
    },

    connectSocket: () => {
      const existing = get().socket;
      if (existing) {
        existing.disconnect();
      }

      const { user, token } = get();
      const newSocket: TypedSocket = io('/', {
        transports: ['websocket', 'polling'],
        auth: {
          token,
          userId: user?.id,
          username: user?.username,
          carId: user?.carId,
        },
      });

      newSocket.on('connect', () => {
        set({ isConnected: true });
      });

      newSocket.on('disconnect', () => {
        set({ isConnected: false });
      });

      newSocket.on('room:state', (room) => {
        set({ currentRoom: room, isLoadingRoom: false });
      });

      newSocket.on('race:countdown', ({ seconds }) => {
        const { currentRoom } = get();
        if (currentRoom) {
          set({ currentRoom: { ...currentRoom, status: 'COUNTDOWN', countdownSeconds: seconds } });
        }
      });

      newSocket.on('race:start', ({ startTime }) => {
        const { currentRoom } = get();
        if (currentRoom) {
          set({ currentRoom: { ...currentRoom, status: 'RACING', startTime } });
        }
      });

      newSocket.on('players:progress', ({ updates }) => {
        const { currentRoom } = get();
        if (!currentRoom) return;

        const updatedParticipants = { ...currentRoom.participants };
        for (const up of updates) {
          if (updatedParticipants[up.id]) {
            updatedParticipants[up.id] = {
              ...updatedParticipants[up.id],
              progress: up.progress,
              wpm: up.wpm,
              accuracy: up.accuracy,
              isFinished: up.isFinished,
              rank: up.rank,
            };
          }
        }
        set({ currentRoom: { ...currentRoom, participants: updatedParticipants } });
      });

      newSocket.on('race:finished', async ({ results }) => {
        const { currentRoom, token } = get();
        if (currentRoom) {
          set({ currentRoom: { ...currentRoom, status: 'FINISHED', results } });
        }
        if (token) {
          try {
            const res = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && data.user) {
              set({ user: data.user });
            }
          } catch {
            // Ignore
          }
        }
      });

      newSocket.on('error:message', ({ message }) => {
        set({ errorMessage: message, isLoadingRoom: false });
      });

      set({ socket: newSocket });
    },

    quickMatch: () => {
      const { socket, user } = get();
      if (!socket) return;
      set({ isLoadingRoom: true });
      socket.emit(
        'room:join',
        { codeOrId: 'quick_match', carId: user?.carId || 'car-cyan', username: user?.username },
        (res) => {
          if (!res.success) {
            set({ errorMessage: res.error || 'Qo‘shilishda xatolik', isLoadingRoom: false });
          }
        }
      );
    },

    createRoom: (params) => {
      const { socket } = get();
      if (!socket) return;
      set({ isLoadingRoom: true });
      socket.emit('room:create', params, (res) => {
        if (!res.success) {
          set({ errorMessage: res.error || 'Xona yaratishda xatolik', isLoadingRoom: false });
        }
      });
    },

    joinRoom: (codeOrId) => {
      const { socket, user } = get();
      if (!socket) return;
      set({ isLoadingRoom: true });
      socket.emit(
        'room:join',
        { codeOrId, carId: user?.carId || 'car-cyan', username: user?.username },
        (res) => {
          if (!res.success) {
            set({ errorMessage: res.error || 'Xona topilmadi', isLoadingRoom: false });
          }
        }
      );
    },

    leaveRoom: () => {
      const { socket } = get();
      if (socket) socket.emit('room:leave');
      set({ currentRoom: null });
      get().fetchPublicRooms();
    },

    toggleReady: (isReady) => {
      const { socket } = get();
      if (socket) socket.emit('race:ready', { isReady });
    },

    sendProgress: (typedLength, currentInput, errorCount) => {
      const { socket } = get();
      if (!socket) return;

      lastProgressPayload = { typedLength, currentInput, errorCount };

      // Throttle player typing progress emission to max 12 calls/sec to save bandwidth
      if (!progressThrottleTimeout) {
        progressThrottleTimeout = setTimeout(() => {
          if (lastProgressPayload) {
            socket.emit('player:progress', {
              ...lastProgressPayload,
              timestamp: Date.now(),
            });
          }
          progressThrottleTimeout = null;
        }, 80);
      }
    },

    requestRematch: () => {
      const { socket } = get();
      if (socket) socket.emit('race:rematch');
    },

    fetchPublicRooms: async () => {
      try {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        if (data.success) {
          set({ publicRooms: data.rooms || [] });
        }
      } catch {
        // Ignore
      }
    },

    clearError: () => set({ errorMessage: null }),
  };
});
