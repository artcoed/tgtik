import * as dotenv from 'dotenv'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ApplicationDatabase } from './database/database'
import { BotManager } from './services/bot.manager'
import { BotService } from './services/bot.service'
import { UserService } from './services/user.service'
import { BotController } from './controllers/bot.controller'
import { UserController } from './controllers/user.controller'
import { Router } from './router/router'

// Загружаем переменные окружения
const envPath = __dirname + `/config/.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envPath });

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Используем правильный connection string для Docker
const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:12345@postgres:5432/bot-database';
const fastify = Fastify({ logger: true })

const database = new ApplicationDatabase(connectionString)

const botManager = new BotManager(database, fastify)
const botService = new BotService(database, botManager)
const userService = new UserService(database, botManager)

const botController = new BotController(botService)
const userController = new UserController(userService)
const router = new Router(fastify, userController, botController)

;(async () => {
   try {
      console.log('Starting server...');
      console.log('Connecting to database...');
      
      await fastify.register(cors, {
         origin: true,
         credentials: true
      })
      
      console.log('Running database migrations...');
      await database.migrate()
      
      console.log('Initializing router...');
      router.init()
      
      console.log('Starting server on port', PORT);
      fastify.listen({ port: PORT, host: '0.0.0.0' }, async (err: any) => {
         if (err) {
            fastify.log.error(err)
            process.exit(1)
         }
         console.log(`Server started on port ${PORT}`)
         console.log('Loading bots...');
         await botManager.loadBots()
         console.log('Server is ready!');
      })
   } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
   }
})()

process.on('SIGTERM', async () => {
   await botManager.destroyBots()
   await database.destroy()
   process.exit(0)
})
