#!/usr/bin/env ts-node
/**
 * Migration Script: Subscriptions to PlanId
 *
 * This script migrates existing subscriptions from the old `plan` enum field
 * to the new `planId` foreign key field that references the Plan table.
 *
 * PREREQUISITES:
 * - Plans must be seeded (run `pnpm prisma db seed`)
 * - Plans table must have records for LITE, FOREMAN, and BRIGADE
 *
 * WHAT THIS SCRIPT DOES:
 * 1. Fetches all plans from the database
 * 2. Creates a mapping: { LITE: planId, FOREMAN: planId, BRIGADE: planId }
 * 3. Updates all subscriptions to set planId based on their current plan enum
 * 4. Sets default currency to RUB if not already set
 * 5. Validates that all subscriptions have planId after migration
 *
 * ROLLBACK:
 * - The old `plan` enum field is kept for now (marked as deprecated)
 * - To rollback: just set planId to null for affected subscriptions
 *
 * USAGE:
 * ```bash
 * cd apps/api
 * pnpm ts-node scripts/migrate-subscriptions-to-planid.ts
 * ```
 */

import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

interface PlanMapping {
  LITE: string;
  FOREMAN: string;
  BRIGADE: string;
}

async function main() {
  console.log('🚀 Starting Subscription → PlanId Migration\n');

  try {
    // Step 1: Fetch plans from database
    console.log('📋 Step 1: Fetching plans from database...');
    const plans = await prisma.plan.findMany({
      where: {
        slug: {
          in: ['lite', 'foreman', 'brigade'],
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (plans.length !== 3) {
      throw new Error(
        `Expected 3 plans (lite, foreman, brigade), found ${plans.length}. ` +
          `Please run seed script first: pnpm prisma db seed`
      );
    }

    console.log(`✅ Found ${plans.length} plans:`);
    plans.forEach((plan) => {
      console.log(`   - ${plan.slug} → ${plan.name} (${plan.id})`);
    });

    // Step 2: Create plan mapping
    console.log('\n📋 Step 2: Creating plan mapping...');
    const planMapping: PlanMapping = {
      LITE: plans.find((p) => p.slug === 'lite')!.id,
      FOREMAN: plans.find((p) => p.slug === 'foreman')!.id,
      BRIGADE: plans.find((p) => p.slug === 'brigade')!.id,
    };

    console.log('✅ Plan mapping created:');
    console.log(`   LITE    → ${planMapping.LITE}`);
    console.log(`   FOREMAN → ${planMapping.FOREMAN}`);
    console.log(`   BRIGADE → ${planMapping.BRIGADE}`);

    // Step 3: Get all subscriptions
    console.log('\n📋 Step 3: Fetching subscriptions...');
    const subscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        plan: true,
        planId: true,
        currency: true,
        teamId: true,
      },
    });

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      console.log('\n⚠️  No subscriptions found. Nothing to migrate.');
      return;
    }

    // Step 4: Analyze current state
    console.log('\n📋 Step 4: Analyzing current state...');
    const alreadyMigrated = subscriptions.filter((s) => s.planId !== null);
    const needsMigration = subscriptions.filter((s) => s.planId === null);

    console.log(`   ✅ Already migrated: ${alreadyMigrated.length}`);
    console.log(`   🔄 Needs migration:  ${needsMigration.length}`);

    if (needsMigration.length === 0) {
      console.log('\n✨ All subscriptions already have planId. Migration not needed!');
      return;
    }

    // Step 5: Migrate subscriptions
    console.log('\n📋 Step 5: Migrating subscriptions...');
    let migratedCount = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const subscription of needsMigration) {
      try {
        // Determine planId based on current plan enum
        const targetPlanId = planMapping[subscription.plan as keyof PlanMapping];

        if (!targetPlanId) {
          errors.push({
            id: subscription.id,
            error: `Unknown plan: ${subscription.plan}`,
          });
          continue;
        }

        // Update subscription
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            planId: targetPlanId,
            currency: subscription.currency || 'RUB', // Set default currency if not set
          },
        });

        migratedCount++;

        if (migratedCount % 10 === 0) {
          console.log(`   ... migrated ${migratedCount}/${needsMigration.length}`);
        }
      } catch (error) {
        errors.push({
          id: subscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`✅ Migrated ${migratedCount} subscriptions`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${errors.length}`);
      errors.forEach((err) => {
        console.log(`   - Subscription ${err.id}: ${err.error}`);
      });
    }

    // Step 6: Validation
    console.log('\n📋 Step 6: Validating migration...');
    const afterMigration = await prisma.subscription.findMany({
      where: {
        planId: null,
      },
      select: {
        id: true,
        plan: true,
      },
    });

    if (afterMigration.length > 0) {
      console.log(`⚠️  Warning: ${afterMigration.length} subscriptions still have null planId:`);
      afterMigration.forEach((sub) => {
        console.log(`   - ${sub.id} (plan: ${sub.plan})`);
      });
    } else {
      console.log('✅ All subscriptions have planId set!');
    }

    // Step 7: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total subscriptions:     ${subscriptions.length}`);
    console.log(`Already migrated:        ${alreadyMigrated.length}`);
    console.log(`Newly migrated:          ${migratedCount}`);
    console.log(`Errors:                  ${errors.length}`);
    console.log(`Remaining null planId:   ${afterMigration.length}`);
    console.log('='.repeat(60));

    if (errors.length === 0 && afterMigration.length === 0) {
      console.log('\n✅ MIGRATION SUCCESSFUL! All subscriptions now use planId.');
      console.log('\n💡 Next steps:');
      console.log('   1. Test your application with the new plan references');
      console.log('   2. Run validation script: pnpm ts-node scripts/validate-migration.ts');
      console.log('   3. After thorough testing, the old "plan" enum field can be deprecated');
    } else {
      console.log('\n⚠️  MIGRATION COMPLETED WITH WARNINGS');
      console.log('   Please review errors and remaining null planIds above.');
    }
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
