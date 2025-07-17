import type { Database } from '../utils/types'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { boolean } from 'zod'

export class ApplicationDatabase {
   public readonly pool: Kysely<Database>
   constructor(conn: string) {
      this.pool = new Kysely<Database>({
         dialect: new PostgresDialect({
            pool: new Pool({
               connectionString: conn
            })
         })
      })
   }

   public async destroy() {
      await this.pool.destroy()
   }

   public async migrate() {
      await this.pool.schema
         .createTable('bots')
         .ifNotExists()
         .addColumn('token', 'text', col => col.primaryKey())
         .addColumn('country', 'text')
         .addColumn('channelId', 'text')
         .addColumn('channelInviteLink', 'text')
         .addColumn('referralReward', 'integer')
         .addColumn('signupBonus', 'integer')
         .addColumn('likeReward', 'integer')
         .addColumn('dislikeReward', 'integer')
         .addColumn('withdrawalLimit', 'integer')
         .addColumn('currency', 'text')
         .addColumn('dailyVideoLimit', 'integer')
         .addColumn('timerDelay', 'integer')
         .addColumn('status', 'text')
         .addColumn('botId', 'text')
         .addColumn('offset', 'integer')
         .execute()

      await this.pool.schema
         .createTable('users')
         .ifNotExists()
         .addColumn('telegramId', 'text')
         .addColumn('botId', 'text')
         .addColumn('balance', 'integer')
         .addColumn('username', 'text')
         .addColumn('country', 'text')
         .addColumn('trackingId', 'text')
         .addColumn('isSubscribed', 'boolean')
         .addColumn('hasBonus', 'boolean')
         .addColumn('createdAt', 'date')
         .addColumn('isRegistered', 'boolean')
         .addColumn('age', 'integer')
         .addColumn('sex', 'text')
         .addPrimaryKeyConstraint('users_pk', ['telegramId', 'botId'])
         .execute()

      await this.pool.schema
         .createTable('videos')
         .ifNotExists()
         .addColumn('id', 'serial', col => col.primaryKey())
         .addColumn('description', 'text')
         .addColumn('profileId', 'text')
         .addColumn('profileLogoUrl', 'text')
         .addColumn('botId', 'text')
         .addColumn('likeReward', 'integer')
         .addColumn('dislikeReward', 'integer')
         .addColumn('url', 'text')
         .addColumn('hashtags', 'text')
         .addColumn('likes', 'float8')
         .addColumn('dislikes', 'float8')
         .addColumn('redirectChannelUrl', 'text')
         .execute()

      await this.pool.schema
         .createTable('actions')
         .ifNotExists()
         .addColumn('userId', 'text')
         .addColumn('botId', 'text')
         .addColumn('videoId', 'integer')
         .addColumn('action', 'text')
         .addColumn('date', 'text')
         .execute()

      await this.pool.schema
         .createTable('withdrawals')
         .ifNotExists()
         .addColumn('id', 'serial', col => col.primaryKey()) // В PostgreSQL используем serial вместо integer с autoIncrement
         .addColumn('userId', 'text')
         .addColumn('botId', 'text')
         .addColumn('amount', 'integer')
         .addColumn('cardNumber', 'text')
         .addColumn('status', 'text')
         .addColumn('createdAt', 'text')
         .execute()

      await this.pool.schema
         .createTable('referrals')
         .ifNotExists()
         .addColumn('referrerId', 'text')
         .addColumn('referredId', 'text')
         .addColumn('botId', 'text')
         .addPrimaryKeyConstraint('referrals_pk', [
            'referrerId',
            'referredId',
            'botId'
         ])
         .execute()
   }
}
