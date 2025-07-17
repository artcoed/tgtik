import { Generated } from 'kysely'

export interface Database {
   bots: {
      token: string
      botId: string
      country: string
      channelId: string
      likReward: number
      dislikeReward: number
      channelInviteLink: string
      referralReward: number // Changed from float to number
      signupBonus: number // Changed from float to number
      withdrawalLimit: number // Changed from float to number
      currency: string
      dailyVideoLimit: number
      timerDelay: number
      status: 'running' | 'stopped'
      offset: number
   }
   users: {
      telegramId: string
      username: string
      botId: string
      balance: number // Changed from float to number
      country: string
      trackingId: string | null
      isSubscribed: boolean
      hasBonus: boolean
      createdAt: Date
      isRegistered: boolean
      age?: number
      sex?: 'male' | 'female' | 'other'
   }
   videos: {
      id: Generated<number>
      botId: string
      description: string
      profileId: string
      likeReward: number
      dislikeReward: number
      likes: number
      dislikes: number
      url: string
      hashtags: string
      redirectChannelUrl: string
   }
   actions: {
      id: Generated<number>
      userId: string
      botId: string
      videoId: number
      action: 'like' | 'dislike'
      date: string
   }
   referrals: {
      referrerId: string
      referredId: string
      botId: string
   }
   withdrawals: {
      id: Generated<number>
      userId: string
      botId: string
      amount: number // Changed from float to number
      cardNumber: string
      status: 'pending' | 'completed' | 'failed'
      createdAt: Date
   }
}

export interface BotConfig {
   token: string
   country: string
   channelId: string
   likReward: number
   dislikeReward: number
   referralReward: number
   signupBonus: number
   withdrawalLimit: number
   currency: string
   dailyVideoLimit: number
   timerDelay: number
   status: 'running' | 'stopped'
   channelInviteLink: string
}

export interface Translation {
   welcome: string
   subscribed: string
   error: string
   createAccount: string
   next: string
   subscribeToCommunities: string
   home: string
   bonus: string
   money: string
   rateVideosTitle: string
   rateVideosDesc: string
   howToEarn: string
   withdraw: string
   videoLimitTitle: string
   videoLimitDesc: string
   videoLimitRefresh: string
   videoLimitDescEnd: string
   continue: string
   bonusGift: string
   toBalance: string
   bonusValue: string
   claimGift: string
   pleaseIndicateCard: string
   card: string
   orUseIban: string
   iban: string
   ibanPlaceholder: string
   amountToWithdraw: string
   amount: string
   sum: string
   noSponsorSubscription: string
   subscribeAndTry: string
   alreadyGetBonus: string
   thanks: string
   giftClaimed: string
   youReceived: string
   serverError: string
   bonusNotReceived: string
   invite: string
   promocodeError: string
   promocodeNotFound: string
   secretBonus: string
   activatedCodes: string
   subscribeToChannel: string
   followNews: string
   linkCopied: string
   shareMenuOpened: string
   linkCopyError: string
   linkShareError: string
   currency: string
   // Registration
   registrationRequired: string
   pleaseIndicateGender: string
   male: string
   female: string
   other: string
   pleaseIndicateAge: string
   age: string
   ageRange: string
   specifyAge: string
   specifyGender: string
   // Video rating
   rateVideo: string
   // Profile
   yourProfile: string
   accountNotVerified: string
   dateOfRegistration: string
   friendsInvited: string
   likes: string
   dislikes: string
   earnings: string
   passVerification: string
   share: string
   // Referral system
   referralSystemBonus: string
   promocode: string
   friendsList: string
   invitedFriends: string
   reload: string
   copyInvitationLink: string
   copy: string
   inviteFriendsEarn: string
   inviteFriendsBonus: string
   invitedFriendsAppear: string
   // Withdrawal
   insufficientFunds: string
   minimumWithdrawalLimit: string
   continueWorking: string
   // Gift toast messages
   giftToast: {
      noSubscriptionTitle: string
      noSubscriptionDescription: string
      alreadyBonusTitle: string
      alreadyBonusDescription: string
      giftClaimedTitle: string
      giftClaimedDescription: string
      serverErrorTitle: string
      serverErrorDescription: string
   }
   openWebAppButton: string
}

export type GetTranslationParams = Record<string, string | number>

export type UserAction = {
   botId: string
   userId: string
   action: 'like' | 'dislike'
   videoId: number
}

export type DoWithdraw = {
   botId: string
   userId: string
   amount: number
   cardNumber: string
}

export type AddReferral = {
   referrerId: string
   referredId: string
   botId: string
}

export type GetBalance = {
   botId: string
   userId: string
}

export type AddVideo = {
   token: string
   url: string
   hashtags: string[]
   description: string
   profileId: string
   likeReward: number
   dislikeReward: number
   likes: number
   dislikes: number
   redirectChannelUrl: string
}

export type GetVideos = {
   userId: string
   botId: string
}

export type GetReferralUri = {
   userId: string
   botId: string
}
