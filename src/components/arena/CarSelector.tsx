import React from 'react';
import { CAR_SKINS, CarVisual } from '../../../shared/types.ts';
import { CarModel } from './CarModel.tsx';
import { Check } from 'lucide-react';

interface CarSelectorProps {
  selectedCarId: string;
  onSelectCar: (carId: string) => void;
}

export const CarSelector: React.FC<CarSelectorProps> = ({
  selectedCarId,
  onSelectCar,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Avtomobilingizni tanlang (8 ta Giperkar)
        </h3>
        <span className="text-xs text-cyan-400 font-medium">
          {CAR_SKINS.find(c => c.id === selectedCarId)?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CAR_SKINS.map((skin) => {
          const isSelected = skin.id === selectedCarId;
          return (
            <button
              key={skin.id}
              onClick={() => onSelectCar(skin.id)}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between border transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Mini visual car */}
              <div className="py-2 scale-90 sm:scale-100">
                <CarModel carId={skin.id} size="sm" isMoving={isSelected} />
              </div>

              {/* Title & Badge */}
              <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 truncate pr-1">
                  {skin.name}
                </span>
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded text-slate-950"
                  style={{ backgroundColor: skin.primaryColor }}
                >
                  {skin.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
