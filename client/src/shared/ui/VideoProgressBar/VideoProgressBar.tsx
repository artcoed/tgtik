import React from 'react';
import styles from './VideoProgressBar.module.css';

interface VideoProgressBarProps {
  progress: number;
}

function VideoProgressBar({ progress }: VideoProgressBarProps) {
  return (
    <div className={styles.videoProgressBar}>
        <div className={styles.videoProgressBarContainer}>
            <div className={styles.videoProgressPlayed} style={{width: `${progress * 100}%`, transition: "1000ms"}} />
            <div className={styles.videoProgressUnplayed} style={{left: `${progress * 100}%`, transition: "1000ms", width: `${(1 - progress) * 100}%`}} />
            <div className={styles.videoProgressThumb} style={{left: `calc(${progress * 100}%)`, transition: "1000ms"}} />
        </div>
    </div>
  );
}

export default VideoProgressBar; 