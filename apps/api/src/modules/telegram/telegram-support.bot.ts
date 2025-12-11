import { Injectable, Logger } from '@nestjs/common'
import {
	Update,
	Ctx,
	Start,
	Help,
	Command,
	On,
	InjectBot,
} from 'nestjs-telegraf'
import { Telegraf, Context, Markup } from 'telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramSupportService } from './telegram-support.service'
import { FAQService } from './faq.service'
import { UsersService } from '../users/users.service'

@Update()
@Injectable()
export class TelegramSupportBot {
	private readonly logger = new Logger(TelegramSupportBot.name)

	constructor(
		@InjectBot('support') private readonly bot: Telegraf<Context>,
		private readonly config: ConfigService,
		private readonly supportService: TelegramSupportService,
		private readonly faqService: FAQService,
		private readonly usersService: UsersService,
	) {}

	// ==================== Commands ====================

	@Start()
	async onStart(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat!.id.toString()
		this.logger.log(`/start from chat ${chatId}`)

		const user = await this.usersService.findByTelegramChatId(chatId)

		if (!user) {
			await ctx.reply(
				'👋 *Добро пожаловать в техническую поддержку ProRab.space!*\n\n' +
					'⚠️ Для использования бота, сначала авторизуйтесь на сайте через @ProRabSpaceBot\n\n' +
					'После этого вы сможете:\n' +
					'• Задавать вопросы в поддержку\n' +
					'• Просматривать FAQ\n' +
					'• Отслеживать статус обращений',
				{
					parse_mode: 'Markdown',
					link_preview_options: { is_disabled: true },
				},
			)
			return
		}

		await this.showMainMenu(ctx, user.fullName)
	}

	@Help()
	async onHelp(@Ctx() ctx: Context): Promise<void> {
		await ctx.reply(
			'📚 *Справка по командам*\n\n' +
				'/start - Главное меню\n' +
				'/help - Эта справка\n' +
				'/status - Статус моего обращения\n' +
				'/cancel - Отменить текущее обращение\n\n' +
				'*FAQ Категории:*\n' +
				'1️⃣ Проекты и команды\n' +
				'2️⃣ Расходы и финансы\n' +
				'3️⃣ Фотоотчёты\n' +
				'4️⃣ Технические проблемы\n\n' +
				'Просто напишите свой вопрос, и я постараюсь помочь!',
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)
	}

	@Command('status')
	async onStatus(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat!.id.toString()

		const user = await this.usersService.findByTelegramChatId(chatId)
		if (!user) {
			await ctx.reply('⚠️ Сначала авторизуйтесь через @ProRabSpaceBot')
			return
		}

		const activeTicket = await this.supportService.getActiveTicket(chatId)

		if (!activeTicket) {
			await ctx.reply(
				'ℹ️ У вас нет активных обращений\n\n' +
					'Отправьте сообщение, чтобы создать новое обращение',
			)
			return
		}

		const stats = await this.supportService.getTicketStats(activeTicket.id)

		await ctx.reply(
			`📊 *Обращение #${activeTicket.id.slice(0, 8)}*\n\n` +
				`Статус: ${this.getStatusEmoji(activeTicket.status)} ${this.translateStatus(activeTicket.status)}\n` +
				`Приоритет: ${this.translatePriority(activeTicket.priority)}\n` +
				`Сообщений: ${stats.messageCount}\n` +
				`Создано: ${this.formatDate(activeTicket.createdAt)}\n\n` +
				`${stats.firstResponseTime ? `⏱ Время первого ответа: ${stats.firstResponseTime} мин` : '⏳ Ожидаем ответа поддержки...'}`,
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
				...Markup.inlineKeyboard([
					[
						Markup.button.callback(
							'📝 История сообщений',
							`ticket_history_${activeTicket.id}`,
						),
					],
					[
						Markup.button.callback(
							'🔴 Закрыть обращение',
							`ticket_close_${activeTicket.id}`,
						),
					],
				]),
			},
		)
	}

	@Command('cancel')
	async onCancel(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat!.id.toString()

		const user = await this.usersService.findByTelegramChatId(chatId)
		if (!user) {
			await ctx.reply('⚠️ Сначала авторизуйтесь через @ProRabSpaceBot')
			return
		}

		const activeTicket = await this.supportService.getActiveTicket(chatId)

		if (!activeTicket) {
			await ctx.reply('ℹ️ У вас нет активных обращений')
			return
		}

		await ctx.reply(
			`Вы уверены, что хотите закрыть обращение #${activeTicket.id.slice(0, 8)}?`,
			Markup.inlineKeyboard([
				[
					Markup.button.callback(
						'✅ Да, закрыть',
						`confirm_close_${activeTicket.id}`,
					),
					Markup.button.callback('❌ Отмена', 'cancel_action'),
				],
			]),
		)
	}

	// ==================== Text Messages ====================

	@On('text')
	async onText(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat!.id.toString()
		const text = (ctx.message as any).text

		this.logger.log(`Message from chat ${chatId}: ${text}`)

		const user = await this.usersService.findByTelegramChatId(chatId)
		if (!user) {
			await ctx.reply(
				'⚠️ Сначала авторизуйтесь через @ProRabSpaceBot\n\n' +
					'https://t.me/ProRabSpaceBot',
			)
			return
		}

		const activeTicket = await this.supportService.getActiveTicket(chatId)

		if (activeTicket) {
			await this.supportService.addMessage(activeTicket.id, text, true)

			await ctx.reply(
				`✅ Сообщение добавлено к обращению #${activeTicket.id.slice(0, 8)}\n\n` +
					'Специалист поддержки ответит в ближайшее время',
			)

			await this.forwardMessageToSupportGroup(
				activeTicket,
				text,
				user.fullName,
			)
		} else {
			const faqs = await this.faqService.searchFAQ(text, 3)

			if (faqs.length > 0) {
				await ctx.reply(
					'💡 *Возможно, вам помогут эти статьи:*',
					{
						parse_mode: 'Markdown',
						...Markup.inlineKeyboard(
							faqs.map((faq) => [
								Markup.button.callback(
									`📄 ${faq.question}`,
									`faq_show_${faq.id}`,
								),
							]),
						),
					},
				)

				await ctx.reply(
					'Если не нашли ответ, создам обращение в поддержку',
					Markup.inlineKeyboard([
						[
							Markup.button.callback(
								'✅ Создать обращение',
								`create_ticket_${text.slice(0, 50)}`,
							),
						],
						[Markup.button.callback('📚 Посмотреть все FAQ', 'faq_all')],
					]),
				)
			} else {
				await this.createTicketFromMessage(ctx, user, text)
			}
		}
	}

	// ==================== Callback Queries ====================

	@On('callback_query')
	async onCallbackQuery(@Ctx() ctx: Context): Promise<void> {
		const callbackQuery = (ctx as any).callbackQuery
		const data = callbackQuery.data

		this.logger.log(`Callback query: ${data}`)

		try {
			if (data === 'faq' || data === 'faq_all') {
				await this.showFAQCategories(ctx)
			} else if (data.startsWith('faq_category_')) {
				const category = data.replace('faq_category_', '')
				await this.showFAQByCategory(ctx, category)
			} else if (data.startsWith('faq_show_')) {
				const faqId = data.replace('faq_show_', '')
				await this.showFAQDetails(ctx, faqId)
			} else if (data === 'ask_question') {
				await ctx.answerCbQuery()
				await ctx.reply(
					'💬 Напишите ваш вопрос, и я создам обращение в поддержку',
				)
			} else if (data.startsWith('create_ticket_')) {
				const message = data.replace('create_ticket_', '')
				const chatId = ctx.chat!.id.toString()
				const user = await this.usersService.findByTelegramChatId(chatId)
				if (user) {
					await this.createTicketFromMessage(ctx, user, message)
				}
			} else if (data === 'my_tickets') {
				await this.showMyTickets(ctx)
			} else if (data.startsWith('ticket_history_')) {
				const ticketId = data.replace('ticket_history_', '')
				await this.showTicketHistory(ctx, ticketId)
			} else if (data.startsWith('ticket_close_')) {
				const ticketId = data.replace('ticket_close_', '')
				await ctx.answerCbQuery()
				await ctx.reply(
					`Вы уверены, что хотите закрыть обращение?`,
					Markup.inlineKeyboard([
						[
							Markup.button.callback(
								'✅ Да, закрыть',
								`confirm_close_${ticketId}`,
							),
							Markup.button.callback('❌ Отмена', 'cancel_action'),
						],
					]),
				)
			} else if (data.startsWith('confirm_close_')) {
				const ticketId = data.replace('confirm_close_', '')
				await this.supportService.closeTicket(ticketId)
				await ctx.answerCbQuery('Обращение закрыто')
				await ctx.reply(
					'✅ Обращение успешно закрыто\n\n' +
						'Спасибо, что пользуетесь нашей поддержкой!',
				)
			} else if (data === 'cancel_action') {
				await ctx.answerCbQuery('Отменено')
				await ctx.reply('Действие отменено')
			} else if (data.startsWith('faq_helpful_')) {
				const faqId = data.replace('faq_helpful_', '')
				await this.faqService.markHelpful(faqId, true)
				await ctx.answerCbQuery('Спасибо за отзыв! 👍')
			} else if (data.startsWith('faq_not_helpful_')) {
				const faqId = data.replace('faq_not_helpful_', '')
				await this.faqService.markHelpful(faqId, false)
				await ctx.answerCbQuery('Спасибо за отзыв!')
				await ctx.reply(
					'Создать обращение в поддержку?',
					Markup.inlineKeyboard([
						[Markup.button.callback('✅ Да', 'ask_question')],
						[Markup.button.callback('❌ Нет', 'cancel_action')],
					]),
				)
			}

			await ctx.answerCbQuery()
		} catch (error) {
			this.logger.error(`Error handling callback query: ${error}`)
			await ctx.answerCbQuery('Произошла ошибка')
		}
	}

	// ==================== Helper Methods ====================

	private async showMainMenu(ctx: Context, userName: string): Promise<void> {
		await ctx.reply(
			`👋 Здравствуйте, ${userName}!\n\n` +
				'Я бот технической поддержки ProRab.space\n\n' +
				'Выберите действие:',
			Markup.inlineKeyboard([
				[Markup.button.callback('📚 FAQ (Частые вопросы)', 'faq')],
				[Markup.button.callback('💬 Задать вопрос', 'ask_question')],
				[Markup.button.callback('📊 Мои обращения', 'my_tickets')],
			]),
		)
	}

	private async showFAQCategories(ctx: Context): Promise<void> {
		const categories = await this.faqService.getCategories()

		const categoryButtons = categories.map((category) => [
			Markup.button.callback(
				this.translateCategory(category),
				`faq_category_${category}`,
			),
		])

		await ctx.reply(
			'📚 *Выберите категорию:*',
			{
				parse_mode: 'Markdown',
				...Markup.inlineKeyboard([
					...categoryButtons,
					[Markup.button.callback('« Назад', 'cancel_action')],
				]),
			},
		)
	}

	private async showFAQByCategory(
		ctx: Context,
		category: string,
	): Promise<void> {
		const faqs = await this.faqService.getFAQsByCategory(category)

		if (faqs.length === 0) {
			await ctx.reply('В этой категории пока нет статей')
			return
		}

		const faqButtons = faqs.map((faq) => [
			Markup.button.callback(faq.question, `faq_show_${faq.id}`),
		])

		await ctx.reply(
			`📚 *${this.translateCategory(category)}*\n\n` +
				`Найдено статей: ${faqs.length}`,
			{
				parse_mode: 'Markdown',
				...Markup.inlineKeyboard([
					...faqButtons,
					[Markup.button.callback('« Назад к категориям', 'faq')],
				]),
			},
		)
	}

	private async showFAQDetails(ctx: Context, faqId: string): Promise<void> {
		const faq = await this.faqService.getFAQById(faqId)

		await this.faqService.incrementViews(faqId)

		await ctx.reply(
			`*${faq.question}*\n\n${faq.answer}\n\n` + `👁 Просмотров: ${faq.views + 1}`,
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
				...Markup.inlineKeyboard([
					[
						Markup.button.callback('👍 Помогло', `faq_helpful_${faqId}`),
						Markup.button.callback('👎 Не помогло', `faq_not_helpful_${faqId}`),
					],
					[Markup.button.callback('« Назад к FAQ', 'faq')],
				]),
			},
		)
	}

	private async createTicketFromMessage(
		ctx: Context,
		user: any,
		message: string,
	): Promise<void> {
		const chatId = ctx.chat!.id.toString()

		const ticket = await this.supportService.createTicket(
			user.id,
			chatId,
			message.slice(0, 100),
		)

		await this.supportService.addMessage(ticket.id, message, true)

		await ctx.reply(
			`📝 *Обращение #${ticket.id.slice(0, 8)} создано*\n\n` +
				`Статус: ${this.translateStatus(ticket.status)}\n` +
				`Приоритет: ${this.translatePriority(ticket.priority)}\n\n` +
				'Специалист поддержки ответит в ближайшее время.\n\n' +
				'Вы можете:\n' +
				'• Продолжить писать сообщения\n' +
				'• Проверить статус: /status\n' +
				'• Закрыть обращение: /cancel',
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)

		await this.forwardToSupportGroup(ticket, message, user)
	}

	private async forwardToSupportGroup(
		ticket: any,
		message: string,
		user: any,
	): Promise<void> {
		const supportChatId = this.config.get('telegramSupport.supportChatId')

		if (!supportChatId) {
			this.logger.warn('TELEGRAM_SUPPORT_CHAT_ID not configured')
			return
		}

		try {
			await this.bot.telegram.sendMessage(
				supportChatId,
				`🆕 *Новое обращение #${ticket.id.slice(0, 8)}*\n\n` +
					`👤 *Пользователь:* ${user.fullName || 'Без имени'}\n` +
					`📧 *Email:* ${user.email}\n` +
					`📱 *Telegram:* ${user.telegramUsername ? '@' + user.telegramUsername : 'нет'}\n\n` +
					`💬 *Сообщение:*\n${message}\n\n` +
					`_Ответьте на это сообщение, чтобы ответить пользователю_`,
				{
					parse_mode: 'Markdown',
					link_preview_options: { is_disabled: true },
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: '✅ Взять в работу',
									callback_data: `ticket_take_${ticket.id}`,
								},
							],
						],
					},
				},
			)
		} catch (error) {
			this.logger.error(`Error forwarding to support group: ${error}`)
		}
	}

	private async forwardMessageToSupportGroup(
		ticket: any,
		message: string,
		userName: string,
	): Promise<void> {
		const supportChatId = this.config.get('telegramSupport.supportChatId')

		if (!supportChatId) {
			return
		}

		try {
			await this.bot.telegram.sendMessage(
				supportChatId,
				`💬 *Новое сообщение в обращении #${ticket.id.slice(0, 8)}*\n\n` +
					`👤 *От:* ${userName}\n\n` +
					`${message}`,
				{
					parse_mode: 'Markdown',
					link_preview_options: { is_disabled: true },
				},
			)
		} catch (error) {
			this.logger.error(`Error forwarding message to support group: ${error}`)
		}
	}

	private async showMyTickets(ctx: Context): Promise<void> {
		const chatId = ctx.chat!.id.toString()
		const user = await this.usersService.findByTelegramChatId(chatId)

		if (!user) {
			await ctx.reply('⚠️ Ошибка авторизации')
			return
		}

		const tickets = await this.supportService.getUserTickets(user.id, false)

		if (tickets.length === 0) {
			await ctx.reply(
				'📭 У вас пока нет обращений\n\n' +
					'Отправьте сообщение, чтобы создать новое обращение',
			)
			return
		}

		const ticketsList = tickets
			.slice(0, 10)
			.map((ticket, index) => {
				const status = this.getStatusEmoji(ticket.status)
				return (
					`${index + 1}. ${status} #${ticket.id.slice(0, 8)}\n` +
					`   ${ticket.subject || 'Без темы'}\n` +
					`   ${this.formatDate(ticket.createdAt)}`
				)
			})
			.join('\n\n')

		await ctx.reply(
			`📊 *Ваши обращения (${tickets.length}):*\n\n${ticketsList}`,
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)
	}

	private async showTicketHistory(
		ctx: Context,
		ticketId: string,
	): Promise<void> {
		const ticket = await this.supportService.getTicketById(ticketId)
		const messages = (ticket.messages || []).slice(-10)

		const messagesList = messages
			.map((msg: any) => {
				const from = msg.fromUser ? '👤 Вы' : '🎧 Поддержка'
				const time = this.formatDate(msg.createdAt)
				return `${from} (${time}):\n${msg.message}`
			})
			.join('\n\n---\n\n')

		await ctx.reply(
			`📝 *История обращения #${ticket.id.slice(0, 8)}*\n\n${messagesList}`,
			{
				parse_mode: 'Markdown',
				link_preview_options: { is_disabled: true },
			},
		)
	}

	// ==================== Formatters ====================

	private translateStatus(status: string): string {
		const map: Record<string, string> = {
			OPEN: 'Открыто',
			IN_PROGRESS: 'В работе',
			WAITING_USER: 'Ожидание ответа',
			RESOLVED: 'Решено',
			CLOSED: 'Закрыто',
		}
		return map[status] || status
	}

	private getStatusEmoji(status: string): string {
		const map: Record<string, string> = {
			OPEN: '🟢',
			IN_PROGRESS: '🟡',
			WAITING_USER: '🔵',
			RESOLVED: '✅',
			CLOSED: '⚫',
		}
		return map[status] || '❓'
	}

	private translatePriority(priority: string): string {
		const map: Record<string, string> = {
			LOW: '🟢 Низкий',
			MEDIUM: '🟡 Средний',
			HIGH: '🟠 Высокий',
			URGENT: '🔴 Срочный',
		}
		return map[priority] || priority
	}

	private translateCategory(category: string): string {
		const map: Record<string, string> = {
			projects: '1️⃣ Проекты и команды',
			teams: '2️⃣ Команды',
			finances: '3️⃣ Расходы и финансы',
			'photo-reports': '4️⃣ Фотоотчёты',
			technical: '5️⃣ Технические проблемы',
		}
		return map[category] || category
	}

	private formatDate(date: Date): string {
		return new Intl.DateTimeFormat('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}
}
