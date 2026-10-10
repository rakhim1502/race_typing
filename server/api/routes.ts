import { Router, Request, Response } from 'express';
import { store } from '../storage/store.ts';
import { TEXT_BANK } from '../engine/TextBank.ts';
import { RoomManager } from '../engine/RoomManager.ts';
import { RegisterSchema, LoginSchema } from '../../shared/types.ts';

export function createApiRouter(roomManager: RoomManager): Router {
  const router = Router();

  // Helper auth extractor
  const getAuthUser = (req: Request) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.substring(7);
    return store.verifyToken(token);
  };

  // --- AUTH ---
  router.post('/auth/register', async (req: Request, res: Response) => {
    try {
      const parsed = RegisterSchema.parse(req.body);
      const { user, token } = await store.register(parsed.username, parsed.password);
      res.json({ success: true, user, token });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi' });
    }
  });

  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const parsed = LoginSchema.parse(req.body);
      const { user, token } = await store.login(parsed.username, parsed.password);
      res.json({ success: true, user, token });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message || 'Kirishda xatolik yuz berdi' });
    }
  });

  router.post('/auth/guest', (req: Request, res: Response) => {
    try {
      const { preferredUsername, carId } = req.body;
      const { user, token } = store.createGuest(preferredUsername, carId);
      res.json({ success: true, user, token });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/auth/me', (req: Request, res: Response) => {
    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' });
    }
    const profile = store.getUserById(auth.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
    }
    res.json({ success: true, user: profile });
  });

  router.put('/auth/car', (req: Request, res: Response) => {
    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' });
    }
    const { carId } = req.body;
    if (typeof carId === 'string') {
      store.updateSelectedCar(auth.id, carId);
    }
    const profile = store.getUserById(auth.id);
    res.json({ success: true, user: profile });
  });

  // --- TEXTS ---
  router.get('/texts', (req: Request, res: Response) => {
    const { lang, difficulty } = req.query;
    let list = TEXT_BANK;
    if (typeof lang === 'string') {
      list = list.filter(t => t.language === lang);
    }
    if (typeof difficulty === 'string') {
      list = list.filter(t => t.difficulty === difficulty);
    }
    res.json({ success: true, texts: list });
  });

  // --- LEADERBOARD ---
  router.get('/leaderboard', (req: Request, res: Response) => {
    const sortBy = req.query.sort === 'wins' ? 'wins' : 'wpm';
    const timeframe = req.query.timeframe === 'daily' ? 'daily' : req.query.timeframe === 'weekly' ? 'weekly' : 'all';
    const leaders = store.getLeaderboard(sortBy, timeframe, 25);
    res.json({ success: true, leaderboard: leaders });
  });

  // --- PROFILE RACE HISTORY ---
  router.get('/stats/history/:userId', (req: Request, res: Response) => {
    const { userId } = req.params;
    const history = store.getUserHistory(userId, 15);
    const profile = store.getUserById(userId);
    res.json({ success: true, history, profile });
  });

  // --- PUBLIC ROOMS ---
  router.get('/rooms', (_req: Request, res: Response) => {
    const rooms = roomManager.getPublicRoomsSummary();
    res.json({ success: true, rooms });
  });

  return router;
}
