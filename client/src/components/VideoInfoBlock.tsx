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

  if (!video) {
    console.warn('[VideoInfoBlock] Нет video, компонент не отрисован');
    return null;
  }

  if (!video.profilePicUrl) {
    console.warn(`[VideoInfoBlock] Нет profilePicUrl для video id=${video.id}, profileId=${video.profileId}`);
  }

  const openTelegramChannel = () => {
    if (!channelUrl) {
      console.warn('[VideoInfoBlock] Нет channelUrl для открытия канала');
      return;
    }
    
    // Убеждаемся, что ссылка имеет правильный формат
    let formattedUrl = channelUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    console.log('[VideoInfoBlock] Открытие канала:', formattedUrl);
    
    try {
      if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
        window.Telegram.WebApp.openTelegramLink(formattedUrl);
      } else {
        window.open(formattedUrl, '_blank');
      }
    } catch (e) {
      console.error('[VideoInfoBlock] Ошибка при открытии канала:', e);
    }
  };

  return (
    <div className={styles.videoInfoBlock}>
      <div className={styles.videoInfoChannelRow} onClick={openTelegramChannel} style={{ cursor: 'pointer' }}>
        {video.profilePicUrl && (
          <img
            src={video.profilePicUrl}
            alt="Channel avatar"
            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8, objectFit: 'cover', border: '1px solid #fff' }}
          />
        )}
        <span className={styles.videoInfoChannel}>{video.profileId}</span>
        <VerificationIcon className={styles.videoInfoVerification} />
      </div>
      <div className={styles.videoInfoDesc}>{video.description}</div>
      <div className={styles.videoInfoTags}>{video.hashtags}</div>
    </div>
  );
}

export default VideoInfoBlock; 