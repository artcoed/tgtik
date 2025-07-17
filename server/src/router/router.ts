import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/user.controller'
import { BotController } from '../controllers/bot.controller'

export class Router {
   constructor(
      private readonly fastify: FastifyInstance,
      private readonly userController: UserController,
      private readonly botController: BotController
   ) {}

   public init() {
      this.fastify.post('/api/bot/start', async (req, res) =>
         this.botController.startBot(req, res)
      )

      this.fastify.get('/api/bot/start', async (req, res) =>
         this.botController.getBotInfo(req, res)
      )

      this.fastify.post('/api/bot/stop', async (req, res) =>
         this.botController.stopBot(req, res)
      )

      this.fastify.get('/api/bots', async (req, res) =>
         this.botController.getAllBots(req, res)
      )

      this.fastify.get('/api/bots/:country', async (req, res) =>
         this.botController.getBotsByCountry(req, res)
      )

      this.fastify.patch('/api/bot/:token', async (req, res) =>
         this.botController.updateBot(req, res)
      )

      this.fastify.get('/api/bot/status/:token', async (req, res) =>
         this.botController.getBotStatus(req, res)
      )

      this.fastify.post('/api/bot/video/add', async (req, res) =>
         this.botController.addVideo(req, res)
      )

      this.fastify.get('/api/bot/:token/stats', async (req, res) =>
         this.botController.getBotStats(req, res)
      )

      this.fastify.get('/api/bot/:botId/videos/:userId', async (req, res) =>
         this.botController.getBotVideos(req, res)
      )
      this.fastify.post('/api/webapp/:botId/action', async (req, res) =>
         this.userController.doAction(req, res)
      )

      //
      this.fastify.post('/api/webapp/:botId/withdraw', async (req, res) =>
         this.userController.withdraw(req, res)
      )

      this.fastify.get(
         '/api/webapp/:botId/referral/:userId',
         async (req, res) => this.userController.getReferralUrl(req, res)
      )

      this.fastify.get('/api/webapp/:botId/profile/:userId', async (req, res) =>
         this.userController.getProfile(req, res)
      )

      this.fastify.get(
         '/api/webapp/:botId/referrals/:userId',
         async (req, res) => this.userController.getReferralsByUserId(req, res)
      )

      this.fastify.get(
         '/api/webapp/:userId/isRegistered/:botId',
         async (req, res) => this.userController.getIsRegistered(req, res)
      )

      this.fastify.post('/api/webapp/register', async (req, res) =>
         this.userController.register(req, res)
      )

      this.fastify.get(
         '/api/user/:userId/rate-balance/:botId',
         async (req, res) => this.userController.getRateWithBalance(req, res)
      )

      this.fastify.get(
         '/api/bot/:botId/channel-invite-link',
         async (req, res) => this.botController.getChannelInviteLink(req, res)
      )

      this.fastify.post('/api/webapp/add-signup-bonus', async (req, res) =>
         this.userController.addSignupBonus(req, res)
      )

      this.fastify.get(
         '/api/webapp/:botId/isSubscribed/:userId',
         async (req, res) => this.userController.getIsSubscribed(req, res)
      )

      this.fastify.get(
         '/api/webapp/:botId/canWithdraw/:userId',
         async (req, res) => this.userController.canWithdraw(req, res)
      )

      this.fastify.get('/api/i18n/:lang', async (req, res) =>
         this.userController.getTranslations(req, res)
      )

      this.fastify.get('/api/i18n/by-country/:country', async (req, res) =>
         this.userController.getTranslationsByCountry(req, res)
      )
   }
}
