import React, { useRef, useEffect } from 'react';
import { Keyboard, AlertCircle } from 'lucide-react';
import { sounds } from '../../lib/sound.ts';

interface TypingBoxProps {
  referenceText: string;
  userInput: string;
  onInputChange: (newInput: string, errorCount: number) => void;
  disabled: boolean;
  isFinished: boolean;
}

export const TypingBox: React.FC<TypingBoxProps> = ({
  referenceText,
  userInput,
  onInputChange,
  disabled,
  isFinished,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalErrorsRef = useRef<number>(0);

  // Auto-focus input when enabled
  useEffect(() => {
    if (!disabled && !isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, isFinished]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isFinished) return;
    const value = e.target.value;

    // Do not allow input beyond reference text
    if (value.length > referenceText.length) return;

    // Check if new character typed is an error
    const lastIndex = value.length - 1;
    if (lastIndex >= 0 && value.length > userInput.length) {
      if (value[lastIndex] !== referenceText[lastIndex]) {
        totalErrorsRef.current += 1;
        sounds.playError();
      } else {
        sounds.playKeypress();
      }
    } else {
      sounds.playKeypress();
    }

    onInputChange(value, totalErrorsRef.current);
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render text segments
  const renderCharacters = () => {
    const chars = [];
    const maxLen = referenceText.length;

    for (let i = 0; i < maxLen; i++) {
      const targetChar = referenceText[i];
      const typedChar = userInput[i];

      let state: 'correct' | 'incorrect' | 'current' | 'upcoming' = 'upcoming';

      if (i < userInput.length) {
        state = typedChar === targetChar ? 'correct' : 'incorrect';
      } else if (i === userInput.length) {
        state = 'current';
      }

      if (state === 'correct') {
        chars.push(
          <span
            key={i}
            className="text-emerald-400 bg-emerald-500/10 rounded-xs font-semibold"
          >
            {targetChar}
          </span>
        );
      } else if (state === 'incorrect') {
        chars.push(
          <span
            key={i}
            className="text-rose-300 bg-rose-500/30 rounded-xs font-bold underline decoration-rose-500 decoration-2"
          >
            {targetChar === ' ' ? '␣' : targetChar}
          </span>
        );
      } else if (state === 'current') {
        chars.push(
          <span
            key={i}
            className="text-cyan-200 bg-cyan-500/40 border-b-2 border-cyan-400 cursor-pulse font-bold rounded-xs px-[1px]"
          >
            {targetChar === ' ' ? '␣' : targetChar}
          </span>
        );
      } else {
        chars.push(
          <span key={i} className="text-slate-400 transition-colors">
            {targetChar}
          </span>
        );
      }
    }

    return chars;
  };

  // Find if current word has error
  const hasError = userInput.length > 0 && userInput !== referenceText.slice(0, userInput.length);

  return (
    <div
      onClick={handleContainerClick}
      className={`relative w-full rounded-2xl p-5 md:p-7 cursor-text transition-all duration-200 border ${
        disabled
          ? 'bg-slate-900/60 border-slate-800 opacity-80'
          : hasError
          ? 'bg-slate-950 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          : 'bg-slate-950/90 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.1)] focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20'
      }`}
    >
      {/* Hidden real input capturing all keyboard strokes */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleChange}
        disabled={disabled || isFinished}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 absolute inset-0 w-full h-full cursor-text -z-10"
      />

      {/* Header prompt */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-1.5 font-medium">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          <span>Matnni yozishni boshlang (Backspace bilan xatoni tuzating):</span>
        </div>
        {hasError && (
          <div className="flex items-center gap-1 text-rose-400 text-xs font-semibold animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Xato bor! To‘g‘rilash uchun Backspace bosing</span>
          </div>
        )}
      </div>

      {/* Styled interactive typing text display */}
      <div className="font-mono text-lg md:text-xl leading-relaxed tracking-wide select-none min-h-[90px] break-words">
        {renderCharacters()}
      </div>

      {/* Helper footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>Fokusni saqlash uchun istalgan joyni bosing</span>
        <span className="font-mono">
          {userInput.length} / {referenceText.length} belgi ({Math.round((userInput.length / Math.max(referenceText.length, 1)) * 100)}%)
        </span>
      </div>
    </div>
  );
};
