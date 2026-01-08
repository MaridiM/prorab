import { PrismaClient, ProjectStatus, LogoType, AdminRoleType } from './generated/client'
import * as argon2 from 'argon2'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import { RolePermissions } from '../src/shared/constants/admin-permissions'

// Load environment variables
dotenv.config({ path: '../../.env' })
dotenv.config()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	console.error('❌ DATABASE_URL is not set')
	process.exit(1)
}

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ==================== SEED USERS ====================
// Все тестовые пользователи для базового формирования

interface SeedUser {
	email: string
	password: string
	fullName: string
	phone: string
	role: AdminRoleType | null
	roleDescription: string
	businessRole?: 'FOREMAN' | 'WORKER' // Бизнес-роль пользователя
	subscriptionPlan?: 'LITE' | 'FOREMAN' | 'BRIGADE' // Тарифный план для прорабов
}

const SEED_USERS: SeedUser[] = [
	// 1. Super Admin - полный доступ ко всему
	{
		email: 'superadmin@prorab.app',
		password: 'super123456',
		fullName: 'Александр Супер',
		phone: '+7 (999) 000-00-01',
		role: AdminRoleType.SUPER_ADMIN,
		roleDescription: 'Полный доступ ко всей системе',
	},
	// 2. Admin - большинство админских функций
	{
		email: 'admin@prorab.app',
		password: 'admin123456',
		fullName: 'Мария Админова',
		phone: '+7 (999) 000-00-02',
		role: AdminRoleType.ADMIN,
		roleDescription: 'Управление пользователями, командами, подписками',
	},
	// 3. Moderator - модерация контента
	{
		email: 'moderator@prorab.app',
		password: 'mod123456',
		fullName: 'Иван Модератор',
		phone: '+7 (999) 000-00-03',
		role: AdminRoleType.MODERATOR,
		roleDescription: 'Модерация контента, поддержка пользователей',
	},
	// 4. Support - только поддержка
	{
		email: 'support@prorab.app',
		password: 'support123456',
		fullName: 'Елена Саппорт',
		phone: '+7 (999) 000-00-04',
		role: AdminRoleType.SUPPORT,
		roleDescription: 'Просмотр тикетов и базовая поддержка',
	},
	// 5. Demo User - прораб с демо данными
	{
		email: 'demo@prorab.app',
		password: 'demo123456',
		fullName: 'Демо Пользователь',
		phone: '+7 (999) 123-45-67',
		role: null, // Обычный пользователь без админ роли
		roleDescription: 'Прораб с демо проектами',
		businessRole: 'FOREMAN', // Прораб - владелец команды
		subscriptionPlan: 'LITE', // Тариф "Лайт" для демо пользователя (с тестовым периодом)
	},
	// 6-8. Обычные пользователи для тестирования команд
	{
		email: 'user1@prorab.app',
		password: 'user123456',
		fullName: 'Петр Петров',
		phone: '+7 (999) 111-11-11',
		role: null,
		roleDescription: 'Тестовый пользователь 1',
	},
	{
		email: 'user2@prorab.app',
		password: 'user123456',
		fullName: 'Ольга Сидорова',
		phone: '+7 (999) 222-22-22',
		role: null,
		roleDescription: 'Тестовый пользователь 2',
	},
	{
		email: 'user3@prorab.app',
		password: 'user123456',
		fullName: 'Сергей Иванов',
		phone: '+7 (999) 333-33-33',
		role: null,
		roleDescription: 'Тестовый пользователь 3',
	},
]

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
	console.log('')

	// ==================== 1. CREATE ALL USERS ====================
	console.log('👥 Creating seed users...')
	const createdUsers: any[] = []

	for (const seedUser of SEED_USERS) {
		// Проверяем, существует ли пользователь
		const existingUser = await prisma.user.findUnique({
			where: { email: seedUser.email },
			include: { adminRole: true },
		})

		if (existingUser) {
			console.log(`   ⚠️  User already exists: ${seedUser.email}`)

			// Обновляем businessRole если указан и отличается
			if (seedUser.businessRole && existingUser.businessRole !== seedUser.businessRole) {
				await prisma.user.update({
					where: { id: existingUser.id },
					data: {
						businessRole: seedUser.businessRole as any,
						businessRoleAssignedAt: new Date(),
					},
				})
				console.log(`      🔧 Business role updated: ${seedUser.businessRole}`)
			}

			// Определяем правильные права доступа для роли
			const expectedPermissions = seedUser.role === AdminRoleType.SUPER_ADMIN
				? [...RolePermissions.SUPER_ADMIN]
				: seedUser.role === AdminRoleType.ADMIN
				? [...RolePermissions.ADMIN]
				: seedUser.role === AdminRoleType.MODERATOR
				? [...RolePermissions.MODERATOR]
				: seedUser.role === AdminRoleType.SUPPORT
				? [...RolePermissions.SUPPORT]
				: [];

			// Проверяем и создаем/обновляем админ роль
			if (seedUser.role) {
				if (!existingUser.adminRole) {
					// Создаем роль, если её нет
					console.log(`      👑 Creating ${seedUser.role} role...`)
					await prisma.adminRole.create({
						data: {
							userId: existingUser.id,
							role: seedUser.role as any,
							permissions: expectedPermissions,
							twoFactorEnforced: false,
							ipWhitelist: [],
						},
					})
					console.log(`      ✅ Role assigned: ${seedUser.role}`)
				} else {
					// Обновляем роль, если она существует, но не соответствует seed данным
					const needsUpdate = 
						existingUser.adminRole.role !== seedUser.role ||
						JSON.stringify(existingUser.adminRole.permissions.sort()) !== JSON.stringify(expectedPermissions.sort());

					if (needsUpdate) {
						console.log(`      🔧 Updating ${seedUser.role} role and permissions...`)
						await prisma.adminRole.update({
							where: { userId: existingUser.id },
							data: {
								role: seedUser.role as any,
								permissions: expectedPermissions,
							},
						})
						console.log(`      ✅ Role updated: ${seedUser.role} with ${expectedPermissions.length} permissions`)
					} else {
						console.log(`      ✅ Role already correct: ${seedUser.role}`)
					}
				}
			} else {
				// Если в seed нет роли, но у пользователя есть - удаляем её
				if (existingUser.adminRole) {
					console.log(`      🗑️  Removing admin role (user should not have admin role)...`)
					await prisma.adminRole.delete({
						where: { userId: existingUser.id },
					})
					console.log(`      ✅ Admin role removed`)
				}
			}

			createdUsers.push(existingUser)
			continue
		}

		// Создаём нового пользователя
		const passwordHash = await argon2.hash(seedUser.password)

		const user = await prisma.user.create({
			data: {
				email: seedUser.email,
				emailNormalized: seedUser.email.toLowerCase(),
				emailVerified: true,
				passwordHash,
				fullName: seedUser.fullName,
				phone: seedUser.phone,
				hasCompletedOnboarding: true,
				onboardingCompletedAt: daysAgo(30),
				businessRole: seedUser.businessRole || null,
				businessRoleAssignedAt: seedUser.businessRole ? new Date() : null,
			},
		})

		console.log(`   ✅ Created: ${user.email} - ${seedUser.fullName}`)

		// Создаём админ роль если указана
		if (seedUser.role) {
			const expectedPermissions = seedUser.role === AdminRoleType.SUPER_ADMIN
				? [...RolePermissions.SUPER_ADMIN]
				: seedUser.role === AdminRoleType.ADMIN
				? [...RolePermissions.ADMIN]
				: seedUser.role === AdminRoleType.MODERATOR
				? [...RolePermissions.MODERATOR]
				: seedUser.role === AdminRoleType.SUPPORT
				? [...RolePermissions.SUPPORT]
				: [];

			await prisma.adminRole.create({
				data: {
					userId: user.id,
					role: seedUser.role as any,
					permissions: expectedPermissions,
					twoFactorEnforced: false,
					ipWhitelist: [],
				},
			})
			console.log(`      👑 Role assigned: ${seedUser.role} (${expectedPermissions.length} permissions)`)
		}

		createdUsers.push(user)
	}

	console.log('')
	console.log(`   ✅ Total users: ${createdUsers.length}`)
	console.log('')

	// Создаём команды и подписки для всех пользователей с ролью FOREMAN
	console.log('👥 Creating teams and subscriptions for FOREMAN users...')
	const foremanUsers = createdUsers.filter(u => {
		const seedUser = SEED_USERS.find(su => su.email === u.email)
		return seedUser?.businessRole === 'FOREMAN'
	})

	for (const foremanUser of foremanUsers) {
		const seedUser = SEED_USERS.find(su => su.email === foremanUser.email)
		if (!seedUser || !seedUser.subscriptionPlan) continue

		// Проверяем, есть ли уже команда у пользователя
		let team = await prisma.team.findFirst({
			where: { ownerId: foremanUser.id },
		})

		if (!team) {
			// Создаём команду для прораба
			team = await prisma.team.create({
				data: {
					name: `${seedUser.fullName} - Команда`,
					logoType: LogoType.GENERATED,
					iconId: 'building',
					colorId: 'blue',
					ownerId: foremanUser.id,
				},
			})

			// Добавляем владельца как члена команды
			await prisma.teamMember.create({
				data: {
					teamId: team.id,
					userId: foremanUser.id,
					role: 'OWNER',
					salaryType: 'percentage',
					salaryAmount: 15,
				},
			})

			// Обновляем текущую команду пользователя
			await prisma.user.update({
				where: { id: foremanUser.id },
				data: { currentTeamId: team.id },
			})

			console.log(`   ✅ Team created for ${foremanUser.email}: ${team.name}`)
		}

		// Создаём подписку
		const planSlug = seedUser.subscriptionPlan.toLowerCase()
		const plan = await prisma.plan.findUnique({
			where: { slug: planSlug },
		})

		if (!plan) {
			console.log(`   ⚠️  Plan "${planSlug}" not found for ${foremanUser.email}`)
			continue
		}

		// Проверяем, существует ли уже подписка
		const existingSubscription = await prisma.subscription.findUnique({
			where: { teamId: team.id },
		})

		if (existingSubscription) {
			console.log(`   ⚠️  Subscription already exists for ${foremanUser.email}`)
			continue
		}

		const now = new Date()
		
		// Check if trial period is available for this plan
		// Trial is only available for LITE plan (TRIAL_ALLOWED_ONLY_FOR_PLAN = 'lite')
		const TRIAL_ALLOWED_ONLY_FOR_PLAN = 'lite'
		const hasTrial = planSlug === TRIAL_ALLOWED_ONLY_FOR_PLAN && plan.trialDays && plan.trialDays > 0
		
		const trialEndsAt = hasTrial 
			? new Date(now.getTime() + (plan.trialDays || 14) * 24 * 60 * 60 * 1000)
			: null
		
		// For trialing subscriptions, currentPeriodEnd should equal trialEndsAt
		// For non-trial subscriptions, use regular billing cycle (30 days)
		const currentPeriodEnd = trialEndsAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
		
		const planEnum = planSlug.toUpperCase() as 'LITE' | 'FOREMAN' | 'BRIGADE'
		const subscriptionStatus = hasTrial ? 'TRIALING' : 'ACTIVE'

		await prisma.subscription.create({
			data: {
				teamId: team.id,
				plan: planEnum,
				planId: plan.id,
				status: subscriptionStatus,
				currentPeriodStart: now,
				currentPeriodEnd: currentPeriodEnd,
				trialEndsAt: trialEndsAt,
				isEarlyBird: true,
				currency: 'RUB',
			},
		})

		const statusText = hasTrial ? 'TRIALING' : 'ACTIVE'
		console.log(`   ✅ Subscription created for ${foremanUser.email}: ${plan.name} (${statusText}, Early Bird${hasTrial ? `, ${plan.trialDays} days trial` : ''})`)
	}

	console.log('')

	// Находим демо пользователя для создания проектов
	const demoUser = createdUsers.find(u => u.email === 'demo@prorab.app')

	if (!demoUser) {
		console.log('⚠️ Demo user not found, skipping project creation')
		return
	}

	// Находим команду demo пользователя (уже создана выше для FOREMAN пользователей)
	let team = await prisma.team.findFirst({
		where: { ownerId: demoUser.id },
	})

	if (!team) {
		// Если команда не создана (старая версия seed), создаем её
		console.log('👥 Creating team for demo user...')
		team = await prisma.team.create({
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
				role: 'OWNER',
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
	} else {
		// Обновляем название команды для demo пользователя на "СтройМастер"
		team = await prisma.team.update({
			where: { id: team.id },
			data: { name: 'СтройМастер' },
		})
		console.log(`   ✅ Using existing team: ${team.name}`)
	}

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

	// ============================================
	// CREATE ADMIN ACTION LOGS
	// ============================================
	console.log('\n🔐 Creating admin action logs...')

	const superAdmin = createdUsers.find((u) => u.email === 'superadmin@prorab.app')
	const admin = createdUsers.find((u) => u.email === 'admin@prorab.app')
	const moderator = createdUsers.find((u) => u.email === 'moderator@prorab.app')
	const support = createdUsers.find((u) => u.email === 'support@prorab.app')

	if (superAdmin && admin && moderator && support) {
		// Super Admin actions (last 7 days)
		await prisma.adminActionLog.createMany({
			data: [
				{
					adminUserId: superAdmin.id,
					action: 'CREATE',
					resource: 'User',
					resourceId: demoUser.id,
					details: { email: 'demo@prorab.app', role: 'user' },
					ipAddress: '192.168.1.100',
					userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
					createdAt: daysAgo(7),
				},
				{
					adminUserId: superAdmin.id,
					action: 'UPDATE',
					resource: 'AdminRole',
					resourceId: admin.id,
					details: { permissions: ['users:view', 'users:manage'] },
					ipAddress: '192.168.1.100',
					createdAt: daysAgo(6),
				},
				{
					adminUserId: superAdmin.id,
					action: 'CREATE',
					resource: 'SystemSettings',
					resourceId: 'email-config',
					details: { category: 'email', key: 'smtp_host', value: 'smtp.example.com' },
					ipAddress: '192.168.1.100',
					createdAt: daysAgo(5),
				},
				{
					adminUserId: superAdmin.id,
					action: 'DELETE',
					resource: 'Team',
					resourceId: 'deleted-team-id',
					details: { teamName: 'Старая команда', reason: 'inactive' },
					ipAddress: '192.168.1.100',
					createdAt: daysAgo(4),
				},
			],
		})

		// Admin actions (last 5 days)
		await prisma.adminActionLog.createMany({
			data: [
				{
					adminUserId: admin.id,
					action: 'VERIFY',
					resource: 'User',
					resourceId: demoUser.id,
					details: { verified: true },
					ipAddress: '192.168.1.101',
					userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
					createdAt: daysAgo(5),
				},
				{
					adminUserId: admin.id,
					action: 'UPDATE',
					resource: 'Team',
					resourceId: team.id,
					details: { name: 'СтройМастер', subscription: 'BRIGADE' },
					ipAddress: '192.168.1.101',
					createdAt: daysAgo(3),
				},
				{
					adminUserId: admin.id,
					action: 'CREATE',
					resource: 'Subscription',
					resourceId: 'sub-123',
					details: { teamId: team.id, plan: 'BRIGADE', price: 2490 },
					ipAddress: '192.168.1.101',
					createdAt: daysAgo(2),
				},
			],
		})

		// Moderator actions (last 3 days)
		await prisma.adminActionLog.createMany({
			data: [
				{
					adminUserId: moderator.id,
					action: 'UPDATE',
					resource: 'Project',
					resourceId: project1.id,
					details: { status: 'active', moderated: true },
					ipAddress: '192.168.1.102',
					userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
					createdAt: daysAgo(3),
				},
				{
					adminUserId: moderator.id,
					action: 'UPDATE',
					resource: 'PhotoReport',
					resourceId: 'report-id',
					details: { approved: true },
					ipAddress: '192.168.1.102',
					createdAt: daysAgo(1),
				},
			],
		})

		// Support actions (today)
		await prisma.adminActionLog.createMany({
			data: [
				{
					adminUserId: support.id,
					action: 'VIEW',
					resource: 'User',
					resourceId: demoUser.id,
					details: { ticket: 'SUPPORT-123' },
					ipAddress: '192.168.1.103',
					userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
					createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
				},
				{
					adminUserId: support.id,
					action: 'VIEW',
					resource: 'Team',
					resourceId: team.id,
					details: { ticket: 'SUPPORT-124' },
					ipAddress: '192.168.1.103',
					createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
				},
			],
		})

		console.log('   ✅ Created 13 admin action logs')
	}

	console.log('')
	console.log('✅ Seed completed successfully!')
	console.log('')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log('📋 SEED ACCOUNTS - LOGIN CREDENTIALS')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log('')
	console.log('👑 ADMIN ACCOUNTS:')
	console.log('   1. Super Admin:')
	console.log(`      Email:    superadmin@prorab.app`)
	console.log(`      Password: super123456`)
	console.log(`      Role:     SUPER_ADMIN (полный доступ)`)
	console.log('')
	console.log('   2. Admin:')
	console.log(`      Email:    admin@prorab.app`)
	console.log(`      Password: admin123456`)
	console.log(`      Role:     ADMIN (управление системой)`)
	console.log('')
	console.log('   3. Moderator:')
	console.log(`      Email:    moderator@prorab.app`)
	console.log(`      Password: mod123456`)
	console.log(`      Role:     MODERATOR (модерация контента)`)
	console.log('')
	console.log('   4. Support:')
	console.log(`      Email:    support@prorab.app`)
	console.log(`      Password: support123456`)
	console.log(`      Role:     SUPPORT (просмотр тикетов)`)
	console.log('')
	console.log('👤 REGULAR USERS:')
	console.log('   5. Demo User (с проектами):')
	console.log(`      Email:    demo@prorab.app`)
	console.log(`      Password: demo123456`)
	console.log('')
	console.log('   6-8. Test Users:')
	console.log(`      Email:    user1@prorab.app, user2@prorab.app, user3@prorab.app`)
	console.log(`      Password: user123456 (для всех)`)
	console.log('')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log('📊 CREATED DATA:')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log(`   ✅ ${createdUsers.length} users`)
	console.log(`   ✅ 4 admin roles (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)`)
	console.log('   ✅ 1 team (СтройМастер)')
	console.log('   ✅ 7 projects (3 active, 2 completed, 2 archived)')
	console.log('   ✅ 27 expenses')
	console.log('   ✅ 6 photo reports')
	console.log('   ✅ 2 payouts')
	console.log('   ✅ 13 admin action logs')
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	console.log('')
	console.log('💡 TIP: Use superadmin@prorab.app to test RBAC system')
	console.log('')
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

