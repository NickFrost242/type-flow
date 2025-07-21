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

  // New version: WPM for the last 5 characters typed
  const calculateRollingWPM = useCallback((recentWords: RecentWord[]): number => {
    // Flatten recentWords into an array of { char, timestamp }
    const charTimestamps: number[] = [];
    for (let i = 0; i < recentWords.length; i++) {
      const word = recentWords[i];
      for (let j = 0; j < word.word.length; j++) {
        charTimestamps.push(word.timestamp);
      }
    }
    if (charTimestamps.length < 5) return 0;
    // Get the timestamp of the 5th most recent character
    const lastIndex = charTimestamps.length - 1;
    const fifthCharIndex = lastIndex - 4;
    const timeSpan = charTimestamps[lastIndex] - charTimestamps[fifthCharIndex];
    if (timeSpan <= 0) return 0;
    const minutes = timeSpan / 60000;
    // 5 characters = 1 word
    return Math.round(1 / minutes);
  }, []);

  return { calculateWPMFromCharacters, calculateAccuracy, calculateRollingWPM };
};

export default useWPMCalculations; 