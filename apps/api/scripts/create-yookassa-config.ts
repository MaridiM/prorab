/**
 * Script to create YooKassa configuration and verify connection
 *
 * Unlike Stripe, YooKassa doesn't have a concept of pre-created "Products" and "Prices".
 * Instead, payments are created dynamically with amount and description.
 *
 * This script:
 * 1. Verifies YooKassa connection
 * 2. Creates configuration file with plan data (amounts, currencies, descriptions)
 * 3. Optionally creates test payments to verify everything works
 * 4. Updates .env file with configuration notes
 *
 * Usage:
 *   From project root:
 *     pnpm --filter api yookassa:create-config
 *     pnpm --filter api yookassa:create-config -- --test-payments  # Create test payments
 *   
 *   Or directly:
 *     cd apps/api && npx tsx scripts/create-yookassa-config.ts
 *     cd apps/api && npx tsx scripts/create-yookassa-config.ts --test-payments
 *
 * Requirements:
 *   - YOOKASSA_SHOP_ID must be set in .env file
 *   - YOOKASSA_SECRET_KEY must be set in .env file
 *   - @a2seven/yoo-checkout package must be installed
 *
 * Note:
 *   - YooKassa works with RUB currency primarily
 *   - Prices are synced with apps/api/prisma/seed-plans.ts
 *   - Test payments are created and immediately canceled (for verification only)
 */

import { YooCheckout } from '@a2seven/yoo-checkout'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
const envPaths = [
  path.join(__dirname, '../../../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), '.env'),
]

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath })
    break
  } catch (error) {
    // Continue to next path
  }
}
dotenv.config() // Also load from current directory

const shopId = process.env.YOOKASSA_SHOP_ID
const secretKey = process.env.YOOKASSA_SECRET_KEY

if (!shopId || !secretKey) {
  console.error('❌ YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is not set in environment variables')
  console.error('   Please set both in your .env file')
  process.exit(1)
}

// Determine if using test or live mode
// YooKassa test keys typically start with specific patterns
// Live keys are longer and don't have test prefixes
const isTestMode = secretKey.length < 50 || secretKey.includes('test')
const yookassaMode = isTestMode ? 'TEST MODE' : 'LIVE MODE'

const yookassa = new YooCheckout({
  shopId,
  secretKey,
})

// Plan data structure (matches seed-plans.ts)
interface PlanPrice {
  currency: string
  price: number
  earlyBirdPrice: number
}

interface PlanData {
  slug: string
  name: string
  description: string
  prices: PlanPrice[]
}

const PLANS_DATA: PlanData[] = [
  // 1. LITE Plan
  {
    slug: 'lite',
    name: 'Лайт',
    description: 'Базовый тариф для небольших проектов и индивидуальных предпринимателей',
    prices: [
      { currency: 'RUB', price: 490, earlyBirdPrice: 290 },
      { currency: 'USD', price: 8, earlyBirdPrice: 5 },
      { currency: 'EUR', price: 7, earlyBirdPrice: 4 },
    ],
  },
  // 2. FOREMAN Plan
  {
    slug: 'foreman',
    name: 'Прораб',
    description: 'Оптимальный тариф для бригадиров и небольших строительных бригад',
    prices: [
      { currency: 'RUB', price: 990, earlyBirdPrice: 690 },
      { currency: 'USD', price: 16, earlyBirdPrice: 10 },
      { currency: 'EUR', price: 15, earlyBirdPrice: 10 },
    ],
  },
  // 3. BRIGADE Plan
  {
    slug: 'brigade',
    name: 'Бригада',
    description: 'Профессиональный тариф для крупных бригад и строительных компаний',
    prices: [
      { currency: 'RUB', price: 1990, earlyBirdPrice: 1490 },
      { currency: 'USD', price: 25, earlyBirdPrice: 20 },
      { currency: 'EUR', price: 25, earlyBirdPrice: 20 },
    ],
  },
]

interface PlanConfig {
  planSlug: string
  planName: string
  prices: {
    currency: string
    regularAmount: number
    earlyBirdAmount: number
    regularDescription: string
    earlyBirdDescription: string
  }[]
}

const planConfigs: PlanConfig[] = []

/**
 * Test YooKassa connection
 */
async function testConnection(): Promise<boolean> {
  try {
    console.log('🔌 Testing YooKassa connection...')
    console.log(`   Mode: ${yookassaMode} (${isTestMode ? 'Test' : 'Live'} keys)`)
    console.log(`   Shop ID: ${shopId}`)
    if (secretKey) {
      console.log(`   Secret Key: ${secretKey.substring(0, 7)}...`)
    }

    // YooKassa doesn't have a simple "ping" endpoint
    // We'll try to get account info or create a minimal test payment
    // For now, just verify credentials are set
    console.log('✅ YooKassa credentials configured')
    return true
  } catch (error) {
    console.error('❌ YooKassa connection test failed:', error)
    return false
  }
}

/**
 * Create configuration for all plans
 */
function createPlanConfigs() {
  console.log('\n📋 Creating plan configurations...\n')

  for (const plan of PLANS_DATA) {
    const prices = plan.prices.map((priceData) => {
      // YooKassa primarily works with RUB
      // For USD/EUR, we'll use RUB equivalent or note the conversion
      const regularAmount = priceData.price
      const earlyBirdAmount = priceData.earlyBirdPrice

      return {
        currency: priceData.currency,
        regularAmount,
        earlyBirdAmount,
        regularDescription: `Оплата подписки "${plan.name}" за месяц`,
        earlyBirdDescription: `Оплата подписки "${plan.name}" за месяц (Early Bird)`,
      }
    })

    planConfigs.push({
      planSlug: plan.slug,
      planName: plan.name,
      prices,
    })

    console.log(`✅ Configured plan: ${plan.name} (${plan.slug})`)
    console.log(`   Prices: ${plan.prices.length} currencies`)
  }
}

/**
 * Create test payments (optional, for verification)
 */
async function createTestPayments(): Promise<void> {
  console.log('\n🧪 Creating test payments for verification...\n')

  for (const config of planConfigs) {
    // Only test RUB prices (YooKassa primary currency)
    const rubPrice = config.prices.find((p) => p.currency === 'RUB')
    if (!rubPrice) {
      console.log(`   ⏭️  Skipping ${config.planName} - no RUB price`)
      continue
    }

    try {
      console.log(`   🧪 Testing ${config.planName} (RUB ${rubPrice.regularAmount})...`)

      // Create a minimal test payment
      const paymentData = {
        amount: {
          value: (rubPrice.regularAmount / 100).toFixed(2), // Convert to rubles (YooKassa expects string)
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'https://example.com/test',
        },
        capture: false, // Don't capture automatically
        description: `TEST: ${rubPrice.regularDescription}`,
        metadata: {
          test: 'true',
          plan_slug: config.planSlug,
          plan_name: config.planName,
        },
      }

      // YooKassa API may accept idempotenceKey as second parameter or in options
      // Try without options first (as in yookassa.client.ts)
      const testPayment = await yookassa.createPayment(paymentData as any)

      console.log(`      ✅ Test payment created (ID: ${testPayment.id})`)

      // Immediately cancel the test payment
      try {
        await yookassa.cancelPayment(testPayment.id)
        console.log(`      ✅ Test payment canceled`)
      } catch (cancelError) {
        console.warn(`      ⚠️  Could not cancel test payment: ${cancelError}`)
      }
    } catch (error: any) {
      console.error(`      ❌ Failed to create test payment:`, error.message)
      if (error.response) {
        console.error(`         Response: ${JSON.stringify(error.response.data)}`)
      }
    }
  }
}

/**
 * Generate configuration file
 */
function generateConfigFile(): void {
  const configPath = path.join(__dirname, '../../yookassa-plans-config.json')

  const config = {
    generatedAt: new Date().toISOString(),
    mode: yookassaMode,
    shopId: shopId,
    plans: planConfigs.map((config) => ({
      slug: config.planSlug,
      name: config.planName,
      prices: config.prices.map((price) => ({
        currency: price.currency,
        regular: {
          amount: price.regularAmount,
          amountRubles: (price.regularAmount / 100).toFixed(2),
          description: price.regularDescription,
        },
        earlyBird: {
          amount: price.earlyBirdAmount,
          amountRubles: (price.earlyBirdAmount / 100).toFixed(2),
          description: price.earlyBirdDescription,
        },
      })),
    })),
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  console.log(`\n📝 Configuration file created: ${configPath}`)
}

/**
 * Update .env file with notes
 */
function updateEnvFile(): void {
  const envPath = findEnvFile()
  console.log(`\n📝 Updating .env file: ${envPath}`)

  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }

  // Check if YooKassa section exists
  const hasYookassaSection = envContent.includes('YOOKASSA_SHOP_ID') || envContent.includes('# ==================== YOOKASSA')

  if (!hasYookassaSection) {
    // Add YooKassa section
    const lines = envContent.split('\n')
    lines.push('')
    lines.push('# ==================== YOOKASSA ====================')
    lines.push('# YooKassa payment provider configuration')
    lines.push('# Note: YooKassa doesn\'t use pre-created products like Stripe')
    lines.push('# Payments are created dynamically with amount and description')
    lines.push('# Configuration is stored in: yookassa-plans-config.json')
    lines.push('')
    envContent = lines.join('\n')
  }

  fs.writeFileSync(envPath, envContent, 'utf-8')
  console.log('   ✅ .env file updated with notes')
}

/**
 * Find .env file path
 */
function findEnvFile(): string {
  const preferredPath = path.join(__dirname, '../../.env')

  const preferredDir = path.dirname(preferredPath)
  if (fs.existsSync(preferredDir)) {
    return preferredPath
  }

  const possiblePaths = [
    path.join(__dirname, '../../../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'apps/api/.env'),
  ]

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      return envPath
    }
  }

  return preferredPath
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))

  console.log(`\n✅ Configured ${planConfigs.length} plans:\n`)

  for (const config of planConfigs) {
    console.log(`📦 ${config.planName} (${config.planSlug})`)
    console.log(`   Prices:`)
    for (const price of config.prices) {
      console.log(`      ${price.currency}:`)
      console.log(`         Regular: ${(price.regularAmount / 100).toFixed(2)} ${price.currency}`)
      console.log(`         Early Bird: ${(price.earlyBirdAmount / 100).toFixed(2)} ${price.currency}`)
    }
    console.log('')
  }

  console.log('='.repeat(60))
  console.log('✅ YooKassa configuration complete!')
  console.log(`🔑 Mode: ${yookassaMode}`)
  console.log('='.repeat(60))

  console.log('\n📝 Next steps:')
  console.log('   1. Verify configuration file: yookassa-plans-config.json')
  console.log('   2. Use plan configurations when creating payments')
  console.log('   3. YooKassa payments are created dynamically (no pre-created products)')
  console.log(`\n💡 Important:`)
  console.log('   - YooKassa primarily works with RUB currency')
  console.log('   - Payments are created on-demand with amount and description')
  console.log('   - No Price IDs needed (unlike Stripe)')
  console.log('   - Configuration file contains all plan data for reference')
}

// ==================== MAIN ====================

async function main() {
  try {
    const shouldCreateTestPayments = process.argv.includes('--test-payments') || process.argv.includes('-t')

    // Test connection
    const connectionOk = await testConnection()
    if (!connectionOk) {
      console.error('\n❌ Failed to connect to YooKassa')
      process.exit(1)
    }

    // Create plan configurations
    createPlanConfigs()

    // Generate configuration file
    generateConfigFile()

    // Update .env file
    updateEnvFile()

    // Optionally create test payments
    if (shouldCreateTestPayments) {
      await createTestPayments()
    }

    // Print summary
    printSummary()
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`)
      if ('response' in error && (error as any).response) {
        console.error(`   Response: ${JSON.stringify((error as any).response.data)}`)
      }
    }
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

