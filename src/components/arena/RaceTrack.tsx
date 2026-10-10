import React from 'react';
import { RaceParticipant, CAR_SKINS } from '../../../shared/types.ts';
import { CarModel } from './CarModel.tsx';
import { Trophy, Award, Zap, Flag, Sparkles } from 'lucide-react';

interface RaceTrackProps {
  participants: RaceParticipant[];
  currentUserId: string;
  isRacing: boolean;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  participants,
  currentUserId,
  isRacing,
}) => {
  // Sort participants by progress descending for visual ranking
  const sorted = [...participants].sort((a, b) => {
    if (a.isFinished && b.isFinished) return (a.rank || 99) - (b.rank || 99);
    if (a.isFinished) return -1;
    if (b.isFinished) return 1;
    return b.progress - a.progress;
  });

  return (
    <div className="w-full bg-[#0b101b] border border-cyan-900/40 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Top track header with grandstand info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 text-xs font-semibold tracking-wider text-slate-400">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-cyan-400" />
          <span className="uppercase text-cyan-300">Poyga Maydoni (Grand Prix Arena)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {participants.length} ta mashina trassada
          </span>
          <div className="hidden sm:flex items-center gap-1 text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>Finish: 100% matn</span>
          </div>
        </div>
      </div>

      {/* Main Track lanes container */}
      <div className="relative flex flex-col gap-3 min-w-[320px]">
        {/* Track asphalt grid background */}
        <div className="absolute inset-0 rounded-xl track-grid opacity-30 pointer-events-none" />

        {/* Start Line Graphic */}
        <div className="absolute left-[130px] sm:left-[170px] top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-white to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] z-10 pointer-events-none">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black text-cyan-300 tracking-tighter bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-500/40">
            START
          </div>
        </div>

        {/* Checkered Finish Line Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-7 checkered-pattern opacity-90 rounded-r-xl border-l-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-10 pointer-events-none">
          <div className="absolute -top-3 right-1 text-[9px] uppercase font-black text-amber-300 tracking-tighter bg-amber-950/90 px-1 py-0.5 rounded border border-amber-500/50">
            FINISH
          </div>
        </div>

        {/* Lanes */}
        {participants.map((player, index) => {
          const isCurrentUser = player.userId === currentUserId;
          const carSkin = CAR_SKINS.find(c => c.id === player.carId) || CAR_SKINS[0];
          // Calculate car progress percentage restricted within track boundaries (0% to 100%)
          const progressClamp = Math.min(100, Math.max(0, player.progress));

          return (
            <div
              key={player.id}
              className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
                isCurrentUser
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Lane Row layout */}
              <div className="flex items-center h-18 sm:h-20 px-2 sm:px-3 relative">
                {/* Lane info & Racer badge on the left */}
                <div className="w-[125px] sm:w-[160px] shrink-0 flex items-center gap-2 pr-2 border-r border-slate-800 z-20">
                  {/* Rank / Number */}
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                      player.rank === 1
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40'
                        : player.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : player.rank === 3
                        ? 'bg-amber-700 text-slate-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {player.rank ? `#${player.rank}` : `${index + 1}`}
                  </div>

                  {/* Racer Name & Stats */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isCurrentUser ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {player.username}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-semibold border border-cyan-500/30">
                          Siz
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="text-cyan-400 font-mono font-bold">
                        {player.wpm} <span className="text-[8px] text-slate-500">WPM</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">
                        {player.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Track roadway where car moves */}
                <div className="relative flex-1 h-full flex items-center pl-4 pr-10 overflow-hidden">
                  {/* Dashed white center lane marker */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-700/60 pointer-events-none" />

                  {/* Car wrapper with smooth CSS transition based on real progress */}
                  <div
                    className="relative transition-all duration-200 ease-out flex items-center"
                    style={{
                      left: `calc(${progressClamp}% - ${progressClamp * 0.9}px)`,
                    }}
                  >
                    {/* The Visual Car */}
                    <CarModel
                      carId={player.carId}
                      isMoving={isRacing && !player.isFinished && player.progress > 0}
                      size="sm"
                    />

                    {/* Finish celebration badge over car */}
                    {player.isFinished && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/50 animate-bounce">
                        <Trophy className="w-3 h-3" />
                        <span>FINISH #{player.rank}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
