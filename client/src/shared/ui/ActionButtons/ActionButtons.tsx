import React from 'react';
import styles from './ActionButtons.module.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ActionButtonsProps {
  showRegistration: boolean;
  onNext: () => void;
  onCreateAccount: () => void;
  isAgeValid: boolean;
  translations: any;
}

function ActionButtons({ showRegistration, onNext, onCreateAccount, isAgeValid, translations }: ActionButtonsProps) {
  const channelUrl = useSelector((state: RootState) => state.channel.inviteLink);
  const channelLoading = useSelector((state: RootState) => state.channel.isLoading);

  const handleSubscribeClick = () => {
    if (!channelUrl) {
      return;
    }
    
    // Убеждаемся, что ссылка имеет правильный формат
    let formattedUrl = channelUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
      window.Telegram.WebApp.openTelegramLink(formattedUrl);
    } else {
      window.open(formattedUrl, '_blank');
    }
  };

  return (
    <>
      {showRegistration ? (
        <button
          className={`${styles.nextBtn} ${isAgeValid ? styles.registrationAccountBtnActive : styles.registrationAccountBtn}`}
          onClick={onCreateAccount}
          disabled={!isAgeValid}
        >
          {translations.createAccount}
        </button>
      ) : (
        <button className={styles.nextBtn} onClick={onNext}>
          {translations.next}
        </button>
      )}
      <div 
        className={styles.subscribeLink} 
        onClick={handleSubscribeClick}
        style={{ 
          opacity: channelLoading ? 0.6 : 1,
          cursor: channelUrl ? 'pointer' : 'default'
        }}
      >
        {translations.subscribeToCommunities}
      </div>
    </>
  );
}

export default ActionButtons; 