/**
 * Sync subscription currentPeriodEnd with latest payment
 */

import { PrismaClient } from '../prisma/generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncSubscriptionPeriod() {
  console.log('Syncing subscription periods with latest payments...\n');

  // Get all subscriptions
  const subscriptions = await prisma.subscription.findMany();

  for (const subscription of subscriptions) {
    // Get latest successful payment for this subscription
    const latestPayment = await prisma.payment.findFirst({
      where: {
        subscriptionId: subscription.id,
        status: 'SUCCEEDED',
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    if (!latestPayment || !latestPayment.periodEndAt) {
      console.log(`⚠️  No payment with period data for subscription ${subscription.id.substring(0, 8)}`);
      continue;
    }

    // Get first payment to determine currentPeriodStart
    const firstPayment = await prisma.payment.findFirst({
      where: {
        subscriptionId: subscription.id,
        status: 'SUCCEEDED',
      },
      orderBy: {
        paidAt: 'asc',
      },
    });

    const currentPeriodStart = firstPayment?.periodStartAt || subscription.currentPeriodStart;
    const currentPeriodEnd = latestPayment.periodEndAt;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    console.log(
      `✓ Subscription ${subscription.id.substring(0, 8)}: ${currentPeriodStart.toISOString().substring(0, 10)} → ${currentPeriodEnd.toISOString().substring(0, 10)}`
    );
  }

  console.log('\n✅ Done!');
}

syncSubscriptionPeriod()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
