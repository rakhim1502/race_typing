import React from 'react';
import { Flame, Shield, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-[#060910] text-slate-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-black text-white">TypeRacer Arena</span>
            <span className="block text-xs text-slate-500">Real-time multiplayer typing racing platform</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>O‘zbekiston, Ingliz va Rus tillaridagi matnlar</span>
          <span>•</span>
          <span>Server-Authoritative Anti-Cheat</span>
          <span>•</span>
          <span>60 FPS Animation</span>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span>© 2026 TypeRacer Arena. Barcha huquqlar himoyalangan.</span>
        </div>
      </div>
    </footer>
  );
};
