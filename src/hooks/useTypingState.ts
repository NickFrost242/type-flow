import { useState, useCallback } from 'react';

export interface TypingState {
  currentWordIndex: number;
  currentCharIndex: number;
  errors: number;
  correctWords: number;
  totalCharacters: number;
  correctCharacters: number;
  highestWPM: number;
}

export interface TypingHistory {
  [key: string]: boolean;
}

const useTypingState = () => {
  const [typingState, setTypingState] = useState<TypingState>({
    currentWordIndex: 0,
    currentCharIndex: 0,
    errors: 0,
    correctWords: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    highestWPM: 0,
  });

  const [typingHistory, setTypingHistory] = useState<TypingHistory>({});
  const [recentWords, setRecentWords] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const updateTypingState = useCallback((updates: Partial<TypingState>) => {
    setTypingState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetTypingState = useCallback(() => {
    setTypingState({
      currentWordIndex: 0,
      currentCharIndex: 0,
      errors: 0,
      correctWords: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      highestWPM: 0,
    });
    setTypingHistory({});
    setRecentWords([]);
    setIsTyping(false);
  }, []);

  return {
    typingState,
    typingHistory,
    recentWords,
    isTyping,
    updateTypingState,
    setTypingHistory,
    setRecentWords,
    setIsTyping,
    resetTypingState,
  };
};

export default useTypingState; 