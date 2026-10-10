import React from 'react';
import { Gauge, Target, Clock, AlertTriangle, Activity } from 'lucide-react';

interface StatHUDProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  progress: number;
  errorCount: number;
  elapsedSeconds: number;
}

export const StatHUD: React.FC<StatHUDProps> = ({
  wpm,
  rawWpm,
  accuracy,
  progress,
  errorCount,
  elapsedSeconds,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-3">
      {/* WPM Display */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            WPM Tezlik
          </span>
          <span className="text-[10px] text-slate-500">Net WPM</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-black font-mono text-cyan-400 tracking-tight group-hover:scale-105 transition-transform">
            {wpm}
          </span>
          <span className="text-xs text-slate-500 font-bold uppercase">WPM</span>
        </div>
        {/* Glow corner */}
        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-cyan-500/10 rounded-full blur-md" />
      </div>

      {/* Raw WPM */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            Raw WPM
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-extrabold font-mono text-purple-300">
            {rawWpm}
          </span>
          <span className="text-xs text-slate-500 font-bold">WPM</span>
        </div>
      </div>

      {/* Accuracy */}
      <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Aniqlik
          </span>
          <span className="text-[10px] text-emerald-400/80">
            {errorCount === 0 ? 'Toza' : `${errorCount} xato`}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-extrabold font-mono text-emerald-400">
            {accuracy}%
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Progress</span>
          <span className="text-amber-400 font-mono font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full rounded-full transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      {/* Elapsed Time */}
      <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Vaqt
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-bold font-mono text-slate-200">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
