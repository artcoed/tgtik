import { Telegraf } from 'telegraf'
import { ApplicationDatabase } from '../database/database'
import { BotConfig } from '../utils/types'
import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import { getTranslation } from '../utils/i18n'
import { sql } from 'kysely'
import path from 'path'

export type BotConfigWithOffset = BotConfig & { offset: number; botId: string }

export class BotManager {
   public bots: Map<string, { bot: Telegraf; config: BotConfigWithOffset }> =
      new Map()

   constructor(
      private readonly db: ApplicationDatabase,
      private readonly fastify: ReturnType<typeof Fastify>
   ) {}

   public async launchBot(
      config: BotConfigWithOffset,
      useWebhook: boolean = false
   ) {
      const bot = new Telegraf(config.token)

      bot.start(async ctx => {
         console.log('Получен /start от', ctx.from.id)
         const trackingId = ctx.payload || ''
         const username = ctx.from.username || ''
         // Парсим referralId из нового формата: "randomCode_userId"
         const referralId = ctx.payload?.split('_').pop() || '' // Берем последнюю часть после последнего подчеркивания
         const userId = ctx.from.id.toString()
         /*
         // Отправка в Keitaro (как было)
         if (trackingId) {
            try {
               const response = await fetch(
                  `${process.env.KEITARO_URL || 'https://keitaro.example.com'}/track?trackingId=${trackingId}`,
                  { method: 'GET' }
               )
               if (!response.ok) {
                  this.fastify.log.error(
                     `Keitaro error for trackingId ${trackingId}: Request failed with status ${response.status}`
                  )
               }
            } catch (err: unknown) {
               const message = err instanceof Error ? err.message : String(err)
               this.fastify.log.error(
                  `Keitaro error for trackingId ${trackingId}: ${message}`
               )
            }
         } */

         // Транзакция для атомарности операций
         await this.db.pool.transaction().execute(async trx => {
            // Проверяем, существует ли пользователь
            const existingUser = await trx
               .selectFrom('users')
               .select(['telegramId'])
               .where('telegramId', '=', userId)
               .where('botId', '=', config.botId)
               .executeTakeFirst()
            if (!existingUser) {
               // Обновляем trackingId и country
               await trx
                  .insertInto('users')
                  .values({
                     telegramId: userId,
                     botId: config.botId,
                     balance: 0,
                     country: config.country,
                     trackingId: trackingId,
                     isSubscribed: false,
                     hasBonus: false,
                     createdAt: new Date(),
                     username: `@${username}`,
                     isRegistered: false
                  })
                  .execute()
            }

            // Если есть referral ID, добавляем запись в referrals
            if (referralId && referralId !== userId) {
               await trx
                  .insertInto('referrals')
                  .values({
                     referrerId: referralId,
                     referredId: userId,
                     botId: config.botId
                  })
                  .onConflict(oc => oc.doNothing())
                  .execute()

               // Увеличиваем баланс реферера
               await trx
                  .updateTable('users')
                  .where('telegramId', '=', referralId)
                  .where('botId', '=', config.botId)
                  .set(eb => ({
                     balance: eb('balance', '+', config.referralReward || 10)
                  }))
                  .execute()
            }
         })

         const videoPath = path.join(__dirname, '../../public/videos/video.mp4')
         await ctx.replyWithVideo(
             { source: videoPath },
             {
                caption: getTranslation(config.country, 'welcome'),
                parse_mode: 'HTML', // Enable Telegram HTML markup in the welcome message
                reply_markup: {
                   inline_keyboard: [
                      [
                         {
                            text: getTranslation(config.country, 'openWebAppButton'),
                            web_app: {
                               url: `https://tgtik1.netlify.app/?bot_id=${config.botId}&country=${config.country}`
                            }
                         }
                      ]
                   ]
                }
             }
         );
      })

      bot.on('chat_member', async ctx => {
         const member = ctx.update.chat_member
         const userId = member.new_chat_member.user.id.toString()
         // Срабатывает только если пользователь ВСТУПИЛ в канал
         const joinedStatuses = ['member', 'administrator', 'creator'];
         if (
           member.chat.id.toString() === config.channelId &&
           joinedStatuses.includes(member.new_chat_member.status)
         ) {
            console.log('Logic')
            const user = await this.db.pool
               .selectFrom('users')
               .selectAll()
               .where('telegramId', '=', userId)
               .where('botId', '=', config.botId)
               .executeTakeFirst()
            if (!user?.isSubscribed) {
               await this.db.pool
                  .updateTable('users')
                  .set({ isSubscribed: true })
                  .where('telegramId', '=', userId)
                  .where('botId', '=', config.botId)
                  .execute()
               await bot.telegram.sendMessage(
                  userId,
                  getTranslation(config.country, 'subscribed', {
                     bonus: config.signupBonus,
                     currency: config.currency
                  })
               )
            }
         }
      })

      bot.on('message', async ctx => {
         const updateId = ctx.update.update_id
         const botData = this.bots.get(config.token)
         if (botData && updateId > botData.config.offset) {
            botData.config.offset = updateId + 1
            await this.db.pool
               .updateTable('bots')
               .set({ offset: updateId + 1 })
               .where('token', '=', config.token)
               .execute()
         }
      })

      if (useWebhook) {
         await bot.telegram.setWebhook(
            `https://${process.env.DOMAIN || 'your-domain.com'}/webhook/${config.token}`
         )
         this.fastify.post(
            `/webhook/${config.token}`,
            async (req: FastifyRequest, reply: FastifyReply) => {
               await bot.handleUpdate(req.body as any)
               reply.send({})
            }
         )
      } else {
         bot.launch({
            dropPendingUpdates: config.offset > 0,
            allowedUpdates: [
               'message',
               'edited_message',
               'channel_post',
               'edited_channel_post',
               'inline_query',
               'chosen_inline_result',
               'callback_query',
               'shipping_query',
               'pre_checkout_query',
               'poll',
               'poll_answer',
               'my_chat_member',
               'chat_member'
            ] // Drop updates before the stored offset
         }).catch(err =>
            this.fastify.log.error(`Bot ${config.token} error: ${err.message}`)
         )
      }

      this.bots.set(config.token, { bot, config })
   }

   public async stopBot(token: string) {
      const botData = this.bots.get(token)
      if (!botData) return false

      this.bots.delete(token)
      botData.bot.stop()

      return true
   }

   public async updateBot(token: string, updates: Partial<BotConfig>) {
      const botData = this.bots.get(token)
      if (!botData) return false

      botData.bot.stop()
      this.bots.delete(token)

      const updatedConfig: BotConfigWithOffset = {
         ...botData.config,
         ...updates,
         status: 'running',
         offset: botData.config.offset
      }
      await this.launchBot(updatedConfig)

      return true
   }

   public async loadBots() {
      const botConfigs = await this.db.pool
         .selectFrom('bots')
         .selectAll()
         .where('status', '=', 'running')
         .execute()
      for (const config of botConfigs) {
         await this.launchBot(config)
      }
   }

   public async getName(token: string) {
      const botData = this.bots.get(token)
      if (!botData) return

      return botData.bot.botInfo?.username
   }

   public async destroyBots() {
      this.bots.forEach(botData => botData.bot.stop())
   }
}
