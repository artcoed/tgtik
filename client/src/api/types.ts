import { Sex } from "../components/RegistrationBlock"

export type GetIsRegisterdResponse = {
    isRegistered: boolean
}

export type RegisterRequest = {
    botId: string
    userId: string
    age: number
    sex: Sex
}

export type GetProfileResponse = {
    username: string,
    registrationDate: Date
    invitedFriends: number,
    likes: number
    dislikes: number,
    earnings: number
}

export type Video = {
    id: number;
    url: string;
    hashtags: string;
    description: string;
    profileId: string;
    profileLogoUrl: string;
    likes: number;
    dislikes: number;
    dislikeReward: number
    likeReward: number
    redirectChannelUrl: string
}

export type GetRateWithBalanceResponse = {
    balance: number
    rate: number
}

export type UserActionRequest = {
  botId: string;
  userId: string;
  videoId: number;
  action: 'like' | 'dislike';
};

export interface Referral {
  referredId: string;
  username: string | null;
  bonus: number;
  avatarUrl?: string;
}

export type BotStartResponse = {
  botId: string;
  channelInviteLink: string;
  botLink: string;
  timerDelay: number;
};