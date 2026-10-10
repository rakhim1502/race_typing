import React, { useState, useEffect } from 'react';
import { RoomState, RaceParticipant, CAR_SKINS } from '../../shared/types.ts';
import { RaceTrack } from '../components/arena/RaceTrack.tsx';
import { StatHUD } from '../components/typing/StatHUD.tsx';
import { TypingBox } from '../components/typing/TypingBox.tsx';
import { CountdownOverlay } from '../components/arena/CountdownOverlay.tsx';
import { ResultsModal } from '../components/arena/ResultsModal.tsx';
import { CarModel } from '../components/arena/CarModel.tsx';
import { Copy, Check, LogOut, CheckCircle2, Clock, Users, Globe, Zap, AlertCircle } from 'lucide-react';

interface RacePageProps {
  room: RoomState;
  currentUserId: string;
  onToggleReady: (isReady: boolean) => void;
  onSendProgress: (typedLength: number, currentInput: string, errorCount: number) => void;
  onLeaveRoom: () => void;
  onRematch: () => void;
}

export const RacePage: React.FC<RacePageProps> = ({
  room,
  currentUserId,
  onToggleReady,
  onSendProgress,
  onLeaveRoom,
  onRematch,
}) => {
  const [userInput, setUserInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const participantsList: RaceParticipant[] = Object.values(room.participants);
  const currentPlayer = participantsList.find(p => p.userId === currentUserId);
  const isRacing = room.status === 'RACING';
  const isFinished = room.status === 'FINISHED' || (currentPlayer?.isFinished ?? false);

  // Timer for elapsed race duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRacing && room.startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - (room.startTime || Date.now())) / 1000));
      }, 500);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRacing, room.startTime]);

  // Reset input when room transitions back to WAITING (rematch)
  useEffect(() => {
    if (room.status === 'WAITING') {
      setUserInput('');
    }
  }, [room.status]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInputChange = (newInput: string, errorCount: number) => {
    setUserInput(newInput);
    onSendProgress(newInput.length, newInput, errorCount);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ROOM HEADER & ACTIONS */}
      <div className="bg-[#0b101c] border border-cyan-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{room.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                {room.language.toUpperCase()} • {room.difficulty}
              </span>
            </h1>
          </div>

          {/* Copy Room Code Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
            title="Xona kodidan nusxa olish"
          >
            <span>KOD: {room.code}</span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Leave Room Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Xonadan Chiqish</span>
          </button>
        </div>
      </div>

      {/* WAITING ROOM PRE-RACE VIEW */}
      {room.status === 'WAITING' && (
        <div className="bg-[#0b101c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase mb-2">
              <Users className="w-4 h-4" />
              <span>Kutish Zali ({participantsList.length}/{room.maxPlayers})</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Barcha o‘yinchilar tayyor bo‘lishi kutilmoqda...
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Do‘stlaringizni taklif qilish uchun xona kodi (<span className="text-cyan-300 font-mono font-bold">{room.code}</span>)ni ulashing.
            </p>
          </div>

          {/* Participants Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {participantsList.map((p) => {
              const isMe = p.userId === currentUserId;
              const carSkin = CAR_SKINS.find(c => c.id === p.carId) || CAR_SKINS[0];

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                    isMe
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                    <span className="truncate pr-1">{p.username} {isMe && '(Siz)'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.isReady
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {p.isReady ? 'Tayyor' : 'Kutilmoqda'}
                    </span>
                  </div>

                  <div className="my-2 scale-90">
                    <CarModel carId={p.carId} size="sm" isMoving={p.isReady} />
                  </div>

                  <div className="text-[10px] font-bold text-slate-400">
                    {carSkin.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ready Button */}
          {currentPlayer && (
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onToggleReady(!currentPlayer.isReady)}
                className={`py-4 px-10 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                  currentPlayer.isReady
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/30 animate-pulse'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>{currentPlayer.isReady ? 'Tayyorman (Bekor Qilish)' : 'Tayyorman (Ready)'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* COUNTDOWN OVERLAY */}
      {room.status === 'COUNTDOWN' && (
        <CountdownOverlay seconds={room.countdownSeconds} />
      )}

      {/* RACE TRACK ARENA (Always visible when Countdown or Racing or Finished) */}
      {(room.status === 'RACING' || room.status === 'COUNTDOWN' || room.status === 'FINISHED') && (
        <div className="space-y-6">
          {/* Real-Time Race Track */}
          <RaceTrack
            participants={participantsList}
            currentUserId={currentUserId}
            isRacing={isRacing}
          />

          {/* Live Player Stat HUD */}
          {currentPlayer && (
            <StatHUD
              wpm={currentPlayer.wpm}
              rawWpm={currentPlayer.rawWpm}
              accuracy={currentPlayer.accuracy}
              progress={currentPlayer.progress}
              errorCount={currentPlayer.errorCount}
              elapsedSeconds={elapsedSeconds}
            />
          )}

          {/* Interactive Character Highlight Typing Box */}
          <TypingBox
            referenceText={room.text.content}
            userInput={userInput}
            onInputChange={handleInputChange}
            disabled={!isRacing}
            isFinished={currentPlayer?.isFinished ?? false}
          />
        </div>
      )}

      {/* RESULTS MODAL (Podium & Rematch) */}
      {room.status === 'FINISHED' && (
        <ResultsModal
          results={room.results}
          currentUserId={currentUserId}
          onRematch={onRematch}
          onLeave={onLeaveRoom}
        />
      )}
    </div>
  );
};
