import { PrismaClient } from './prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function cleanup() {
  try {
    console.log('🧹 Cleaning up duplicate subscriptions...\n')

    // Find subscriptions with failed payments created in last 24 hours
    const duplicates = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        payments: true,
      },
    })

    const toDelete = duplicates.filter(sub =>
      sub.payments.every(p => p.status !== 'SUCCEEDED')
    )

    if (toDelete.length === 0) {
      console.log('✅ No duplicate subscriptions to clean up')
      return
    }

    console.log(`Found ${toDelete.length} subscription(s) to delete:\n`)
    toDelete.forEach(sub => {
      console.log(`   - ${sub.id} (Plan: ${sub.plan}, Payments: ${sub.payments.length})`)
    })

    console.log('\nDeleting...')

    for (const sub of toDelete) {
      // Delete associated payments first
      await prisma.payment.deleteMany({
        where: { subscriptionId: sub.id },
      })

      // Delete subscription
      await prisma.subscription.delete({
        where: { id: sub.id },
      })

      console.log(`   ✅ Deleted ${sub.id}`)
    }

    console.log(`\n🎉 Successfully cleaned up ${toDelete.length} duplicate subscription(s)!`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
    await prisma.$disconnect()
  }
}

cleanup()
