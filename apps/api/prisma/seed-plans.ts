/**
 * Seed file for Subscription Plans and Payment Providers (Stage 15)
 *
 * This script:
 * 1. Creates 3 default subscription plans (Lite, Foreman, Brigade)
 * 2. Creates multi-currency prices for each plan (RUB, USD, EUR)
 * 3. Creates features for each plan
 * 4. Creates payment provider records (Yookassa, Stripe)
 *
 * Usage:
 *   npx tsx --env-file=.env prisma/seed-plans.ts
 */

import { PrismaClient, PaymentProviderType } from './generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

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

// ==================== PLAN DATA ====================

interface PlanData {
  slug: string
  name: string
  description: string
  maxActiveProjects: number | null
  maxMembers: number
  storageGB: number
  isPopular: boolean
  sortOrder: number
  prices: {
    currency: string
    price: number
    earlyBirdPrice: number
  }[]
  features: {
    name: string
    description?: string
    sortOrder: number
  }[]
}

const PLANS_DATA: PlanData[] = [
  // 1. LITE Plan
  {
    slug: 'lite',
    name: 'Лайт',
    description: 'Базовый тариф для небольших проектов и индивидуальных предпринимателей',
    maxActiveProjects: 1,
    maxMembers: 1,
    storageGB: 0.5, // 500 MB
    isPopular: false,
    sortOrder: 1,
    prices: [
      { currency: 'RUB', price: 490, earlyBirdPrice: 290 },
      { currency: 'USD', price: 7, earlyBirdPrice: 4 },
      { currency: 'EUR', price: 7, earlyBirdPrice: 4 },
    ],
    features: [
      { name: 'Базовый функционал', description: 'Управление проектами и задачами', sortOrder: 1 },
      { name: 'Email поддержка', description: 'Ответ в течение 24 часов', sortOrder: 2 },
      { name: '1 активный проект', sortOrder: 3 },
      { name: '1 участник команды', sortOrder: 4 },
      { name: '500 МБ хранилища', sortOrder: 5 },
    ],
  },

  // 2. FOREMAN Plan (Most Popular)
  {
    slug: 'foreman',
    name: 'Прораб',
    description: 'Оптимальный тариф для бригадиров и небольших строительных бригад',
    maxActiveProjects: 4,
    maxMembers: 3,
    storageGB: 2,
    isPopular: true, // Most Popular
    sortOrder: 2,
    prices: [
      { currency: 'RUB', price: 990, earlyBirdPrice: 690 },
      { currency: 'USD', price: 15, earlyBirdPrice: 10 },
      { currency: 'EUR', price: 15, earlyBirdPrice: 10 },
    ],
    features: [
      { name: 'Расчёты зарплаты', description: 'Автоматический расчёт выплат', sortOrder: 1 },
      { name: 'Фотоотчёты', description: 'Публичные фотоотчёты для клиентов', sortOrder: 2 },
      { name: 'Приоритетная поддержка', description: 'Ответ в течение 8 часов', sortOrder: 3 },
      { name: 'До 4 активных проектов', sortOrder: 4 },
      { name: 'До 3 участников команды', sortOrder: 5 },
      { name: '2 ГБ хранилища', sortOrder: 6 },
      { name: 'Учёт рабочего времени', sortOrder: 7 },
      { name: 'Аналитика по проектам', sortOrder: 8 },
    ],
  },

  // 3. BRIGADE Plan
  {
    slug: 'brigade',
    name: 'Бригада',
    description: 'Профессиональный тариф для крупных бригад и строительных компаний',
    maxActiveProjects: null, // Unlimited
    maxMembers: 10,
    storageGB: 10,
    isPopular: false,
    sortOrder: 3,
    prices: [
      { currency: 'RUB', price: 1990, earlyBirdPrice: 1490 },
      { currency: 'USD', price: 25, earlyBirdPrice: 20 },
      { currency: 'EUR', price: 25, earlyBirdPrice: 20 },
    ],
    features: [
      { name: 'Неограниченное количество проектов', sortOrder: 1 },
      { name: 'API доступ', description: 'Интеграция с вашими системами', sortOrder: 2 },
      { name: 'Выделенная поддержка', description: 'Персональный менеджер', sortOrder: 3 },
      { name: 'До 10 участников команды', sortOrder: 4 },
      { name: '10 ГБ хранилища', sortOrder: 5 },
      { name: 'Расширенная аналитика', description: 'Детальные отчёты и графики', sortOrder: 6 },
      { name: 'Приоритетные обновления', sortOrder: 7 },
      { name: 'История изменений', sortOrder: 8 },
    ],
  },
]

// ==================== PAYMENT PROVIDERS DATA ====================

interface ProviderData {
  type: PaymentProviderType
  name: string
  isActive: boolean
  isPrimary: boolean
}

const PROVIDERS_DATA: ProviderData[] = [
  {
    type: PaymentProviderType.YOOKASSA,
    name: 'Yookassa',
    isActive: true, // Active by default (already integrated)
    isPrimary: true, // Primary provider
  },
  {
    type: PaymentProviderType.STRIPE,
    name: 'Stripe',
    isActive: false, // Inactive until configured
    isPrimary: false,
  },
]

// ==================== SEED FUNCTIONS ====================

async function seedPlans() {
  console.log('🌱 Seeding subscription plans...')

  for (const planData of PLANS_DATA) {
    // Check if plan already exists
    const existing = await prisma.plan.findUnique({
      where: { slug: planData.slug },
    })

    if (existing) {
      console.log(`   ⏭️  Plan "${planData.name}" already exists, skipping...`)
      continue
    }

    // Create plan with prices and features
    const plan = await prisma.plan.create({
      data: {
        slug: planData.slug,
        name: planData.name,
        description: planData.description,
        maxActiveProjects: planData.maxActiveProjects,
        maxMembers: planData.maxMembers,
        storageGB: planData.storageGB,
        isPopular: planData.isPopular,
        sortOrder: planData.sortOrder,
        isActive: true,
        isEarlyBird: true, // Enable early bird pricing by default
        prices: {
          create: planData.prices.map(price => ({
            currency: price.currency,
            price: price.price,
            earlyBirdPrice: price.earlyBirdPrice,
            billingCycleDays: 30, // Monthly billing
          })),
        },
        features: {
          create: planData.features.map(feature => ({
            name: feature.name,
            description: feature.description,
            isIncluded: true,
            sortOrder: feature.sortOrder,
          })),
        },
      },
      include: {
        prices: true,
        features: true,
      },
    })

    console.log(`   ✅ Created plan "${plan.name}"`)
    console.log(`      - ${plan.prices.length} prices (${plan.prices.map(p => p.currency).join(', ')})`)
    console.log(`      - ${plan.features.length} features`)
  }
}

async function seedPaymentProviders() {
  console.log('\n💳 Seeding payment providers...')

  for (const providerData of PROVIDERS_DATA) {
    // Check if provider already exists
    const existing = await prisma.paymentProvider.findUnique({
      where: { type: providerData.type },
    })

    if (existing) {
      console.log(`   ⏭️  Provider "${providerData.name}" already exists, skipping...`)
      continue
    }

    // Create provider
    const provider = await prisma.paymentProvider.create({
      data: {
        type: providerData.type,
        name: providerData.name,
        isActive: providerData.isActive,
        isPrimary: providerData.isPrimary,
      },
    })

    const status = provider.isActive ? '🟢 Active' : '🔴 Inactive'
    const primary = provider.isPrimary ? '⭐ Primary' : ''
    console.log(`   ✅ Created provider "${provider.name}" - ${status} ${primary}`)
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))

  // Plans summary
  const plans = await prisma.plan.findMany({
    include: {
      prices: true,
      features: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  console.log(`\n📦 Subscription Plans: ${plans.length}`)
  for (const plan of plans) {
    const rubPrice = plan.prices.find(p => p.currency === 'RUB')
    const price = rubPrice ? `${rubPrice.price}₽` : 'N/A'
    const popular = plan.isPopular ? '⭐ Popular' : ''
    console.log(`   ${plan.sortOrder}. ${plan.name} (${plan.slug}) - ${price} ${popular}`)
    console.log(`      Limits: ${plan.maxActiveProjects || '∞'} projects, ${plan.maxMembers} members, ${plan.storageGB} GB`)
    console.log(`      Features: ${plan.features.length}`)
  }

  // Providers summary
  const providers = await prisma.paymentProvider.findMany()
  console.log(`\n💳 Payment Providers: ${providers.length}`)
  for (const provider of providers) {
    const status = provider.isActive ? '🟢 Active' : '🔴 Inactive'
    const primary = provider.isPrimary ? '⭐ Primary' : ''
    console.log(`   - ${provider.name}: ${status} ${primary}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Seeding complete!')
  console.log('='.repeat(60))

  console.log('\n📝 Next steps:')
  console.log('   1. Configure payment providers in SystemSettings:')
  console.log('      - payment.yookassa.shop_id')
  console.log('      - payment.yookassa.secret_key (encrypted)')
  console.log('      - payment.stripe.secret_key (encrypted)')
  console.log('   2. Test admin panel: http://localhost:3000/admin/plans')
  console.log('   3. Test pricing page: http://localhost:3000/pricing')
}

// ==================== MAIN ====================

async function main() {
  console.log('🚀 Starting Stage 15 seed...\n')

  try {
    await seedPlans()
    await seedPaymentProviders()
    await printSummary()
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    throw error
  } finally {
    await pool.end()
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
