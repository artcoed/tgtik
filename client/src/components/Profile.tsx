import React, { useEffect, useState } from 'react';
import styles from './Profile.module.css';
import { ReactComponent as CloseGiftWindowIcon } from '../assets/CloseGiftWindowIcon.svg';
import Profile1Image from '../assets/Profile1Image.jpg';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ProfileProps {
  username?: string;
  avatarUrl?: string;
  registrationDate?: string;
  friendsInvited?: number;
  likes?: number;
  dislikes?: number;
  earnings?: string;
  isVerified?: boolean;
  onPassVerification?: () => void;
  onClose?: () => void;
  open?: boolean;
  translations: any;
}

const Profile: React.FC<ProfileProps> = ({
  username = '@hunkyfoxx',
  avatarUrl,
  registrationDate = '30.06.2025',
  friendsInvited = 0,
  likes = 1,
  dislikes = 0,
  earnings = '120',
  isVerified = false,
  onPassVerification,
  onClose,
  open = true,
  translations
}) => {
  const [visible, setVisible] = useState(open);
  const [animate, setAnimate] = useState(false);
  const channelUrl = useSelector((state: RootState) => state.channel.inviteLink);
  
  useEffect(() => {
    if (open) {
      setVisible(true);
      setAnimate(false);
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimate(false);
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!visible) return null;

  const openTelegramChannel = () => {
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
    <div
      className={styles.profileModal + (animate && open ? ' ' + styles.open : '')}
      onClick={onClose}
    >
      <div
        className={styles.profileModalCard + (animate && open ? ' ' + styles.open : '')}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.profileHeader}>
          <h2 className={styles.profileTitle}>{translations.yourProfile}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseGiftWindowIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>
        <div className={styles.profileContent}>
          <img 
            className={styles.profileAvatar} 
            src={avatarUrl || Profile1Image} 
            alt={translations.profileAvatar || 'Profile avatar'} 
            onClick={openTelegramChannel}
          />
          <div className={styles.profileUsername}>{username}</div>
          <div className={styles.verificationStatus} style={isVerified ? { background: '#09C46A' } : {}}>
            <span className={styles.verificationText}>
              {isVerified ? (translations.accountVerified || 'Account is verified') : translations.accountNotVerified}
            </span>
          </div>
          <div className={styles.statsContainer}>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{registrationDate}</div>
                <div className={styles.statLabel}>{translations.dateOfRegistration}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{friendsInvited}</div>
                <div className={styles.statLabel}>{translations.friendsInvited}</div>
              </div>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{likes}</div>
                <div className={styles.statLabel}>{translations.likes}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{dislikes}</div>
                <div className={styles.statLabel}>{translations.dislikes}</div>
              </div>
            </div>
          </div>
          <div className={styles.earningsContainer}>
            <div className={styles.statValue}>{translations.currency}{earnings}</div>
            <div className={styles.statLabel}>{translations.earnings}</div>
          </div>
          {!isVerified && (
            <button 
              className={styles.verificationButton}
              onClick={openTelegramChannel}
            >
              {translations.passVerification}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 