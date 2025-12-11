import { PrismaClient, ProjectStatus, LogoType } from './generated/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

// Демо пользователь
const DEMO_USER = {
	email: 'demo@prorab.app',
	password: 'demo123456',
	fullName: 'Демо Пользователь',
	phone: '+7 (999) 123-45-67',
}

// Генерация случайного slug для отчётов
function generateSlug(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	let result = ''
	for (let i = 0; i < 8; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}

// Получить дату N дней назад
function daysAgo(days: number): Date {
	const date = new Date()
	date.setDate(date.getDate() - days)
	return date
}

// Получить дату через N дней
function daysLater(days: number): Date {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date
}

async function main() {
	console.log('🌱 Starting seed...')

	// Проверяем, существует ли уже демо пользователь
	const existingUser = await prisma.user.findUnique({
		where: { email: DEMO_USER.email },
	})

	if (existingUser) {
		console.log('⚠️ Demo user already exists, skipping seed')
		return
	}

	// 1. Создаём демо пользователя
	console.log('👤 Creating demo user...')
	const passwordHash = await argon2.hash(DEMO_USER.password)

	const demoUser = await prisma.user.create({
		data: {
			email: DEMO_USER.email,
			emailNormalized: DEMO_USER.email.toLowerCase(),
			emailVerified: true,
			passwordHash,
			fullName: DEMO_USER.fullName,
			phone: DEMO_USER.phone,
			hasCompletedOnboarding: true,
			onboardingCompletedAt: daysAgo(30),
		},
	})

	console.log(`   ✅ User created: ${demoUser.email}`)

	// 2. Создаём команду
	console.log('👥 Creating team...')
	const team = await prisma.team.create({
		data: {
			name: 'СтройМастер',
			logoType: LogoType.GENERATED,
			iconId: 'building',
			colorId: 'blue',
			ownerId: demoUser.id,
		},
	})

	// Добавляем владельца как члена команды
	await prisma.teamMember.create({
		data: {
			teamId: team.id,
			userId: demoUser.id,
			role: 'owner',
			salaryType: 'percentage',
			salaryAmount: 15,
		},
	})

	// Обновляем текущую команду пользователя
	await prisma.user.update({
		where: { id: demoUser.id },
		data: { currentTeamId: team.id },
	})

	console.log(`   ✅ Team created: ${team.name}`)

	// 3. Создаём проекты
	console.log('🏗️ Creating projects...')

	// Проект 1: Активный с большим бюджетом
	const project1 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Дом Строй ЛБ',
			address: 'Киевская 32',
			description: 'Строительство частного дома под ключ. Площадь 180 кв.м.',
			budget: 4500000,
			clientPhone: '+7 (900) 111-22-33',
			startDate: daysAgo(45),
			endDate: daysLater(90),
			progress: 35,
			status: ProjectStatus.ACTIVE,
			createdById: demoUser.id,
		},
	})

	// Проект 2: Активный (ремонт)
	const project2 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Квартира на Пушкина',
			address: 'ул. Пушкина, д. 15, кв. 42',
			description: 'Капитальный ремонт трёхкомнатной квартиры. Площадь 85 кв.м.',
			budget: 1800000,
			clientPhone: '+7 (900) 222-33-44',
			startDate: daysAgo(20),
			endDate: daysLater(45),
			progress: 15,
			status: ProjectStatus.ACTIVE,
			createdById: demoUser.id,
		},
	})

	// Проект 3: Активный без бюджета (начальный этап)
	const project3 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Офис TechCorp',
			address: 'БЦ Сити, 5 этаж',
			description: 'Отделка офисного помещения. Площадь 120 кв.м.',
			budget: null,
			clientPhone: '+7 (900) 333-44-55',
			startDate: daysAgo(5),
			endDate: null,
			progress: 5,
			status: ProjectStatus.ACTIVE,
			createdById: demoUser.id,
		},
	})

	// Проект 4: Завершённый
	const project4 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Коттедж Солнечный',
			address: 'КП Солнечный, уч. 28',
			description: 'Строительство коттеджа с отделкой. Площадь 220 кв.м.',
			budget: 6800000,
			clientPhone: '+7 (900) 444-55-66',
			startDate: daysAgo(180),
			endDate: daysAgo(15),
			progress: 100,
			status: ProjectStatus.COMPLETED,
			completedAt: daysAgo(15),
			finalProfit: 1020000,
			createdById: demoUser.id,
		},
	})

	// Проект 5: Завершённый
	const project5 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Баня у Петровых',
			address: 'с. Озёрное, ул. Лесная 5',
			description: 'Строительство бани из бруса с комнатой отдыха.',
			budget: 950000,
			clientPhone: '+7 (900) 555-66-77',
			startDate: daysAgo(90),
			endDate: daysAgo(30),
			progress: 100,
			status: ProjectStatus.COMPLETED,
			completedAt: daysAgo(30),
			finalProfit: 190000,
			createdById: demoUser.id,
		},
	})

	// Проект 6: Архивный
	const project6 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Гараж на 2 машины',
			address: 'ул. Гаражная 10',
			description: 'Строительство гаража с подвалом. Проект заморожен клиентом.',
			budget: 800000,
			clientPhone: '+7 (900) 666-77-88',
			startDate: daysAgo(120),
			endDate: null,
			progress: 25,
			status: ProjectStatus.ARCHIVED,
			archivedAt: daysAgo(60),
			notes: 'Клиент приостановил финансирование',
			createdById: demoUser.id,
		},
	})

	// Проект 7: Архивный (отменён)
	const project7 = await prisma.project.create({
		data: {
			teamId: team.id,
			name: 'Беседка Иванова',
			address: 'дачный посёлок Радуга',
			description: 'Строительство деревянной беседки.',
			budget: 150000,
			clientPhone: '+7 (900) 777-88-99',
			startDate: daysAgo(150),
			endDate: null,
			progress: 0,
			status: ProjectStatus.ARCHIVED,
			archivedAt: daysAgo(140),
			notes: 'Клиент отказался от проекта',
			createdById: demoUser.id,
		},
	})

	console.log('   ✅ Created 7 projects')

	// 4. Создаём расходы
	console.log('💰 Creating expenses...')

	// Расходы для Проекта 1 (Дом Строй ЛБ)
	const expenseCategories = ['Материалы', 'Работа', 'Доставка', 'Инструменты', 'Прочее']
	const project1Expenses = [
		{ amount: 450000, category: 'Материалы', comment: 'Кирпич, цемент, арматура для фундамента' },
		{ amount: 180000, category: 'Работа', comment: 'Земляные работы и заливка фундамента' },
		{ amount: 35000, category: 'Доставка', comment: 'Доставка стройматериалов' },
		{ amount: 320000, category: 'Материалы', comment: 'Газоблоки для стен' },
		{ amount: 150000, category: 'Работа', comment: 'Кладка стен первого этажа' },
		{ amount: 85000, category: 'Материалы', comment: 'Пиломатериалы для перекрытий' },
		{ amount: 25000, category: 'Инструменты', comment: 'Аренда миксера и вибратора' },
		{ amount: 12000, category: 'Прочее', comment: 'Электричество на объекте' },
	]

	for (let i = 0; i < project1Expenses.length; i++) {
		const exp = project1Expenses[i]
		await prisma.expense.create({
			data: {
				projectId: project1.id,
				amount: exp.amount,
				category: exp.category,
				comment: exp.comment,
				paidByClient: i % 3 === 0, // каждый третий оплачен клиентом
				createdById: demoUser.id,
				createdAt: daysAgo(45 - i * 5),
			},
		})
	}

	// Расходы для Проекта 2 (Квартира на Пушкина)
	const project2Expenses = [
		{ amount: 45000, category: 'Материалы', comment: 'Демонтажные работы, вывоз мусора' },
		{ amount: 85000, category: 'Работа', comment: 'Демонтаж старых покрытий' },
		{ amount: 120000, category: 'Материалы', comment: 'Электрика: провода, автоматы, щиток' },
		{ amount: 65000, category: 'Работа', comment: 'Штробление и прокладка электрики' },
	]

	for (let i = 0; i < project2Expenses.length; i++) {
		const exp = project2Expenses[i]
		await prisma.expense.create({
			data: {
				projectId: project2.id,
				amount: exp.amount,
				category: exp.category,
				comment: exp.comment,
				paidByClient: false,
				createdById: demoUser.id,
				createdAt: daysAgo(20 - i * 4),
			},
		})
	}

	// Расходы для завершённого Проекта 4 (Коттедж Солнечный)
	const project4Expenses = [
		{ amount: 890000, category: 'Материалы', comment: 'Фундамент: бетон, арматура' },
		{ amount: 420000, category: 'Работа', comment: 'Фундаментные работы' },
		{ amount: 1250000, category: 'Материалы', comment: 'Стеновые материалы' },
		{ amount: 580000, category: 'Работа', comment: 'Возведение стен и перекрытий' },
		{ amount: 680000, category: 'Материалы', comment: 'Кровельные материалы' },
		{ amount: 320000, category: 'Работа', comment: 'Кровельные работы' },
		{ amount: 450000, category: 'Материалы', comment: 'Окна, двери' },
		{ amount: 890000, category: 'Материалы', comment: 'Отделочные материалы' },
		{ amount: 650000, category: 'Работа', comment: 'Внутренняя отделка' },
		{ amount: 95000, category: 'Доставка', comment: 'Доставка материалов за весь проект' },
		{ amount: 45000, category: 'Прочее', comment: 'Согласования, документы' },
	]

	for (let i = 0; i < project4Expenses.length; i++) {
		const exp = project4Expenses[i]
		await prisma.expense.create({
			data: {
				projectId: project4.id,
				amount: exp.amount,
				category: exp.category,
				comment: exp.comment,
				paidByClient: true,
				createdById: demoUser.id,
				createdAt: daysAgo(180 - i * 15),
			},
		})
	}

	// Расходы для завершённого Проекта 5 (Баня)
	const project5Expenses = [
		{ amount: 180000, category: 'Материалы', comment: 'Брус, доска для каркаса' },
		{ amount: 95000, category: 'Работа', comment: 'Фундамент и сборка сруба' },
		{ amount: 120000, category: 'Материалы', comment: 'Утеплитель, пароизоляция' },
		{ amount: 85000, category: 'Материалы', comment: 'Печь банная с дымоходом' },
		{ amount: 65000, category: 'Работа', comment: 'Монтаж печи, отделка парной' },
		{ amount: 45000, category: 'Материалы', comment: 'Вагонка, полки' },
		{ amount: 35000, category: 'Работа', comment: 'Внутренняя отделка' },
		{ amount: 28000, category: 'Доставка', comment: 'Доставка материалов' },
	]

	for (let i = 0; i < project5Expenses.length; i++) {
		const exp = project5Expenses[i]
		await prisma.expense.create({
			data: {
				projectId: project5.id,
				amount: exp.amount,
				category: exp.category,
				comment: exp.comment,
				paidByClient: true,
				createdById: demoUser.id,
				createdAt: daysAgo(90 - i * 8),
			},
		})
	}

	console.log('   ✅ Created expenses for projects')

	// 5. Создаём фото отчёты
	console.log('📸 Creating photo reports...')

	// Отчёт для Проекта 1
	const report1 = await prisma.photoReport.create({
		data: {
			slug: generateSlug(),
			projectId: project1.id,
			title: 'Фундамент готов',
			description: 'Завершены работы по заливке фундамента. Бетон набирает прочность.',
			isPublic: true,
			viewCount: 24,
			createdById: demoUser.id,
			publishedAt: daysAgo(30),
			createdAt: daysAgo(30),
		},
	})

	const report2 = await prisma.photoReport.create({
		data: {
			slug: generateSlug(),
			projectId: project1.id,
			title: 'Возведение стен',
			description: 'Начали кладку стен первого этажа из газоблока.',
			isPublic: true,
			viewCount: 18,
			createdById: demoUser.id,
			publishedAt: daysAgo(15),
			createdAt: daysAgo(15),
		},
	})

	// Отчёт для Проекта 2
	const report3 = await prisma.photoReport.create({
		data: {
			slug: generateSlug(),
			projectId: project2.id,
			title: 'Демонтаж завершён',
			description: 'Полностью демонтированы старые покрытия, выровнены стены.',
			isPublic: true,
			viewCount: 12,
			createdById: demoUser.id,
			publishedAt: daysAgo(10),
			createdAt: daysAgo(10),
		},
	})

	// Отчёты для завершённого Проекта 4
	const report4 = await prisma.photoReport.create({
		data: {
			slug: generateSlug(),
			projectId: project4.id,
			title: 'Коробка дома готова',
			description: 'Возведены стены, установлена кровля, вставлены окна.',
			isPublic: true,
			viewCount: 156,
			createdById: demoUser.id,
			publishedAt: daysAgo(90),
			createdAt: daysAgo(90),
		},
	})

	const report5 = await prisma.photoReport.create({
		data: {
			slug: generateSlug(),
			projectId: project4.id,
			title: 'Финальный результат',
			description: 'Дом полностью готов к заселению. Выполнена чистовая отделка.',
			isPublic: true,
			viewCount: 234,
			createdById: demoUser.id,
			publishedAt: daysAgo(15),
			createdAt: daysAgo(15),
		},
	})

	// Отчёт для Проекта 5 (Баня)
	const report6 = await prisma.photoReport.create({
		data: {
			slug: generateSlug(),
			projectId: project5.id,
			title: 'Баня готова',
			description: 'Баня из бруса полностью построена и готова к использованию.',
			isPublic: true,
			viewCount: 89,
			createdById: demoUser.id,
			publishedAt: daysAgo(30),
			createdAt: daysAgo(30),
		},
	})

	console.log('   ✅ Created 6 photo reports')

	// 6. Добавляем фотографии к отчётам (заглушки URL)
	console.log('🖼️ Creating report photos...')

	const samplePhotos = [
		'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
		'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
		'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
		'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
		'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
	]

	const reports = [report1, report2, report3, report4, report5, report6]

	for (const report of reports) {
		const photoCount = Math.floor(Math.random() * 3) + 2 // 2-4 фото на отчёт
		for (let i = 0; i < photoCount; i++) {
			await prisma.reportPhoto.create({
				data: {
					reportId: report.id,
					photoUrl: samplePhotos[i % samplePhotos.length],
					caption: i === 0 ? 'Общий вид' : null,
					orderIndex: i,
					width: 1200,
					height: 800,
				},
			})
		}

		// Устанавливаем cover photo
		await prisma.photoReport.update({
			where: { id: report.id },
			data: { coverPhotoUrl: samplePhotos[0] },
		})
	}

	console.log('   ✅ Created photos for reports')

	// 7. Создаём выплаты для завершённых проектов
	console.log('💸 Creating payouts...')

	const ownerMember = await prisma.teamMember.findFirst({
		where: { teamId: team.id, userId: demoUser.id },
	})

	if (ownerMember) {
		// Выплата за Проект 4
		await prisma.projectPayout.create({
			data: {
				projectId: project4.id,
				memberId: ownerMember.id,
				calculatedAmount: 153000, // 15% от 1,020,000 прибыли
				actualAmount: 153000,
				status: 'paid',
				paidAt: daysAgo(10),
				notes: 'Выплата по завершении проекта',
			},
		})

		// Выплата за Проект 5
		await prisma.projectPayout.create({
			data: {
				projectId: project5.id,
				memberId: ownerMember.id,
				calculatedAmount: 28500, // 15% от 190,000 прибыли
				actualAmount: 28500,
				status: 'paid',
				paidAt: daysAgo(25),
				notes: 'Выплата по завершении проекта',
			},
		})
	}

	console.log('   ✅ Created payouts')

	console.log('')
	console.log('✅ Seed completed successfully!')
	console.log('')
	console.log('📋 Demo account credentials:')
	console.log(`   Email: ${DEMO_USER.email}`)
	console.log(`   Password: ${DEMO_USER.password}`)
	console.log('')
	console.log('📊 Created data:')
	console.log('   - 1 demo user')
	console.log('   - 1 team')
	console.log('   - 7 projects (3 active, 2 completed, 2 archived)')
	console.log('   - 27 expenses')
	console.log('   - 6 photo reports')
	console.log('   - 2 payouts')
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

