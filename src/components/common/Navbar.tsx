import React, { useState } from 'react';
import { Flag, Trophy, User as UserIcon, Play, LogOut, Flame, Volume2, VolumeX } from 'lucide-react';
import { PlayerProfile } from '../../../shared/types.ts';
import { sounds } from '../../lib/sound.ts';

interface NavbarProps {
  currentTab: 'home' | 'lobby' | 'race' | 'leaderboard' | 'profile';
  onNavigate: (tab: 'home' | 'lobby' | 'race' | 'leaderboard' | 'profile') => void;
  user: PlayerProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeRoomId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  activeRoomId,
}) => {
  const [muted, setMuted] = useState(sounds.isMuted);

  const toggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-slate-950 fill-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              TypeRacer<span className="text-cyan-400">Arena</span>
            </span>
            <span className="block text-[10px] text-slate-400 -mt-1 font-mono tracking-wider">
              REAL-TIME RACING
            </span>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'home'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bosh Sahifa
          </button>
          <button
            onClick={() => onNavigate('lobby')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'lobby' || currentTab === 'race'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>Poygalar (Lobby)</span>
            {activeRoomId && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => onNavigate('leaderboard')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentTab === 'leaderboard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Reyting (Leaderboard)</span>
          </button>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2.5">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            title={muted ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  currentTab === 'profile'
                    ? 'bg-slate-800 border-cyan-400/60 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-black">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight">{user.username}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {user.bestWpm ? `${user.bestWpm} WPM` : 'Yangi'}
                  </div>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Chiqish"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Kirish / Ro‘yxat
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
