import React from 'react';
import styles from './MobileInput.module.css';

interface MobileInputProps {
  inputValue: string;
  mobileInputRef: React.RefObject<HTMLInputElement | null>;
  handleMobileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isTyping: boolean;
  isTestComplete: boolean;
}

function MobileInput({
  inputValue,
  mobileInputRef,
  handleMobileInput,
  handleKeyDown,
  isTyping,
  isTestComplete,
}: MobileInputProps) {
  return (
    <input
      ref={mobileInputRef}
      type="text"
      value={inputValue}
      onChange={handleMobileInput}
      onKeyDown={handleKeyDown}
      className={styles['typing-input']}
      onFocus={() => {
        if (mobileInputRef.current) {
          mobileInputRef.current.focus();
        }
      }}
      onBlur={() => {
        if (isTyping && !isTestComplete) {
          setTimeout(() => {
            if (mobileInputRef.current) {
              mobileInputRef.current.focus();
            }
          }, 100);
        }
      }}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      inputMode="text"
      enterKeyHint="done"
    />
  )
};

export default MobileInput; 