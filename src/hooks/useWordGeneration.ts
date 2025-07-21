import { useState, useCallback } from 'react';
import { WORD_LIST } from '../config/words';

const useWordGeneration = () => {
  const [words, setWords] = useState<string[]>([]);

  const generateWords = useCallback((count: number = 100) => {
    const newWords: string[] = [];
    for (let i = 0; i < count; i++) {
      newWords.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }
    return newWords;
  }, []);

  const addMoreWords = useCallback((count: number = 50) => {
    const newWords = generateWords(count);
    setWords(prev => [...prev, ...newWords]);
  }, [generateWords]);

  const initializeWords = useCallback(() => {
    setWords(generateWords(100));
  }, [generateWords]);

  return { words, addMoreWords, initializeWords };
};

export default useWordGeneration; 