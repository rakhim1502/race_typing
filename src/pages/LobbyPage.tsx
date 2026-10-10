import React, { useState } from 'react';
import { Play, Plus, Lock, Globe, Gauge, Users, RefreshCw, KeyRound, Sparkles, ChevronRight } from 'lucide-react';
import { SupportedLanguage, RaceDifficulty, CAR_SKINS } from '../../shared/types.ts';
import { CarSelector } from '../components/arena/CarSelector.tsx';

interface PublicRoomItem {
  id: string;
  code: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  language: SupportedLanguage;
  difficulty: RaceDifficulty;
}

interface LobbyPageProps {
  onQuickMatch: () => void;
  onCreateRoom: (params: {
    name: string;
    isPrivate: boolean;
    language: SupportedLanguage;
    difficulty: RaceDifficulty;
    maxPlayers: number;
    carId: string;
  }) => void;
  onJoinByCode: (code: string) => void;
  publicRooms: PublicRoomItem[];
  onRefreshRooms: () => void;
  selectedCarId: string;
  onSelectCar: (carId: string) => void;
  isLoading: boolean;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  onQuickMatch,
  onCreateRoom,
  onJoinByCode,
  publicRooms,
  onRefreshRooms,
  selectedCarId,
  onSelectCar,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'create' | 'code'>('quick');

  // Custom room form
  const [roomName, setRoomName] = useState('Speedway Arena');
  const [isPrivate, setIsPrivate] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('uz');
  const [difficulty, setDifficulty] = useState<RaceDifficulty>('medium');
  const [maxPlayers, setMaxPlayers] = useState(4);

  // Join code input
  const [joinCode, setJoinCode] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({
      name: roomName,
      isPrivate,
      language,
      difficulty,
      maxPlayers,
      carId: selectedCarId,
    });
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinByCode(joinCode.trim());
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Poygalar Markazi</span>
            <span className="text-cyan-400 text-sm font-mono font-bold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40">
              LOBBY
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mavjud o‘yinga qo‘shiling yoki do‘stlaringiz uchun shaxsiy xona yarating
          </p>
        </div>

        {/* Quick Play CTA */}
        <button
          onClick={onQuickMatch}
          disabled={isLoading}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Tezkor Poyga (Quick Match)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Actions & Modes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Tabs Header */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('quick')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Tezkor O‘yin</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Xona Yaratish</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kod Bilan Kirish</span>
            </button>
          </div>

          {/* TAB 1: Quick Play Card */}
          {activeTab === 'quick' && (
            <div className="bg-[#0b101c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/20 animate-pulse">
                <Play className="w-8 h-8 fill-cyan-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Darhol Poygani Boshlang
              </h2>
              <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
                Tizim sizni avtomatik ravishda hozir tayyor turgan ommaviy xonaga yoki yangi ochilgan poygaga ulaydi.
              </p>

              <button
                onClick={onQuickMatch}
                disabled={isLoading}
                className="mt-6 py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Play Now (O‘yinga Kirish)</span>
              </button>
            </div>
          )}

          {/* TAB 2: Create Custom Room */}
          {activeTab === 'create' && (
            <form
              onSubmit={handleCreateSubmit}
              className="bg-[#0b101c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Yangi Xona Parametrlari</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Xona Nomi</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-sm text-slate-100 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Matn Tili</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-100 outline-none"
                  >
                    <option value="uz">🇺🇿 O‘zbek Tili</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ru">🇷🇺 Русский</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qiyinlik</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as RaceDifficulty)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-100 outline-none"
                  >
                    <option value="easy">Oson (Easy)</option>
                    <option value="medium">O‘rtacha (Medium)</option>
                    <option value="hard">Qiyin (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">O‘yinchilar Soni</label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-100 outline-none"
                  >
                    <option value={2}>2 nafar</option>
                    <option value={4}>4 nafar</option>
                    <option value={6}>6 nafar</option>
                    <option value={8}>8 nafar (Max)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="privateCheck"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="privateCheck" className="text-xs text-slate-300 select-none cursor-pointer">
                  Maxfiy xona (Faqat xona kodi orqali kirish mumkin bo‘ladi)
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                Xona Yaratish va Kirish
              </button>
            </form>
          )}

          {/* TAB 3: Join by Code */}
          {activeTab === 'code' && (
            <form
              onSubmit={handleCodeSubmit}
              className="bg-[#0b101c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">Xona Kodini Kiriting</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Do‘stingiz yuborgan 6 belgili maxsus kodni kiriting (masalan, RACER8)
              </p>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={8}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="KODNI YOZING"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-center font-mono font-bold text-lg tracking-widest text-cyan-300 py-3 rounded-xl outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !joinCode.trim()}
                className="py-3 px-8 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                Qo‘shilish
              </button>
            </form>
          )}

          {/* Active Public Rooms Browser */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Ochiq Poyga Xonalari ({publicRooms.length})</span>
              </span>
              <button
                onClick={onRefreshRooms}
                className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Yangilash</span>
              </button>
            </div>

            {publicRooms.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Hozircha bo‘sh ommaviy xonalar yo‘q. Yangi xona yarating yoki Quick Match bosing!
              </div>
            ) : (
              <div className="space-y-2">
                {publicRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{room.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="uppercase text-cyan-400">{room.language}</span>
                        <span>•</span>
                        <span className="capitalize">{room.difficulty}</span>
                        <span>•</span>
                        <span>
                          {room.playerCount}/{room.maxPlayers} o‘yinchi
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onJoinByCode(room.code)}
                      className="py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Kirish</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Car Selection Garage */}
        <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <CarSelector
            selectedCarId={selectedCarId}
            onSelectCar={onSelectCar}
          />
        </div>
      </div>
    </div>
  );
};
