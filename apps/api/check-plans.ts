import { PrismaClient } from './prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkPlans() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        prices: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    console.log('\n📦 Subscription Plans in Database:\n')
    console.log('━'.repeat(60))

    if (plans.length === 0) {
      console.log('❌ No plans found! Run: pnpm prisma:seed:plans')
      return
    }

    plans.forEach((plan, i) => {
      const popular = plan.isPopular ? '⭐ Popular' : ''
      console.log(`${i + 1}. ${plan.name} (${plan.slug}) ${popular}`)
      console.log(`   Limits: ${plan.maxActiveProjects || '∞'} projects, ${plan.maxMembers} members, ${plan.storageGB} GB`)
      console.log(`   Early Bird: ${plan.isEarlyBird ? 'YES' : 'NO'}`)
      console.log(`   Prices:`)

      plan.prices.forEach(price => {
        const regular = `${price.price} ${price.currency}`
        const earlyBird = plan.isEarlyBird ? ` (Early Bird: ${price.earlyBirdPrice} ${price.currency})` : ''
        console.log(`      - ${regular}${earlyBird}`)
      })
      console.log()
    })

    console.log('━'.repeat(60))
    console.log(`\n✅ Total: ${plans.length} plan(s)`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
    await prisma.$disconnect()
  }
}

checkPlans()
