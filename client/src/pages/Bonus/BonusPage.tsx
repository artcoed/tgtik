import React from 'react';
import styles from './BonusPage.module.css';
import { ReactComponent as BonusBigFriendsIcon } from '../assets/BonusBigFriendsIcon.svg';
import { getReferralUrlCurrent, getReferralsCurrent, getRateWithBalanceCurrent } from '../api/api';
import type { Referral } from '../api/types';
import GiftToast from './GiftToast';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Add this at the very top of the file
declare global {
  interface Window {
    Telegram?: any;
  }
}

const InviteList: React.FC<{refs: Referral[], onInvite: () => void, translations: any}> = ({refs, onInvite, translations}) =>  {
  const listRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (listRef.current && refs.length >= 2) {
      // Принудительно показываем скроллбар при наличии 2+ элементов
      listRef.current.classList.add('has-scroll');
    } else if (listRef.current) {
      listRef.current.classList.remove('has-scroll');
    }
  }, [refs.length]);
  
  return (
      <div className={styles.container}>
        <div className={styles.list} ref={listRef}>
          {refs.map((ref) => (
              <div className={styles.item} key={ref.referredId}>
                <img
                  src={ref.avatarUrl || 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Photo.png'}
                  alt="avatar"
                  className={styles.avatar}
                  onError={e => {
                    const target = e.currentTarget;
                    if (target.src !== 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Photo.png') {
                      target.src = 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Photo.png';
                    }
                  }}
                />
                <div className={styles.text}>
                  <div className={styles.username}>{ref.username}</div>
                  <div className={styles.bonus}>+{translations.currency}{ref.bonus} {translations.bonus || 'bonus'}</div>
                </div>
              </div>
          ))}
        </div>
        <button className={styles.inviteButton} onClick={onInvite}>{translations.invite}</button>
      </div>
  );
}

const BonusPage: React.FC<{ showToast: (title: string, description: string) => void, translations: any }> = ({ showToast, translations }) => {
  const channelUrl = useSelector((state: RootState) => state.channel.inviteLink);
  const [promoCode, setPromoCode] = React.useState('');
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(false);
  const botLink = useSelector((state: RootState) => state.channel.botLink);

  // Проверяем, что мы в Telegram Mini App
  React.useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const handlePromoApply = () => {
    showToast(translations.promocodeError, translations.promocodeNotFound);
    setPromoCode(''); // Очищаем поле промокода после применения
  };

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await getReferralsCurrent();
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setReferrals(data);
      // Получаем актуальный баланс с сервера:
      try {
        const balanceRes = await getRateWithBalanceCurrent();
        // dispatch(setBalance(balanceRes.data.balance)); // This line was removed as per the edit hint
      } catch (e) {}
    } catch (e) {
      console.log('Ошибка при получении рефералов:', e);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReferrals();
  }, []);

  const handleCopyInvite = async () => {
    try {
      // Получаем реферальную ссылку
      const referralRes = await getReferralUrlCurrent();
      const referralLink = referralRes.data.referralLink;
      await navigator.clipboard.writeText(referralLink);
      showToast(translations.linkCopied || 'Link copied', translations.linkCopiedDesc || 'Referral link copied to clipboard');
    } catch (e) {
      console.log('Ошибка при получении реферальной ссылки:', e);
      // Fallback на botLink если реферальная ссылка недоступна
      if (botLink) {
        try {
          await navigator.clipboard.writeText(botLink);
          showToast(translations.linkCopied || 'Link copied', translations.linkCopiedDesc || 'Referral link copied to clipboard');
        } catch (e) {
          console.log('Ошибка при копировании ссылки');
          showToast(translations.copyError || 'Copy error', translations.copyErrorDesc || 'Failed to copy link');
        }
      } else {
        showToast(translations.copyError || 'Copy error', translations.copyErrorDesc || 'Failed to copy link');
      }
    }
  };

  // Функция для обработки клика по кнопке "Поделиться"
  const handleShare = async () => {
    try {
      // Получаем реферальную ссылку
      const referralRes = await getReferralUrlCurrent();
      const shareUrl = referralRes.data.referralLink;
      const shareText = '';

      if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
        const tgLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        console.log('Opening Telegram link:', tgLink);
        window.Telegram.WebApp.openTelegramLink(tgLink);
        showToast(translations.shareMenuOpened || 'Share menu opened', translations.shareMenuOpenedDesc || 'Telegram share menu opened');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast(translations.linkCopied || 'Link copied', translations.linkCopiedDesc || 'Referral link copied to clipboard');
      }
    } catch (e) {
      console.log('Ошибка при получении реферальной ссылки:', e);
      // Fallback на botLink если реферальная ссылка недоступна
      if (botLink) {
        const shareUrl = botLink;
        const shareText = '';
        
        if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.openTelegramLink === 'function') {
          const tgLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          window.Telegram.WebApp.openTelegramLink(tgLink);
          showToast(translations.shareMenuOpened || 'Share menu opened', translations.shareMenuOpenedDesc || 'Telegram share menu opened');
        } else {
          await navigator.clipboard.writeText(shareUrl);
          showToast(translations.linkCopied || 'Link copied', translations.linkCopiedDesc || 'Referral link copied to clipboard');
        }
      } else {
        showToast(translations.shareError || 'Share error', translations.shareErrorDesc || 'Failed to share link');
      }
    }
  };

  // handleInviteClick теперь вызывает handleShare если isTelegram, иначе handleCopyInvite
  const handleInviteClick = () => {
    handleShare();
  };

  const openTelegramChannel = () => {
    if (!channelUrl) return;
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
    <div className={styles.bonusContainer}>
      <div className={styles.bonusHeader}>
        <div className={styles.bonusHeaderRow}>
          <div className={styles.bonusLine}></div>
          <img
            src={require('../assets/BonusSocialIcons.svg').default}
            alt="Social icons"
            className={styles.bonusSocialIcons}
          />
          <div className={styles.bonusLine}></div>
        </div>
        <div className={styles.bonusTitle} style={{ textAlign: 'center' }}>
          <div className={styles.marqueeWrapper}>
            <div className={styles.marqueeTrack}>
              <span className={styles.marqueeText}>{translations.referralSystemBonus}</span>
              <span className={styles.marqueeText}>{translations.referralSystemBonus}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bonusContent} style={{ backgroundImage: `url(${require('../assets/BonusBlueBackground.png')})` }}>
        <div className={styles.bonusTopRow}>
          <div className={styles.bonusCupBg}>
            <img src={require('../assets/BonusPrizeIcon.svg').default} alt="Cup" className={styles.bonusCupIcon} />
          </div>
          <div className={styles.bonusTextBlock}>
            <div className={styles.bonusLabel}>{translations.secretBonus}</div>
            <div className={styles.bonusActivated}>{translations.activatedCodes.replace('{count}', '0')}</div>
          </div>
          <button className={styles.bonusSubscribeBtn} onClick={openTelegramChannel}>
            <span className={styles.bonusSubscribeText}>{translations.subscribeToChannel}</span>
            <img src={require('../assets/BonusTgIcon.svg').default} alt="Telegram" className={styles.bonusTgIcon} />
          </button>
        </div>
        <div className={styles.bonusNewsText}>{translations.followNews}</div>
        <div className={styles.bonusPromoBlock}>
          <input
            className={styles.bonusPromoInput}
            type="text"
            placeholder={translations.promocode}
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
          />
          <img
            src={require('../assets/BonusApplyIcon.svg').default}
            alt={translations.apply || 'Apply'}
            className={styles.bonusPromoIcon}
            style={{ cursor: 'pointer' }}
            onClick={handlePromoApply}
          />
        </div>
      </div>
      {/* Friends List Block */}
      <div className={styles.friendsListBlock}>
        <div className={styles.friendsListHeaderRow}>
          <div className={styles.friendsListIconBg}>
            <img src={require('../assets/BonusFriendsIcon.svg').default} alt="Friends" className={styles.friendsListIcon} />
          </div>
          <div className={styles.friendsListTextBlock}>
            <div className={styles.friendsListTitle}>{translations.friendsList}</div>
            <div className={styles.friendsListSubtitle}>{translations.invitedFriends.replace('{count}', referrals.length.toString())}</div>
          </div>
          <button className={styles.friendsReloadBtn} onClick={fetchReferrals}>
            <span className={styles.friendsReloadBtnBg}>
              <img
                src={require('../assets/BonusReloadIcon.svg').default}
                alt={translations.reload}
                className={styles.friendsReloadIcon + (loading ? ' ' + styles.friendsReloadIconActive : '')}
              />
            </span>
          </button>
          <button className={styles.copyInviteBtn} onClick={handleCopyInvite}>
            <span className={styles.copyInviteText}>{translations.copyInvitationLink}</span>
            <span className={styles.copyInviteIconBg}>
              <img
                src={require('../assets/BonusCopyIcon.svg').default}
                alt={translations.copy}
                className={styles.copyInviteIcon + (false ? ' ' + styles.copyInviteIconActive : '')}
              />
            </span>
          </button>
        </div>
        <div className={styles.friendsListInfoText}>
          <span className={styles.friendsListInfoTextBold}>
            {translations.inviteFriendsEarn.replace('{currency}', translations.currency || '$')}
          </span>
        </div>
      </div>
      {referrals.length === 0 ? (
          <div className={styles.bonusFriendsList}>
            <div className={styles.bonusEmptyList}>
              <BonusBigFriendsIcon className={styles.bonusBigFriendsIcon}/>
              <div className={styles.bonusEmptyTitle}>{translations.inviteFriendsBonus}</div>
              <div className={styles.bonusEmptyDesc}>{translations.invitedFriendsAppear}</div>
            </div>
            <button
              className={styles.bonusInviteBtn + (loading ? ' ' + styles.bonusInviteBtnActive : '')}
              onClick={handleInviteClick}
            >
              <span className={styles.bonusInviteText}>{translations.invite}</span>
            </button>
          </div>
      ) : (
        <InviteList refs={referrals} onInvite={handleInviteClick} translations={translations}/>
      )}
    </div>
  );
};

export default BonusPage; 