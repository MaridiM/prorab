/**
 * Verification script for Stage 13 + 14 deployment
 */

import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  user: process.env.POSTGRES_USER || 'prorab',
  password: process.env.POSTGRES_PASSWORD || 'prorab',
  database: process.env.POSTGRES_DATABASE || 'prorab',
})

async function verify() {
  const client = await pool.connect()

  try {
    console.log('🔍 Verifying Stage 13 + 14 deployment...\n')

    // ===== STAGE 14 VERIFICATION =====
    console.log('📋 STAGE 14: Role System Normalization')
    console.log('─'.repeat(60))

    // Check BusinessRole enum
    const businessRoleEnum = await client.query(`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = '"BusinessRole"'::regtype
      ORDER BY enumsortorder
    `)
    console.log('✅ BusinessRole enum values:', businessRoleEnum.rows.map(r => r.enumlabel).join(', '))

    // Check TeamRole enum
    const teamRoleEnum = await client.query(`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = '"TeamRole"'::regtype
      ORDER BY enumsortorder
    `)
    console.log('✅ TeamRole enum values:', teamRoleEnum.rows.map(r => r.enumlabel).join(', '))

    // Check user business roles
    const userRoles = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN business_role = 'FOREMAN' THEN 1 END) as foremen,
        COUNT(CASE WHEN business_role = 'WORKER' THEN 1 END) as workers,
        COUNT(CASE WHEN business_role IS NULL THEN 1 END) as no_role
      FROM users
    `)
    const ur = userRoles.rows[0]
    console.log(`✅ User BusinessRoles: ${ur.foremen} FOREMAN, ${ur.workers} WORKER, ${ur.no_role} unassigned (${ur.total} total)`)

    // Check team member roles
    const memberRoles = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'OWNER' THEN 1 END) as owners,
        COUNT(CASE WHEN role = 'MEMBER' THEN 1 END) as members
      FROM team_members
    `)
    const mr = memberRoles.rows[0]
    console.log(`✅ TeamMember Roles: ${mr.owners} OWNER, ${mr.members} MEMBER (${mr.total} total)`)

    // Check for conflicts
    const conflicts = await client.query(`
      SELECT COUNT(*) as count FROM users u
      WHERE u.business_role = 'FOREMAN'
      AND EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = u.id AND tm.role = 'MEMBER'
        AND tm.team_id NOT IN (SELECT id FROM teams WHERE owner_id = u.id)
      )
    `)
    const conflictCount = parseInt(conflicts.rows[0].count)
    if (conflictCount === 0) {
      console.log('✅ No role conflicts detected')
    } else {
      console.log(`⚠️  WARNING: ${conflictCount} users have conflicting roles!`)
    }

    // ===== STAGE 13 VERIFICATION =====
    console.log('\n📋 STAGE 13: RBAC System')
    console.log('─'.repeat(60))

    // Check admin_roles table exists
    const adminRolesTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'admin_roles'
      )
    `)
    console.log('✅ admin_roles table exists:', adminRolesTable.rows[0].exists)

    // Check admin roles
    const adminRoles = await client.query(`
      SELECT
        ar.role,
        u.email,
        array_length(ar.permissions, 1) as permission_count,
        ar.two_factor_enforced as requires_2fa
      FROM admin_roles ar
      JOIN users u ON u.id = ar.user_id
      ORDER BY
        CASE ar.role
          WHEN 'SUPER_ADMIN' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'MODERATOR' THEN 3
          WHEN 'SUPPORT' THEN 4
          ELSE 5
        END
    `)

    if (adminRoles.rows.length === 0) {
      console.log('⚠️  WARNING: No admin roles found!')
    } else {
      console.log(`✅ Admin roles found: ${adminRoles.rows.length}`)
      adminRoles.rows.forEach(role => {
        console.log(`   - ${role.email}: ${role.role} (${role.permission_count} permissions${role.requires_2fa ? ', 2FA required' : ''})`)
      })
    }

    // Check for expected admin accounts
    const expectedAdmins = ['superadmin@prorab.app', 'admin@prorab.app', 'moderator@prorab.app', 'support@prorab.app']
    const missingAdmins = []

    for (const email of expectedAdmins) {
      const found = adminRoles.rows.find(r => r.email === email)
      if (!found) {
        missingAdmins.push(email)
      }
    }

    if (missingAdmins.length > 0) {
      console.log(`⚠️  WARNING: Missing admin accounts: ${missingAdmins.join(', ')}`)
    } else {
      console.log('✅ All expected admin accounts present')
    }

    // ===== SUMMARY =====
    console.log('\n' + '═'.repeat(60))
    console.log('📊 DEPLOYMENT VERIFICATION SUMMARY')
    console.log('═'.repeat(60))

    const allChecks = [
      businessRoleEnum.rows.length === 2,
      teamRoleEnum.rows.length === 2,
      parseInt(ur.total) > 0,
      conflictCount === 0,
      adminRolesTable.rows[0].exists,
      adminRoles.rows.length >= 4,
      missingAdmins.length === 0
    ]

    const passedChecks = allChecks.filter(Boolean).length
    const totalChecks = allChecks.length

    console.log(`\n✅ Passed: ${passedChecks}/${totalChecks} checks`)

    if (passedChecks === totalChecks) {
      console.log('\n🎉 DEPLOYMENT VERIFIED SUCCESSFULLY!')
      console.log('   Both Stage 13 and Stage 14 are ready for production.')
    } else {
      console.log('\n⚠️  DEPLOYMENT HAS ISSUES')
      console.log('   Please review the warnings above.')
    }

    console.log('\n📝 Next steps:')
    console.log('   1. Start development server: pnpm dev')
    console.log('   2. Test admin panel: http://localhost:3000/admin')
    console.log('   3. Login as: superadmin@prorab.app / super123456')
    console.log('   4. Test RBAC: Navigate to /admin/roles')
    console.log('   5. Test role system: Create/join teams as different users')

  } catch (error) {
    console.error('\n❌ Verification failed:', (error as Error).message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

verify().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
