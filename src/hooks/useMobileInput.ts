import { useState, useRef, useCallback } from 'react';

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

export default useMobileInput; 