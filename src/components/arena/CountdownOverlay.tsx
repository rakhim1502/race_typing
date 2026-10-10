import React, { useEffect } from 'react';
import { Flag, Zap } from 'lucide-react';

interface CountdownOverlayProps {
  seconds: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ seconds }) => {
  // Beep audio synthesizer using standard Web Audio API
  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      // High pitch when GO (0), lower pitch for 3, 2, 1
      osc.frequency.setValueAtTime(seconds === 0 ? 880 : 440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio autoplay may be prevented before user interaction
    }
  }, [seconds]);

  const display = seconds > 0 ? seconds : 'GO!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md pointer-events-none select-none">
      <div className="text-center flex flex-col items-center">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-black uppercase tracking-widest mb-2 animate-pulse">
          <Zap className="w-4 h-4" />
          <span>Barcha o‘yinchilar tayyor!</span>
          <Zap className="w-4 h-4" />
        </div>

        <div
          key={seconds}
          className={`font-black font-mono tracking-tighter transition-all duration-300 transform scale-125 animate-ping ${
            seconds === 0
              ? 'text-7xl sm:text-9xl text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.8)]'
              : 'text-7xl sm:text-9xl text-cyan-300 drop-shadow-[0_0_40px_rgba(6,182,212,0.8)]'
          }`}
        >
          {display}
        </div>

        <div className="mt-4 text-xs font-semibold text-slate-400">
          Klaviatura tayyorlang, GO! bilan bir zumda yozishni boshlang!
        </div>
      </div>
    </div>
  );
};
