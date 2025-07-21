import React from 'react';
import styles from './VideoProgressBar.module.css';

interface VideoProgressBarProps {
  progress: number;
  disableTransition?: boolean;
}

function VideoProgressBar({ progress, disableTransition = false }: VideoProgressBarProps) {
  const transition = disableTransition ? 'none' : '1000ms';
  return (
    <div className={styles.videoProgressBar}>
        <div className={styles.videoProgressBarContainer}>
            <div className={styles.videoProgressPlayed} style={{width: `${progress * 100}%`, transition}} />
            <div className={styles.videoProgressUnplayed} style={{left: `${progress * 100}%`, transition, width: `${(1 - progress) * 100}%`}} />
            <div className={styles.videoProgressThumb} style={{left: `calc(${progress * 100}%)`, transition}} />
        </div>
    </div>
  );
}

export default VideoProgressBar; 