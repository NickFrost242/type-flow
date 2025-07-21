import React from 'react';
import { TestResult } from '../../App';
import styles from './Results.module.css';

interface ResultsProps {
  results: TestResult;
  onStartNewTest: () => void;
}

function Results({ results, onStartNewTest }: ResultsProps) {
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.round(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWPMRating = (wpm: number): string => {
    if (wpm >= 80) return 'Excellent';
    if (wpm >= 60) return 'Good';
    if (wpm >= 40) return 'Average';
    if (wpm >= 20) return 'Below Average';
    return 'Beginner';
  };

  const getAccuracyRating = (accuracy: number): string => {
    if (accuracy >= 98) return 'Excellent';
    if (accuracy >= 95) return 'Good';
    if (accuracy >= 90) return 'Average';
    if (accuracy >= 80) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <div className={styles.results}>
      <div className={styles['results-header']}>
        <h2>Test Complete!</h2>
        <p>Here are your typing results</p>
      </div>

      <div className={styles['results-grid']}>
        <div className={`${styles['result-card']} ${styles.primary}`}>
          <div className={styles['result-value']}>{results.wpm}</div>
          <div className={styles['result-label']}>Words Per Minute</div>
          <div className={styles['result-rating']}>{getWPMRating(results.wpm)}</div>
        </div>

        <div className={styles['result-card']}>
          <div className={styles['result-value']}>{results.highestWPM}</div>
          <div className={styles['result-label']}>Highest WPM</div>
          <div className={styles['result-rating']}>Peak Speed</div>
        </div>

        <div className={styles['result-card']}>
          <div className={styles['result-value']}>{results.accuracy}%</div>
          <div className={styles['result-label']}>Accuracy</div>
          <div className={styles['result-rating']}>{getAccuracyRating(results.accuracy)}</div>
        </div>

        <div className={styles['result-card']}>
          <div className={styles['result-value']}>{formatTime(results.timeElapsed)}</div>
          <div className={styles['result-label']}>Time</div>
        </div>

        <div className={styles['result-card']}>
          <div className={styles['result-value']}>{results.totalWords}</div>
          <div className={styles['result-label']}>Words Typed</div>
        </div>

        <div className={styles['result-card']}>
          <div className={styles['result-value']}>{results.correctWords}</div>
          <div className={styles['result-label']}>Correct Words</div>
        </div>

        <div className={styles['result-card']}>
          <div className={styles['result-value']}>{results.errors}</div>
          <div className={styles['result-label']}>Errors</div>
        </div>
      </div>

      <div className={styles['results-actions']}>
        <button className={styles['new-test-button']} onClick={onStartNewTest}>
          Take Another Test
        </button>
      </div>

      <div className={styles['results-tips']}>
        <h3>Tips to Improve Your Speed</h3>
        <ul>
          <li>Practice regularly with typing exercises</li>
          <li>Focus on accuracy first, then speed</li>
          <li>Use proper finger positioning on the keyboard</li>
          <li>Take breaks to avoid fatigue</li>
          <li>Try different typing techniques like touch typing</li>
        </ul>
      </div>
    </div>
  );
}

export default Results; 