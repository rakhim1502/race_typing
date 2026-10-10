import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RaceResultSummary, CAR_SKINS } from '../../../shared/types.ts';
import { CarModel } from './CarModel.tsx';
import { Trophy, RotateCcw, Home, Award, Zap, Clock, Target, AlertTriangle } from 'lucide-react';
import { sounds } from '../../lib/sound.ts';

interface ResultsModalProps {
  results: RaceResultSummary[];
  currentUserId: string;
  onRematch: () => void;
  onLeave: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  results,
  currentUserId,
  onRematch,
  onLeave,
}) => {
  // Fire confetti and play sound
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981'],
      });
      sounds.playVictory();
    } catch {
      // Ignore if confetti not supported
    }
  }, []);

  const currentUserResult = results.find(r => r.userId === currentUserId);
  const winner = results[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b101c] border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 my-8">
        {/* Glow Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Poyga Yakunlandi (Grand Prix Results)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
            {winner && winner.userId === currentUserId
              ? '🏆 Tabriklaymiz, Siz G‘olib Bo‘ldingiz!'
              : `${winner?.username || 'G‘olib'} 1-o‘rinni egalladi!`}
          </h2>
        </div>

        {/* Podium Top 3 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {results.slice(0, 3).map((res, i) => {
            const isFirst = res.rank === 1;
            const isUser = res.userId === currentUserId;

            return (
              <div
                key={res.userId}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  isFirst
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] order-2 -mt-2'
                    : i === 1
                    ? 'bg-slate-900/60 border-slate-700 order-1'
                    : 'bg-slate-900/60 border-slate-700 order-3'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                    isFirst
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : i === 1
                      ? 'bg-slate-300 text-slate-950'
                      : 'bg-amber-700 text-slate-100'
                  }`}
                >
                  #{res.rank}
                </div>

                <div className="scale-75 my-1">
                  <CarModel carId={res.carId} size="sm" />
                </div>

                <div className="text-xs font-bold truncate max-w-full text-slate-200">
                  {res.username}
                </div>
                {isUser && (
                  <span className="text-[9px] text-cyan-400 font-bold">(Siz)</span>
                )}

                <div className="text-sm font-mono font-extrabold text-cyan-400 mt-1">
                  {res.wpm} <span className="text-[9px] text-slate-400">WPM</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Table for all participants */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">O‘rin</th>
                <th className="py-2.5 px-3">Ishtirokchi</th>
                <th className="py-2.5 px-3 text-right">WPM</th>
                <th className="py-2.5 px-3 text-right">Aniqlik</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">Vaqt</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">Xatolar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map((res) => {
                const isUser = res.userId === currentUserId;
                const timeSec = (res.finishTimeMs / 1000).toFixed(1);

                return (
                  <tr
                    key={res.userId}
                    className={isUser ? 'bg-cyan-950/20 font-bold text-cyan-300' : 'text-slate-300'}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {res.rank === 1 ? '🥇 1' : res.rank === 2 ? '🥈 2' : res.rank === 3 ? '🥉 3' : `#${res.rank}`}
                    </td>
                    <td className="py-2.5 px-3 flex items-center gap-1.5 truncate">
                      <span>{res.username}</span>
                      {isUser && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1 rounded">
                          Siz
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-400">
                      {res.wpm}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {res.accuracy}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 hidden sm:table-cell">
                      {timeSec}s
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 hidden sm:table-cell">
                      {res.errorCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRematch}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Qayta O‘ynash (Rematch)</span>
          </button>

          <button
            onClick={onLeave}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Lobbyga Qaytish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
