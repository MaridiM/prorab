/**
 * Script to check and clean up donations that might have been created with mock data
 * 
 * Usage:
 * cd apps/api
 * pnpm tsx scripts/check-donations.ts
 */

import { PrismaClient, DonationStatus } from '../prisma/generated/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function checkDonations() {
  console.log('🔍 Checking donations for mock data...\n')

  // Find all donations
  const allDonations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
  })

  console.log(`Total donations: ${allDonations.length}\n`)

  // Check for suspicious donations
  const suspiciousDonations = allDonations.filter((donation) => {
    // Check for mock payment IDs
    if (donation.providerPaymentId.startsWith('mock_')) {
      return true
    }
    if (donation.providerPaymentId.startsWith('temp_')) {
      return true
    }
    // Check for succeeded donations without paidAt
    if (donation.status === DonationStatus.SUCCEEDED && !donation.paidAt) {
      return true
    }
    return false
  })

  if (suspiciousDonations.length > 0) {
    console.log(`⚠️  Found ${suspiciousDonations.length} suspicious donations:\n`)
    
    suspiciousDonations.forEach((donation) => {
      console.log(`  - ID: ${donation.id}`)
      console.log(`    Status: ${donation.status}`)
      console.log(`    Provider Payment ID: ${donation.providerPaymentId}`)
      console.log(`    Amount: ${donation.amount} ${donation.currency}`)
      console.log(`    Created: ${donation.createdAt}`)
      console.log(`    Paid At: ${donation.paidAt || 'NOT SET'}`)
      console.log('')
    })

    console.log('💡 These donations might have been created with mock data.')
    console.log('💡 To clean them up, you can:')
    console.log('   1. Set their status to FAILED or CANCELLED')
    console.log('   2. Delete them if they are test data')
    console.log('   3. Keep them if they are real payments that need webhook updates\n')
  } else {
    console.log('✅ No suspicious donations found. All donations look legitimate.\n')
  }

  // Show statistics
  const stats = {
    total: allDonations.length,
    succeeded: allDonations.filter((d) => d.status === DonationStatus.SUCCEEDED).length,
    pending: allDonations.filter((d) => d.status === DonationStatus.PENDING).length,
    failed: allDonations.filter((d) => d.status === DonationStatus.FAILED).length,
    cancelled: allDonations.filter((d) => d.status === DonationStatus.CANCELLED).length,
  }

  console.log('📊 Statistics:')
  console.log(`   Total: ${stats.total}`)
  console.log(`   Succeeded: ${stats.succeeded}`)
  console.log(`   Pending: ${stats.pending}`)
  console.log(`   Failed: ${stats.failed}`)
  console.log(`   Cancelled: ${stats.cancelled}`)
}

checkDonations()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

