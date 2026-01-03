/**
 * Backfill script to calculate and update periodStartAt and periodEndAt
 * for existing payments that don't have these fields set
 *
 * Run with: pnpm tsx scripts/backfill-payment-periods.ts
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
const BILLING_CYCLE_DAYS = 30;

async function backfillPaymentPeriods() {
  console.log('Starting payment periods backfill...\n');

  // First, check total payments
  const totalPayments = await prisma.payment.count({
    where: { status: 'SUCCEEDED' },
  });
  console.log(`Total successful payments in database: ${totalPayments}`);

  const paymentsWithPeriods = await prisma.payment.count({
    where: {
      status: 'SUCCEEDED',
      periodStartAt: { not: null },
    },
  });
  console.log(`Payments with period data: ${paymentsWithPeriods}`);

  // Get ALL successful payments, ordered by subscription and payment date
  // We'll recalculate periods for all of them
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
    orderBy: [
      { subscriptionId: 'asc' },
      { paidAt: 'asc' },
    ],
  });

  console.log(`Processing all ${payments.length} payments (will recalculate periods)\n`);

  // Group payments by subscription
  const paymentsBySubscription = payments.reduce((acc, payment) => {
    const subId = payment.subscriptionId;
    if (!acc[subId]) {
      acc[subId] = [];
    }
    acc[subId].push(payment);
    return acc;
  }, {} as Record<string, typeof payments>);

  let updated = 0;
  let errors = 0;

  // Process each subscription's payments
  for (const [subscriptionId, subPayments] of Object.entries(paymentsBySubscription)) {
    console.log(`Processing subscription ${subscriptionId} with ${subPayments.length} payments`);

    // Track the running period end for this subscription
    let currentPeriodEnd: Date | null = null;

    for (let i = 0; i < subPayments.length; i++) {
      const payment = subPayments[i];
      const paidAt = payment.paidAt || payment.createdAt;

      let periodStartAt: Date;
      let periodEndAt: Date;

      if (i === 0) {
        // First payment - period starts from payment date
        periodStartAt = paidAt;
        periodEndAt = new Date(paidAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
        currentPeriodEnd = periodEndAt;
      } else {
        // Subsequent payments - check if this is a renewal or plan change
        const prevPayment = subPayments[i - 1];

        // Extract plan info from current and previous payment
        const currentPlanSlug = extractPlanSlug(payment);
        const prevPlanSlug = extractPlanSlug(prevPayment);

        // IMPORTANT: Compare by base price (not Early Bird), as user can switch between EB and regular
        const currentBasePrice = getBasePlanPrice(Number(payment.amount));
        const prevBasePrice = getBasePlanPrice(Number(prevPayment.amount));

        // Consider it a renewal if base plan price is the same
        const isSamePlan = currentBasePrice === prevBasePrice;

        if (isSamePlan && currentPeriodEnd) {
          // Same plan - renewal: period continues from previous period end
          periodStartAt = currentPeriodEnd;
          periodEndAt = new Date(currentPeriodEnd.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
          currentPeriodEnd = periodEndAt;
        } else {
          // Plan change - new period starts from payment date
          periodStartAt = paidAt;
          periodEndAt = new Date(paidAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
          currentPeriodEnd = periodEndAt;
        }
      }

      try {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            periodStartAt,
            periodEndAt,
          },
        });

        console.log(`  ✓ Payment ${payment.id}: ${periodStartAt.toISOString()} - ${periodEndAt.toISOString()}`);
        updated++;
      } catch (error) {
        console.error(`  ✗ Failed to update payment ${payment.id}:`, error);
        errors++;
      }
    }

    console.log('');
  }

  console.log(`\nBackfill complete!`);
  console.log(`✓ Updated: ${updated} payments`);
  console.log(`✗ Errors: ${errors} payments`);
}

/**
 * Get base plan price (regular, non-Early Bird price)
 * This allows us to compare plans ignoring Early Bird discount
 */
function getBasePlanPrice(amount: number): number {
  // LITE: 290 (EB) or 490 (regular) → base = 490
  if (amount === 290 || amount === 490) return 490;

  // FOREMAN: 690 (EB) or 990 (regular) → base = 990
  if (amount === 690 || amount === 990) return 990;

  // BRIGADE: 1490 (EB) or 1990 (regular) → base = 1990
  if (amount === 1490 || amount === 1990) return 1990;

  // Unknown amount - return as is
  return amount;
}

/**
 * Extract plan slug from payment metadata
 */
function extractPlanSlug(payment: any): string {
  // Try failureReason (mock payments)
  if (payment.failureReason && payment.failureReason.startsWith('TARGET_PLAN_METADATA:')) {
    const [, targetPlan] = payment.failureReason.replace('TARGET_PLAN_METADATA:', '').split('|');
    if (targetPlan) return targetPlan.toLowerCase();
  }

  // Try description (real payments)
  if (payment.description && payment.description.includes('TARGET_PLAN:')) {
    const match = payment.description.match(/TARGET_PLAN:[^|]+\|([^|]+)\|/);
    if (match) return match[1].toLowerCase();
  }

  // Try subscription plan
  if (payment.subscription?.planRef?.slug) {
    return payment.subscription.planRef.slug.toLowerCase();
  }

  // Fallback: determine from amount
  const amount = Number(payment.amount);
  if (amount === 290 || amount === 490) return 'lite';
  if (amount === 690 || amount === 990) return 'foreman';
  if (amount === 1490 || amount === 1990) return 'brigade';

  return 'unknown';
}

// Run the script
backfillPaymentPeriods()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
