import React, {ReactElement, ReactHTMLElement, useEffect, useRef, useState} from 'react';
import Profile1Image from '../assets/Profile1Image.jpg';
import { ReactComponent as PlusVideoImage } from '../assets/PlusVideoImage.svg';
import { ReactComponent as LikeIcon } from '../assets/LikeIcon.svg';
import { ReactComponent as DislikeIcon } from '../assets/DislikeIcon.svg';
import { ReactComponent as ShareIcon } from '../assets/ShareIcon.svg';
import styles from './VideoSidebar.module.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { startTimer, pauseTimer, resumeTimer, resetTimer, finishTimer, TimerStatus } from '../store';
import { getReferralUrl, BOT_ID, USER_ID } from '../api/api';

// Функция для форматирования чисел (тысячи, миллионы)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

interface VideoSidebarProps {
  onProfileClick?: () => void;
  onLike: () => void;
  onDislike: () => void;
  likes: number;
  dislikes: number;
  rate: number;
  isVideoReady: boolean;
  currentIndex: number;
  activeTab?: 'home' | 'bonus' | 'money';
  playing: boolean;
  isVideoLoading: boolean;
  likeReward: number
  dislikeReward: number
  redirectChannelUrl: string
  translations: any;
  timerDelay?: number;
  logPrefix?: string;
}

function VideoSidebar({ onProfileClick, onLike, onDislike, likes, dislikes, currentIndex, isVideoReady, activeTab, playing, isVideoLoading, likeReward, dislikeReward, redirectChannelUrl, translations, timerDelay, logPrefix }: VideoSidebarProps) {
    const timerFillLike = useRef<HTMLDivElement>(null);
    const timerFillDislike = useRef<HTMLDivElement>(null);
    const [timeStart, setTimeStart] = useState(0);
    const [showRewardLike, setShowRewardLike] = useState(false);
    const [showRewardDislike, setShowRewardDislike] = useState(false);
    const [rewardLikeFlyOut, setRewardLikeFlyOut] = useState(false);
    const [rewardDislikeFlyOut, setRewardDislikeFlyOut] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [progress, setProgress] = useState(0);
    const dispatch = useDispatch<AppDispatch>();
    const timerStatus = useSelector((state: RootState) => state.timer.status);
    const timerState = useSelector((state: RootState) => state.timer);
    const [isTelegram, setIsTelegram] = useState(false);
    const [shareMessage, setShareMessage] = useState('');
    const [isSharePressed, setIsSharePressed] = useState(false);
    const channelUrl = useSelector((state: RootState) => state.channel.inviteLink);
    
    console.log('VideoSidebar: channelUrl:', channelUrl);

    const totalDuration = (timerDelay || 3000) / 1000; // Конвертируем миллисекунды в секунды

    const prevIndex = useRef(currentIndex);
    const wasUnmounted = useRef(false);

    // Сбросить все reward-состояния и таймер только при смене видео (не при каждом монтировании)
    useEffect(() => {
        if (prevIndex.current !== currentIndex) {
            console.log(logPrefix || '[VideoSidebar]', 'resetTimer on currentIndex change', 'currentIndex:', currentIndex);
        setShowRewardDislike(false);
        setRewardLikeFlyOut(false);
        setRewardDislikeFlyOut(false);
        setTimeStart(0);
        dispatch(resetTimer());
        }
        prevIndex.current = currentIndex;
    }, [currentIndex, dispatch]);

    // Управление статусом таймера по бизнес-логике
    useEffect(() => {
        // Если все условия выполнены и таймер не стартовал — стартуем
        if (
            activeTab === 'home' &&
            playing &&
            !isVideoLoading &&
            isVideoReady &&
            (timerStatus === 'not_started' || timerStatus === 'paused')
        ) {
            if (timerStatus === 'not_started') {
                console.log(logPrefix || '[VideoSidebar]', 'startTimer (all conditions met)');
                dispatch(startTimer());
            } else if (timerStatus === 'paused') {
                console.log(logPrefix || '[VideoSidebar]', 'resumeTimer (all conditions met)');
                dispatch(resumeTimer());
            }
        }
        // Если условия не выполнены, а таймер был running — пауза
        if (
            (activeTab !== 'home' || !playing || isVideoLoading || !isVideoReady) &&
            timerStatus === 'running'
        ) {
            console.log(logPrefix || '[VideoSidebar]', 'pauseTimer (conditions not met)');
            dispatch(pauseTimer());
        }
    }, [activeTab, playing, isVideoLoading, isVideoReady, timerStatus, dispatch, logPrefix]);

    // Глобальный таймер: завершение через timerDelay миллисекунд после старта
    useEffect(() => {
        if (timerState.status !== 'running' || !timerState.startedAt) return;
        const elapsed = timerState.elapsedBeforePause + (Date.now() - timerState.startedAt);
        const remaining = Math.max((timerDelay || 3000) - elapsed, 0);
        if (remaining === 0) {
            dispatch(finishTimer());
            return;
        }
        const timeout = setTimeout(() => {
            dispatch(finishTimer());
        }, remaining);
        return () => clearTimeout(timeout);
    }, [timerState.status, timerState.startedAt, timerState.elapsedBeforePause, dispatch, timerDelay]);

    // Визуальный прогресс таймера
    useEffect(() => {
        let raf: number | undefined;
        if (timerState.status === 'running' && timerState.startedAt) {
            const update = () => {
                const elapsed = timerState.elapsedBeforePause + (Date.now() - timerState.startedAt!);
                const prog = Math.min(elapsed / (timerDelay || 3000), 1);
                setProgress(prog);
                if (prog < 1 && timerState.status === 'running') {
                    raf = requestAnimationFrame(update);
                }
            };
            update();
        } else if (timerState.status === 'finished') {
            setProgress(1);
        } else {
            setProgress(timerState.elapsedBeforePause / (timerDelay || 3000));
        }
        return () => { if (raf !== undefined) cancelAnimationFrame(raf); };
    }, [timerState.status, timerState.startedAt, timerState.elapsedBeforePause, timerDelay]);

    // Ставить таймер на паузу при размонтировании (например, при смене страницы), не сбрасывать
    useEffect(() => {
        return () => {
            wasUnmounted.current = true;
            dispatch(pauseTimer());
        };
    }, [dispatch]);

    useEffect(() => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready?.();
        setIsTelegram(true);
      }
    }, []);



    const handleCopyInvite = async () => {
      try {
        const res = await getReferralUrl(BOT_ID, USER_ID);
        const link = res.data?.referralLink;
        if (link) {
          await navigator.clipboard.writeText(link);
        }
        setShareMessage(translations.linkCopied || 'Link copied');
        setTimeout(() => setShareMessage(''), 2000);
      } catch (e) {
        setShareMessage(translations.copyError || 'Copy error');
        setTimeout(() => setShareMessage(''), 2000);
      }
    };

    const handleShare = async () => {
      console.log('DEBUG: Share button clicked!');
      setIsSharePressed(true);
      setTimeout(() => setIsSharePressed(false), 300);
      try {
        const res = await getReferralUrl(BOT_ID, USER_ID);
        const shareUrl = res.data?.referralLink || window.location.href;
        const shareText = '';
        console.log('DEBUG: Share URL:', shareUrl);
        if (isTelegram && window.Telegram?.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
          const tgLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          console.log('DEBUG: Opening Telegram share link:', tgLink);
          window.Telegram.WebApp.openTelegramLink(tgLink);
          setShareMessage(translations.shareMenuOpened || 'Share menu opened');
        } else {
          console.log('DEBUG: Copying to clipboard:', shareUrl);
          await navigator.clipboard.writeText(shareUrl);
          setShareMessage(translations.linkCopied || 'Link copied');
        }
        setTimeout(() => setShareMessage(''), 2000);
      } catch (error) {
        console.error('DEBUG: Share error:', error);
        setShareMessage(translations.shareError || 'Share error');
        setTimeout(() => setShareMessage(''), 2000);
      }
    };

  const openTelegramChannel = () => {
    if (!channelUrl) {
      console.log('Channel URL not available');
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
    <div className={styles.videoSidebar}>
      <div className={styles.sidebarProfileWrapper}>
        <img 
          src={Profile1Image} 
          alt="profile" 
          className={styles.sidebarProfileImg} 
          onClick={openTelegramChannel}
          style={{ cursor: 'pointer' }}
        />
        <div className={styles.sidebarPlusVideo}>
          <div className={styles.sidebarPlusVideoDot}>
            <PlusVideoImage className={styles.sidebarPlusIcon} />
          </div>
        </div>
      </div>
      <div
        className={styles.sidebarIconBlock}
        onClick={timerStatus === 'finished' && !isBlocked ? () => {
          setIsBlocked(true);
          setRewardLikeFlyOut(true);
          setTimeout(() => {
            setShowRewardLike(false);
            setRewardLikeFlyOut(false);
            onLike();
            setShowRewardLike(false);
            setShowRewardDislike(false);
            setRewardLikeFlyOut(false);
            setRewardDislikeFlyOut(false);
            dispatch(resetTimer());
          }, 500);
        } : undefined}
        style={{ cursor: timerStatus === 'finished' && !isBlocked ? 'pointer' : 'not-allowed', position: 'relative' }}
      >
        {timerStatus === 'running' || timerStatus === 'paused' ? (
          <div ref={timerFillLike} className={styles.sidebarIconBlockFill} style={{ background: `conic-gradient(from 90deg, rgba(255,255,255,0.37) ${360 * (1 - progress)}deg, transparent ${360 * (1 - progress)}deg)` }}></div>
        ) : null}
        <LikeIcon className={styles.sidebarIcon + (timerStatus === 'finished' ? ' ' + styles.sidebarIconGlow : '')} />
        {(timerStatus === 'finished' && !isBlocked) ? (
          <div className={styles.sidebarIconLabelHolder}>
            <div className={styles.animatedDollar}>{likeReward}{translations.currency}</div>
          </div>
        ) : (
          <div className={styles.sidebarIconLabelHolder}>
            <div className={styles.sidebarIconLabel}>{typeof dislikes === 'number' ? formatNumber(dislikes) : '--'}</div>
          </div>
        )}
      </div>
      <div
        className={styles.sidebarIconBlock}
        onClick={timerStatus === 'finished' && !isBlocked ? () => {
          setIsBlocked(true);
          setRewardDislikeFlyOut(true);
          setTimeout(() => {
            setShowRewardDislike(false);
            setRewardDislikeFlyOut(false);
            onDislike();
            setShowRewardLike(false);
            setShowRewardDislike(false);
            setRewardLikeFlyOut(false);
            setRewardDislikeFlyOut(false);
            dispatch(resetTimer());
          }, 500);
        } : undefined}
        style={{ cursor: timerStatus === 'finished' && !isBlocked ? 'pointer' : 'not-allowed', position: 'relative' }}
      >
        {timerStatus === 'running' || timerStatus === 'paused' ? (
          <div ref={timerFillDislike} className={styles.sidebarIconBlockFill} style={{ background: `conic-gradient(from 90deg, rgba(255,255,255,0.37) ${360 * (1 - progress)}deg, transparent ${360 * (1 - progress)}deg)` }}></div>
        ) : null}
        <DislikeIcon className={styles.sidebarIcon + (timerStatus === 'finished' ? ' ' + styles.sidebarIconGlow : '')} />
        {timerStatus === 'finished' && !isBlocked ? (
          <div className={styles.sidebarIconLabelHolder}>
            <div className={styles.animatedDollar}>{dislikeReward}{translations.currency}</div>
          </div>
        ) : (
          <div className={styles.sidebarIconLabelHolder}>
            <div className={styles.sidebarIconLabel}>{typeof likes === 'number' ? formatNumber(likes) : '--'}</div>
          </div>
        )}
      </div>
      <div className={styles.sidebarShareBlock} onClick={handleShare}>
        <ShareIcon 
          className={styles.sidebarShareIcon + (isSharePressed ? ' ' + styles.sidebarShareIconActive : '')} 
          onClick={(e) => {
            e.stopPropagation();
            console.log('DEBUG: Share icon clicked!');
            handleShare();
          }}
        />
        <div className={styles.sidebarShareLabel}>{translations.share}</div>
        {/* Добавляем невидимую область для увеличения кликабельности */}
        <div 
          style={{
            position: 'absolute',
            top: '-10px',
            left: '-10px',
            right: '-10px',
            bottom: '-10px',
            zIndex: 100500,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('DEBUG: Invisible area clicked!');
            handleShare();
          }}
        />
      </div>
      {shareMessage && (
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '4px 12px', fontSize: 12, zIndex: 10000 }}>
          {shareMessage}
        </div>
      )}
    </div>
  );
}

export default VideoSidebar; 