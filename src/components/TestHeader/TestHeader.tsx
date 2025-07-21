import React from 'react';
import styles from './TestHeader.module.css';

interface TestHeaderProps {
  avgWPM: number;
  currentWPM: number;
  currentAccuracy: number;
  timeElapsed: number;
  onCompleteTest: () => void;
}

function TestHeader({
  avgWPM,
  currentWPM,
  currentAccuracy,
  timeElapsed,
  onCompleteTest,
}: TestHeaderProps) {
  return (
    <div className={styles['test-header']}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>WPM</span>
          <span className={styles['stat-value']}>{avgWPM}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>Current WPM</span>
          <span className={styles['stat-value']}>{currentWPM}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>Accuracy</span>
          <span className={styles['stat-value']}>{currentAccuracy}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>Time</span>
          <span className={styles['stat-value']}>{Math.round(timeElapsed / 1000)}s</span>
        </div>
      </div>
      <button className={styles['complete-button']} onClick={onCompleteTest}>
        Complete Test
      </button>
    </div>
  );
}

export default TestHeader; 