import { ApplicationDatabase } from '../database/database'
import { AddVideo, BotConfig, GetVideos } from '../utils/types'
import { BotConfigWithOffset, BotManager } from './bot.manager'
import { sql } from 'kysely'

export class BotService {
   constructor(
      private readonly db: ApplicationDatabase,
      private readonly botManager: BotManager
   ) {}

   public async startBot(config: BotConfig) {
      const botInCache = this.botManager.bots.get(config.token)
      if (botInCache) {
         return { error: 'Bot already started' }
      }
      const botData = await this.db.pool
         .selectFrom('bots')
         .selectAll()
         .where('token', '=', config.token)
         .executeTakeFirst()

      if (botData) {
         await this.botManager.launchBot({
            ...botData,
            status: 'running'
         } as BotConfigWithOffset)
         await this.db.pool
            .updateTable('bots')
            .set({ status: 'running' })
            .where('token', '=', config.token)
            .execute()
         return { status: 'started' }
      }
      const botId = config.token.split(':')[0]
      await this.db.pool
         .insertInto('bots')
         .values({ ...config, status: 'running', offset: 0, botId: botId })
         .execute()

      await this.botManager.launchBot({
         ...config,
         status: 'running',
         offset: 0,
         botId: botId
      })

      return { status: 'started' }
   }

   public async stopBot(token: string) {
      const isStopped = await this.botManager.stopBot(token)
      if (!isStopped) {
         return { error: 'Bot not found' }
      }
      await this.db.pool
         .updateTable('bots')
         .set({ status: 'stopped' })
         .where('token', '=', token)
         .execute()
      return { status: 'stopped' }
   }

   public async getAllBots() {
      const bots = await this.db.pool.selectFrom('bots').selectAll().execute()
      if (!bots || bots.length === 0) {
         return { error: 'No bots found' }
      }
      return bots
   }

   public async getBotsByCountry(country: string) {
      const bots = await this.db.pool
         .selectFrom('bots')
         .where('country', '=', country)
         .selectAll()
         .execute()
      if (!bots || bots.length === 0) {
         return { error: 'No bots found for this country' }
      }
      return bots
   }

   public async updateBot(token: string, updates: Partial<BotConfig>) {
      const isUpdated = await this.botManager.updateBot(token, updates)
      if (!isUpdated) return { error: 'Bot not updated' }
      await this.db.pool
         .updateTable('bots')
         .set(updates)
         .where('token', '=', token)
         .execute()
      return { status: 'updated' }
   }

   public async getVideos(data: GetVideos) {
      // Проверка: существует ли пользователь
      const user = await this.db.pool
         .selectFrom('users')
         .select(['telegramId'])
         .where('telegramId', '=', data.userId)
         .where('botId', '=', data.botId)
         .executeTakeFirst()
      if (!user) {
         return { error: 'User not found', status: 404 }
      }

      // Получаем все видео для данного бота
      const allVideos = await this.db.pool
         .selectFrom('videos')
         .select([
            'videos.id',
            'videos.url',
            'videos.hashtags',
            'videos.description',
            'videos.profileId',
            'videos.dislikeReward',
            'videos.likeReward',
            'videos.dislikes',
            'videos.likes',
            'videos.redirectChannelUrl'
         ])
         .where('botId', '=', data.botId)
         .execute()

      if (!allVideos || allVideos.length === 0) {
         return { error: 'No videos available' }
      }

      // Получаем непросмотренные видео
      const unwatchedVideos = await this.db.pool
         .selectFrom('videos')
         .select([
            'videos.id',
            'videos.url',
            'videos.hashtags',
            'videos.description',
            'videos.profileId',
            'videos.dislikeReward',
            'videos.likeReward',
            'videos.dislikes',
            'videos.likes',
            'videos.redirectChannelUrl'
         ])
         .where('botId', '=', data.botId)
         .where(eb =>
            eb.not(
               eb.exists(
                  eb
                     .selectFrom('actions')
                     .select(['videoId'])
                     .whereRef('actions.videoId', '=', 'videos.id')
                     .where('actions.userId', '=', data.userId)
               )
            )
         )
         .execute()

      // Если есть непросмотренные видео, возвращаем их
      if (unwatchedVideos && unwatchedVideos.length > 0) {
         console.log('DEBUG: getVideos - returning unwatched videos:', unwatchedVideos.length);
         return unwatchedVideos
      }

      // Если все видео просмотрены, возвращаем все видео в случайном порядке
      // НЕ исключаем последнее просмотренное видео, чтобы пользователь не понимал, что видео закончились
      console.log('DEBUG: getVideos - all videos watched, returning shuffled all videos:', allVideos.length);
      
      // Перемешиваем все видео
      const shuffledVideos = allVideos.sort(() => Math.random() - 0.5);
      console.log('DEBUG: getVideos - returning shuffled videos:', shuffledVideos.length);
      return shuffledVideos;
   }

   public async getStatus(token: string) {
      const botData = await this.db.pool
         .selectFrom('bots')
         .select(['status'])
         .where('token', '=', token)
         .executeTakeFirst()

      if (!botData) {
         return { error: 'Not found bot' }
      }

      return { status: botData.status }
   }

   public async addVideo(data: AddVideo) {
      const botData = await this.db.pool
         .selectFrom('bots')
         .select(['status', 'botId'])
         .where('token', '=', data.token)
         .executeTakeFirst()

      if (!botData) {
         return { error: 'Not found bot' }
      }
      const parsedHashtags = data.hashtags.join(' ')
      await this.db.pool
         .insertInto('videos')
         .values({
            botId: botData.botId,
            url: data.url,
            hashtags: parsedHashtags,
            description: data.description,
            profileId: data.profileId,
            likeReward: data.likeReward,
            dislikeReward: data.dislikeReward,
            dislikes: data.likes,
            likes: data.dislikes,
            redirectChannelUrl: data.redirectChannelUrl
         })
         .execute()
      return { message: 'Sucess added video' }
   }

   public async getBotStats(token: string) {
      // Проверяем, существует ли бот
      const bot = await this.db.pool
         .selectFrom('bots')
         .select(['token', 'botId'])
         .where('token', '=', token)
         .executeTakeFirst()

      if (!bot) {
         return { error: 'Bot not found' }
      }

      // Количество пользователей
      const usersCount = await this.db.pool
         .selectFrom('users')
         .select(sql<number>`COUNT(*)`.as('count'))
         .where('botId', '=', bot.botId)
         .executeTakeFirst()

      // Сумма денег к выводу (pending withdrawals)
      const pendingWithdrawals = await this.db.pool
         .selectFrom('withdrawals')
         .select(sql<number>`COALESCE(SUM(amount), 0)`.as('sum'))
         .where('botId', '=', bot.botId)
         .where('status', '=', 'pending')
         .executeTakeFirst()

      // Количество видео
      const videosCount = await this.db.pool
         .selectFrom('videos')
         .select(sql<number>`COUNT(*)`.as('count'))
         .where('botId', '=', bot.botId)
         .executeTakeFirst()

      return {
         usersCount: Number(usersCount?.count ?? 0),
         pendingWithdrawals: Number(pendingWithdrawals?.sum ?? 0),
         videosCount: Number(videosCount?.count ?? 0)
      }
   }

   public async getBotInfo(botId: string) {
      const botData = await this.db.pool
         .selectFrom('bots')
         .select(['botId', 'token', 'channelInviteLink', 'timerDelay'])
         .where('botId', '=', botId)
         .executeTakeFirst()

      console.log('DEBUG: getBotInfo botData:', botData);

      if (!botData) {
         console.log('DEBUG: Bot not found for botId:', botId);
         return null
      }

      // Получаем имя бота для формирования ссылки на бота
      const botName = await this.botManager.getName(botData.token)
      const botLink = botName ? `https://t.me/${botName}` : null

      const channelInviteLink = botData.channelInviteLink
      console.log('DEBUG: getBotInfo result:', {
         botId: botData.botId,
         channelInviteLink: channelInviteLink,
         botLink: botLink
      });

      return {
         botId: botData.botId,
         channelInviteLink: channelInviteLink,
         botLink: botLink,
         timerDelay: botData.timerDelay || 3000
      }
   }

   public async getChannelInviteLink(botId: string): Promise<string | null> {
      // Сначала ищем в запущенных ботах по token
      // Если не найдено, ищем по botId в базе
      const botFromDb = await this.db.pool
         .selectFrom('bots')
         .select(['channelInviteLink'])
         .where('botId', '=', botId)
         .executeTakeFirst()
      return botFromDb?.channelInviteLink || null
   }

   public async getLastWatchedVideo(userId: string, botId: string) {
      const lastAction = await this.db.pool
         .selectFrom('actions')
         .select(['videoId'])
         .where('userId', '=', userId)
         .where('botId', '=', botId)
         .orderBy('date', 'desc')
         .limit(1)
         .executeTakeFirst()
      if (!lastAction) {
         return { error: 'No watched videos' }
      }
      const video = await this.db.pool
         .selectFrom('videos')
         .select([
            'videos.id',
            'videos.url',
            'videos.hashtags',
            'videos.description',
            'videos.profileId',
            'videos.dislikeReward',
            'videos.likeReward',
            'videos.dislikes',
            'videos.likes'
         ])
         .where('id', '=', lastAction.videoId)
         .executeTakeFirst()
      if (!video) {
         return { error: 'Video not found' }
      }
      return video
   }
}
