import React, { useState } from 'react';
import './App.css';
import TypingTest from './components/TypingTest/TypingTest';
import Results from './components/Results/Results';
import Header from './components/Header/Header';

export interface TestResult {
  wpm: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  timeElapsed: number;
  errors: number;
  highestWPM: number;
}

function App() {
  const [isTestActive, setIsTestActive] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);

  const startNewTest = () => {
    setIsTestActive(true);
    setResults(null);
  };

  const handleTestComplete = (result: TestResult) => {
    setIsTestActive(false);
    setResults(result);
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        {!isTestActive && !results && (
          <div className="welcome-screen">
            <h2>Welcome to TypeFlow</h2>
            <p>Test your typing speed with a continuous stream of random words</p>
            <button className="start-button" onClick={startNewTest}>
              Start Typing Test
            </button>
          </div>
        )}
        
        {isTestActive && (
          <TypingTest onTestComplete={handleTestComplete} />
        )}
        
        {results && (
          <Results 
            results={results} 
            onStartNewTest={startNewTest}
          />
        )}
      </main>
    </div>
  );
}

export default App;
