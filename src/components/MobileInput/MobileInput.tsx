import React from 'react';

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
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.1,
        width: '10px',
        height: '10px',
        border: '1px solid transparent',
        background: 'transparent',
        fontSize: '16px',
        zIndex: 1000,
        cursor: 'none',
        caretColor: 'transparent',
        color: 'transparent',
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