/**
 * Script to create Stripe Products and Prices from seed-plans.ts
 *
 * This script:
 * 1. Reads plan data from seed-plans.ts structure
 * 2. Creates Products in Stripe for each plan
 * 3. Creates Prices for each product in different currencies (RUB, USD, EUR)
 * 4. Creates both regular and Early Bird prices
 *
 * Usage:
 *   From project root:
 *     pnpm --filter api stripe:create-products
 *   
 *   Or directly:
 *     cd apps/api && npx tsx scripts/create-stripe-products.ts
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY must be set in .env file (root or apps/api)
 *   - Stripe API key must have permissions to create products and prices
 *   - stripe package must be installed (in root or apps/api)
 */

import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
// Try multiple paths to find .env file
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

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY is not set in environment variables')
  console.error('   Please set STRIPE_SECRET_KEY in your .env file')
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
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

// Currency mapping: our currency codes to Stripe currency codes
const STRIPE_CURRENCY_MAP: Record<string, string> = {
  RUB: 'rub',
  USD: 'usd',
  EUR: 'eur',
}

interface CreatedProduct {
  planSlug: string
  productId: string
  prices: {
    currency: string
    regularPriceId: string
    earlyBirdPriceId: string | null
  }[]
}

const createdProducts: CreatedProduct[] = []

/**
 * Create a Stripe Product for a plan
 */
async function createStripeProduct(plan: PlanData): Promise<Stripe.Product> {
  // Check if product already exists
  const existingProducts = await stripe.products.list({
    limit: 100,
  })

  const existingProduct = existingProducts.data.find(
    (p) => p.metadata?.plan_slug === plan.slug,
  )

  if (existingProduct) {
    console.log(`   ⏭️  Product "${plan.name}" already exists (ID: ${existingProduct.id})`)
    return existingProduct
  }

  // Create new product
  const product = await stripe.products.create({
    name: `${plan.name} - Подписка`,
    description: plan.description,
    metadata: {
      plan_slug: plan.slug,
      plan_name: plan.name,
    },
  })

  console.log(`   ✅ Created product "${plan.name}" (ID: ${product.id})`)
  return product
}

/**
 * Create Stripe Prices for a product
 */
async function createStripePrices(
  product: Stripe.Product,
  plan: PlanData,
): Promise<{ currency: string; regularPriceId: string; earlyBirdPriceId: string | null }[]> {
  const prices: { currency: string; regularPriceId: string; earlyBirdPriceId: string | null }[] = []

  // Check existing prices
  const existingPrices = await stripe.prices.list({
    product: product.id,
    limit: 100,
  })

  for (const priceData of plan.prices) {
    const stripeCurrency = STRIPE_CURRENCY_MAP[priceData.currency]
    if (!stripeCurrency) {
      console.warn(`   ⚠️  Unknown currency: ${priceData.currency}, skipping...`)
      continue
    }

    // Convert price to cents (smallest currency unit)
    // Note: RUB, USD, EUR all use 2 decimal places
    const regularAmount = Math.round(priceData.price * 100)
    const earlyBirdAmount = Math.round(priceData.earlyBirdPrice * 100)

    // Check if regular price already exists
    let regularPrice = existingPrices.data.find(
      (p) =>
        p.currency === stripeCurrency &&
        p.unit_amount === regularAmount &&
        p.metadata?.price_type === 'regular',
    )

    if (!regularPrice) {
      // Create regular price
      regularPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: regularAmount,
        currency: stripeCurrency,
        recurring: {
          interval: 'month',
        },
        metadata: {
          plan_slug: plan.slug,
          price_type: 'regular',
          currency: priceData.currency,
        },
      })
      console.log(
        `      ✅ Created regular price: ${priceData.currency} ${priceData.price} (ID: ${regularPrice.id})`,
      )
    } else {
      console.log(
        `      ⏭️  Regular price ${priceData.currency} ${priceData.price} already exists (ID: ${regularPrice.id})`,
      )
    }

    // Check if Early Bird price already exists
    let earlyBirdPrice: Stripe.Price | null = existingPrices.data.find(
      (p) =>
        p.currency === stripeCurrency &&
        p.unit_amount === earlyBirdAmount &&
        p.metadata?.price_type === 'early_bird',
    ) || null

    if (!earlyBirdPrice) {
      // Create Early Bird price
      earlyBirdPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: earlyBirdAmount,
        currency: stripeCurrency,
        recurring: {
          interval: 'month',
        },
        metadata: {
          plan_slug: plan.slug,
          price_type: 'early_bird',
          currency: priceData.currency,
        },
      })
      console.log(
        `      ✅ Created Early Bird price: ${priceData.currency} ${priceData.earlyBirdPrice} (ID: ${earlyBirdPrice.id})`,
      )
    } else {
      console.log(
        `      ⏭️  Early Bird price ${priceData.currency} ${priceData.earlyBirdPrice} already exists (ID: ${earlyBirdPrice.id})`,
      )
    }

    prices.push({
      currency: priceData.currency,
      regularPriceId: regularPrice.id,
      earlyBirdPriceId: earlyBirdPrice?.id || null,
    })
  }

  return prices
}

/**
 * Main function to create all products and prices
 */
async function createStripeProducts() {
  console.log('🚀 Starting Stripe products creation...\n')
  console.log(`📋 Plans to process: ${PLANS_DATA.length}\n`)

  for (const plan of PLANS_DATA) {
    console.log(`\n📦 Processing plan: ${plan.name} (${plan.slug})`)
    console.log('─'.repeat(60))

    try {
      // Create product
      const product = await createStripeProduct(plan)

      // Create prices
      const prices = await createStripePrices(product, plan)

      createdProducts.push({
        planSlug: plan.slug,
        productId: product.id,
        prices,
      })
    } catch (error) {
      console.error(`   ❌ Failed to create product for "${plan.name}":`, error)
      if (error instanceof Stripe.errors.StripeError) {
        console.error(`      Error: ${error.message}`)
      }
    }
  }
}

/**
 * Print summary of created products
 */
async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))

  console.log(`\n✅ Created/Updated ${createdProducts.length} products:\n`)

  for (const created of createdProducts) {
    const plan = PLANS_DATA.find((p) => p.slug === created.planSlug)
    console.log(`📦 ${plan?.name || created.planSlug}`)
    console.log(`   Product ID: ${created.productId}`)
    console.log(`   Prices:`)
    for (const price of created.prices) {
      console.log(`      ${price.currency}:`)
      console.log(`         Regular: ${price.regularPriceId}`)
      if (price.earlyBirdPriceId) {
        console.log(`         Early Bird: ${price.earlyBirdPriceId}`)
      }
    }
    console.log('')
  }

  console.log('='.repeat(60))
  console.log('✅ Stripe products creation complete!')
  console.log('='.repeat(60))

  console.log('\n📝 Next steps:')
  console.log('   1. Verify products in Stripe Dashboard: https://dashboard.stripe.com/products')
  console.log('   2. Update your database with Stripe Product IDs if needed')
  console.log('   3. Test checkout flow with created products')
}

// ==================== MAIN ====================

async function main() {
  try {
    // Verify Stripe connection
    console.log('🔌 Testing Stripe connection...')
    await stripe.products.list({ limit: 1 })
    console.log('✅ Stripe connection successful\n')

    // Create products and prices
    await createStripeProducts()

    // Print summary
    await printSummary()
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`   Stripe Error: ${error.message}`)
      console.error(`   Type: ${error.type}`)
    }
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

