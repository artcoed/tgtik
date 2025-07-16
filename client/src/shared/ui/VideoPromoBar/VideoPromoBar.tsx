import React from 'react';
import { ReactComponent as TelegramIcon } from '../assets/TelegramIcon.svg';
import { ReactComponent as NextStepIcon } from '../assets/NextStepIcon.svg';
import styles from './VideoPromoBar.module.css';

interface VideoPromoBarProps {
  onOpenTelegramChannel: () => void;
  translations: any;
}

function VideoPromoBar({ onOpenTelegramChannel, translations }: VideoPromoBarProps) {
  return (
    <div className={styles.videoPromoBar} onClick={onOpenTelegramChannel} style={{ cursor: 'pointer' }}>
      <div className={styles.promoMain}>
        <TelegramIcon className={styles.promoTelegramIcon} />
        <span className={styles.promoText}>{translations.howToEarn}</span>
      </div>
      <NextStepIcon className={styles.promoNextstepIcon} />
    </div>
  );
}

export default VideoPromoBar; 