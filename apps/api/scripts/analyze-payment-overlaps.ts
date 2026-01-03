/**
 * Analyze payment periods to find overlaps and issues
 */

import { PrismaClient } from '../prisma/generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function analyzePayments() {
  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCEEDED' },
    orderBy: { paidAt: 'asc' },
  });

  console.log(`\n📊 Analyzing ${payments.length} payments...\n`);

  // Group by amount to see plan progression
  const byAmount = payments.reduce((acc, p) => {
    const amount = Number(p.amount);
    if (!acc[amount]) acc[amount] = [];
    acc[amount].push(p);
    return acc;
  }, {} as Record<number, typeof payments>);

  console.log('Payments by amount (plan):');
  Object.entries(byAmount).forEach(([amount, pmts]) => {
    const planName = getPlanName(Number(amount));
    console.log(`  ${amount} RUB (${planName}): ${pmts.length} payments`);
  });

  console.log('\n📅 Chronological order with overlaps:\n');

  for (let i = 0; i < payments.length; i++) {
    const p = payments[i];
    const paidAt = (p.paidAt || p.createdAt).toISOString().substring(0, 10);
    const start = p.periodStartAt?.toISOString().substring(0, 10) || 'NULL';
    const end = p.periodEndAt?.toISOString().substring(0, 10) || 'NULL';
    const amount = Number(p.amount);
    const planName = getPlanName(amount);

    let warning = '';

    // Check for overlaps with previous payment
    if (i > 0 && p.periodStartAt && p.periodEndAt) {
      const prev = payments[i - 1];
      if (prev.periodEndAt) {
        const overlap = p.periodStartAt < prev.periodEndAt;
        if (overlap) {
          const prevEnd = prev.periodEndAt.toISOString().substring(0, 10);
          warning = ` ⚠️  OVERLAP! Previous ended ${prevEnd}, this starts ${start}`;
        }
      }
    }

    // Check if period is correct (30 days)
    if (p.periodStartAt && p.periodEndAt) {
      const days = Math.round((p.periodEndAt.getTime() - p.periodStartAt.getTime()) / (24 * 60 * 60 * 1000));
      if (days !== 30) {
        warning += ` ⚠️  Period is ${days} days (should be 30)`;
      }
    }

    console.log(
      `${String(i + 1).padStart(2)}.  Paid: ${paidAt}  ${amount.toString().padStart(4)} RUB (${planName.padEnd(10)})  Period: ${start} → ${end}${warning}`
    );
  }

  console.log('\n');
}

function getPlanName(amount: number): string {
  if (amount === 290) return 'LITE (EB)';
  if (amount === 490) return 'LITE';
  if (amount === 690) return 'FOREMAN(EB)';
  if (amount === 990) return 'FOREMAN';
  if (amount === 1490) return 'BRIGADE(EB)';
  if (amount === 1990) return 'BRIGADE';
  return 'UNKNOWN';
}

analyzePayments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
