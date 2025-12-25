import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../core/prisma/prisma.service'
import { User } from '../../../prisma/generated/client'
import { nanoid } from 'nanoid'

export interface TelegramUser {
	id: number
	first_name: string
	last_name?: string
	username?: string
	photo_url?: string
}

@Injectable()
export class TelegramAuthService {
	private readonly logger = new Logger(TelegramAuthService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {}

	/**
	 * Генерация auth token для deep link
	 */
	async generateAuthToken(): Promise<{ token: string; deepLink: string }> {
		const token = nanoid(32)
		const authTokenTtl = this.config.get<number>('telegram.authTokenTtl', 600000)
		const expiresAt = new Date(Date.now() + authTokenTtl)

		try {
			await this.prisma.telegramAuthToken.create({
				data: { token, expiresAt },
			})
		} catch (error: any) {
			// Обработка ошибок подключения к базе данных
			if (error.code === 'ECONNREFUSED' || error.code === 'P1001') {
				this.logger.error('Database connection refused. Please check:')
				this.logger.error('1. Is PostgreSQL database running?')
				this.logger.error('2. Is DATABASE_URL correctly set in .env file?')
				this.logger.error('3. Can you connect to the database manually?')
				throw new BadRequestException(
					'База данных недоступна. Пожалуйста, проверьте подключение к базе данных.'
				)
			}
			// Пробрасываем другие ошибки дальше
			throw error
		}

		const botUsername = this.config.get<string>('telegram.botUsername', 'ProRabSpaceBot')
		const deepLink = `https://t.me/${botUsername}?start=auth_${token}`

		this.logger.log(`Generated auth token: ${token.substring(0, 8)}...`)

		return {
			token,
			deepLink,
		}
	}

	/**
	 * Связать token с chat_id (вызывается из бота)
	 */
	async linkAuthToken(token: string, chatId: string, telegramUser?: TelegramUser): Promise<void> {
		const authToken = await this.prisma.telegramAuthToken.findUnique({
			where: { token },
		})

		if (!authToken) {
			throw new BadRequestException('Invalid auth token')
		}

		if (authToken.used) {
			throw new BadRequestException('Auth token already used')
		}

		if (authToken.expiresAt < new Date()) {
			throw new BadRequestException('Auth token expired')
		}

		await this.prisma.telegramAuthToken.update({
			where: { token },
			data: { 
				chatId, 
				used: true,
				telegramFirstName: telegramUser?.first_name,
				telegramLastName: telegramUser?.last_name,
				telegramUsername: telegramUser?.username,
				telegramPhotoUrl: telegramUser?.photo_url,
			},
		})

		this.logger.log(`Linked token ${token.substring(0, 8)}... with chat_id ${chatId}`)
	}

	/**
	 * Проверить статус auth (для polling)
	 */
	async checkAuthToken(
		token: string,
	): Promise<{ completed: boolean; chatId?: string; telegramUser?: TelegramUser }> {
		const authToken = await this.prisma.telegramAuthToken.findUnique({
			where: { token },
		})

		if (!authToken || authToken.expiresAt < new Date()) {
			return { completed: false }
		}

		/* eslint-disable @typescript-eslint/naming-convention */
		// Construct TelegramUser from stored data if available
		let telegramUser: TelegramUser | undefined
		if (authToken.telegramFirstName && authToken.chatId) {
			telegramUser = {
				id: parseInt(authToken.chatId, 10), // This might be approximate if chatId is string
				first_name: authToken.telegramFirstName,
				last_name: authToken.telegramLastName || undefined,
				username: authToken.telegramUsername || undefined,
				photo_url: authToken.telegramPhotoUrl || undefined,
			}
		}
		/* eslint-enable @typescript-eslint/naming-convention */

		return {
			completed: authToken.used && !!authToken.chatId,
			chatId: authToken.chatId || undefined,
			telegramUser,
		}
	}

	/**
	 * Создать или найти пользователя по Telegram
	 */
	async authenticateWithTelegram(
		chatId: string,
		telegramUser: TelegramUser,
	): Promise<User> {
		const telegramId = telegramUser.id.toString()

		// Поиск существующего пользователя
		let user = await this.prisma.user.findFirst({
			where: {
				oauthProvider: 'telegram',
				oauthProviderId: telegramId,
			},
		})

		if (user) {
			// Обновить chat_id и фото
			user = await this.prisma.user.update({
				where: { id: user.id },
				data: {
					telegramChatId: chatId,
					telegramPhotoUrl: telegramUser.photo_url,
				},
			})

			this.logger.log(`Existing user authenticated via Telegram: ${user.email}`)
			return user
		}

		// Создать нового пользователя
		const email = `telegram_${telegramId}@prorab.space`
		const fullName =
			[telegramUser.first_name, telegramUser.last_name]
				.filter(Boolean)
				.join(' ') || 'Telegram User'

		user = await this.prisma.user.create({
			data: {
				email,
				emailNormalized: email.toLowerCase(),
				emailVerified: true, // Telegram users are pre-verified
				passwordHash: null, // OAuth без пароля
				fullName,
				avatarUrl: telegramUser.photo_url,
				oauthProvider: 'telegram',
				oauthProviderId: telegramId,
				telegramChatId: chatId,
				telegramUsername: telegramUser.username,
				telegramPhotoUrl: telegramUser.photo_url,
			},
		})

		this.logger.log(`New user created via Telegram: ${user.email}`)
		return user
	}

	/**
	 * Cleanup expired tokens (запускать периодически)
	 */
	async cleanupExpiredTokens(): Promise<number> {
		const result = await this.prisma.telegramAuthToken.deleteMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		})

		if (result.count > 0) {
			this.logger.log(`Cleaned up ${result.count} expired Telegram auth tokens`)
		}

		return result.count
	}
}
