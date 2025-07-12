import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="app-title">
          <span className="title-highlight">Type</span>Flow
        </h1>
        <p className="app-subtitle">Test your typing speed</p>
      </div>
    </header>
  );
};

export default Header; 