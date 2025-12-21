import { Injectable, Logger } from '@nestjs/common'
import { Update, Start, Help, Ctx, InjectBot } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'
import { TelegramAuthService } from './telegram-auth.service'

@Update()
@Injectable()
export class TelegramBot {
	private readonly logger = new Logger(TelegramBot.name)

	constructor(
		@InjectBot('oauth') private readonly bot: Telegraf<Context>,
		private readonly telegramAuthService: TelegramAuthService,
	) {
		this.logger.log('OAuth Bot (ProRabSpaceBot) initialized')
		this.logger.log(`OAuth Bot token: ${process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET'}`)
		this.setupMenuCommands()
	}

	private async setupMenuCommands() {
		try {
			await this.bot.telegram.setMyCommands([
				{ command: 'start', description: '🏠 Главная - авторизация' },
				{ command: 'help', description: '❓ Помощь и инструкции' },
			])
			this.logger.log('OAuth Bot menu commands configured')
		} catch (error) {
			this.logger.error('Failed to set menu commands:', error)
		}
	}

	@Start()
	async onStart(@Ctx() ctx: Context) {
		// IMPORTANT: Log immediately to see if handler is called
		this.logger.log(`[TelegramBot] /start handler CALLED`)
		
		// Check if this is our bot (OAuth bot) - use ctx.telegram to get the bot that received the event
		try {
			const botInfo = await ctx.telegram.getMe()
			this.logger.log(`[TelegramBot] /start received, bot username: ${botInfo.username}`)
			
			if (botInfo.username !== 'ProRabSpaceBot') {
				this.logger.log(`[TelegramBot] Skipping /start - not our bot (expected ProRabSpaceBot, got ${botInfo.username})`)
				return // Skip if not our bot
			}
			
			this.logger.log(`[TelegramBot] ✅ Bot username matches, processing /start`)
		} catch (error: any) {
			this.logger.error(`[TelegramBot] Failed to get bot info in /start:`, {
				message: error?.message,
				stack: error?.stack,
			})
			return
		}

		const chatId = ctx.chat!.id.toString()
		this.logger.log(`[ProRabSpaceBot] /start from chat ${chatId}`)

		const startPayload = (ctx as any).startPayload

		// OAuth flow
		if (startPayload?.startsWith('auth_')) {
			const token = startPayload.replace('auth_', '')

			try {
				const telegramUser = ctx.from
				const chatId = ctx.chat!.id.toString()

				if (!telegramUser) {
					await ctx.reply('❌ Ошибка: не удалось получить данные пользователя.')
					return
				}

				await this.telegramAuthService.linkAuthToken(token, chatId, telegramUser)

				await ctx.reply(
					'✅ *Авторизация успешна!*\n\n' +
						'Теперь вы можете вернуться на сайт и продолжить работу.\n\n' +
						'Если страница не обновилась автоматически, просто обновите её вручную.',
					{ parse_mode: 'Markdown' },
				)

				this.logger.log(`OAuth successful for chat_id ${chatId}`)
			} catch (error) {
				this.logger.error(`OAuth error: ${error.message}`, error.stack)
				await ctx.reply(
					'❌ *Ошибка авторизации*\n\n' +
						'Возможные причины:\n' +
						'• Токен устарел (истёк 10-минутный лимит)\n' +
						'• Токен уже использован\n' +
						'• Неверный токен\n\n' +
						'Попробуйте снова нажать кнопку "Войти через Telegram" на сайте.',
					{ parse_mode: 'Markdown' },
				)
			}
			return
		}

		// Обычный старт - ProRab Space Bot (OAuth)
		await ctx.reply(
			'👋 *Добро пожаловать в ProRab Space!*\n\n' +
				'🏗 *Система управления строительными проектами*\n\n' +
				'Этот бот используется для быстрой авторизации на платформе prorab.space\n\n' +
				'🔐 *Как войти на сайт:*\n' +
				'1️⃣ Откройте сайт [prorab.space](https://prorab.space)\n' +
				'2️⃣ Нажмите кнопку "Войти через Telegram"\n' +
				'3️⃣ Вернитесь сюда и нажмите Start\n' +
				'4️⃣ Готово! Вы авторизованы ✅\n\n' +
				'📱 *Что доступно на платформе:*\n' +
				'• Управление проектами и командами\n' +
				'• Контроль расходов и доходов\n' +
				'• Фотоотчёты с объектов\n' +
				'• Расчёт зарплат сотрудников\n' +
				'• Планирование задач\n\n' +
				'❓ *Нужна помощь?*\n' +
				'Используйте @ProRabSupportBot для вопросов и поддержки',
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)
	}

	@Help()
	async onHelp(@Ctx() ctx: Context) {
		// Check if this is our bot (OAuth bot) - use ctx.telegram to get the bot that received the event
		try {
			const botInfo = await ctx.telegram.getMe()
			if (botInfo.username !== 'ProRabSpaceBot') {
				return // Skip if not our bot
			}
		} catch (error: any) {
			this.logger.error(`[TelegramBot] Failed to get bot info in /help:`, {
				message: error?.message,
			})
			return
		}

		this.logger.log(`[ProRabSpaceBot] /help command received`)
		
		await ctx.reply(
			'📖 *Справка ProRab.space Bot*\n\n' +
				'*Команды:*\n' +
				'/start - Начать работу с ботом\n' +
				'/help - Показать эту справку\n\n' +
				'*Как войти на сайт:*\n' +
				'1. Откройте [prorab.space](https://prorab.space)\n' +
				'2. Нажмите "Войти через Telegram"\n' +
				'3. Нажмите кнопку "Start" в этом боте\n' +
				'4. Готово! Вы авторизованы\n\n' +
				'*Поддержка:*\n' +
				'По всем вопросам пишите на support@prorab.space',
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)
	}
}
