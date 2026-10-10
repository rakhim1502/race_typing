import React, { useState, useEffect } from 'react';
import { Trophy, Gauge, Target, Award, Clock, Sparkles, Shield, RotateCcw, Check, Flame } from 'lucide-react';
import { PlayerProfile, CAR_SKINS } from '../../shared/types.ts';
import { CarModel } from '../components/arena/CarModel.tsx';
import { CarSelector } from '../components/arena/CarSelector.tsx';

interface ProfilePageProps {
  user: PlayerProfile;
  onUpdateCar: (carId: string) => Promise<void>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateCar,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/stats/history/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelect = async (carId: string) => {
    await onUpdateCar(carId);
    setSaveMessage('Yangi giperkar faollashtirildi!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const winRate = user.racesCompleted && user.racesCompleted > 0
    ? Math.round(((user.racesWon || 0) / user.racesCompleted) * 100)
    : 0;

  const xp = user.xpPoints || 0;
  const nextLevelXp = xp < 500 ? 500 : xp < 1500 ? 1500 : xp < 3000 ? 3000 : xp < 5000 ? 5000 : 10000;
  const currentLevelFloor = xp < 500 ? 0 : xp < 1500 ? 500 : xp < 3000 ? 1500 : xp < 5000 ? 3000 : 5000;
  const xpProgress = Math.min(100, Math.round(((xp - currentLevelFloor) / (nextLevelXp - currentLevelFloor)) * 100));

  const getTierInfo = (points: number) => {
    if (points >= 5000) return { title: 'Apex Legend', next: 'Max Daraja', color: 'text-purple-400' };
    if (points >= 3000) return { title: 'Diamond Racer', next: 'Apex Legend', color: 'text-cyan-400' };
    if (points >= 1500) return { title: 'Gold Champion', next: 'Diamond', color: 'text-amber-400' };
    if (points >= 500) return { title: 'Silver Pro', next: 'Gold', color: 'text-slate-300' };
    return { title: 'Rookie Racer', next: 'Silver', color: 'text-emerald-400' };
  };

  const tier = getTierInfo(xp);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast feedback */}
      {saveMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-[#0b101c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-1 shadow-lg shadow-cyan-500/25 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl font-black text-cyan-400">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user.username}</h1>
              {user.isGuest ? (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                  Mehmon Hisob
                </span>
              ) : (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  Tasdiqlangan Profil
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold ${tier.color}`}>
                {tier.title}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Selected Car preview */}
        <div className="scale-110">
          <CarModel carId={user.carId} size="md" isMoving={true} />
        </div>
      </div>

      {/* XP Level Progression Bar */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span>Mavqe Rivojlanishi (XP Progression)</span>
          </span>
          <span className="text-cyan-400 font-mono">
            {xp} / {nextLevelXp} XP ({xpProgress}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>Joriy: {tier.title}</span>
          <span>Navbatdagi: {tier.next}</span>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 text-center hover:border-cyan-500/40 transition-colors">
          <span className="text-xs text-slate-400 font-medium">Rekord WPM</span>
          <div className="text-3xl font-black font-mono text-cyan-400 mt-1">
            {user.bestWpm || 0}
          </div>
        </div>

        <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 text-center hover:border-purple-500/40 transition-colors">
          <span className="text-xs text-slate-400 font-medium">O‘rtacha WPM</span>
          <div className="text-3xl font-black font-mono text-purple-400 mt-1">
            {user.avgWpm || 0}
          </div>
        </div>

        <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 text-center hover:border-amber-500/40 transition-colors">
          <span className="text-xs text-slate-400 font-medium">G‘alabalar / Poygalar</span>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1">
            {user.racesWon || 0} / {user.racesCompleted || 0}
          </div>
        </div>

        <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 text-center hover:border-emerald-500/40 transition-colors">
          <span className="text-xs text-slate-400 font-medium">G‘alaba Foizi</span>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {winRate}%
          </div>
        </div>
      </div>

      {/* Car Selection Garage */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <CarSelector
          selectedCarId={user.carId}
          onSelectCar={handleCarSelect}
        />
      </div>

      {/* Race History */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Oxirgi Poygalar Tarixi</span>
        </h2>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Hozircha poygalar tarixi mavjud emas. Lobbyga o‘tib ilk poygani boshlang!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">O‘rin</th>
                  <th className="py-2.5 px-3">Tezlik</th>
                  <th className="py-2.5 px-3">Aniqlik</th>
                  <th className="py-2.5 px-3">Xatolar</th>
                  <th className="py-2.5 px-3">Vaqt</th>
                  <th className="py-2.5 px-3 text-right">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((record) => {
                  const dateStr = new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={record.id} className="text-slate-300 hover:bg-slate-900/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {record.rank === 1 ? '🥇 1-o‘rin' : record.rank === 2 ? '🥈 2-o‘rin' : record.rank === 3 ? '🥉 3-o‘rin' : `#${record.rank}`}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {record.wpm} WPM
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">
                        {record.accuracy}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {record.errorCount}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {(record.finishTimeMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
