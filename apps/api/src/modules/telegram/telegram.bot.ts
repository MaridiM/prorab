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
	) {}

	@Start()
	async onStart(@Ctx() ctx: Context) {
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

				await this.telegramAuthService.linkAuthToken(token, chatId)

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

		// Обычный старт
		await ctx.reply(
			'👋 *Добро пожаловать в ProRab.space!*\n\n' +
				'Я бот для управления строительными проектами.\n\n' +
				'🔑 *Авторизация*\n' +
				'Чтобы войти на сайт, используйте кнопку "Войти через Telegram" на [prorab.space](https://prorab.space)\n\n' +
				'📋 *Возможности*\n' +
				'• Управление проектами и командами\n' +
				'• Учёт расходов и доходов\n' +
				'• Фотоотчёты со стройки\n' +
				'• Расчёт зарплат сотрудников\n\n' +
				'❓ Для справки используйте команду /help',
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)
	}

	@Help()
	async onHelp(@Ctx() ctx: Context) {
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
