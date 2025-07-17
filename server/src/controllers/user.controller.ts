import { FastifyReply, FastifyRequest } from 'fastify'
import { UserService } from '../services/user.service'
import { AddReferral, DoWithdraw, GetBalance, UserAction } from '../utils/types'
import { translations } from '../utils/i18n';

export class UserController {
   constructor(private readonly userService: UserService) {}

   public async doAction(req: FastifyRequest, reply: FastifyReply) {
      const { botId } = req.params as { botId: string }
      const { userId, action, videoId } = req.body as UserAction
      const result = await this.userService.doAction({
         botId,
         userId,
         action,
         videoId
      })
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async withdraw(req: FastifyRequest, reply: FastifyReply) {
      const { botId } = req.params as { botId: string }
      const { userId, amount, cardNumber } = req.body as DoWithdraw
      const result = await this.userService.withdraw({
         botId,
         userId,
         amount,
         cardNumber
      })
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async addReferral(req: FastifyRequest, reply: FastifyReply) {
      const { botId } = req.params as { botId: string }
      const { referrerId, referredId } = req.body as AddReferral
      const result = await this.userService.addReferal({
         botId,
         referrerId,
         referredId
      })
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async getBalance(req: FastifyRequest, reply: FastifyReply) {
      const { botId, userId } = req.params as { botId: string; userId: string }
      const result = await this.userService.getBalance({ botId, userId })
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async getReferralUrl(req: FastifyRequest, reply: FastifyReply) {
      const { userId } = req.params as { userId: string }
      const { botId } = req.params as { botId: string }
      const result = await this.userService.getReferralUri({ userId, botId })
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async getProfile(req: FastifyRequest, reply: FastifyReply) {
      const { botId, userId } = req.params as { botId: string; userId: string }
      const result = await this.userService.getProfile({ botId, userId })
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async getReferralsByUserId(req: FastifyRequest, reply: FastifyReply) {
      const { userId, botId } = req.params as { userId: string; botId: string }
      const result = await this.userService.getReferralsByUserId(userId, botId)
      if (result && !Array.isArray(result) && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async getIsRegistered(req: FastifyRequest, reply: FastifyReply) {
      const { userId, botId } = req.params as { userId: string; botId: string }
      const result = await this.userService.getIsRegistered(userId, botId)
      return result
   }

   public async register(req: FastifyRequest, reply: FastifyReply) {
      const { userId, botId, age, sex } = req.body as {
         userId: string
         botId: string
         age: number
         sex: string
      }
      const result = await this.userService.register(userId, botId, age, sex)
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async getRateWithBalance(req: FastifyRequest, reply: FastifyReply) {
      const { botId, userId } = req.params as { botId: string; userId: string }
      const result = await this.userService.getRateWithBalance(botId, userId)
      if (result && result.error) {
         return reply.status(result.status ?? 400).send({ error: result.error })
      }
      return reply.send(result)
   }

   public async addSignupBonus(req: FastifyRequest, reply: FastifyReply) {
      const { userId, botId } = req.body as { userId: string; botId: string }
      const result = await this.userService.addSignupBonus(userId, botId)
      if (result.status === 200) {
         return reply.send({ status: 200, bonus: result.bonus })
      } else {
         return reply.status(result.status).send({
            error: 'User not found, not subscribed, or bonus not added'
         })
      }
   }

   public async getIsSubscribed(req: FastifyRequest, reply: FastifyReply) {
      const { userId, botId } = req.params as { userId: string; botId: string }
      const result = await this.userService.getIsSubscribed(userId, botId)
      return reply.send(result)
   }

   public async canWithdraw(req: FastifyRequest, reply: FastifyReply) {
      const { userId, botId } = req.params as { userId: string; botId: string }
      const result = await this.userService.canWithdraw(userId, botId)
      return reply.send(result)
   }

   public async getTranslations(req: FastifyRequest, reply: FastifyReply) {
      const { lang } = req.params as { lang: string };
      const code = lang?.toLowerCase() || 'en';
      const data = translations[code] || translations['en'];
      return reply.send(data);
   }

   public async getTranslationsByCountry(req: FastifyRequest, reply: FastifyReply) {
      const { country } = req.params as { country: string };
      const code = country?.toLowerCase() || 'en';
      const data = translations[code] || translations['en'];
      return reply.send(data);
   }
}
