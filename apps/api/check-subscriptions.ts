import { PrismaClient } from './prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkSubscriptions() {
  try {
    const trialSubs = await prisma.subscription.findMany({
      where: { status: 'TRIALING' },
      include: {
        payments: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('\n📊 TRIALING Subscriptions:\n')
    console.log('━'.repeat(60))

    if (trialSubs.length === 0) {
      console.log('✅ No TRIALING subscriptions found')
    } else {
      trialSubs.forEach((sub, i) => {
        const hasPayments = sub.payments.length > 0
        const successPayments = sub.payments.filter(p => p.status === 'SUCCEEDED').length
        console.log(`${i + 1}. ${sub.id}`)
        console.log(`   Team: ${sub.team?.name || 'N/A'}`)
        console.log(`   Plan: ${sub.plan}`)
        console.log(`   Created: ${sub.createdAt.toISOString()}`)
        console.log(`   Payments: ${sub.payments.length} (${successPayments} succeeded)`)
        console.log(`   ${hasPayments && successPayments === 0 ? '⚠️  Has failed payments' : ''}`)
        console.log()
      })

      // Find duplicates (same team, recent creations, no successful payments)
      const duplicates = trialSubs.filter(sub =>
        sub.payments.filter(p => p.status === 'SUCCEEDED').length === 0 &&
        new Date().getTime() - sub.createdAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      )

      if (duplicates.length > 0) {
        console.log('\n⚠️  Found potential duplicate subscriptions:')
        duplicates.forEach(sub => {
          console.log(`   - ${sub.id} (Team: ${sub.team?.name}, Created: ${sub.createdAt.toISOString()})`)
        })
        console.log('\n💡 Run cleanup script to remove them:')
        console.log('   cd apps/api')
        console.log('   psql -h localhost -p 54320 -U prorab -d prorab -f prisma/cleanup-duplicate-subscriptions.sql')
      }
    }

    console.log('━'.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
    await prisma.$disconnect()
  }
}

checkSubscriptions()
