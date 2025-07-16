import React from 'react';
import { ReactComponent as GiftIcon } from '../assets/GiftIcon.svg';
import { ReactComponent as InfoIcon } from '../assets/InfoIcon.svg';
import styles from './VideoTopBar.module.css';

interface VideoTopBarProps {
  onGiftClick?: () => void;
  maxVideos: number
  rate: number
  onProfileClick?: () => void;
  translations: any;
  hideGiftIcon?: boolean;
}

function VideoTopBar({ onGiftClick, rate, maxVideos, onProfileClick, translations, hideGiftIcon }: VideoTopBarProps) {
  const handleGiftClick = () => {
    console.log('Gift icon clicked in VideoTopBar');
    if (onGiftClick) {
      onGiftClick();
    }
  };

  return (
    <div className={styles.videoTopBar}>
      {!hideGiftIcon && (
      <GiftIcon className={styles.topbarGiftIcon} onClick={handleGiftClick} style={{cursor: 'pointer'}} />
      )}
      <div className={styles.topbarCenter}>
        <span className={styles.topbarProgress}>{rate} / {maxVideos}</span>
        <span className={styles.topbarDivider} />
        <span className={styles.topbarTitle}>{translations.rateVideo}</span>
      </div>
      <InfoIcon className={styles.topbarInfoIcon} onClick={onProfileClick} style={{cursor: 'pointer'}} />
    </div>
  );
}

export default VideoTopBar; 