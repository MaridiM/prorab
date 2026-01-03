import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';
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

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  try {
    // Disable foreign key checks temporarily (PostgreSQL doesn't support this directly, but we'll use CASCADE)
    console.log('🗑️  Deleting all data from tables...');

    // Get list of all tables that should be truncated
    // We'll check if they exist first
    const tablesToTruncate = [
      'support_messages',
      'support_tickets',
      'faq_entries',
      'work_logs',
      'expenses',
      'tasks',
      'photo_reports',
      'report_photos',
      'project_payouts',
      'team_member_salary_his',
      'role_assignment_histor',
      'team_members',
      'invite_codes',
      'payments',
      'subscriptions',
      'teams',
      'custom_roles',
      'admin_action_logs',
      'login_history',
      'password_reset_tokens',
      'verification_tokens',
      'telegram_auth_tokens',
      'notification_settings',
      'users',
    ];

    // Check which tables exist and truncate only those
    const existingTables: string[] = [];
    for (const table of tablesToTruncate) {
      try {
        const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          ) as exists;
        `;
        if (result[0]?.exists) {
          existingTables.push(table);
        }
      } catch (error) {
        // Table doesn't exist, skip it
        console.log(`⚠️  Table ${table} does not exist, skipping...`);
      }
    }

    if (existingTables.length > 0) {
      // Truncate all existing tables in one command
      const tableList = existingTables.join(', ');
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} CASCADE;`);
      console.log(`✅ Truncated ${existingTables.length} tables: ${tableList}`);
    } else {
      console.log('⚠️  No tables to truncate');
    }

    console.log('✅ All user data deleted');

    // Keep system tables (these are "reserved"):
    // - subscription_plans
    // - plan_prices
    // - plan_features
    // - payment_providers
    // - system_settings
    // - system_statistics
    // - admin_roles (but clear user assignments)
    // - team_templates
    // - team_audit_logs
    // - team_merge_logs

    console.log('✅ Database reset completed');
    console.log('📋 Reserved tables (not deleted):');
    console.log('   - subscription_plans');
    console.log('   - plan_prices');
    console.log('   - plan_features');
    console.log('   - payment_providers');
    console.log('   - system_settings');
    console.log('   - system_statistics');
    console.log('   - admin_roles');
    console.log('   - team_templates');
    console.log('   - team_audit_logs');
    console.log('   - team_merge_logs');
    console.log('   - _prisma_migrations');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetDatabase()
  .then(() => {
    console.log('✨ Database reset completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

