import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TestResult } from '../../App';
import { WORD_LIST } from '../../config/words';
import TestHeader from '../TestHeader/TestHeader';
import MobileInput from '../MobileInput/MobileInput';
import WordsDisplay from '../WordsDisplay/WordsDisplay';
import TestInstructions from '../TestInstructions/TestInstructions';

interface TypingTestProps {
  onTestComplete: (result: TestResult) => void;
}

interface TypingState {
  currentWordIndex: number;
  currentCharIndex: number;
  errors: number;
  correctWords: number;
  totalCharacters: number;
  correctCharacters: number;
  highestWPM: number;
}

interface TypingHistory {
  [key: string]: boolean;
}

interface RecentWord {
  word: string;
  timestamp: number;
}

// Custom hook for mobile detection
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Custom hook for word generation
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

// Custom hook for WPM calculations
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

// Custom hook for typing state management
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
  const [recentWords, setRecentWords] = useState<RecentWord[]>([]);
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

// Custom hook for timer management
const useTimer = (startTime: number | null, isTestComplete: boolean) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isTestComplete) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, isTestComplete]);

  const resetTimer = useCallback(() => {
    setTimeElapsed(0);
  }, []);

  return { timeElapsed, resetTimer };
};

// Custom hook for mobile input handling
const useMobileInput = (isMobile: boolean, handleCharacterInput: (char: string) => void, completeTest: () => void) => {
  const [inputValue, setInputValue] = useState('');
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleMobileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];
    
    if (lastChar) {
      handleCharacterInput(lastChar);
    }
    
    setInputValue('');
  }, [handleCharacterInput]);

  const focusMobileInput = useCallback(() => {
    if (isMobile && mobileInputRef.current) {
      const input = mobileInputRef.current;
      
      // Multiple strategies for reliable focus
      input.focus();
      
      setTimeout(() => {
        input.click();
        input.focus();
      }, 50);
      
      setTimeout(() => {
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        input.dispatchEvent(touchEvent);
        input.focus();
      }, 100);
    }
  }, [isMobile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      completeTest();
    }
  }, [completeTest]);

  return {
    inputValue,
    mobileInputRef,
    handleMobileInput,
    focusMobileInput,
    handleKeyDown,
  };
};

const TypingTest: React.FC<TypingTestProps> = ({ onTestComplete }) => {
  // Custom hooks
  const isMobile = useMobileDetection();
  const { words, addMoreWords, initializeWords } = useWordGeneration();
  const { calculateWPMFromCharacters, calculateAccuracy, calculateRollingWPM } = useWPMCalculations();
  const {
    typingState,
    typingHistory,
    recentWords,
    isTyping,
    updateTypingState,
    setTypingHistory,
    setRecentWords,
    setIsTyping,
    resetTypingState,
  } = useTypingState();

  // State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);

  // Refs
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Timer
  const { timeElapsed } = useTimer(startTime, isTestComplete);

  // Initialize words
  useEffect(() => {
    initializeWords();
  }, [initializeWords]);

  // Helper function to get global character index
  const getGlobalCharIndex = useCallback((wordIndex: number, charIndex: number): number => {
    let globalIndex = 0;
    for (let i = 0; i < wordIndex; i++) {
      globalIndex += words[i]?.length || 0;
      globalIndex += 1; // Add space
    }
    globalIndex += charIndex;
    return globalIndex;
  }, [words]);

  // Effect to center the current character
  useEffect(() => {
    const container = wordsContainerRef.current;
    const currentCharIndexGlobal = getGlobalCharIndex(typingState.currentWordIndex, typingState.currentCharIndex);
    const currentChar = charRefs.current[currentCharIndexGlobal];

    if (container && currentChar) {
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const charRect = currentChar.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        const charCenter = charRect.left + charRect.width / 2;

        if (charCenter > containerCenter) {
          const offset = charCenter - containerCenter;
          container.scrollLeft += offset;
        }
      });
    }
  }, [typingState.currentWordIndex, typingState.currentCharIndex, getGlobalCharIndex]);

  // Handle character input
  const handleCharacterInput = useCallback((typedChar: string) => {
    if (isTestComplete) return;

    setIsTyping(true);

    if (!startTime) {
      setStartTime(Date.now());
    }

    const currentWord = words[typingState.currentWordIndex];
    if (!currentWord) return;

    const expectedChar = currentWord[typingState.currentCharIndex];

    // Check if word is complete and user typed a space
    if (typingState.currentCharIndex >= currentWord.length && typedChar === ' ') {
      updateTypingState({
        correctWords: typingState.correctWords + 1,
        currentWordIndex: typingState.currentWordIndex + 1,
        currentCharIndex: 0,
        correctCharacters: typingState.correctCharacters + 1,
        totalCharacters: typingState.totalCharacters + 1,
      });
      
      setRecentWords(prev => [...prev, { word: currentWord, timestamp: Date.now() }]);

      // Add more words if running low
      if (typingState.currentWordIndex >= words.length - 30) {
        addMoreWords();
      }
      return;
    }

    // Check if the typed character is correct
    if (typedChar === expectedChar) {
      setTypingHistory(prev => ({
        ...prev,
        [`${typingState.currentWordIndex}-${typingState.currentCharIndex}`]: true,
      }));
      
      updateTypingState({
        currentCharIndex: typingState.currentCharIndex + 1,
        correctCharacters: typingState.correctCharacters + 1,
        totalCharacters: typingState.totalCharacters + 1,
      });
    } else if (typedChar === ' ') {
      updateTypingState({
        errors: typingState.errors + 1,
        totalCharacters: typingState.totalCharacters + 1,
      });
    } else if (typedChar) {
      setTypingHistory(prev => ({
        ...prev,
        [`${typingState.currentWordIndex}-${typingState.currentCharIndex}`]: false,
      }));
      
      updateTypingState({
        errors: typingState.errors + 1,
        totalCharacters: typingState.totalCharacters + 1,
      });
    }
  }, [
    isTestComplete,
    startTime,
    words,
    typingState,
    updateTypingState,
    setTypingHistory,
    setRecentWords,
    addMoreWords,
  ]);

  // Complete test
  const completeTest = useCallback(() => {
    if (!startTime) return;

    setIsTestComplete(true);
    const finalTimeElapsed = Date.now() - startTime;
    const finalWPM = calculateWPMFromCharacters(typingState.correctCharacters, finalTimeElapsed);
    const finalAccuracy = calculateAccuracy(typingState.correctCharacters, typingState.totalCharacters);

    const result: TestResult = {
      wpm: finalWPM,
      accuracy: finalAccuracy,
      totalWords: typingState.currentWordIndex,
      correctWords: typingState.correctWords,
      timeElapsed: finalTimeElapsed,
      errors: typingState.errors,
      highestWPM: typingState.highestWPM,
    };

    onTestComplete(result);
  }, [
    startTime,
    typingState,
    calculateWPMFromCharacters,
    calculateAccuracy,
    onTestComplete,
  ]);

  // Mobile input handling
  const {
    inputValue,
    mobileInputRef,
    handleMobileInput,
    focusMobileInput,
    handleKeyDown,
  } = useMobileInput(isMobile, handleCharacterInput, completeTest);

  // Handle words display click for mobile
  const handleWordsDisplayClick = useCallback(() => {
    if (isMobile) {
      focusMobileInput();
    }
  }, [isMobile, focusMobileInput]);

  // Keyboard event listeners (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      handleCharacterInput(e.key);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        completeTest();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, handleCharacterInput, completeTest]);

  // Focus mobile input when typing starts
  useEffect(() => {
    if (isTyping && isMobile) {
      focusMobileInput();
    }
  }, [isTyping, isMobile, focusMobileInput]);

  // Reset typing state after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isTyping) {
      timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [isTyping]);

  // Clean up old words from recent words array
  useEffect(() => {
    const now = Date.now();
    const windowMs = 10000; // 10 second window for cleanup
    setRecentWords(prev => prev.filter(word => now - word.timestamp < windowMs));
  }, [timeElapsed, setRecentWords]);

  // Track highest WPM achieved
  useEffect(() => {
    const currentWPM = calculateRollingWPM(recentWords);
    if (typingState.correctCharacters >= 5 && currentWPM > 0 && currentWPM < 1000 && currentWPM > typingState.highestWPM) {
      updateTypingState({ highestWPM: currentWPM });
    }
  }, [recentWords, typingState.correctCharacters, typingState.highestWPM, calculateRollingWPM, updateTypingState]);

  // Memoized calculations
  const avgWPM = useMemo(() => 
    startTime ? calculateWPMFromCharacters(typingState.correctCharacters, timeElapsed) : 0,
    [startTime, typingState.correctCharacters, timeElapsed, calculateWPMFromCharacters]
  );

  const currentWPM = useMemo(() => 
    calculateRollingWPM(recentWords),
    [recentWords, calculateRollingWPM]
  );

  const currentAccuracy = useMemo(() => 
    typingState.totalCharacters > 0 ? Math.round((typingState.correctCharacters / typingState.totalCharacters) * 100) : 100,
    [typingState.correctCharacters, typingState.totalCharacters]
  );

  return (
    <div className="typing-test">
      {/* Mobile Input */}
      {isMobile && (
        <MobileInput
          inputValue={inputValue}
          mobileInputRef={mobileInputRef}
          handleMobileInput={handleMobileInput}
          handleKeyDown={handleKeyDown}
          isTyping={isTyping}
          isTestComplete={isTestComplete}
        />
      )}

      {/* Test Header */}
      <TestHeader
        avgWPM={avgWPM}
        currentWPM={currentWPM}
        currentAccuracy={currentAccuracy}
        timeElapsed={timeElapsed}
        onCompleteTest={completeTest}
      />

      {/* Words Display */}
      <WordsDisplay
        words={words}
        typingState={typingState}
        typingHistory={typingHistory}
        isTyping={isTyping}
        startTime={startTime}
        isMobile={isMobile}
        wordsContainerRef={wordsContainerRef}
        charRefs={charRefs}
        getGlobalCharIndex={getGlobalCharIndex}
        onWordsDisplayClick={handleWordsDisplayClick}
        onFocus={isMobile ? focusMobileInput : undefined}
      />

      {/* Test Instructions */}
      <TestInstructions isMobile={isMobile} />
    </div>
  );
};

export default TypingTest;