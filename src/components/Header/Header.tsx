import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles['header-content']}>
        <h1 className={styles['app-title']}>
          <span className={styles['title-highlight']}>Type</span>Flow
        </h1>
        <p className={styles['app-subtitle']}>Test your typing speed</p>
      </div>
    </header>
  );
};

export default Header; 