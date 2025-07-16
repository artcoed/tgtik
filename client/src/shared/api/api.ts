import axios from "axios";
import { GetIsRegisterdResponse, GetProfileResponse, GetRateWithBalanceResponse, RegisterRequest, Video, UserActionRequest, BotStartResponse } from "./types";
import { getTelegramData, getBotId, getUserId, getCountry, isTelegramWebApp } from "../utils/telegram";

// const baseUrl = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3001/'
const baseUrl = 'http://localhost:3001/'

const api = axios.create({
    withCredentials: true,
    baseURL: baseUrl
})

// Функции для получения BOT_ID и USER_ID из Telegram WebApp
const getTelegramBotId = (): string => {
    // Сначала пытаемся получить из Telegram WebApp
    const telegramBotId = getBotId();
    if (telegramBotId) {
        return telegramBotId;
    }

    // Fallback для разработки (если не в Telegram WebApp)
    return '7182696236';
};

const getTelegramUserId = (): string => {
    // Сначала пытаемся получить из Telegram WebApp
    const telegramUserId = getUserId();
    if (telegramUserId) {
        return telegramUserId;
    }

    // Fallback для разработки (если не в Telegram WebApp)
    return '5599145134';
};

// Функции для получения актуальных ID (для случаев, когда данные могут измениться)
const getCurrentBotId = (): string => getTelegramBotId();
const getCurrentUserId = (): string => getTelegramUserId();

// Экспортируем функции для получения ID
export const BOT_ID = getTelegramBotId();
export const USER_ID = getTelegramUserId();

const getIsRegistered = (botId: string, userId: string) => {
    return api.get<GetIsRegisterdResponse>(`/api/webapp/${userId}/isRegistered/${botId}`)
}

const register = (data: RegisterRequest) => {
    return api.post<GetIsRegisterdResponse>('/api/webapp/register', data)
}

const getProfile = (botId: string, userId: string) => {
    return api.get<GetProfileResponse>(`/api/webapp/${botId}/profile/${userId}`)
}

const getVideos = (botId: string, userId: string) => {
    return api.get<Video[]>(`/api/bot/${botId}/videos/${userId}`)
}

const getRateWithBalance = (botId: string, userId: string) => {
    return api.get<{ balance: number, rate: number, maxVideos: number }>(`/api/user/${userId}/rate-balance/${botId}`)
}

const doAction = (data: UserActionRequest) => {
    return api.post<{status: string, newBalance: number}>('/api/webapp/' + data.botId + '/action', data);
}

const addSignupBonus = (botId: string, userId: string) => {
    return api.post<{bonus: number }>(`/api/webapp/add-signup-bonus`, { userId, botId });
}

const getIsSubscribed = (botId: string, userId: string) => {
    return api.get<{isSubscribed: boolean, hasBonus: boolean}>(`/api/webapp/${botId}/isSubscribed/${userId}`)
}

const getReferralUrl = (botId: string, userId: string) => {
    return api.get<{status: 'success',
    referralLink: string}>(`/api/webapp/${botId}/referral/${userId}`);
}

const getReferrals = (botId: string, userId: string) => {
    return api.get<{referredId: string,
        username: string,
        bonus: number}[]>(`/api/webapp/${botId}/referrals/${userId}`)
}

const getCanWithdraw = (botId: string, userId: string) => {
  return api.get<{ canWithdraw: boolean, withdrawalLimit: number }>(`/api/webapp/${botId}/canWithdraw/${userId}`);
}

const withdraw = (botId: string, userId: string, amount: number, cardNumber: string) => {
    return api.post<{message: string}>(`/api/webapp/${botId}/withdraw`, {
        userId,
        cardNumber,
        amount
    })
}

const getChannelInviteLink = (botId: string) => {
    return api.get<{ channelInviteLink: string }>(`/api/bot/${botId}/channel-invite-link`);
};

const getTranslations = (lang: string) => {
    return api.get(`/api/i18n/${lang}`);
};

const getTranslationsByCountry = (country: string) => {
    return api.get(`/api/i18n/by-country/${country}`);
};

const getBotStart = (botId: string) => {
    return api.get<BotStartResponse>(`/api/bot/start?botId=${botId}`);
};

// Функции-обертки, которые автоматически используют текущие ID
const getIsRegisteredCurrent = () => getIsRegistered(getCurrentBotId(), getCurrentUserId());
const registerCurrent = (data: Omit<RegisterRequest, 'botId' | 'userId'>) => {
    return register({ ...data, botId: getCurrentBotId(), userId: getCurrentUserId() });
};
const getProfileCurrent = () => getProfile(getCurrentBotId(), getCurrentUserId());
const getVideosCurrent = () => getVideos(getCurrentBotId(), getCurrentUserId());
const getRateWithBalanceCurrent = () => getRateWithBalance(getCurrentBotId(), getCurrentUserId());
const doActionCurrent = (data: Omit<UserActionRequest, 'botId' | 'userId'>) => {
    return doAction({ ...data, botId: getCurrentBotId(), userId: getCurrentUserId() });
};
const addSignupBonusCurrent = () => addSignupBonus(getCurrentBotId(), getCurrentUserId());
const getIsSubscribedCurrent = () => getIsSubscribed(getCurrentBotId(), getCurrentUserId());
const getReferralUrlCurrent = () => getReferralUrl(getCurrentBotId(), getCurrentUserId());
const getReferralsCurrent = () => getReferrals(getCurrentBotId(), getCurrentUserId());
const getCanWithdrawCurrent = () => getCanWithdraw(getCurrentBotId(), getCurrentUserId());
const withdrawCurrent = (amount: number, cardNumber: string) => {
    return withdraw(getCurrentBotId(), getCurrentUserId(), amount, cardNumber);
};

export {
    api,
    getIsRegistered,
    register,
    getProfile,
    getVideos,
    getRateWithBalance,
    doAction,
    addSignupBonus,
    getReferralUrl,
    getReferrals,
    getIsSubscribed,
    getCanWithdraw,
    withdraw,
    getChannelInviteLink,
    // Функции с автоматическим получением ID
    getIsRegisteredCurrent,
    registerCurrent,
    getProfileCurrent,
    getVideosCurrent,
    getRateWithBalanceCurrent,
    doActionCurrent,
    addSignupBonusCurrent,
    getIsSubscribedCurrent,
    getReferralUrlCurrent,
    getReferralsCurrent,
    getCanWithdrawCurrent,
    withdrawCurrent,
    // Утилиты
    getCurrentBotId,
    getCurrentUserId,
    getCountry,
    isTelegramWebApp,
    getTranslations,
    getTranslationsByCountry,
    getBotId,
    getBotStart
}