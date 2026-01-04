/**
 * Seed script to create payment history for demo user
 * All dates are аккуратно согласованы, якорь = 04.01.2026 (локально, 12:00)
 *
 * Гарантии:
 * - Каждый payment = ровно 30 дней: periodStartAt === paidAt, periodEndAt = +30 дней
 * - Продления (тот же план) идут без разрывов: новый период начинается в конец прошлого
 * - Ранняя смена плана (shiftDays 1..29) режет предыдущий период до paidAt
 * - subscription.currentPeriodStart/currentPeriodEnd = период ПОСЛЕДНЕГО платежа (не “накопительный”)
 */
import * as dotenv from 'dotenv'
import { Pool } from 'pg'

import { PrismaPg } from '@prisma/adapter-pg'

import { PaymentProviderType, PaymentStatus, PrismaClient, SubscriptionStatus } from '../prisma/generated/client'

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

const BILLING_CYCLE_DAYS = 30

// Plan prices (RUB, regular / early bird)
const PLAN_PRICES = {
	LITE: { regular: 490, earlyBird: 290 },
	FOREMAN: { regular: 990, earlyBird: 690 },
	BRIGADE: { regular: 1990, earlyBird: 1490 },
}

type PlanSlug = 'lite' | 'foreman' | 'brigade'

interface PaymentHistoryEntry {
	planSlug: PlanSlug
	planName: string
	isEarlyBird: boolean

	/**
	 * Только для смены плана:
	 * - undefined => смена по границе (в prev.periodEndAt)
	 * - 1..29 => ранняя смена внутри предыдущего периода (обрезаем предыдущий до paidAt)
	 */
	shiftDays?: number
}

/**
 * История от старых к новым (НЕ сортировать).
 * Последняя запись будет привязана к TODAY = 04.01.2026 12:00 (+03:00).
 */
const PAYMENT_HISTORY: PaymentHistoryEntry[] = [
	// Lite Early Bird (3 месяца)
	{ planSlug: 'lite', planName: 'Лайт', isEarlyBird: true },
	{ planSlug: 'lite', planName: 'Лайт', isEarlyBird: true },
	{ planSlug: 'lite', planName: 'Лайт', isEarlyBird: true },

	// Переход на Foreman Early Bird (2 месяца)
	{ planSlug: 'foreman', planName: 'Прораб', isEarlyBird: true },
	{ planSlug: 'foreman', planName: 'Прораб', isEarlyBird: true },

	// Ранний апгрейд на Brigade (через 15 дней)
	{ planSlug: 'brigade', planName: 'Бригада', isEarlyBird: true, shiftDays: 15 },

	// Brigade (2 месяца)
	{ planSlug: 'brigade', planName: 'Бригада', isEarlyBird: false },
	{ planSlug: 'brigade', planName: 'Бригада', isEarlyBird: false },

	// Назад на Foreman (1 месяц)
	{ planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false },

	// Ранний даунгрейд на Lite (через 7 дней)
	{ planSlug: 'lite', planName: 'Лайт', isEarlyBird: false, shiftDays: 7 },

	// Снова Foreman (2 месяца, последний платёж — 04.01.2026)
	{ planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false },
	{ planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false },
]

// === Anchor date: "today" is fixed for demo ===
// ВАЖНО: используем ISO с UTC offset, чтобы не было сюрпризов на серверах.
const TODAY = new Date('2026-01-04T12:00:00+03:00')

// Helpers
function atNoonKeepTz(d: Date): Date {
	// Мы якорим TODAY уже с временем 12:00 и offset.
	// Тут просто нормализуем “на 12:00” в локальном представлении Date.
	const x = new Date(d)
	x.setHours(12, 0, 0, 0)
	return x
}

function addDays(d: Date, days: number): Date {
	const x = new Date(d)
	x.setDate(x.getDate() + days)
	return x
}

function planSlugToPriceKey(slug: PlanSlug): keyof typeof PLAN_PRICES {
	return slug.toUpperCase() as keyof typeof PLAN_PRICES
}

async function seedDemoPaymentHistory() {
	console.log('🌱 Starting demo payment history seed...\n')

	try {
		// Find demo user
		const demoUser = await prisma.user.findUnique({
			where: { email: 'demo@prorab.app' },
			include: {
				ownedTeams: {
					include: {
						subscription: {
							include: {
								planRef: true,
							},
						},
					},
				},
			},
		})

		if (!demoUser) {
			console.error('❌ Demo user not found. Please run seed.ts first.')
			process.exit(1)
		}

		const team = demoUser.ownedTeams[0]
		if (!team) {
			console.error('❌ Demo user has no team. Please run seed.ts first.')
			process.exit(1)
		}

		let subscription = team.subscription
		if (!subscription) {
			console.error('❌ Demo user has no subscription. Please run seed.ts first.')
			process.exit(1)
		}

		// Get all plans
		const plans = await prisma.plan.findMany({
			include: {
				prices: {
					where: { currency: 'RUB' },
				},
			},
		})
		const planMap = new Map(plans.map(p => [p.slug, p]))

		console.log(`📋 Found demo user: ${demoUser.email}`)
		console.log(`📋 Team: ${team.name} (${team.id})`)
		console.log(`📋 Current subscription: ${subscription.planRef?.name || subscription.plan}\n`)

		// Delete existing payments for this subscription
		const existingPayments = await prisma.payment.count({
			where: { subscriptionId: subscription.id },
		})

		if (existingPayments > 0) {
			console.log(`🗑️  Deleting ${existingPayments} existing payments...`)
			await prisma.payment.deleteMany({
				where: { subscriptionId: subscription.id },
			})
			console.log(`✅ Deleted existing payments\n`)
		}

		console.log(`💳 Creating ${PAYMENT_HISTORY.length} payment history entries...\n`)

		/**
		 * Ключевое: последний платеж paidAt = TODAY (04.01.2026 12:00)
		 * Базовый старт считаем назад: (N-1)*30 дней.
		 * Ранние смены плана просто режут предыдущий период, но не ломают последовательность.
		 */
		const lastPaidAt = atNoonKeepTz(TODAY)
		let nextPeriodStart = addDays(lastPaidAt, -(PAYMENT_HISTORY.length - 1) * BILLING_CYCLE_DAYS)

		// Track previous payment for truncation on early plan change
		let prevPaymentId: string | null = null
		let prevPeriodStartAt: Date | null = null
		let prevPeriodEndAt: Date | null = null
		let prevPlanSlug: PlanSlug | null = null

		// Track last created payment to set subscription at the end
		let lastCreatedPayment: { id: string; planId: string; planSlug: PlanSlug; isEarlyBird: boolean } | null = null

		for (let i = 0; i < PAYMENT_HISTORY.length; i++) {
			const entry = PAYMENT_HISTORY[i]
			const plan = planMap.get(entry.planSlug)

			if (!plan) {
				console.error(`❌ Plan ${entry.planSlug} not found`)
				continue
			}

			const priceKey = planSlugToPriceKey(entry.planSlug)
			const priceData = PLAN_PRICES[priceKey]
			const amount = entry.isEarlyBird ? priceData.earlyBird : priceData.regular

			const isFirst = i === 0
			const isPlanChange = isFirst ? true : prevPlanSlug !== entry.planSlug
			const isRenewal = !isFirst && prevPlanSlug === entry.planSlug

			let paidAt: Date
			let periodStartAt: Date
			let periodEndAt: Date

			if (isFirst) {
				paidAt = atNoonKeepTz(nextPeriodStart)
				periodStartAt = new Date(paidAt)
				periodEndAt = addDays(periodStartAt, BILLING_CYCLE_DAYS)
			} else if (isRenewal) {
				if (!prevPeriodEndAt) throw new Error('prevPeriodEndAt is null on renewal')

				paidAt = atNoonKeepTz(prevPeriodEndAt)
				periodStartAt = new Date(paidAt)
				periodEndAt = addDays(periodStartAt, BILLING_CYCLE_DAYS)
			} else {
				if (!prevPeriodStartAt || !prevPeriodEndAt || !prevPaymentId) {
					throw new Error('Previous payment refs are null on plan change')
				}

				const shift = entry.shiftDays
				if (typeof shift === 'number' && shift > 0 && shift < BILLING_CYCLE_DAYS) {
					// early change inside previous period
					paidAt = atNoonKeepTz(addDays(prevPeriodStartAt, shift))

					if (paidAt < prevPeriodEndAt) {
						await prisma.payment.update({
							where: { id: prevPaymentId },
							data: { periodEndAt: new Date(paidAt) },
						})
						// update local refs
						prevPeriodEndAt = new Date(paidAt)
					}
				} else {
					// boundary change at prev end
					paidAt = atNoonKeepTz(prevPeriodEndAt)
				}

				periodStartAt = new Date(paidAt)
				periodEndAt = addDays(periodStartAt, BILLING_CYCLE_DAYS)
			}

			// Force the VERY LAST payment to match the anchor date exactly
			if (i === PAYMENT_HISTORY.length - 1) {
				paidAt = new Date(lastPaidAt)
				periodStartAt = new Date(paidAt)
				periodEndAt = addDays(periodStartAt, BILLING_CYCLE_DAYS)
			}

			const payment = await prisma.payment.create({
				data: {
					subscriptionId: subscription.id,
					teamId: team.id,
					amount,
					currency: 'RUB',
					status: PaymentStatus.SUCCEEDED,
					providerType: PaymentProviderType.YOOKASSA,
					providerPaymentId: `demo-payment-${i + 1}-${Date.now()}`,
					description: `Подписка '${entry.planName}' за месяц | TARGET_PLAN:${plan.id}|${entry.planSlug.toUpperCase()}|${entry.isEarlyBird}`,
					paidAt,
					periodStartAt,
					periodEndAt,
				},
			})

			const action = isRenewal ? '🔄 Renewal' : '🔄 Plan change'
			const earlyBirdBadge = entry.isEarlyBird ? '⭐ Early Bird' : ''
			console.log(`   ${i + 1}. ${action}: ${entry.planName} - ${amount}₽ ${earlyBirdBadge}`)
			console.log(`      PaidAt:  ${paidAt.toLocaleDateString('ru-RU')} ${paidAt.toLocaleTimeString('ru-RU')}`)
			console.log(
				`      Period: ${periodStartAt.toLocaleDateString('ru-RU')} - ${periodEndAt.toLocaleDateString('ru-RU')}`,
			)

			// advance pointer
			nextPeriodStart = new Date(periodEndAt)

			// store prev refs
			prevPaymentId = payment.id
			prevPeriodStartAt = new Date(periodStartAt)
			prevPeriodEndAt = new Date(periodEndAt)
			prevPlanSlug = entry.planSlug

			lastCreatedPayment = {
				id: payment.id,
				planId: plan.id,
				planSlug: entry.planSlug,
				isEarlyBird: entry.isEarlyBird,
			}
		}

		// Update subscription to the latest payment period only
		if (lastCreatedPayment) {
			const lastPayment = await prisma.payment.findUnique({ where: { id: lastCreatedPayment.id } })
			if (lastPayment) {
				subscription = await prisma.subscription.update({
					where: { id: subscription.id },
					data: {
						planId: lastCreatedPayment.planId,
						plan: lastCreatedPayment.planSlug.toUpperCase() as any,
						isEarlyBird: lastCreatedPayment.isEarlyBird,
						currentPeriodStart: lastPayment.periodStartAt,
						currentPeriodEnd: lastPayment.periodEndAt,
						status: SubscriptionStatus.ACTIVE,
						trialEndsAt: null,
					},
				})
			}
		}

		const lastEntry = PAYMENT_HISTORY[PAYMENT_HISTORY.length - 1]
		console.log(`\n✅ Created ${PAYMENT_HISTORY.length} payments`)
		console.log(`✅ Updated subscription to current plan: ${lastEntry.planName}`)
		console.log(`✅ Payment history seeded successfully! (Anchor date: 04.01.2026)`)
	} catch (error) {
		console.error('❌ Error:', error)
		throw error
	} finally {
		await prisma.$disconnect()
		await pool.end()
	}
}

seedDemoPaymentHistory()
	.then(() => {
		console.log('\n✨ Demo payment history seed completed!')
		process.exit(0)
	})
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
