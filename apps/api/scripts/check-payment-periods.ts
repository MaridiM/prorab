/**
 * Check payment periods in database
 *
 * Run with: pnpm tsx scripts/check-payment-periods.ts
 */

import { PrismaClient } from '../prisma/generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkPaymentPeriods() {
  console.log('Checking payment periods in database...\n');

  // Get all successful payments with their periods
  const payments = await prisma.payment.findMany({
    where: {
      status: 'SUCCEEDED',
    },
    include: {
      subscription: {
        include: {
          planRef: true,
        },
      },
    },
    orderBy: {
      paidAt: 'desc',
    },
    take: 20,
  });

  console.log(`Found ${payments.length} successful payments (showing latest 20)\n`);
  console.log('ID'.padEnd(10) + ' | ' + 'Plan'.padEnd(12) + ' | ' + 'Amount'.padEnd(8) + ' | ' + 'Paid At'.padEnd(20) + ' | ' + 'Period Start'.padEnd(20) + ' | ' + 'Period End');
  console.log('-'.repeat(150));

  for (const payment of payments) {
    const id = payment.id.substring(0, 8);
    const plan = payment.subscription?.planRef?.name || payment.subscription?.plan || 'Unknown';
    const amount = `${payment.amount} ${payment.currency}`;
    const paidAt = payment.paidAt?.toISOString().substring(0, 19) || 'N/A';
    const periodStart = payment.periodStartAt?.toISOString().substring(0, 19) || 'NULL';
    const periodEnd = payment.periodEndAt?.toISOString().substring(0, 19) || 'NULL';

    console.log(
      id.padEnd(10) + ' | ' +
      plan.padEnd(12) + ' | ' +
      amount.padEnd(8) + ' | ' +
      paidAt.padEnd(20) + ' | ' +
      periodStart.padEnd(20) + ' | ' +
      periodEnd
    );
  }

  console.log('\n');

  // Group by subscription and show period progression
  const paymentsBySubscription = payments.reduce((acc, payment) => {
    const subId = payment.subscriptionId;
    if (!acc[subId]) {
      acc[subId] = [];
    }
    acc[subId].push(payment);
    return acc;
  }, {} as Record<string, typeof payments>);

  console.log('\nPeriod progression by subscription:\n');

  for (const [subscriptionId, subPayments] of Object.entries(paymentsBySubscription)) {
    // Sort chronologically (oldest first)
    const sorted = subPayments.sort((a, b) => {
      const dateA = a.paidAt || a.createdAt;
      const dateB = b.paidAt || b.createdAt;
      return dateA.getTime() - dateB.getTime();
    });

    console.log(`Subscription ${subscriptionId.substring(0, 8)}... (${sorted[0].subscription?.planRef?.name || sorted[0].subscription?.plan}):`);

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const periodStart = p.periodStartAt?.toISOString().substring(0, 10);
      const periodEnd = p.periodEndAt?.toISOString().substring(0, 10);
      const paidAt = (p.paidAt || p.createdAt).toISOString().substring(0, 10);

      console.log(`  Payment ${i + 1}: Paid ${paidAt} → Period: ${periodStart} to ${periodEnd}`);
    }
    console.log('');
  }
}

// Run the script
checkPaymentPeriods()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
