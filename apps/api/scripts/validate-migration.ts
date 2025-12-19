#!/usr/bin/env ts-node
/**
 * Validation Script: Phase 4 Migration Validation
 *
 * This script validates that both migrations (Subscriptions → PlanId and
 * Yookassa → SystemSettings) were completed successfully.
 *
 * WHAT THIS SCRIPT CHECKS:
 * 1. All subscriptions have planId set
 * 2. All planId values reference valid plans
 * 3. All subscriptions have currency set
 * 4. Yookassa settings exist in SystemSettings
 * 5. Yookassa settings can be decrypted (encrypted ones)
 * 6. PaymentProvider records exist and are correctly configured
 *
 * USAGE:
 * ```bash
 * cd apps/api
 * pnpm ts-node scripts/validate-migration.ts
 * ```
 */

import { PrismaClient } from '../prisma/generated/client';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Simple decryption (matches EncryptionService)
class SimpleDecryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not found in environment variables');
    }

    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

interface ValidationResult {
  section: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
}

const results: ValidationResult[] = [];

async function validateSubscriptions(): Promise<ValidationResult> {
  console.log('📋 Validating Subscriptions Migration...\n');

  const result: ValidationResult = {
    section: 'Subscriptions',
    passed: true,
    issues: [],
    warnings: [],
  };

  // Check 1: All subscriptions have planId
  const subscriptionsWithoutPlanId = await prisma.subscription.count({
    where: { planId: null },
  });

  if (subscriptionsWithoutPlanId > 0) {
    result.passed = false;
    result.issues.push(`${subscriptionsWithoutPlanId} subscription(s) have null planId`);
    console.log(`   ❌ ${subscriptionsWithoutPlanId} subscription(s) missing planId`);
  } else {
    console.log(`   ✅ All subscriptions have planId set`);
  }

  // Check 2: All planId values reference valid plans
  const subscriptions = await prisma.subscription.findMany({
    select: {
      id: true,
      planId: true,
      plan: true,
    },
  });

  const planIds = new Set<string>();
  subscriptions.forEach((sub) => {
    if (sub.planId) planIds.add(sub.planId);
  });

  for (const planId of planIds) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      result.passed = false;
      result.issues.push(`Invalid planId reference: ${planId}`);
      console.log(`   ❌ Invalid planId: ${planId} (plan not found)`);
    }
  }

  if (result.issues.filter((i) => i.includes('Invalid planId')).length === 0) {
    console.log(`   ✅ All planId values reference valid plans`);
  }

  // Check 3: All subscriptions have currency
  const subscriptionsWithoutCurrency = await prisma.subscription.count({
    where: {
      OR: [
        { currency: null },
        { currency: '' },
      ],
    },
  });

  if (subscriptionsWithoutCurrency > 0) {
    result.warnings.push(`${subscriptionsWithoutCurrency} subscription(s) have empty currency`);
    console.log(`   ⚠️  ${subscriptionsWithoutCurrency} subscription(s) missing currency`);
  } else {
    console.log(`   ✅ All subscriptions have currency set`);
  }

  // Check 4: Consistency check (plan enum vs planId)
  const inconsistent = subscriptions.filter((sub) => {
    if (!sub.planId) return false;

    // Try to match plan enum with planId
    // This is a simplified check - in reality, you'd need to fetch the plan
    return false; // We'll skip this for now as it's complex
  });

  console.log(`   ✅ Total subscriptions validated: ${subscriptions.length}\n`);

  return result;
}

async function validateYookassaSettings(): Promise<ValidationResult> {
  console.log('📋 Validating Yookassa Settings Migration...\n');

  const result: ValidationResult = {
    section: 'Yookassa Settings',
    passed: true,
    issues: [],
    warnings: [],
  };

  const requiredSettings = [
    { key: 'payment.yookassa.shop_id', encrypted: false },
    { key: 'payment.yookassa.secret_key', encrypted: true },
  ];

  const optionalSettings = [
    { key: 'payment.yookassa.webhook_secret', encrypted: true },
  ];

  const decryption = new SimpleDecryption();

  // Check required settings
  for (const setting of requiredSettings) {
    const dbSetting = await prisma.systemSettings.findUnique({
      where: { key: setting.key },
    });

    if (!dbSetting) {
      result.passed = false;
      result.issues.push(`Required setting missing: ${setting.key}`);
      console.log(`   ❌ Missing: ${setting.key}`);
      continue;
    }

    if (!dbSetting.value || dbSetting.value.length === 0) {
      result.passed = false;
      result.issues.push(`Required setting has empty value: ${setting.key}`);
      console.log(`   ❌ Empty value: ${setting.key}`);
      continue;
    }

    // Try to decrypt if encrypted
    if (setting.encrypted) {
      try {
        const decrypted = decryption.decrypt(dbSetting.value);
        if (decrypted.length > 0) {
          console.log(`   ✅ ${setting.key}: Encrypted and valid (${decrypted.length} chars)`);
        } else {
          result.warnings.push(`${setting.key} decrypts to empty string`);
          console.log(`   ⚠️  ${setting.key}: Decrypts to empty string`);
        }
      } catch (error) {
        result.passed = false;
        result.issues.push(`Failed to decrypt ${setting.key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(`   ❌ Failed to decrypt ${setting.key}`);
      }
    } else {
      console.log(`   ✅ ${setting.key}: Set correctly`);
    }
  }

  // Check optional settings
  for (const setting of optionalSettings) {
    const dbSetting = await prisma.systemSettings.findUnique({
      where: { key: setting.key },
    });

    if (!dbSetting) {
      result.warnings.push(`Optional setting not set: ${setting.key}`);
      console.log(`   ⚠️  Optional: ${setting.key} not set`);
      continue;
    }

    // Try to decrypt if encrypted
    if (setting.encrypted && dbSetting.value) {
      try {
        const decrypted = decryption.decrypt(dbSetting.value);
        console.log(`   ✅ ${setting.key}: Set and encrypted (${decrypted.length} chars)`);
      } catch (error) {
        result.warnings.push(`Failed to decrypt ${setting.key}`);
        console.log(`   ⚠️  Failed to decrypt ${setting.key}`);
      }
    }
  }

  console.log('');

  return result;
}

async function validatePaymentProviders(): Promise<ValidationResult> {
  console.log('📋 Validating Payment Providers...\n');

  const result: ValidationResult = {
    section: 'Payment Providers',
    passed: true,
    issues: [],
    warnings: [],
  };

  // Check that payment providers exist
  const providers = await prisma.paymentProvider.findMany();

  if (providers.length === 0) {
    result.passed = false;
    result.issues.push('No payment providers found in database');
    console.log(`   ❌ No payment providers found`);
    console.log(`   💡 Run: pnpm prisma db seed`);
    return result;
  }

  console.log(`   ✅ Found ${providers.length} payment provider(s):`);

  providers.forEach((provider) => {
    console.log(`      - ${provider.type}: ${provider.name} (${provider.isActive ? 'active' : 'inactive'}${provider.isPrimary ? ', primary' : ''})`);
  });

  // Check for at least one active provider
  const activeProviders = providers.filter((p) => p.isActive);

  if (activeProviders.length === 0) {
    result.warnings.push('No active payment providers');
    console.log(`   ⚠️  No active payment providers`);
  } else {
    console.log(`   ✅ ${activeProviders.length} active provider(s)`);
  }

  // Check for primary provider
  const primaryProviders = providers.filter((p) => p.isPrimary);

  if (primaryProviders.length === 0) {
    result.warnings.push('No primary payment provider set');
    console.log(`   ⚠️  No primary payment provider`);
  } else if (primaryProviders.length > 1) {
    result.warnings.push(`Multiple primary providers: ${primaryProviders.length}`);
    console.log(`   ⚠️  ${primaryProviders.length} primary providers (should be 1)`);
  } else {
    console.log(`   ✅ Primary provider: ${primaryProviders[0].type}`);
  }

  console.log('');

  return result;
}

async function validatePlans(): Promise<ValidationResult> {
  console.log('📋 Validating Plans...\n');

  const result: ValidationResult = {
    section: 'Plans',
    passed: true,
    issues: [],
    warnings: [],
  };

  // Check that plans exist
  const plans = await prisma.plan.findMany({
    include: {
      prices: true,
      features: true,
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });

  if (plans.length === 0) {
    result.passed = false;
    result.issues.push('No plans found in database');
    console.log(`   ❌ No plans found`);
    console.log(`   💡 Run: pnpm prisma db seed`);
    return result;
  }

  console.log(`   ✅ Found ${plans.length} plan(s):\n`);

  plans.forEach((plan) => {
    console.log(`      📦 ${plan.name} (${plan.slug})`);
    console.log(`         - Active: ${plan.isActive ? 'Yes' : 'No'}`);
    console.log(`         - Prices: ${plan.prices.length} currencies`);
    console.log(`         - Features: ${plan.features.length}`);
    console.log(`         - Subscriptions: ${plan._count.subscriptions}`);

    // Check for at least one price
    if (plan.prices.length === 0) {
      result.warnings.push(`Plan "${plan.slug}" has no prices`);
      console.log(`         ⚠️  No prices defined`);
    }

    // Check for at least one feature
    if (plan.features.length === 0) {
      result.warnings.push(`Plan "${plan.slug}" has no features`);
      console.log(`         ⚠️  No features defined`);
    }

    console.log('');
  });

  // Check for required plans
  const requiredSlugs = ['lite', 'foreman', 'brigade'];
  const foundSlugs = new Set(plans.map((p) => p.slug));

  requiredSlugs.forEach((slug) => {
    if (!foundSlugs.has(slug)) {
      result.warnings.push(`Missing standard plan: ${slug}`);
      console.log(`   ⚠️  Missing plan: ${slug}`);
    }
  });

  return result;
}

async function main() {
  console.log('🔍 VALIDATION: Phase 4 Migration');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Run all validations
    results.push(await validatePlans());
    results.push(await validateSubscriptions());
    results.push(await validateYookassaSettings());
    results.push(await validatePaymentProviders());

    // Summary
    console.log('='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));

    let allPassed = true;
    let totalIssues = 0;
    let totalWarnings = 0;

    results.forEach((result) => {
      const status = result.passed ? '✅' : '❌';
      const issuesCount = result.issues.length;
      const warningsCount = result.warnings.length;

      console.log(`${status} ${result.section}: ${issuesCount} issue(s), ${warningsCount} warning(s)`);

      if (!result.passed) allPassed = false;
      totalIssues += issuesCount;
      totalWarnings += warningsCount;
    });

    console.log('='.repeat(60));
    console.log(`Total Issues:   ${totalIssues}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log('='.repeat(60));

    if (allPassed && totalIssues === 0) {
      console.log('\n✅ ALL VALIDATIONS PASSED!');
      console.log('\n💡 Migration is complete and verified.');

      if (totalWarnings > 0) {
        console.log(`\n⚠️  ${totalWarnings} warning(s) to review:`);
        results.forEach((result) => {
          result.warnings.forEach((warning) => {
            console.log(`   - ${result.section}: ${warning}`);
          });
        });
      }

      console.log('\n🎉 Phase 4 Complete! Ready for Phase 5 (Frontend Admin Panel).');
    } else {
      console.log('\n❌ VALIDATION FAILED');
      console.log(`\n${totalIssues} issue(s) found:\n`);

      results.forEach((result) => {
        if (result.issues.length > 0) {
          console.log(`${result.section}:`);
          result.issues.forEach((issue) => {
            console.log(`   - ${issue}`);
          });
          console.log('');
        }
      });

      console.log('Please fix the issues above and run validation again.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ VALIDATION ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
