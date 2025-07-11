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
    likes_count: number;
    dislikes_count: number;
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