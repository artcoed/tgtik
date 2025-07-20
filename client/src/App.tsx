import React, { useEffect, useState } from "react";
import "./App.css";
import HomePage from './components/HomePage';
import BackgroundSection from './components/BackgroundSection';
import ContentSection from './components/ContentSection';
import BonusPage from './components/BonusPage';
import BottomNavBar from './components/BottomNavBar';
import SubscriptionBlock from './components/SubscriptionBlock';
import { WithdrawalForm } from './components/SubscriptionBlock';
import VideoLimitModal from './components/VideoLimitModal';
import { getIsRegisteredCurrent, registerCurrent, getRateWithBalanceCurrent, getCanWithdrawCurrent, withdrawCurrent, isTelegramWebApp, getTranslations, getTranslationsByCountry, getCountry, getChannelInviteLink, getBotId, getBotStart } from "./api/api";
import { Sex } from "./components/RegistrationBlock";
import HelloLoader from './components/HelloLoader';
import GiftToast from './components/GiftToast';
import DebugBlock from './components/DebugBlock';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { setLoading, setRegistered, setBalance, setChannelInviteLink, setChannelLoading, setBotLink, setAuth } from './store';
import { AxiosError } from "axios";
import { initTelegramWebApp } from './utils/telegram';
import { api } from './api/api';
import { baseUrl } from './api/api';
import { getCloudItem, setCloudItem } from './utils/cloudStorage';

function BackgroundModal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimate(false);
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimate(false);
    }
  }, [open]);

  return (
    <div
      className={`money-modal-backdrop${open && animate ? ' open' : ''}`}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      onClick={onClose}
    >
      <div
        className={`money-modal-content${open && animate ? ' open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [activeDot, setActiveDot] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [nextCount, setNextCount] = useState(0);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localIsRegistered, setLocalIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'bonus' | 'money'>('home');
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [money, setMoney] = useState(0);
  const dotsCount = 3;
  const [minWithdraw, setMinWithdraw] = useState<number>(0)
  const [timerDelay, setTimerDelay] = useState<number>(3000)
  const [isOpenBackgroundModal, setIsOpenBackgroundModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<null | 'home' | 'bonus' | 'money'>(null);
  const [toasts, setToasts] = useState<{ id: number, title: string, description: string }[]>([]);
  const [videoLimitReached, setVideoLimitReached] = useState(false);
  const [videoRate, setVideoRate] = useState(0);
  const [videoMaxVideos, setVideoMaxVideos] = useState(0);
  const showToast = (title: string, description: string) => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), title, description }]);
  };
  const handleCloseToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  const [translations, setTranslations] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'ru'>('en'); // по умолчанию английский

  // Загрузка переводов при инициализации
  useEffect(() => {
    async function fetchTranslations() {
      try {
        // Получаем country из URL
        const country = getCountry();
        console.log('DEBUG: Loading translations, country:', country, 'lang:', lang);
        
        if (country) {
          // Используем новый endpoint с country
          const res = await getTranslationsByCountry(country);
          console.log('DEBUG: Translations loaded by country:', res.data);
          setTranslations(res.data);
        } else {
          // Fallback на старый способ
          const res = await getTranslations(lang);
          console.log('DEBUG: Translations loaded by lang:', res.data);
          setTranslations(res.data);
        }
      } catch (e) {
        console.error('DEBUG: Error loading translations:', e);
        // fallback: можно показать ошибку или использовать en
        setTranslations(null);
      }
    }
    fetchTranslations();
  }, [lang]);


  const isLoading = useSelector((state: RootState) => state.app.isLoading);
  const isRegistered = useSelector((state: RootState) => state.app.isRegistered);
  const dispatch = useDispatch<AppDispatch>();
  const balance = useSelector((state: RootState) => state.balance.value);

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (isTelegramWebApp()) {
      initTelegramWebApp();
    }
  }, []);

  useEffect(() => {
    const checkRegistration = async () => {
      setLocalIsLoading(true)
      try {
        const v = await getIsRegisteredCurrent()
        setLocalIsRegistered(v.data.isRegistered);
        dispatch(setRegistered(v.data.isRegistered));
      } catch (err) {
        // Можно добавить обработку ошибки, если нужно
      } finally {
        setLocalIsLoading(false)
      }
    }
    checkRegistration();
  }, [])

  // Загрузка ссылки на канал при инициализации
  useEffect(() => {
    const fetchBotStart = async () => {
      const botId = getBotId();
      console.log('App: Fetching bot start info for botId:', botId);
      if (botId) {
        try {
          dispatch(setChannelLoading(true));
          const res = await getBotStart(botId);
          console.log('App: getBotStart response:', res.data);
          if (res.data) {
            if (res.data.channelInviteLink) {
              console.log('App: Setting channelInviteLink:', res.data.channelInviteLink);
              dispatch(setChannelInviteLink(res.data.channelInviteLink));
            } else {
              console.log('App: channelInviteLink is empty in response');
            }
            if (res.data.botLink) {
              console.log('App: Setting botLink:', res.data.botLink);
              dispatch(setBotLink(res.data.botLink));
            }
            if (res.data.timerDelay) {
              console.log('App: Setting timerDelay:', res.data.timerDelay);
              setTimerDelay(res.data.timerDelay);
            }
          }
        } catch (e) {
          console.error('App: Failed to fetch bot start info:', e);
        } finally {
          dispatch(setChannelLoading(false));
        }
      } else {
        console.log('App: botId is empty');
      }
    };
    fetchBotStart();
  }, [dispatch]);

  const fetchCanWithdraw = async () => {
    try {
      const response = await getCanWithdrawCurrent()
      console.log(response.data)
      setCanWithdraw(response.data.canWithdraw)
      setMinWithdraw(response.data.withdrawalLimit)
    } catch (err) {
      setCanWithdraw(false)
    }
  }

  const handleNext = () => {
    if (nextCount === 2) {
      setShowRegistration(true);
      setNextCount(0);
      return;
    }
    setActiveDot((prev) => (prev + 1) % dotsCount);
    setNextCount((prev) => prev + 1);
  };

  const handleCreateAccount = async (age: number, sex: Sex) => {
    try {
      const response = await registerCurrent({age, sex})
      console.log(response.data)
      setLocalIsRegistered(response.data.isRegistered)
      dispatch(setRegistered(response.data.isRegistered));
      setTimeout(() => {
        setLocalIsLoading(false);
        setLocalIsRegistered(true);
        dispatch(setRegistered(true));
      }, 1500);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setLocalIsRegistered(true);
      dispatch(setRegistered(true));
    }
    finally {
      setLocalIsLoading(false)
    }
  };

  const onWithdraw = async (data: { cardData: string; amount: string }) => {
    try {
      const amount = Number(data.amount)
      const response = await withdrawCurrent(amount, data.cardData)
      showToast('Operation in progress', response.data.message)
      setIsOpenBackgroundModal(false)
      dispatch(setBalance(balance - amount))
    }catch(err) {
      if (err instanceof AxiosError) {
        console.log(err.response?.data.error)
        showToast('Withdraw failed', err.response?.data.error)
      }
    }
  }

  const handleTabSelect = async (tab: 'home' | 'bonus' | 'money') => {
    if (tab === 'money') {
      await fetchCanWithdraw()
      if (isOpenBackgroundModal) {
        setIsOpenBackgroundModal(false);
        return;
      }
      try {
        const response = await getRateWithBalanceCurrent();
        dispatch(setBalance(response.data.balance));
      } catch (e) {}
      setIsOpenBackgroundModal(true);
      return;
    }
    setIsOpenBackgroundModal(false);
    setActiveTab(tab);
    setShowWithdrawal(false);
  };

  useEffect(() => {
    if (!isOpenBackgroundModal && pendingTab) {
      const timeout = setTimeout(() => {
        if (pendingTab === 'money') {
          setIsOpenBackgroundModal(true);
        } else {
          setActiveTab(pendingTab);
          setShowWithdrawal(false);
        }
        setPendingTab(null);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpenBackgroundModal, pendingTab]);

  // Восстановление токена из CloudStorage при старте
  useEffect(() => {
    (async () => {
      const token = await getCloudItem('jwt');
      const user = await getCloudItem('user');
      if (token && user) {
        dispatch(setAuth({ token, user: JSON.parse(user) }));
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const initData = window.Telegram.WebApp.initData;
      const botId = getBotId();
      api.post(`${baseUrl}api/auth`, { initData, botId })
        .then(async (res) => {
          const { token, user } = res.data;
          await setCloudItem("jwt", token);
          await setCloudItem("user", JSON.stringify(user));
          dispatch(setAuth({ token, user }));
        })
        .catch((err) => {
        });
    }
  }, [dispatch]);

  if (isLoading || !translations) {
    return <HelloLoader />;
  }

  if (isRegistered) {
      return <>
      <div style={{
        position: 'fixed',
        top: 16,
        left: 10,
        right: 10,
        zIndex: 20000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        {toasts.map(toast => (
          <GiftToast
            key={toast.id}
            open={true}
            onClose={() => handleCloseToast(toast.id)}
            title={toast.title}
            description={toast.description}
          />
        ))}
      </div>
      <BackgroundModal open={isOpenBackgroundModal} onClose={() => setIsOpenBackgroundModal(false)}>
        <div style={{
          position: 'absolute',
          top: 16,
          left: 10,
          right: 10,
          zIndex: 20000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {toasts.map(toast => (
            <GiftToast
              key={toast.id + '-modal'}
              open={true}
              onClose={() => handleCloseToast(toast.id)}
              title={toast.title}
              description={toast.description}
            />
          ))}
        </div>
        {videoLimitReached 
          ? <VideoLimitModal 
              current={videoRate} 
              max={videoMaxVideos} 
              onContinue={() => {
                setVideoLimitReached(false);
                setIsOpenBackgroundModal(false);
              }} 
              translations={translations}
            />
          : canWithdraw
            ? <WithdrawalForm onWithdraw={onWithdraw} onClose={() => setIsOpenBackgroundModal(false)} minWithdraw={minWithdraw} translations={translations} showToast={showToast}/>
            : <SubscriptionBlock money={balance} onContinue={() => setIsOpenBackgroundModal(false)} minWithdraw={minWithdraw} translations={translations}/>
        }
        {(() => {
          console.log('DEBUG: App.tsx translations:', translations);
          console.log('DEBUG: App.tsx showWithdrawal:', showWithdrawal);
          return null;
        })()}
            
      </BackgroundModal>
      <div style={{display: activeTab === 'home' ? 'block' : 'none'}}>
        <HomePage 
          translations={translations} 
          onSelect={handleTabSelect} 
          activeTab={activeTab} 
          setMoney={() => {}} 
          showToast={showToast} 
          showErrorModal={undefined} 
          setIsOpenBackgroundModal={setIsOpenBackgroundModal} 
          timerDelay={timerDelay}
          onVideoLimitReached={(rate, maxVideos) => {
            setVideoRate(rate);
            setVideoMaxVideos(maxVideos);
            setVideoLimitReached(true);
            setIsOpenBackgroundModal(true);
          }}
        />
      </div>
      <div style={{display: activeTab === 'bonus' ? 'block' : 'none'}}>
        <BonusPage showToast={showToast} translations={translations} />
      </div>
      <BottomNavBar onSelect={handleTabSelect} activeTab={activeTab} isModalOpen={isOpenBackgroundModal} translations={translations} />
    </>;
  }

  return (
    <div className="app">
      <div className="content">
        <BackgroundSection />
        <ContentSection
          showRegistration={showRegistration}
          isLoading={localIsLoading}
          activeDot={activeDot}
          dotsCount={dotsCount}
          onNext={handleNext}
          onCreateAccount={handleCreateAccount}
          translations={translations}
        />
      </div>
    </div>
  );
}
