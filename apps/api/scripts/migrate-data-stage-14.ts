/**
 * Stage 14: Data Migration
 * Migrates existing team_members.role to TeamRole enum
 * Assigns BusinessRole to existing users
 */

import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  user: process.env.POSTGRES_USER || 'prorab',
  password: process.env.POSTGRES_PASSWORD || 'prorab',
  database: process.env.POSTGRES_DATABASE || 'prorab',
})

async function migrateData() {
  const client = await pool.connect()

  try {
    console.log('🚀 Starting Stage 14 data migration...')
    console.log(`📊 Database: ${process.env.POSTGRES_DATABASE || 'prorab'} @ ${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5433'}\n`)

    await client.query('BEGIN')

    // STEP 1: Check if TeamMember.role is already enum
    console.log('📋 Step 1: Checking TeamMember.role column type...')
    const roleColumnCheck = await client.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'team_members' AND column_name = 'role'
    `)

    const currentType = roleColumnCheck.rows[0]?.data_type
    console.log(`   Current type: ${currentType}`)

    if (currentType === 'USER-DEFINED') {
      console.log('   ✅ TeamMember.role is already enum type, skipping conversion')
    } else if (currentType === 'character varying') {
      console.log('   🔄 Converting TeamMember.role from String to Enum...')

      // Add temporary column
      await client.query(`ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "role_new" "TeamRole"`)

      // Migrate data
      await client.query(`
        UPDATE "team_members" SET "role_new" =
          CASE
            WHEN LOWER("role") = 'owner' THEN 'OWNER'::"TeamRole"
            WHEN LOWER("role") = 'member' THEN 'MEMBER'::"TeamRole"
            ELSE 'MEMBER'::"TeamRole"
          END
        WHERE "role_new" IS NULL
      `)

      // Verify no NULLs
      const nullCheck = await client.query(`SELECT COUNT(*) FROM "team_members" WHERE "role_new" IS NULL`)
      const nullCount = parseInt(nullCheck.rows[0].count)

      if (nullCount > 0) {
        throw new Error(`❌ ${nullCount} team_members have NULL role_new`)
      }

      console.log(`   ✅ Migrated ${roleColumnCheck.rowCount} team_members`)

      // Drop old column and rename
      await client.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "role"`)
      await client.query(`ALTER TABLE "team_members" RENAME COLUMN "role_new" TO "role"`)
      await client.query(`ALTER TABLE "team_members" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"TeamRole"`)
      await client.query(`ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL`)

      console.log('   ✅ TeamMember.role converted to enum')
    }

    // STEP 2: Assign businessRole to team owners
    console.log('\n📋 Step 2: Assigning FOREMAN role to team owners...')
    const foremenResult = await client.query(`
      UPDATE "users" u
      SET
        "business_role" = 'FOREMAN'::"BusinessRole",
        "business_role_assigned_at" = NOW()
      WHERE EXISTS (
        SELECT 1 FROM "teams" t WHERE t."owner_id" = u.id
      )
      AND "business_role" IS NULL
      RETURNING id
    `)
    console.log(`   ✅ Assigned FOREMAN to ${foremenResult.rowCount} users`)

    // STEP 3: Assign businessRole to team members (non-owners)
    console.log('\n📋 Step 3: Assigning WORKER role to team members...')
    const workersResult = await client.query(`
      UPDATE "users" u
      SET
        "business_role" = 'WORKER'::"BusinessRole",
        "business_role_assigned_at" = NOW()
      WHERE EXISTS (
        SELECT 1 FROM "team_members" tm
        WHERE tm."user_id" = u.id AND tm."role" = 'MEMBER'::"TeamRole"
      )
      AND NOT EXISTS (
        SELECT 1 FROM "teams" t WHERE t."owner_id" = u.id
      )
      AND "business_role" IS NULL
      RETURNING id
    `)
    console.log(`   ✅ Assigned WORKER to ${workersResult.rowCount} users`)

    // STEP 4: Handle conflicts (users who own teams AND are members elsewhere)
    console.log('\n📋 Step 4: Resolving conflicts...')
    const conflictsResult = await client.query(`
      WITH conflict_users AS (
        SELECT DISTINCT u.id
        FROM "users" u
        INNER JOIN "teams" t ON t."owner_id" = u.id
        INNER JOIN "team_members" tm ON tm."user_id" = u.id
          AND tm."team_id" != t.id
          AND tm."role" = 'MEMBER'::"TeamRole"
      )
      UPDATE "users" u
      SET
        "business_role" = 'FOREMAN'::"BusinessRole",
        "business_role_assigned_at" = NOW()
      FROM conflict_users cu
      WHERE u.id = cu.id
      RETURNING u.id
    `)
    console.log(`   ⚠️  Resolved ${conflictsResult.rowCount} conflicts (kept as FOREMAN)`)

    // STEP 5: Clean up conflicting memberships
    console.log('\n📋 Step 5: Cleaning up conflicting memberships...')
    const cleanupResult = await client.query(`
      DELETE FROM "team_members" tm
      WHERE tm."user_id" IN (
        SELECT u.id FROM "users" u WHERE u."business_role" = 'FOREMAN'::"BusinessRole"
      )
      AND tm."role" = 'MEMBER'::"TeamRole"
      AND tm."team_id" NOT IN (
        SELECT t.id FROM "teams" t WHERE t."owner_id" = tm."user_id"
      )
    `)
    console.log(`   🧹 Removed ${cleanupResult.rowCount} conflicting memberships`)

    // STEP 6: Create index
    console.log('\n📋 Step 6: Creating index...')
    await client.query(`CREATE INDEX IF NOT EXISTS "users_business_role_idx" ON "users"("business_role")`)
    console.log('   ✅ Created index on users.business_role')

    // STEP 7: Verify final state
    console.log('\n📋 Step 7: Verifying final state...')

    const userStats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "business_role" = 'FOREMAN' THEN 1 END) as foremen,
        COUNT(CASE WHEN "business_role" = 'WORKER' THEN 1 END) as workers,
        COUNT(CASE WHEN "business_role" IS NULL THEN 1 END) as no_role
      FROM "users"
    `)

    const memberStats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "role" = 'OWNER' THEN 1 END) as owners,
        COUNT(CASE WHEN "role" = 'MEMBER' THEN 1 END) as members
      FROM "team_members"
    `)

    const users = userStats.rows[0]
    const members = memberStats.rows[0]

    console.log('\n============================================================')
    console.log('✅ MIGRATION COMPLETE - Final State:')
    console.log('============================================================')
    console.log('USER BUSINESS ROLES:')
    console.log(`  Total users:    ${users.total}`)
    console.log(`  FOREMAN:        ${users.foremen} (${users.total > 0 ? ((parseInt(users.foremen) / parseInt(users.total)) * 100).toFixed(1) : 0}%)`)
    console.log(`  WORKER:         ${users.workers} (${users.total > 0 ? ((parseInt(users.workers) / parseInt(users.total)) * 100).toFixed(1) : 0}%)`)
    console.log(`  No role yet:    ${users.no_role} (${users.total > 0 ? ((parseInt(users.no_role) / parseInt(users.total)) * 100).toFixed(1) : 0}%)`)
    console.log('')
    console.log('TEAM MEMBER ROLES:')
    console.log(`  Total members:  ${members.total}`)
    console.log(`  OWNER:          ${members.owners} (${members.total > 0 ? ((parseInt(members.owners) / parseInt(members.total)) * 100).toFixed(1) : 0}%)`)
    console.log(`  MEMBER:         ${members.members} (${members.total > 0 ? ((parseInt(members.members) / parseInt(members.total)) * 100).toFixed(1) : 0}%)`)
    console.log('============================================================\n')

    await client.query('COMMIT')

    console.log('✅ Migration transaction committed successfully!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('\n❌ Migration failed! Transaction rolled back.')
    console.error('Error:', (error as Error).message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrateData().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
