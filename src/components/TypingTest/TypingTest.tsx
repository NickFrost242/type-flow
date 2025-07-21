import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TestResult } from '../../App';
import { WORD_LIST } from '../../config/words';
import TestHeader from '../TestHeader/TestHeader';
import MobileInput from '../MobileInput/MobileInput';
import WordsDisplay from '../WordsDisplay/WordsDisplay';
import TestInstructions from '../TestInstructions/TestInstructions';
import useMobileDetection from '../../hooks/useMobileDetection';
import useWordGeneration from '../../hooks/useWordGeneration';
import useWPMCalculations, { RecentWord } from '../../hooks/useWPMCalculations';
import useTypingState, { TypingState, TypingHistory } from '../../hooks/useTypingState';
import useTimer from '../../hooks/useTimer';
import useMobileInput from '../../hooks/useMobileInput';

interface TypingTestProps {
  onTestComplete: (result: TestResult) => void;
}

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

      <TestInstructions isMobile={isMobile} />
    </div>
  );
};

export default TypingTest;