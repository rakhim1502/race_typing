import React, { useState } from 'react';
import { X, User, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { CAR_SKINS } from '../../../shared/types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => Promise<void>;
  onRegister: (username: string, pass: string, carId: string) => Promise<void>;
  onPlayGuest: (username?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onPlayGuest,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [carId, setCarId] = useState('car-cyan');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        if (!username || !password) throw new Error('Iltimos barcha maydonlarni to‘ldiring');
        await onLogin(username, password);
        onClose();
      } else if (tab === 'register') {
        if (!username || !password) throw new Error('Iltimos barcha maydonlarni to‘ldiring');
        if (password.length < 6) throw new Error('Parol kamida 6 ta belgidan iborat bo‘lishi lozim');
        await onRegister(username, password, carId);
        onClose();
      } else {
        onPlayGuest(username || undefined);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0b101c] border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">TypeRacer Arena</h2>
          <p className="text-xs text-slate-400 mt-1">
            Poygalarga qo‘shiling, tajriba orttiring va natijalaringizni saqlang
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl mb-6 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'login' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kirish
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'register' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ro‘yxatdan o‘tish
          </button>
          <button
            onClick={() => { setTab('guest'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'guest' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mehmon
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {tab === 'guest' ? 'Taxallus (Ixtiyoriy)' : 'Foydalanuvchi nomi'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={tab === 'guest' ? 'Racer_99' : 'ApexTyper'}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          {tab !== 'guest' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Parol</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Boshlang‘ich Mashina</label>
              <select
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 outline-none"
              >
                {CAR_SKINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.badge})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            {loading ? 'Kutilmoqda...' : tab === 'login' ? 'Tizimga Kirish' : tab === 'register' ? 'Hisob Yaratish' : 'Mehmon Sifatida O‘ynash'}
          </button>
        </form>
      </div>
    </div>
  );
};
