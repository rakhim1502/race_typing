export interface ValidationResult {
  isValid: boolean;
  correctChars: number;
  progress: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  isFinished: boolean;
  reason?: string;
}

export class RaceEngine {
  /**
   * Validates typed text progress against reference text.
   * Server is the sole authority on WPM, accuracy, and finish state.
   */
  static validateProgress(
    referenceText: string,
    currentInput: string,
    errorCount: number,
    startTime: number,
    currentTime: number
  ): ValidationResult {
    const refLen = referenceText.length;
    if (refLen === 0) {
      return { isValid: false, correctChars: 0, progress: 0, wpm: 0, rawWpm: 0, accuracy: 100, isFinished: false, reason: 'Empty reference' };
    }

    // Check bounds
    if (currentInput.length > refLen) {
      return {
        isValid: false,
        correctChars: 0,
        progress: 0,
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        isFinished: false,
        reason: 'Input exceeds reference text length',
      };
    }

    // Compute correct characters prefix
    let correctChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === referenceText[i]) {
        correctChars++;
      } else {
        // If there is an error in current prefix, valid completed length stops at first mismatch
        break;
      }
    }

    // Elapsed time in minutes (minimum 1 second to avoid division by near-zero)
    const elapsedMs = Math.max(currentTime - startTime, 1000);
    const elapsedMinutes = elapsedMs / 60000;

    // Standard Typing Metric Formulas:
    // WPM = (correctly typed characters / 5) / elapsedMinutes
    // Raw WPM = (total typed characters / 5) / elapsedMinutes
    const rawWpm = Math.max(0, Math.round((currentInput.length / 5) / elapsedMinutes));
    const wpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));

    // Accuracy: ratio of correct characters against total keystrokes (correct + recorded errors)
    const totalKeystrokes = Math.max(correctChars + errorCount, currentInput.length, 1);
    const accuracy = Math.min(100, Math.max(0, Number(((correctChars / totalKeystrokes) * 100).toFixed(1))));

    // Progress: percentage of reference text successfully completed
    const progress = Math.min(100, Math.max(0, Number(((correctChars / refLen) * 100).toFixed(1))));

    // Finished condition: exact match and 100% progress
    const isFinished = correctChars === refLen && currentInput === referenceText;

    // Sanity check: Anti-cheat cap (impossible human WPM threshold > 280)
    if (wpm > 280 && elapsedMs > 3000) {
      return {
        isValid: false,
        correctChars,
        progress,
        wpm: 0,
        rawWpm,
        accuracy,
        isFinished: false,
        reason: 'Typing velocity exceeds legitimate threshold',
      };
    }

    return {
      isValid: true,
      correctChars,
      progress,
      wpm,
      rawWpm,
      accuracy,
      isFinished,
    };
  }
}
