import React from 'react';
import { ReactComponent as VerificationIcon } from '../assets/VerificationIcon.svg';
import styles from './VideoInfoBlock.module.css';
import { Video as VideoType } from '../api/types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface VideoInfoBlockProps {
  video?: VideoType;
}

function VideoInfoBlock({ video }: VideoInfoBlockProps) {
  const channelUrl = useSelector((state: RootState) => state.channel.inviteLink);

  if (!video) return null;

  const openTelegramChannel = () => {
    if (!channelUrl) {
      return;
    }
    
    // Убеждаемся, что ссылка имеет правильный формат
    let formattedUrl = channelUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    console.log('Opening channel URL:', formattedUrl);
    
    if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
      window.Telegram.WebApp.openTelegramLink(formattedUrl);
    } else {
      window.open(formattedUrl, '_blank');
    }
  };

  return (
    <div className={styles.videoInfoBlock}>
      <div className={styles.videoInfoChannelRow} onClick={openTelegramChannel} style={{ cursor: 'pointer' }}>
        <span className={styles.videoInfoChannel}>{video.profileId}</span>
        <VerificationIcon className={styles.videoInfoVerification} />
      </div>
      <div className={styles.videoInfoDesc}>{video.description}</div>
      <div className={styles.videoInfoTags}>{video.hashtags}</div>
    </div>
  );
}

export default VideoInfoBlock; 