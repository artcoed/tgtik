import React from 'react';
import styles from './VideoProgressBar.module.css';

interface VideoProgressBarProps {
  progress: number;
  transition?: boolean;
}

function VideoProgressBar({ progress, transition = true }: VideoProgressBarProps) {
  const transitionStyle = transition ? 'width 0.3s cubic-bezier(.4,0,.2,1)' : 'none';
  return (
    <div className={styles.videoProgressBar}>
        <div className={styles.videoProgressBarContainer}>
            <div className={styles.videoProgressPlayed} style={{width: `${progress * 100}%`, transition: transitionStyle}} />
            <div className={styles.videoProgressUnplayed} style={{left: `${progress * 100}%`, transition: transitionStyle, width: `${(1 - progress) * 100}%`}} />
            <div className={styles.videoProgressThumb} style={{left: `calc(${progress * 100}%)`, transition: transitionStyle}} />
        </div>
    </div>
  );
}

export default VideoProgressBar; 