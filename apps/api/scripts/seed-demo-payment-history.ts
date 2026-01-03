/**
 * Seed script to create payment history for demo user
 * Creates 10-15 payments with different plans, renewals, and plan changes
 */

import { PrismaClient, PaymentStatus, SubscriptionStatus, PaymentProviderType } from '../prisma/generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BILLING_CYCLE_DAYS = 30;

// Plan prices (RUB, regular / early bird)
const PLAN_PRICES = {
  LITE: { regular: 490, earlyBird: 290 },
  FOREMAN: { regular: 990, earlyBird: 690 },
  BRIGADE: { regular: 1990, earlyBird: 1490 },
};

interface PaymentHistoryEntry {
  planSlug: 'lite' | 'foreman' | 'brigade';
  planName: string;
  isEarlyBird: boolean;
  daysAgo: number; // Days ago from now
}

// Create payment history: mix of plan changes and renewals
// Payments are defined with daysAgo, will be sorted chronologically
const PAYMENT_HISTORY: PaymentHistoryEntry[] = [
  // Start with LITE plan (6 months ago)
  { planSlug: 'lite', planName: 'Лайт', isEarlyBird: true, daysAgo: 180 },
  { planSlug: 'lite', planName: 'Лайт', isEarlyBird: true, daysAgo: 150 }, // Renewal
  { planSlug: 'lite', planName: 'Лайт', isEarlyBird: true, daysAgo: 120 }, // Renewal
  
  // Change to FOREMAN (3 months ago)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: true, daysAgo: 90 },
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: true, daysAgo: 60 }, // Renewal
  
  // Change to BRIGADE (1 month ago)
  { planSlug: 'brigade', planName: 'Бригада', isEarlyBird: true, daysAgo: 30 },
  
  // Back to FOREMAN (2 weeks ago)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false, daysAgo: 15 },
  
  // Back to LITE (1 week ago)
  { planSlug: 'lite', planName: 'Лайт', isEarlyBird: false, daysAgo: 7 },
  
  // Change to FOREMAN again (5 days ago)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false, daysAgo: 5 },
  
  // Renewal FOREMAN (2 days ago)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false, daysAgo: 2 },
  
  // Change to BRIGADE (yesterday)
  { planSlug: 'brigade', planName: 'Бригада', isEarlyBird: false, daysAgo: 1 },
  
  // Back to FOREMAN (today - current)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false, daysAgo: 0 },
  
  // Additional payments for more history (15 total)
  // Change to BRIGADE (4 months ago)
  { planSlug: 'brigade', planName: 'Бригада', isEarlyBird: true, daysAgo: 105 },
  
  // Change to LITE (3.5 months ago)
  { planSlug: 'lite', planName: 'Лайт', isEarlyBird: true, daysAgo: 75 },
  
  // Change to FOREMAN (3 weeks ago)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false, daysAgo: 21 },
  
  // Change to BRIGADE (10 days ago)
  { planSlug: 'brigade', planName: 'Бригада', isEarlyBird: false, daysAgo: 10 },
  
  // Change to LITE (8 days ago)
  { planSlug: 'lite', planName: 'Лайт', isEarlyBird: false, daysAgo: 8 },
  
  // Change to FOREMAN (6 days ago)
  { planSlug: 'foreman', planName: 'Прораб', isEarlyBird: false, daysAgo: 6 },
];

async function seedDemoPaymentHistory() {
  console.log('🌱 Starting demo payment history seed...\n');

  try {
    // Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@prorab.app' },
      include: {
        ownedTeams: {
          include: {
            subscription: {
              include: {
                planRef: true,
              },
            },
          },
        },
      },
    });

    if (!demoUser) {
      console.error('❌ Demo user not found. Please run seed.ts first.');
      process.exit(1);
    }

    const team = demoUser.ownedTeams[0];
    if (!team) {
      console.error('❌ Demo user has no team. Please run seed.ts first.');
      process.exit(1);
    }

    let subscription = team.subscription;
    if (!subscription) {
      console.error('❌ Demo user has no subscription. Please run seed.ts first.');
      process.exit(1);
    }

    // Get all plans
    const plans = await prisma.plan.findMany({
      include: {
        prices: {
          where: { currency: 'RUB' },
        },
      },
    });

    const planMap = new Map(plans.map(p => [p.slug, p]));

    console.log(`📋 Found demo user: ${demoUser.email}`);
    console.log(`📋 Team: ${team.name} (${team.id})`);
    console.log(`📋 Current subscription: ${subscription.planRef?.name || subscription.plan}\n`);

    // Delete existing payments for this subscription
    const existingPayments = await prisma.payment.count({
      where: { subscriptionId: subscription.id },
    });

    if (existingPayments > 0) {
      console.log(`🗑️  Deleting ${existingPayments} existing payments...`);
      await prisma.payment.deleteMany({
        where: { subscriptionId: subscription.id },
      });
      console.log(`✅ Deleted existing payments\n`);
    }

    // Sort payments by date (oldest first) to ensure proper period calculation
    const sortedPayments = [...PAYMENT_HISTORY].sort((a, b) => b.daysAgo - a.daysAgo);
    
    console.log(`💳 Creating ${sortedPayments.length} payment history entries...\n`);

    const createdPayments: Array<{ id: string; periodEndAt: Date; planSlug: string }> = [];
    let previousPayment: { planSlug: string; periodEndAt: Date; paymentDate: Date; paymentId: string } | null = null;

    for (let i = 0; i < sortedPayments.length; i++) {
      const entry = sortedPayments[i];
      const plan = planMap.get(entry.planSlug);

      if (!plan) {
        console.error(`❌ Plan ${entry.planSlug} not found`);
        continue;
      }

      const priceData = PLAN_PRICES[entry.planSlug.toUpperCase() as keyof typeof PLAN_PRICES];
      const amount = entry.isEarlyBird ? priceData.earlyBird : priceData.regular;

      // Calculate payment date
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - entry.daysAgo);
      paymentDate.setHours(12, 0, 0, 0); // Set to noon

      // Calculate period dates
      let periodStartAt: Date;
      let periodEndAt: Date;
      let isRenewal = false;

      // Determine if this is a renewal (same plan as previous payment)
      if (previousPayment && previousPayment.planSlug === entry.planSlug) {
        // Renewal: extend from previous period end (continuous period)
        isRenewal = true;
        periodStartAt = new Date(previousPayment.periodEndAt);
        periodEndAt = new Date(previousPayment.periodEndAt);
        periodEndAt.setDate(periodEndAt.getDate() + BILLING_CYCLE_DAYS);
      } else {
        // Plan change or first payment: start from payment date
        periodStartAt = new Date(paymentDate);
        periodEndAt = new Date(paymentDate);
        periodEndAt.setDate(periodEndAt.getDate() + BILLING_CYCLE_DAYS);
        
        // If previous payment exists and its period extends beyond this payment date,
        // update the previous payment's periodEndAt to this payment date
        if (previousPayment && previousPayment.periodEndAt > paymentDate) {
          await prisma.payment.update({
            where: { id: previousPayment.paymentId },
            data: {
              periodEndAt: new Date(paymentDate),
            },
          });
          // Update local reference
          previousPayment.periodEndAt = new Date(paymentDate);
        }
      }

      // Create payment
      const payment = await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          teamId: team.id,
          amount: amount,
          currency: 'RUB',
          status: PaymentStatus.SUCCEEDED,
          providerType: PaymentProviderType.YOOKASSA,
          providerPaymentId: `demo-payment-${i + 1}-${Date.now()}`,
          description: `Вписки '${entry.planName}' за месяц | TARGET_PLAN:${plan.id}|${entry.planSlug.toUpperCase()}|${entry.isEarlyBird}`,
          paidAt: paymentDate,
          periodStartAt: periodStartAt,
          periodEndAt: periodEndAt,
        },
      });

      createdPayments.push({
        id: payment.id,
        periodEndAt: new Date(periodEndAt),
        planSlug: entry.planSlug,
      });

      // Update subscription for this payment
      const isPlanChange = !previousPayment || previousPayment.planSlug !== entry.planSlug;

      if (isPlanChange) {
        // Update subscription plan
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            planId: plan.id,
            plan: entry.planSlug.toUpperCase() as any,
            isEarlyBird: entry.isEarlyBird,
            currentPeriodStart: periodStartAt,
            currentPeriodEnd: periodEndAt,
            status: SubscriptionStatus.ACTIVE,
            trialEndsAt: null, // Remove trial on plan change
          },
        });
      } else {
        // Just update period for renewal
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            currentPeriodStart: periodStartAt,
            currentPeriodEnd: periodEndAt,
          },
        });
      }

      const action = isRenewal ? '🔄 Renewal' : '🔄 Plan change';
      const earlyBirdBadge = entry.isEarlyBird ? '⭐ Early Bird' : '';
      console.log(
        `   ${i + 1}. ${action}: ${entry.planName} - ${amount}₽ ${earlyBirdBadge}`
      );
      console.log(
        `      Period: ${periodStartAt.toLocaleDateString('ru-RU')} - ${periodEndAt.toLocaleDateString('ru-RU')}`
      );

      previousPayment = { 
        planSlug: entry.planSlug, 
        periodEndAt: new Date(periodEndAt),
        paymentDate: new Date(paymentDate),
        paymentId: payment.id,
      };
    }

    // Update subscription to current state (most recent payment, daysAgo = 0)
    const mostRecentPayment = sortedPayments.find(p => p.daysAgo === 0) || sortedPayments[0];
    const lastPlan = planMap.get(mostRecentPayment.planSlug);
    const lastPaymentRecord = createdPayments.find(p => {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - mostRecentPayment.daysAgo);
      paymentDate.setHours(12, 0, 0, 0);
      const payment = createdPayments.find(cp => cp.id === p.id);
      return payment;
    });

    if (lastPlan && lastPaymentRecord) {
      const lastPayment = await prisma.payment.findUnique({
        where: { id: lastPaymentRecord.id },
      });

      if (lastPayment) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            planId: lastPlan.id,
            plan: mostRecentPayment.planSlug.toUpperCase() as any,
            isEarlyBird: mostRecentPayment.isEarlyBird,
            currentPeriodStart: lastPayment.periodStartAt,
            currentPeriodEnd: lastPayment.periodEndAt,
            status: SubscriptionStatus.ACTIVE,
          },
        });
      }
    }

    console.log(`\n✅ Created ${createdPayments.length} payments`);
    console.log(`✅ Updated subscription to current plan: ${mostRecentPayment.planName}`);
    console.log(`✅ Payment history seeded successfully!`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedDemoPaymentHistory()
  .then(() => {
    console.log('\n✨ Demo payment history seed completed!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
