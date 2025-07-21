import { useCallback } from 'react';

export interface RecentWord {
  word: string;
  timestamp: number;
}

const useWPMCalculations = () => {
  const calculateWPMFromCharacters = useCallback((characters: number, timeElapsed: number): number => {
    if (timeElapsed === 0) return 0;
    const minutes = timeElapsed / 60000;
    const words = characters / 5; // Standard: 5 characters = 1 word
    return Math.round(words / minutes);
  }, []);

  const calculateAccuracy = useCallback((correctCharacters: number, totalCharacters: number): number => {
    if (totalCharacters === 0) return 100;
    return Math.round((correctCharacters / totalCharacters) * 100);
  }, []);

  const calculateRollingWPM = useCallback((recentWords: RecentWord[]): number => {
    if (recentWords.length === 0) return 0;
    const now = Date.now();
    const windowMs = 5000; // 5 second window
    const recentWordsInWindow = recentWords.filter(word => now - word.timestamp < windowMs);
    if (recentWordsInWindow.length === 0) return 0;
    const oldestWord = recentWordsInWindow[0];
    const timeSpan = now - oldestWord.timestamp;
    if (timeSpan < 1000) return 0; // Require at least 1 second
    const minutes = timeSpan / 60000;
    const recentCharacters = recentWordsInWindow.reduce((total, word) => total + word.word.length, 0);
    const words = recentCharacters / 5;
    return recentCharacters < 5 ? 0 : Math.round(words / minutes);
  }, []);

  return { calculateWPMFromCharacters, calculateAccuracy, calculateRollingWPM };
};

export default useWPMCalculations; 