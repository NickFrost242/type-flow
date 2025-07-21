import { useState, useEffect, useCallback } from 'react';

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

export default useTimer; 