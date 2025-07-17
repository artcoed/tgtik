import { FastifyReply, FastifyRequest } from 'fastify'
import { BotConfig } from '../utils/types'
import { BotService } from '../services/bot.service'

export class BotController {
   constructor(private readonly botService: BotService) {}

   public async startBot(req: FastifyRequest, reply: FastifyReply) {
      const config = req.body as BotConfig
      const result = await this.botService.startBot(config)
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async stopBot(req: FastifyRequest, reply: FastifyReply) {
      const { token } = req.body as { token: string }
      const result = await this.botService.stopBot(token)
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async getAllBots(req: FastifyRequest, reply: FastifyReply) {
      const result = await this.botService.getAllBots()
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async getBotsByCountry(req: FastifyRequest, reply: FastifyReply) {
      const { country } = req.params as { country: string }
      const result = await this.botService.getBotsByCountry(country)
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async updateBot(req: FastifyRequest, reply: FastifyReply) {
      const { token } = req.params as { token: string }
      const updates = req.body as Partial<BotConfig>
      const result = await this.botService.updateBot(token, updates)
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async getBotVideos(req: FastifyRequest, reply: FastifyReply) {
      const { botId, userId } = req.params as { botId: string; userId: string }
      const result = await this.botService.getVideos({ userId, botId })
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async getBotStatus(req: FastifyRequest, reply: FastifyReply) {
      const { token } = req.params as { token: string }
      const result = await this.botService.getStatus(token)
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async addVideo(req: FastifyRequest, reply: FastifyReply) {
      const {
         hashtags,
         url,
         token,
         description,
         profileId,
         likeReward,
         dislikeReward,
         likes,
         dislikes,
         redirectChannelUrl
      } = req.body as {
         hashtags: string[]
         url: string
         token: string
         description: string
         profileId: string
         dislikeReward: number
         likeReward: number
         likes: number
         dislikes: number
         redirectChannelUrl: string
      }
      const result = await this.botService.addVideo({
         token,
         hashtags,
         url,
         description,
         profileId,
         likeReward,
         dislikeReward,
         likes,
         dislikes,
         redirectChannelUrl
      })
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async getBotStats(req: FastifyRequest, reply: FastifyReply) {
      const { token } = req.params as { token: string }
      const result = await this.botService.getBotStats(token)
      if (!Array.isArray(result) && result && result.error) {
         return reply.status(404).send(result)
      }
      return result
   }

   public async getBotInfo(req: FastifyRequest, reply: FastifyReply) {
      const { botId } = req.query as { botId: string }
      if (!botId) {
         return reply.status(400).send({ error: 'botId is required' })
      }
      
      const botInfo = await this.botService.getBotInfo(botId)
      if (!botInfo) {
         return reply.status(404).send({ error: 'Bot not found' })
      }
      
      return reply.send(botInfo)
   }

   public async getChannelInviteLink(req: FastifyRequest, reply: FastifyReply) {
      const { botId } = req.params as { botId: string }
      const link = await this.botService.getChannelInviteLink(botId)
      if (!link) {
         return reply
            .status(404)
            .send({ error: 'Channel invite link not found' })
      }
      return reply.send({ channelInviteLink: link })
   }
}
