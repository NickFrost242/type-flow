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
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [highestWPM, setHighestWPM] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [typingHistory, setTypingHistory] = useState<{ [key: string]: boolean }>({});
  const [recentWords, setRecentWords] = useState<{ word: string; timestamp: number }[]>([]);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateWords = useCallback(() => {
    const newWords: string[] = [];
    for (let i = 0; i < 100; i++) {
      newWords.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }

    setWords(newWords);
  }, []);

  // Generate initial words
  useEffect(() => {
    generateWords();
  }, [generateWords]);

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

        // If character is past center, scroll text to keep it visible
        if (charCenter > containerCenter) {
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

  const calculateWPMFromCharacters = useCallback((characters: number, timeElapsed: number): number => {
    if (timeElapsed === 0) return 0;
    const minutes = timeElapsed / 60000;
    // Standard WPM calculation: 5 characters = 1 word
    const words = characters / 5;
    return Math.round(words / minutes);
  }, []);

  const calculateAccuracy = useCallback((correctWords: number, totalWords: number): number => {
    if (totalWords === 0) return 100;
    return Math.round((correctWords / totalWords) * 100);
  }, []);

  const calculateRollingWPM = useCallback((): number => {
    if (recentWords.length === 0) return 0;
    
    const now = Date.now();
    const windowMs = 5000; // 5 second window
    const recentWordsInWindow = recentWords.filter(word => now - word.timestamp < windowMs);
    
    if (recentWordsInWindow.length === 0) return 0;
    
    const oldestWord = recentWordsInWindow[0];
    const timeSpan = now - oldestWord.timestamp;
    
    // Require at least 1 second of typing for WPM calculation
    if (timeSpan < 1000) return 0;
    
    const minutes = timeSpan / 60000;
    
    // Calculate characters in recent words
    const recentCharacters = recentWordsInWindow.reduce((total, word) => total + word.word.length, 0);
    const words = recentCharacters / 5; // 5 characters = 1 word (standard)
    
    // Only return WPM if we have enough characters for a meaningful calculation
    if (recentCharacters < 5) return 0;
    
    return Math.round(words / minutes);
  }, [recentWords]);

  const completeTest = useCallback(() => {
    if (!startTime) return;

    setIsTestComplete(true);
    const finalTimeElapsed = Date.now() - startTime;
    const finalWPM = calculateWPMFromCharacters(correctCharacters, finalTimeElapsed);
    const finalAccuracy = calculateAccuracy(correctWords, currentWordIndex);

    const result: TestResult = {
      wpm: finalWPM,
      accuracy: finalAccuracy,
      totalWords: currentWordIndex,
      correctWords,
      timeElapsed: finalTimeElapsed,
      errors,
      highestWPM
    };

    onTestComplete(result);
  }, [startTime, correctWords, currentWordIndex, errors, calculateWPMFromCharacters, calculateAccuracy, onTestComplete, highestWPM, correctCharacters]);

  // Handle character input (works for both keyboard and mobile)
  const handleCharacterInput = useCallback((typedChar: string) => {
    if (isTestComplete) return;

    setIsTyping(true);

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Get the current character that should be typed
    const currentWord = words[currentWordIndex];
    if (!currentWord) return; // Safety check

    const expectedChar = currentWord[currentCharIndex];

    // Check if word is complete and user typed a space
    if (currentCharIndex >= currentWord.length && typedChar === ' ') {
      // Word is complete and space was typed - move to next word
      setCorrectWords(prev => prev + 1);
      setCurrentWordIndex(prev => prev + 1);
      setCurrentCharIndex(0);
      
      // Count the space as a correct character
      setCorrectCharacters(prev => prev + 1);
      setTotalCharacters(prev => prev + 1);
      
      // Add word to recent words for rolling WPM calculation
      setRecentWords(prev => [...prev, { word: currentWord, timestamp: Date.now() }]);

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
      setCorrectCharacters(prev => prev + 1);
      setTotalCharacters(prev => prev + 1);

      // If word is complete, wait for space
      if (currentCharIndex + 1 >= currentWord.length) {
        // Word is complete, but don't advance yet - wait for space
      }
    } else if (typedChar === ' ') {
      // Wrong space - count as error but don't advance
      setErrors(prev => prev + 1);
      setTotalCharacters(prev => prev + 1);
    } else if (typedChar) {
      // Wrong character (but not space) - show error and don't advance
      setTypingHistory(prev => ({
        ...prev,
        [`${currentWordIndex}-${currentCharIndex}`]: false
      }));
      setErrors(prev => prev + 1);
      setTotalCharacters(prev => prev + 1);
    }
  }, [currentWordIndex, currentCharIndex, words, isTestComplete, startTime, addMoreWords]);

  // Mobile input handler
  const handleMobileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];
    
    if (lastChar) {
      handleCharacterInput(lastChar);
    }
    
    // Reset input value to keep it empty
    setInputValue('');
  }, [handleCharacterInput]);

  // Focus mobile input when test starts
  const focusMobileInput = useCallback(() => {
    if (isMobile && mobileInputRef.current) {
      // Multiple strategies to ensure focus works on all mobile devices
      const input = mobileInputRef.current;
      
      // Strategy 1: Direct focus
      input.focus();
      
      // Strategy 2: Click to focus (for iOS)
      setTimeout(() => {
        input.click();
        input.focus();
      }, 50);
      
      // Strategy 3: Touch event simulation
      setTimeout(() => {
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        input.dispatchEvent(touchEvent);
        input.focus();
      }, 100);
    }
  }, [isMobile]);

  // Handle words display click for mobile
  const handleWordsDisplayClick = useCallback(() => {
    if (isMobile) {
      focusMobileInput();
    }
  }, [isMobile, focusMobileInput]);

  // Add keyboard event listeners (for desktop)
  useEffect(() => {
    if (isMobile) return; // Skip keyboard events on mobile

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

  // Clean up old words from recent words array
  useEffect(() => {
    const now = Date.now();
    const windowMs = 10000; // 10 second window for cleanup
    setRecentWords(prev => prev.filter(word => now - word.timestamp < windowMs));
  }, [timeElapsed]); // Run cleanup every time timer updates

  const avgWPM = startTime ? calculateWPMFromCharacters(correctCharacters, timeElapsed) : 0;
  const currentWPM = calculateRollingWPM();
  const currentAccuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 100;

  // Track highest WPM achieved (only after minimum characters typed)
  useEffect(() => {
    // Only track highest WPM after at least 5 characters and if current WPM is reasonable
    if (correctCharacters >= 5 && currentWPM > 0 && currentWPM < 1000 && currentWPM > highestWPM) {
      setHighestWPM(currentWPM);
    }
  }, [currentWPM, highestWPM, correctCharacters]);

  return (
    <div className="typing-test">
      <div className="test-header">
        <div className="stats">
          <div className="stat">
            <span className="stat-label">WPM</span>
            <span className="stat-value">{avgWPM}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Current WPM</span>
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

      <div 
        className="words-display" 
        onClick={handleWordsDisplayClick}
        tabIndex={isMobile ? 0 : undefined}
        onFocus={isMobile ? focusMobileInput : undefined}
      >
        {/* Hidden mobile input for keyboard handling */}
        {isMobile && (
          <input
            ref={mobileInputRef}
            type="text"
            value={inputValue}
            onChange={handleMobileInput}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                completeTest();
              }
            }}
            onFocus={() => {
              // Ensure the input stays focused for mobile keyboard
              if (mobileInputRef.current) {
                mobileInputRef.current.focus();
              }
            }}
            onBlur={() => {
              // Refocus if the user is still typing
              if (isTyping && !isTestComplete) {
                setTimeout(() => {
                  if (mobileInputRef.current) {
                    mobileInputRef.current.focus();
                  }
                }, 100);
              }
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.1, // More visible for better focus
              width: '10px',
              height: '10px',
              border: '1px solid transparent',
              background: 'transparent',
              fontSize: '16px', // Prevents zoom on iOS
              zIndex: 1000,
              cursor: 'none',
              caretColor: 'transparent',
              color: 'transparent'
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
            enterKeyHint="done"
          />
        )}
        
        {isMobile && !startTime && (
          <div className="mobile-start-indicator">
            <p>Tap here to start typing</p>
          </div>
        )}
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
                    className={`char ${isCompleted ? 'completed' :
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
      </div>

      <div className="test-instructions">
        <p>
          {isMobile 
            ? "Tap the text area to start typing. Press ESC, Enter, or click 'Complete Test' to finish."
            : "Start typing to begin the test. Press ESC, Enter, or click 'Complete Test' to finish."
          }
        </p>
      </div>
    </div>
  );
};

export default TypingTest;