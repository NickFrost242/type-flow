import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TestResult } from '../App';
import { WORD_LIST } from '../config/words';

interface TypingTestProps {
  onTestComplete: (result: TestResult) => void;
}

const TypingTest: React.FC<TypingTestProps> = ({ onTestComplete }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isTyping, setIsTyping] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(50); // Start at center (50%)

  const [typingHistory, setTypingHistory] = useState<{[key: string]: boolean}>({});
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const generateWords = useCallback(() => {
    const newWords: string[] = [];
    for (let i = 0; i < 100; i++) {
      newWords.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }
    console.log('Generated words:', newWords.slice(0, 5)); // Debug log
    setWords(newWords);
  }, []);

  // Generate initial words
  useEffect(() => {
    generateWords();
  }, [generateWords]);

  // Set container width when component mounts
  useEffect(() => {
    if (wordsContainerRef.current) {
      setContainerWidth(wordsContainerRef.current.offsetWidth);
    }
  }, []);

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
    const currentCharIndexGlobal = getGlobalCharIndex(currentWordIndex, currentCharIndex);
    const currentChar = charRefs.current[currentCharIndexGlobal];
    
    if (container && currentChar) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const charRect = currentChar.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        const charCenter = charRect.left + charRect.width / 2;
        
        // Calculate cursor position as percentage of container width (left edge of character)
        const cursorPosPercent = ((charRect.left - containerRect.left) / containerRect.width) * 100;
        
        // If character is before center, move cursor to follow it
        if (charCenter <= containerCenter) {
          setCursorPosition(cursorPosPercent);
        } else {
          // If character is past center, keep cursor at center and scroll text
          setCursorPosition(50);
          const offset = charCenter - containerCenter;
          container.scrollLeft += offset;
        }
      });
    }
  }, [currentWordIndex, currentCharIndex, getGlobalCharIndex]);

  const addMoreWords = useCallback(() => {
    const newWords: string[] = [];
    for (let i = 0; i < 50; i++) {
      newWords.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }
    setWords(prev => [...prev, ...newWords]);
  }, []);

  const calculateWPM = useCallback((correctWords: number, timeElapsed: number): number => {
    if (timeElapsed === 0) return 0;
    const minutes = timeElapsed / 60000; // Convert milliseconds to minutes
    return Math.round(correctWords / minutes);
  }, []);

  const calculateAccuracy = useCallback((correctWords: number, totalWords: number): number => {
    if (totalWords === 0) return 100;
    return Math.round((correctWords / totalWords) * 100);
  }, []);

  const completeTest = useCallback(() => {
    if (!startTime) return;
    
    setIsTestComplete(true);
    const finalTimeElapsed = Date.now() - startTime;
    const finalWPM = calculateWPM(correctWords, finalTimeElapsed);
    const finalAccuracy = calculateAccuracy(correctWords, currentWordIndex);

    const result: TestResult = {
      wpm: finalWPM,
      accuracy: finalAccuracy,
      totalWords: currentWordIndex,
      correctWords,
      timeElapsed: finalTimeElapsed,
      errors
    };

    onTestComplete(result);
  }, [startTime, correctWords, currentWordIndex, errors, calculateWPM, calculateAccuracy, onTestComplete]);

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTestComplete) return;
      
      // Prevent default behavior for typing characters
      e.preventDefault();
      
      console.log('Key pressed:', e.key); // Debug log
      
      setIsTyping(true);
      
      if (!startTime) {
        setStartTime(Date.now());
      }

      // Get the current character that should be typed
      const currentWord = words[currentWordIndex];
      if (!currentWord) return; // Safety check
      
      const expectedChar = currentWord[currentCharIndex];
      const typedChar = e.key;

      // Check if word is complete and user typed a space
      if (currentCharIndex >= currentWord.length && typedChar === ' ') {
        // Word is complete and space was typed - move to next word
        setCorrectWords(prev => prev + 1);
        setCurrentWordIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        
        // Add more words if we're running low
        if (currentWordIndex >= words.length - 30) {
          addMoreWords();
        }
        return;
      }

      // Check if the typed character is correct
      if (typedChar === expectedChar) {
        // Correct character - move to next character
        setTypingHistory(prev => ({
          ...prev,
          [`${currentWordIndex}-${currentCharIndex}`]: true
        }));
        setCurrentCharIndex(prev => prev + 1);
        
        // If word is complete, wait for space
        if (currentCharIndex + 1 >= currentWord.length) {
          // Word is complete, but don't advance yet - wait for space
        }
      } else if (typedChar && typedChar !== ' ') {
        // Wrong character (but not space) - show error and don't advance
        setTypingHistory(prev => ({
          ...prev,
          [`${currentWordIndex}-${currentCharIndex}`]: false
        }));
        setErrors(prev => prev + 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [currentWordIndex, currentCharIndex, words, isTestComplete, startTime, addMoreWords, completeTest]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isTestComplete) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [startTime, isTestComplete]);

  // Reset typing state after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isTyping) {
      timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000); // Reset after 2 seconds of inactivity
    }
    return () => clearTimeout(timeout);
  }, [isTyping]);



  const currentWPM = startTime ? calculateWPM(correctWords, timeElapsed) : 0;
  const currentAccuracy = currentWordIndex > 0 ? calculateAccuracy(correctWords, currentWordIndex) : 100;


  return (
    <div className="typing-test">
      <div className="test-header">
        <div className="stats">
          <div className="stat">
            <span className="stat-label">WPM</span>
            <span className="stat-value">{currentWPM}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{currentAccuracy}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{Math.round(timeElapsed / 1000)}s</span>
          </div>
        </div>
        <button className="complete-button" onClick={completeTest}>
          Complete Test
        </button>
      </div>

      <div className="words-display">
        <div 
          ref={wordsContainerRef}
          className={`words-container ${isTyping ? 'typing-active' : ''}`}
        >
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="word">
              {word.split('').map((char, charIndex) => {
                const isCompleted = wordIndex < currentWordIndex;
                const isCurrentWord = wordIndex === currentWordIndex;
                const isCurrentChar = isCurrentWord && charIndex === currentCharIndex;
                const historyKey = `${wordIndex}-${charIndex}`;
                const wasTyped = typingHistory[historyKey] !== undefined;
                const wasCorrect = typingHistory[historyKey];
                const globalCharIndex = getGlobalCharIndex(wordIndex, charIndex);
                
                return (
                  <span
                    key={charIndex}
                    ref={(el) => {
                      charRefs.current[globalCharIndex] = el;
                    }}
                    className={`char ${
                      isCompleted ? 'completed' :
                      wasTyped && wasCorrect ? 'typed' :
                      wasTyped && !wasCorrect ? 'error-char' :
                      isCurrentChar ? 'current-char' : ''
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
              <span className="word-space"> </span>
            </span>
          ))}
        </div>
        <div 
          className="cursor-overlay"
          style={{ left: `${cursorPosition}%` }}
        ></div>
      </div>

      <div className="test-instructions">
        <p>Start typing to begin the test. Press ESC or click "Complete Test" to finish.</p>
      </div>
    </div>
  );
};

export default TypingTest;