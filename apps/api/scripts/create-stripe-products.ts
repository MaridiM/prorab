/**
 * Script to create Stripe Products and Prices from seed-plans.ts
 *
 * This script:
 * 1. Reads plan data from seed-plans.ts structure
 * 2. Creates Products in Stripe for each plan (ProRab LITE, ProRab FOREMAN, ProRab BRIGADE)
 * 3. Creates Prices for each product in different currencies (RUB, USD, EUR)
 * 4. Creates both regular and Early Bird prices
 * 5. Automatically updates apps/api/.env file with all Price IDs
 *
 * Usage:
 *   From project root:
 *     pnpm --filter api stripe:create-products
 *     pnpm --filter api stripe:create-products -- --force  # Force recreate products
 *   
 *   Or directly:
 *     cd apps/api && npx tsx scripts/create-stripe-products.ts
 *     cd apps/api && npx tsx scripts/create-stripe-products.ts --force
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY must be set in .env file (root or apps/api)
 *   - Stripe API key must have permissions to create products and prices
 *   - stripe package must be installed (in root or apps/api)
 *
 * Note:
 *   - Prices are synced with apps/api/prisma/seed-plans.ts
 *   - Product names follow format: "ProRab {PLAN_SLUG}"
 *   - Price IDs are automatically added to apps/api/.env in format:
 *     STRIPE_PRICE_{PLAN}_{CURRENCY}_{REGULAR|EARLYBIRD}=price_...
 */

import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

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

// Determine Stripe mode (test or live)
const isTestMode = stripeSecretKey.startsWith('sk_test_')
const stripeMode = isTestMode ? 'TEST MODE' : 'LIVE MODE'

// Export for use in other functions
const STRIPE_SECRET_KEY_FOR_LOGGING = stripeSecretKey

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
async function createStripeProduct(plan: PlanData, forceRecreate: boolean = false): Promise<Stripe.Product> {
  // Check if product already exists
  console.log(`   🔍 Checking for existing product "${plan.name}"...`)
  const existingProducts = await stripe.products.list({
    limit: 100,
  })

  const existingProduct = existingProducts.data.find(
    (p) => p.metadata?.plan_slug === plan.slug,
  )

  if (existingProduct && !forceRecreate) {
    console.log(`   ⏭️  Product "${plan.name}" already exists (ID: ${existingProduct.id})`)
    console.log(`      Name: ${existingProduct.name}`)
    console.log(`      Active: ${existingProduct.active}`)
    
    // If product exists but is inactive, activate it
    if (!existingProduct.active) {
      console.log(`      🔄 Activating inactive product...`)
      const updatedProduct = await stripe.products.update(existingProduct.id, {
        active: true,
      })
      console.log(`      ✅ Product activated`)
      return updatedProduct
    }
    
    return existingProduct
  }
  
  if (existingProduct && forceRecreate) {
    console.log(`   🔄 Force recreating product "${plan.name}"...`)
    // Archive old product instead of deleting (Stripe doesn't allow deletion)
    try {
      await stripe.products.update(existingProduct.id, {
        active: false,
      })
      console.log(`   📦 Archived old product (ID: ${existingProduct.id})`)
    } catch (error) {
      console.warn(`   ⚠️  Could not archive old product: ${error}`)
    }
  }

  // Create new product
  console.log(`   🆕 Creating new product "${plan.name}"...`)
  const product = await stripe.products.create({
    name: `ProRab ${plan.slug.toUpperCase()}`,
    description: plan.description,
    active: true, // Ensure product is active
    metadata: {
      plan_slug: plan.slug,
      plan_name: plan.name,
    },
  })

  console.log(`   ✅ Created product "${plan.name}" (ID: ${product.id})`)
  console.log(`      Name: ${product.name}`)
  console.log(`      Active: ${product.active}`)
  console.log(`      Created: ${new Date(product.created * 1000).toISOString()}`)
  
  // Verify product was created by fetching it
  const verifiedProduct = await stripe.products.retrieve(product.id)
  if (!verifiedProduct) {
    throw new Error(`Failed to verify product creation: ${product.id}`)
  }
  console.log(`   ✅ Product verified in Stripe`)
  
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

  // Check existing prices (get all pages if needed)
  const existingPrices: Stripe.Price[] = []
  let hasMore = true
  let startingAfter: string | undefined = undefined

  while (hasMore) {
    const pricesPage = await stripe.prices.list({
      product: product.id,
      limit: 100,
      starting_after: startingAfter,
    })
    existingPrices.push(...pricesPage.data)
    hasMore = pricesPage.has_more
    if (hasMore && pricesPage.data.length > 0) {
      startingAfter = pricesPage.data[pricesPage.data.length - 1].id
    } else {
      hasMore = false
    }
  }

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
    let regularPrice = existingPrices.find(
      (p) =>
        p.currency === stripeCurrency &&
        p.unit_amount === regularAmount &&
        p.metadata?.price_type === 'regular',
    )

    if (!regularPrice) {
      // Create regular price
      console.log(`      🆕 Creating regular price: ${priceData.currency} ${priceData.price}...`)
      regularPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: regularAmount,
        currency: stripeCurrency,
        recurring: {
          interval: 'month',
        },
        active: true, // Ensure price is active
        metadata: {
          plan_slug: plan.slug,
          price_type: 'regular',
          currency: priceData.currency,
        },
      })
      console.log(
        `      ✅ Created regular price: ${priceData.currency} ${priceData.price} (ID: ${regularPrice.id})`,
      )
      console.log(`         Active: ${regularPrice.active}, Type: ${regularPrice.type}`)
    } else {
      console.log(
        `      ⏭️  Regular price ${priceData.currency} ${priceData.price} already exists (ID: ${regularPrice.id})`,
      )
    }

    // Check if Early Bird price already exists
    let earlyBirdPrice: Stripe.Price | null = existingPrices.find(
      (p) =>
        p.currency === stripeCurrency &&
        p.unit_amount === earlyBirdAmount &&
        p.metadata?.price_type === 'early_bird',
    ) || null

    if (!earlyBirdPrice) {
      // Create Early Bird price
      console.log(`      🆕 Creating Early Bird price: ${priceData.currency} ${priceData.earlyBirdPrice}...`)
      earlyBirdPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: earlyBirdAmount,
        currency: stripeCurrency,
        recurring: {
          interval: 'month',
        },
        active: true, // Ensure price is active
        metadata: {
          plan_slug: plan.slug,
          price_type: 'early_bird',
          currency: priceData.currency,
        },
      })
      console.log(
        `      ✅ Created Early Bird price: ${priceData.currency} ${priceData.earlyBirdPrice} (ID: ${earlyBirdPrice.id})`,
      )
      console.log(`         Active: ${earlyBirdPrice.active}, Type: ${earlyBirdPrice.type}`)
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
async function createStripeProducts(forceRecreate: boolean = false) {
  console.log('🚀 Starting Stripe products creation...\n')
  if (forceRecreate) {
    console.log('⚠️  FORCE RECREATE mode: Will archive existing products and create new ones\n')
  }
  console.log(`📋 Plans to process: ${PLANS_DATA.length}\n`)

  for (const plan of PLANS_DATA) {
    console.log(`\n📦 Processing plan: ${plan.name} (${plan.slug})`)
    console.log('─'.repeat(60))

    try {
      // Create product
      const product = await createStripeProduct(plan, forceRecreate)

      // Create prices
      const prices = await createStripePrices(product, plan)

      createdProducts.push({
        planSlug: plan.slug,
        productId: product.id,
        prices,
      })
      
      console.log(`   ✅ Successfully processed plan "${plan.name}"`)
    } catch (error) {
      console.error(`   ❌ Failed to create product for "${plan.name}":`, error)
      if (error instanceof Stripe.errors.StripeError) {
        console.error(`      Stripe Error: ${error.message}`)
        console.error(`      Error Type: ${error.type}`)
        console.error(`      Error Code: ${error.code || 'N/A'}`)
      } else {
        console.error(`      Error: ${error}`)
      }
      throw error // Re-throw to stop execution
    }
  }
  
  console.log(`\n✅ Successfully processed ${createdProducts.length} plans`)
}

/**
 * Update .env file with Stripe Price IDs
 */
function updateEnvFile(envPath: string): void {
  console.log(`\n📝 Updating .env file: ${envPath}`)

  // Read existing .env file if it exists
  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }

  // Remove existing Stripe Price ID entries
  const lines = envContent.split('\n')
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim()
    // Keep lines that are not Stripe Price ID entries
    return !trimmed.startsWith('STRIPE_PRICE_') || trimmed.startsWith('#')
  })

  // Add Stripe configuration section if it doesn't exist
  let hasStripeSection = false
  let insertIndex = filteredLines.length

  for (let i = 0; i < filteredLines.length; i++) {
    if (filteredLines[i].includes('STRIPE_SECRET_KEY') || filteredLines[i].includes('STRIPE_WEBHOOK_SECRET')) {
      hasStripeSection = true
      // Find the end of Stripe section
      for (let j = i + 1; j < filteredLines.length; j++) {
        if (filteredLines[j].trim() && !filteredLines[j].trim().startsWith('#') && !filteredLines[j].includes('STRIPE_')) {
          insertIndex = j
          break
        }
      }
      break
    }
  }

  // Build new Stripe Price ID entries
  const priceIdEntries: string[] = []

  // Add section header if needed
  if (!hasStripeSection) {
    priceIdEntries.push('')
    priceIdEntries.push('# ==================== STRIPE PRICE IDs ====================')
    priceIdEntries.push('# Automatically generated by create-stripe-products.ts')
    priceIdEntries.push('# Used for creating Checkout Sessions')
    priceIdEntries.push('')
  } else {
    priceIdEntries.push('')
    priceIdEntries.push('# ==================== STRIPE PRICE IDs ====================')
    priceIdEntries.push('# Automatically generated by create-stripe-products.ts')
    priceIdEntries.push('')
  }

  // Add Price IDs for each plan
  for (const created of createdProducts) {
    const planSlugUpper = created.planSlug.toUpperCase()

    // Add comment for plan
    const plan = PLANS_DATA.find((p) => p.slug === created.planSlug)
    priceIdEntries.push(`# ${plan?.name || planSlugUpper} Plan`)

    // Add Price IDs for each currency
    for (const price of created.prices) {
      const currencyUpper = price.currency.toUpperCase()
      
      // Regular price
      priceIdEntries.push(`STRIPE_PRICE_${planSlugUpper}_${currencyUpper}_REGULAR=${price.regularPriceId}`)
      
      // Early Bird price
      if (price.earlyBirdPriceId) {
        priceIdEntries.push(`STRIPE_PRICE_${planSlugUpper}_${currencyUpper}_EARLYBIRD=${price.earlyBirdPriceId}`)
      }
    }
    priceIdEntries.push('')
  }

  // Insert Price IDs into the file
  filteredLines.splice(insertIndex, 0, ...priceIdEntries)

  // Write updated content
  const updatedContent = filteredLines.join('\n')
  fs.writeFileSync(envPath, updatedContent, 'utf-8')

  console.log(`   ✅ Updated .env file with ${createdProducts.length * 3 * 2} Price IDs`)
}

/**
 * Find .env file path (prefer apps/api/.env)
 */
function findEnvFile(): string {
  // Prefer apps/api/.env
  const preferredPath = path.join(__dirname, '../../.env')
  
  // Check if preferred path exists or if we can create it
  const preferredDir = path.dirname(preferredPath)
  if (fs.existsSync(preferredDir)) {
    return preferredPath
  }

  // Fallback to other possible paths
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

  // If .env doesn't exist, use preferred path (will be created)
  return preferredPath
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
  console.log(`📊 Total: ${createdProducts.length} products, ${createdProducts.reduce((sum, p) => sum + p.prices.length * 2, 0)} prices`)
  console.log(`🔑 Mode: ${stripeMode}`)
  console.log('='.repeat(60))

  // Update .env file
  const envPath = findEnvFile()
  try {
    updateEnvFile(envPath)
  } catch (error) {
    console.log('\n⚠️  Could not update .env file:', error)
    console.log('   Please manually add Price IDs to your .env file')
    console.log('\n   Add these variables to apps/api/.env:')
    for (const created of createdProducts) {
      const planSlugUpper = created.planSlug.toUpperCase()
      for (const price of created.prices) {
        const currencyUpper = price.currency.toUpperCase()
        console.log(`   STRIPE_PRICE_${planSlugUpper}_${currencyUpper}_REGULAR=${price.regularPriceId}`)
        if (price.earlyBirdPriceId) {
          console.log(`   STRIPE_PRICE_${planSlugUpper}_${currencyUpper}_EARLYBIRD=${price.earlyBirdPriceId}`)
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📝 NEXT STEPS')
  console.log('='.repeat(60))
  console.log(`\n1️⃣  Verify products in Stripe Dashboard (${stripeMode}):`)
  if (isTestMode) {
    console.log('   👉 Open: https://dashboard.stripe.com/test/products')
    console.log('   ✅ Make sure "Test mode" toggle is ON (purple) in the top right corner')
  } else {
    console.log('   👉 Open: https://dashboard.stripe.com/products')
    console.log('   ✅ Make sure "Test mode" toggle is OFF (grey) in the top right corner')
  }
  console.log('\n2️⃣  Check .env file for updated Price IDs')
  console.log('   Location: apps/api/.env')
  console.log('\n3️⃣  Test checkout flow with created products')
  
  console.log(`\n⚠️  CRITICAL: Make sure you're viewing ${stripeMode} in Stripe Dashboard!`)
  console.log('   Products created in TEST mode are NOT visible in LIVE mode and vice versa.')
  
  console.log(`\n💡 TROUBLESHOOTING - If you don't see products:`)
  console.log(`   1. Check the mode toggle in Stripe Dashboard top right corner`)
  console.log(`      - Should show: "${stripeMode}"`)
  console.log(`   2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)`)
  console.log(`   3. Check your API key in .env file:`)
  console.log(`      - Test mode: should start with "sk_test_"`)
  console.log(`      - Live mode: should start with "sk_live_"`)
  console.log(`   4. Check product filters in Stripe Dashboard:`)
  console.log(`      - Make sure "All products" is selected (not "Active" or "Archived")`)
  console.log(`   5. Run script with --force flag to recreate products:`)
  console.log(`      pnpm --filter api stripe:create-products -- --force`)
  
  console.log(`\n📋 Created Product IDs (for reference):`)
  for (const created of createdProducts) {
    const plan = PLANS_DATA.find((p) => p.slug === created.planSlug)
    console.log(`   ${plan?.name || created.planSlug}: ${created.productId}`)
  }
}

// ==================== MAIN ====================

async function main() {
  try {
    // Check for force recreate flag
    const forceRecreate = process.argv.includes('--force') || process.argv.includes('-f')
    
    // Verify Stripe connection
    console.log('🔌 Testing Stripe connection...')
    console.log(`   Mode: ${stripeMode} (${isTestMode ? 'Test' : 'Live'} keys)`)
    console.log(`   Key prefix: ${STRIPE_SECRET_KEY_FOR_LOGGING.substring(0, 7)}...`)
    
    const testConnection = await stripe.products.list({ limit: 1 })
    console.log('✅ Stripe connection successful\n')
    
    // Show current products count
    const allProducts = await stripe.products.list({ limit: 100 })
    console.log(`📊 Current products in Stripe (${stripeMode}): ${allProducts.data.length}`)
    if (allProducts.data.length > 0) {
      console.log('   Existing products:')
      allProducts.data.forEach((p) => {
        console.log(`      - ${p.name} (ID: ${p.id}, Active: ${p.active})`)
      })
    }
    console.log('')

    // Create products and prices
    await createStripeProducts(forceRecreate)

    // Verify products were created
    console.log('\n🔍 Verifying created products in Stripe...')
    const verifyProducts = await stripe.products.list({ limit: 100, active: true })
    const createdProductIds = createdProducts.map((p) => p.productId)
    const foundProducts = verifyProducts.data.filter((p) => createdProductIds.includes(p.id))
    
    console.log(`   Found ${foundProducts.length} of ${createdProducts.length} created products in Stripe`)
    if (foundProducts.length !== createdProducts.length) {
      console.warn('   ⚠️  Some products may not be visible. Check Stripe Dashboard.')
      const missingIds = createdProductIds.filter((id) => !foundProducts.some((p) => p.id === id))
      console.warn(`   Missing product IDs: ${missingIds.join(', ')}`)
    } else {
      console.log('   ✅ All products verified in Stripe')
    }
    
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

