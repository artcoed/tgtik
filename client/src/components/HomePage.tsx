import { useEffect, useState, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import VideoProgressBar from './VideoProgressBar';
import VideoTopBar from './VideoTopBar';
import VideoBalanceBar from './VideoBalanceBar';
import VideoPromoBar from './VideoPromoBar';
import VideoSidebar from './VideoSidebar';
import VideoInfoBlock from './VideoInfoBlock';
import BottomNavBar from './BottomNavBar';
import GiftToast from './GiftToast';
import GiftWindow from './GiftWindow';
import Profile from './Profile';
import styles from './HomePage.module.css';
import { getProfileCurrent, getVideosCurrent, getRateWithBalanceCurrent, doActionCurrent, addSignupBonusCurrent, getIsSubscribedCurrent, getChannelInviteLink } from '../api/api';
import { GetProfileResponse, Video as VideoType } from '../api/types';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setBalance } from '../store';
import type { RootState, AppDispatch } from '../store';
import { getUserId, getBotId, isTelegramWebApp } from '../utils/telegram';
import { setPlayedSeconds } from '../store';

function HomePage({ onSelect, activeTab, setMoney, showToast, showErrorModal, setIsOpenBackgroundModal, translations, timerDelay, onVideoLimitReached }: { onSelect?: (tab: 'home' | 'bonus' | 'money') => void, activeTab?: 'home' | 'bonus' | 'money' , setMoney: (v: number) => void, showToast: (title: string, description: string) => void, showErrorModal?: (msg: string) => void, setIsOpenBackgroundModal: (value: boolean) => void, translations: any, timerDelay?: number, onVideoLimitReached?: (rate: number, maxVideos: number) => void }) {
  const [showGiftToast, setShowGiftToast] = useState(false);
  const [showGiftWindow, setShowGiftWindow] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<GetProfileResponse | null>(null)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [video, setVideo] = useState<VideoType | null>(null);
  const [reward, setReward] = useState<{dislikeReward: number, likeReward: number}>({ dislikeReward: 0, likeReward: 0})
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [rate, setRate] = useState(0);
  const [maxVideos, setMaxVideos] = useState(0)
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [playing, setPlaying] = useState(false); // теперь по умолчанию пауза
  const [isFirstPlay, setIsFirstPlay] = useState(true); // для первого запуска
  const dispatch = useDispatch<AppDispatch>();
  const balance = useSelector((state: RootState) => state.balance.value);
  const channelUrl = useSelector((state: RootState) => state.channel.inviteLink);
  const botLink = useSelector((state: RootState) => state.channel.botLink);
  const botId = getBotId();
  console.log('HomePage: channelUrl (inviteLink):', channelUrl);
  console.log('HomePage: botLink:', botLink);
  console.log('HomePage: botId:', botId);
  const [hasBonus, setHasBonus] = useState<boolean>(false);
  const playedSeconds = useSelector((state: RootState) => state.videoProgress.playedSeconds);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    setMoney(balance);
  }, [balance, setMoney]);

  useEffect(() => {
    if (!isVideoLoading) {
      setTimerFinished(false);
    }
  }, [isVideoLoading]);

  useEffect(() => {
    console.log('[HomePage] playing:', playing, 'isVideoLoading:', isVideoLoading, 'isVideoReady:', isVideoReady, 'currentIndex:', currentIndex);
  }, [playing, isVideoLoading, isVideoReady, currentIndex]);

  useEffect(() => {
    if (activeTab !== 'home') {
      setPlaying(false);
      dispatch(setPlayedSeconds(progress));
    } else {
      setPlaying(true);
    }
  }, [activeTab]);

  // Fetch hasBonus on mount
  useEffect(() => {
    const fetchHasBonus = async () => {
      try {
        const res = await getIsSubscribedCurrent();
        setHasBonus(!!res.data.hasBonus);
      } catch (e) {
        setHasBonus(false);
      }
    };
    fetchHasBonus();
  }, []);

  // Убираем этот useEffect - модалка должна появляться только при достижении дневного лимита



  const fetchProfile = async () => {
    try {
      const response = await getProfileCurrent()
      const data = response.data
      setProfile(data)
      // Получаем статус подписки
      const subRes = await getIsSubscribedCurrent();
      setIsSubscribed(!!subRes.data.isSubscribed);
    } catch (error) {
      console.error('Ошибка при получении профиля:', error)
    }
  }

  const fetchRate = async () => {
    try {
      const response = await getRateWithBalanceCurrent();
      dispatch(setBalance(response.data.balance));
      setRate(response.data.rate)
      setMaxVideos(response.data.maxVideos)
    } catch (error) {
      console.error('Ошибка при получении видео:', error);
    }
  }

  

  const fetchVideo = async () => {
    try {
      const response = await getVideosCurrent();
      setVideo(response.data);
      setReward({ likeReward: response.data.likeReward, dislikeReward: response.data.dislikeReward });
      setPlaying(false);
      setIsVideoReady(false);
    } catch (error) {
      setVideo(null);
      // обработка ошибок
    }
  };

  useEffect(() => {
    fetchRate();
    fetchVideo();
  }, []);

  const handleOpenProfile = async () => {
    await fetchProfile();
    setShowProfile(true);
  }

  const handlePassVerification = () => {
    // Handle verification logic here
    console.log('Pass verification clicked');
  };

  const handleNextVideo = () => {
    setProgress(0);
    setFade(true);
    setIsVideoReady(false);
    setPlaying(true);
    setTimeout(() => {
      fetchVideo();
      setFade(false);
    }, 300);
  };

  const handleLike = async () => {
    if (!video) return;
    try {
      const response = await doActionCurrent({
        videoId: video.id,
        action: 'like',
      });
      setRate(v => v + 1);
      dispatch(setBalance(response.data.newBalance));
      handleNextVideo();
    } catch (error) {
      handleNextVideo();
    }
  };

  const handleDislike = async () => {
    if (!video) return;
    try {
      const response = await doActionCurrent({
        videoId: video.id,
        action: 'dislike',
      });
      setRate(v => v + 1);
      dispatch(setBalance(response.data.newBalance));
      handleNextVideo();
    } catch (error) {
      handleNextVideo();
    }
  };

  const handleGiftClick = async () => {
    console.log('Gift button clicked!');
    try {
        const response = await getIsSubscribedCurrent()
        console.log('Subscription response:', response.data);
        const {isSubscribed, hasBonus} = response.data
        if(!isSubscribed) {
          console.log('User not subscribed');
          showToast(translations.giftToast.noSubscriptionTitle, translations.giftToast.noSubscriptionDescription);
          return
        }
        if (hasBonus) {
          console.log('User already has bonus');
          showToast(translations.giftToast.alreadyBonusTitle, translations.giftToast.alreadyBonusDescription);
          return
        }
        console.log('Opening gift window');
        setShowGiftWindow(true);
        setIsGiftOpen(true)
    } catch (error) {
       console.error('Error in handleGiftClick:', error);
       showToast(translations.giftToast.noSubscriptionTitle, translations.giftToast.noSubscriptionDescription);
     } 
  };

  const onClaimGift = async () => {
    try {
      const response = await addSignupBonusCurrent()
      dispatch(setBalance(balance + response.data.bonus))
      setHasBonus(true);
      showToast(translations.giftToast.giftClaimedTitle, translations.giftToast.giftClaimedDescription.replace('{amount}', response.data.bonus.toString()).replace('{currency}', translations.currency));
    }catch(err) {
      showToast(translations.giftToast.serverErrorTitle, translations.giftToast.serverErrorDescription);
    }
  }

  const handleCloseProfile = () => {
    setShowProfile(false);
    setTimeout(() => setProfile(null), 300);
  };

  const handleCloseGiftToast = () => {
    setShowGiftToast(false);
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

  const getCurrentVideoDuration = () => {
    if (!video) return 1;
    const videoElement = document.querySelector('video');
    // duration может быть недоступен до загрузки видео, поэтому fallback = 1
    return (videoElement && (videoElement as HTMLVideoElement).duration) || 1;
  };

  const handleProgress = (playedState: { playedSeconds: number }) => {
    dispatch(setPlayedSeconds(playedState.playedSeconds));
    // вычисляем прогресс в процентах относительно длительности видео
    const duration = getCurrentVideoDuration();
    setProgress(duration > 0 ? playedState.playedSeconds / duration : 0);
  };

  return (
    <>
      {showGiftWindow && (
        <GiftWindow
          open={isGiftOpen}
          onClose={() => {
            setIsGiftOpen(false);
            setTimeout(() => setShowGiftWindow(false), 300);
          }}
          onClaimGift={onClaimGift}
          translations={translations}
        />
      )}
      {profile && (
        <Profile 
          username={profile.username}
          avatarUrl={profile.avatarUrl} // Новый проп для динамической аватарки
          registrationDate={profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
          friendsInvited={profile.invitedFriends}
          likes={profile.likes}
          dislikes={profile.dislikes}
          earnings={profile.earnings?.toString()}
          isVerified={isSubscribed}
          onPassVerification={handlePassVerification}
          onClose={handleCloseProfile}
          open={showProfile}
          translations={translations}
        />
      )}
      <VideoPlayer
        setProgress={setProgress}
        video={video}
        fade={fade}
        setIsVideoLoading={setIsVideoLoading}
        playing={playing}
        setPlaying={setPlaying}
        muted={false}
        onVideoReady={() => {
          setIsVideoReady(true);
          if (!playing) setPlaying(false);
        }}
        playedSeconds={playedSeconds}
        onProgress={handleProgress}
        setIsFirstPlay={setIsFirstPlay}
        isFirstPlay={isFirstPlay}
      />
      <VideoProgressBar progress={progress} />
      <VideoTopBar onGiftClick={handleGiftClick} rate={rate} maxVideos={maxVideos} onProfileClick={handleOpenProfile} translations={translations} hideGiftIcon={hasBonus}/>
      <VideoBalanceBar translations={translations} />
      <VideoPromoBar onOpenTelegramChannel={openTelegramChannel} translations={translations} />
      <div className={styles.homePage}>
        <VideoSidebar
          key={0}
          onLike={handleLike}
          onDislike={handleDislike}
          likes={video?.likes ?? 0}
          dislikes={video?.dislikes ?? 0}
          rate={rate}
          likeReward={reward.likeReward}
          dislikeReward={reward?.dislikeReward}
          isVideoReady={isVideoReady}
          currentIndex={0}
          activeTab={activeTab}
          playing={playing}
          isVideoLoading={isVideoLoading}
          redirectChannelUrl={video?.redirectChannelUrl ?? ''}
          translations={translations}
          timerDelay={timerDelay || 3000}
          logPrefix={'[VideoSidebar]'}
          profileLogoUrl={video?.profileLogoUrl}
        />
        <VideoInfoBlock video={video ?? undefined} />
      </div>
      <BottomNavBar onSelect={onSelect} activeTab={activeTab} translations={translations} />
    </>
  );
}

export default HomePage; 