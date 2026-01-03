/**
 * Fix payment periods to be strictly sequential without overlaps
 * This is a SIMPLE approach: each payment gets a 30-day period starting from previous period end
 */

import { PrismaClient } from '../prisma/generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const BILLING_CYCLE_DAYS = 30;

async function fixPaymentPeriods() {
  console.log('Fixing payment periods to be sequential...\n');

  // Get all successful payments in chronological order
  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCEEDED' },
    orderBy: [
      { subscriptionId: 'asc' },
      { paidAt: 'asc' },
    ],
  });

  console.log(`Found ${payments.length} successful payments\n`);

  // Group by subscription
  const paymentsBySubscription = payments.reduce((acc, payment) => {
    const subId = payment.subscriptionId;
    if (!acc[subId]) acc[subId] = [];
    acc[subId].push(payment);
    return acc;
  }, {} as Record<string, typeof payments>);

  let updated = 0;

  // Process each subscription's payments sequentially
  for (const [subscriptionId, subPayments] of Object.entries(paymentsBySubscription)) {
    console.log(`\nProcessing subscription ${subscriptionId.substring(0, 8)}... (${subPayments.length} payments)`);

    let periodEnd: Date | null = null;

    for (let i = 0; i < subPayments.length; i++) {
      const payment = subPayments[i];
      const paidAt = payment.paidAt || payment.createdAt;

      let periodStartAt: Date;
      let periodEndAt: Date;

      if (i === 0) {
        // First payment: start from payment date
        periodStartAt = paidAt;
        periodEndAt = new Date(paidAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
      } else {
        // Subsequent payments: start from previous period end
        periodStartAt = periodEnd!;
        periodEndAt = new Date(periodStartAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
      }

      // Update period end for next iteration
      periodEnd = periodEndAt;

      // Update database
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          periodStartAt,
          periodEndAt,
        },
      });

      const amount = Number(payment.amount);
      console.log(
        `  ${String(i + 1).padStart(2)}. ${amount.toString().padStart(4)} RUB  ${periodStartAt.toISOString().substring(0, 10)} → ${periodEndAt.toISOString().substring(0, 10)}`
      );

      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} payments with sequential periods`);
}

fixPaymentPeriods()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
