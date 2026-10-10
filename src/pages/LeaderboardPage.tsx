import React, { useState, useEffect } from 'react';
import { Trophy, Award, Gauge, Flame, Sparkles, Search, Calendar, Zap, Crown } from 'lucide-react';
import { PlayerProfile, CAR_SKINS } from '../../shared/types.ts';
import { CarModel } from '../components/arena/CarModel.tsx';

export const LeaderboardPage: React.FC = () => {
  const [leaders, setLeaders] = useState<PlayerProfile[]>([]);
  const [sortBy, setSortBy] = useState<'wpm' | 'wins'>('wpm');
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'daily'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?sort=${sortBy}&timeframe=${timeframe}`);
      const data = await res.json();
      if (data.success) {
        setLeaders(data.leaderboard);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaders = leaders.filter((p) =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const getTierBadge = (xp: number = 0) => {
    if (xp >= 5000) return { label: 'Apex Legend', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    if (xp >= 3000) return { label: 'Diamond', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    if (xp >= 1500) return { label: 'Gold', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (xp >= 500) return { label: 'Silver', color: 'bg-slate-400/20 text-slate-300 border-slate-400/40' };
    return { label: 'Rookie', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase mb-2 shadow-lg shadow-amber-500/10">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>TypeRacer Arena Reytingi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Peshqadam Poygachilar
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Eng tezkor va mahoratli typistlar. Har bir to‘g‘ri so‘z va g‘alaba sizga XP va mavqe keltiradi!
        </p>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-3 sm:p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Metric Sort Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSortBy('wpm')}
            className={`flex-1 md:flex-none py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              sortBy === 'wpm'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Eng Yuqori WPM</span>
          </button>
          <button
            onClick={() => setSortBy('wins')}
            className={`flex-1 md:flex-none py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              sortBy === 'wins'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ko‘p G‘alabalar</span>
          </button>
        </div>

        {/* Timeframe Selector & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Timeframe */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setTimeframe('all')}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                timeframe === 'all' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                timeframe === 'weekly' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Haftalik
            </button>
            <button
              onClick={() => setTimeframe('daily')}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                timeframe === 'daily' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kunlik
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {filteredLeaders.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {filteredLeaders.slice(0, 3).map((player, index) => {
            const isFirst = index === 0;
            const tier = getTierBadge(player.xpPoints);
            const carVisual = CAR_SKINS.find((c) => c.id === player.carId) || CAR_SKINS[0];

            return (
              <div
                key={player.id}
                className={`bg-[#0b101c] border rounded-3xl p-5 flex flex-col items-center text-center transition-all ${
                  isFirst
                    ? 'border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.2)] order-1 md:order-2 md:-mt-3'
                    : index === 1
                    ? 'border-slate-700 order-2 md:order-1'
                    : 'border-slate-700 order-3 md:order-3'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs mb-2 ${
                    isFirst
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-4 ring-amber-500/30'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950 ring-4 ring-slate-400/20'
                      : 'bg-amber-700 text-slate-100 ring-4 ring-amber-800/20'
                  }`}
                >
                  {isFirst ? '👑' : `#${index + 1}`}
                </div>

                <div className="scale-95 my-2">
                  <CarModel carId={player.carId} size="sm" isMoving={isFirst} />
                </div>

                <h3 className="text-sm font-bold text-slate-100 truncate max-w-full">
                  {player.username}
                </h3>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {player.xpPoints || 0} XP
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 w-full grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Best WPM</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {player.bestWpm || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">G‘alabalar</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {player.racesWon || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Reyting</th>
              <th className="py-3.5 px-4">Poygachi</th>
              <th className="py-3.5 px-4">Rang / Tier</th>
              <th className="py-3.5 px-4 text-right">Best WPM</th>
              <th className="py-3.5 px-4 text-right">O‘rtacha WPM</th>
              <th className="py-3.5 px-4 text-right">G‘alabalar</th>
              <th className="py-3.5 px-4 text-right hidden sm:table-cell">Poygalar</th>
              <th className="py-3.5 px-4 text-right hidden sm:table-cell">XP Ochkolar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLeaders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  Mos keluvchi poygachilar topilmadi.
                </td>
              </tr>
            ) : (
              filteredLeaders.map((player, index) => {
                const tier = getTierBadge(player.xpPoints);
                return (
                  <tr key={player.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                    </td>
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      <span className="font-bold text-slate-200">{player.username}</span>
                      {player.isGuest && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">
                          Mehmon
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.color}`}>
                        {tier.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-400">
                      {player.bestWpm || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {player.avgWpm || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      {player.racesWon || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400 hidden sm:table-cell">
                      {player.racesCompleted || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-purple-400 font-bold hidden sm:table-cell">
                      {player.xpPoints || 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
