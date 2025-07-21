import { useCallback } from 'react';

export interface RecentWord {
  word: string;
  timestamp: number; // when the word was typed
}

const useWPMCalculations = () => {
  const calculateWPMFromCharacters = useCallback((characters: number, timeElapsed: number): number => {
    if (timeElapsed === 0) return 0;
    const minutes = timeElapsed / 60000;
    const words = characters / 5;
    return Math.round(words / minutes);
  }, []);

  const calculateAccuracy = useCallback((correctCharacters: number, totalCharacters: number): number => {
    if (totalCharacters === 0) return 100;
    return Math.round((correctCharacters / totalCharacters) * 100);
  }, []);

  const calculateRollingWPM = useCallback((recentWords: RecentWord[]): number => {
    const now = Date.now();
    const windowMs = 5000;
  
    // Step 1: Filter recent words within time window
    const filteredWords = recentWords.filter(word => now - word.timestamp <= windowMs);
    if (filteredWords.length === 0) return 0;
  
    // Step 2: Flatten to character timestamps (one per char)
    const charTimestamps: number[] = [];
    for (const word of filteredWords) {
      for (let i = 0; i < word.word.length; i++) {
        charTimestamps.push(word.timestamp);
      }
    }
  
    if (charTimestamps.length < 2) return 0;
  
    // Step 3: Calculate dynamic time window (based on char timestamps)
    const earliest = Math.min(...charTimestamps);
    const latest = Math.max(...charTimestamps);
    const actualDuration = latest - earliest;
  
    if (actualDuration <= 0) return 0;
  
    // Step 4: Calculate WPM using real character count and actual time
    const totalCharacters = charTimestamps.length;
    const minutes = actualDuration / 60000;
    const wpm = (totalCharacters / 5) / minutes;
  
    return Math.round(wpm);
  }, []);

  return {
    calculateWPMFromCharacters,
    calculateAccuracy,
    calculateRollingWPM,
  };
};

export default useWPMCalculations;
