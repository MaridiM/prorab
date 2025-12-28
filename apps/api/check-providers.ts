import { PrismaClient } from './prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkProviders() {
  try {
    const providers = await prisma.paymentProvider.findMany()

    console.log('\n💳 Payment Providers in Database:\n')
    console.log('━'.repeat(60))

    providers.forEach(p => {
      const status = p.isActive ? '🟢 Active' : '🔴 Inactive'
      const primary = p.isPrimary ? '⭐ Primary' : '   Secondary'
      console.log(`${status} ${primary} | ${p.name.padEnd(10)} (${p.type})`)
    })

    console.log('━'.repeat(60))
    console.log(`\nTotal: ${providers.length} provider(s)`)

    if (providers.every(p => p.isActive)) {
      console.log('\n✅ All providers are active - ready for payments!')
    } else {
      console.log('\n⚠️  Some providers are inactive')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
    await prisma.$disconnect()
  }
}

checkProviders()
