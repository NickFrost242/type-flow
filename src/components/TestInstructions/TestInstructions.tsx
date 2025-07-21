import React from 'react';
import styles from './TestInstructions.module.css';

interface TestInstructionsProps {
  isMobile: boolean;
}

const TestInstructions: React.FC<TestInstructionsProps> = ({ isMobile }) => (
  <div className={styles['test-instructions']}>
    <p>
      {isMobile 
        ? "Tap the text area to start typing. Press ESC, Enter, or click 'Complete Test' to finish."
        : "Start typing to begin the test. Press ESC, Enter, or click 'Complete Test' to finish."
      }
    </p>
  </div>
);

export default TestInstructions; 