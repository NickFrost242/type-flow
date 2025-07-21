import React from 'react';
import styles from './WordsDisplay.module.css';

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

export interface WordsDisplayProps {
  words: string[];
  typingState: TypingState;
  typingHistory: TypingHistory;
  isTyping: boolean;
  startTime: number | null;
  isMobile: boolean;
  wordsContainerRef: React.RefObject<HTMLDivElement | null>;
  charRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  getGlobalCharIndex: (wordIndex: number, charIndex: number) => number;
  onWordsDisplayClick: () => void;
  onFocus?: () => void;
}

function WordsDisplay({
  words,
  typingState,
  typingHistory,
  isTyping,
  startTime,
  isMobile,
  wordsContainerRef,
  charRefs,
  getGlobalCharIndex,
  onWordsDisplayClick,
  onFocus,
}: WordsDisplayProps) {
  return (
    <div 
      className={styles['words-display']} 
      onClick={onWordsDisplayClick}
      tabIndex={isMobile ? 0 : undefined}
      onFocus={onFocus}
    >
      {isMobile && !startTime && (
        <div className={styles['mobile-start-indicator']}>
          <p>Tap here to start typing</p>
        </div>
      )}
      <div
        ref={wordsContainerRef}
        className={
          isTyping
            ? `${styles['words-container']} ${styles['typing-active']}`
            : styles['words-container']
        }
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className={styles.word}>
            {word.split('').map((char, charIndex) => {
              const isCompleted = wordIndex < typingState.currentWordIndex;
              const isCurrentWord = wordIndex === typingState.currentWordIndex;
              const isCurrentChar = isCurrentWord && charIndex === typingState.currentCharIndex;
              const historyKey = `${wordIndex}-${charIndex}`;
              const wasTyped = typingHistory[historyKey] !== undefined;
              const wasCorrect = typingHistory[historyKey];
              const globalCharIndex = getGlobalCharIndex(wordIndex, charIndex);

              let charClass = styles.char;
              if (isCompleted) charClass += ' ' + styles.completed;
              else if (wasTyped && wasCorrect) charClass += ' ' + styles.typed;
              else if (wasTyped && !wasCorrect) charClass += ' ' + styles['error-char'];
              else if (isCurrentChar) charClass += ' ' + styles['current-char'];

              return (
                <span
                  key={charIndex}
                  ref={(el) => {
                    charRefs.current[globalCharIndex] = el;
                  }}
                  className={charClass}
                >
                  {char}
                </span>
              );
            })}
            <span className={styles['word-space']}> </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default WordsDisplay; 