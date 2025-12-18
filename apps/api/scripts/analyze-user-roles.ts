/**
 * Script to analyze current user role distribution
 *
 * This script checks:
 * 1. How many users own teams
 * 2. How many users are only members
 * 3. How many users have BOTH roles (conflict cases)
 * 4. How many users have no team association yet
 *
 * Run from API directory: cd apps/api && node -r esbuild-register scripts/analyze-user-roles.ts
 * Or: cd apps/api && pnpm exec ts-node scripts/analyze-user-roles.ts
 */

import { PrismaService } from '../src/prisma.service';

const prisma = new PrismaService();

interface UserRoleAnalysis {
  userId: string;
  email: string;
  fullName: string;
  ownedTeamsCount: number;
  memberTeamsCount: number;
  suggestedRole: 'FOREMAN' | 'WORKER' | 'NONE' | 'CONFLICT';
  details: string;
}

async function analyzeUserRoles() {
  console.log('🔍 Analyzing user role distribution...\n');

  // Fetch all users with their team relationships
  const users = await prisma.user.findMany({
    include: {
      ownedTeams: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
      teamMemberships: {
        where: {
          role: 'member', // Only count actual worker memberships
        },
        select: {
          id: true,
          teamId: true,
          role: true,
          joinedAt: true,
          team: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const analysis: UserRoleAnalysis[] = [];
  const stats = {
    total: users.length,
    foremen: 0,
    workers: 0,
    none: 0,
    conflicts: 0,
  };

  for (const user of users) {
    const ownedCount = user.ownedTeams.length;
    const memberCount = user.teamMemberships.length;

    let suggestedRole: UserRoleAnalysis['suggestedRole'] = 'NONE';
    let details = '';

    if (ownedCount > 0 && memberCount > 0) {
      // CONFLICT: User owns teams AND is member of other teams
      suggestedRole = 'CONFLICT';
      stats.conflicts++;
      details = `Owns ${ownedCount} team(s), member of ${memberCount} team(s) - NEEDS RESOLUTION`;
    } else if (ownedCount > 0) {
      // User owns team(s) - should be FOREMAN
      suggestedRole = 'FOREMAN';
      stats.foremen++;
      details = `Owns ${ownedCount} team(s)`;
    } else if (memberCount > 0) {
      // User is only a member - should be WORKER
      suggestedRole = 'WORKER';
      stats.workers++;
      details = `Member of ${memberCount} team(s)`;
    } else {
      // User has no team association yet
      suggestedRole = 'NONE';
      stats.none++;
      details = 'No team associations';
    }

    analysis.push({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      ownedTeamsCount: ownedCount,
      memberTeamsCount: memberCount,
      suggestedRole,
      details,
    });
  }

  // Print summary statistics
  console.log('📊 SUMMARY STATISTICS:');
  console.log('═'.repeat(60));
  console.log(`Total Users:           ${stats.total}`);
  console.log(`  └─ Foremen (owners): ${stats.foremen} (${((stats.foremen / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  └─ Workers (members): ${stats.workers} (${((stats.workers / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  └─ No role yet:       ${stats.none} (${((stats.none / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  └─ ⚠️  CONFLICTS:      ${stats.conflicts} (${((stats.conflicts / stats.total) * 100).toFixed(1)}%)`);
  console.log('═'.repeat(60));
  console.log();

  // Show conflict cases (most important)
  if (stats.conflicts > 0) {
    console.log('⚠️  CONFLICT CASES (Users with BOTH roles):');
    console.log('─'.repeat(60));
    const conflicts = analysis.filter((a) => a.suggestedRole === 'CONFLICT');
    for (const user of conflicts) {
      console.log(`📧 ${user.email} (${user.fullName})`);
      console.log(`   Owns: ${user.ownedTeamsCount} team(s)`);
      console.log(`   Member: ${user.memberTeamsCount} team(s)`);
      console.log(`   ⚠️  Requires manual resolution`);
      console.log();
    }
  }

  // Show foremen
  if (stats.foremen > 0) {
    console.log('👷 FOREMEN (Team Owners):');
    console.log('─'.repeat(60));
    const foremen = analysis.filter((a) => a.suggestedRole === 'FOREMAN');
    for (const user of foremen.slice(0, 5)) {
      // Show first 5
      console.log(`📧 ${user.email} - Owns ${user.ownedTeamsCount} team(s)`);
    }
    if (foremen.length > 5) {
      console.log(`   ... and ${foremen.length - 5} more`);
    }
    console.log();
  }

  // Show workers
  if (stats.workers > 0) {
    console.log('🔧 WORKERS (Team Members):');
    console.log('─'.repeat(60));
    const workers = analysis.filter((a) => a.suggestedRole === 'WORKER');
    for (const user of workers.slice(0, 5)) {
      // Show first 5
      console.log(`📧 ${user.email} - Member of ${user.memberTeamsCount} team(s)`);
    }
    if (workers.length > 5) {
      console.log(`   ... and ${workers.length - 5} more`);
    }
    console.log();
  }

  // Show users with no role
  if (stats.none > 0) {
    console.log('👤 USERS WITHOUT TEAMS:');
    console.log('─'.repeat(60));
    const noRole = analysis.filter((a) => a.suggestedRole === 'NONE');
    console.log(`${noRole.length} users have not created or joined any teams yet`);
    console.log('(These will stay as NONE until they take action)');
    console.log();
  }

  // Generate recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('═'.repeat(60));

  if (stats.conflicts === 0) {
    console.log('✅ No conflicts found! Safe to implement role constraint.');
    console.log('   All users are either foremen OR workers, not both.');
  } else {
    console.log('⚠️  ACTION REQUIRED: Found conflict cases.');
    console.log('   Before implementing constraints:');
    console.log('   1. Contact conflicted users');
    console.log('   2. Ask them to choose: remain foreman OR become worker');
    console.log('   3. Manually update their data');
    console.log('   4. Re-run this script to verify');
  }

  console.log();
  console.log('📋 NEXT STEPS:');
  console.log('   1. Review conflict cases above');
  console.log('   2. Run migration: npx prisma migrate dev --name add_user_role_field');
  console.log('   3. Run data migration: npx tsx apps/api/scripts/migrate-user-roles.ts');
  console.log('   4. Deploy validation logic in teams.service.ts');
  console.log('═'.repeat(60));

  // Export detailed report to JSON
  const report = {
    timestamp: new Date().toISOString(),
    statistics: stats,
    users: analysis,
  };

  const fs = await import('fs/promises');
  await fs.writeFile(
    'apps/api/scripts/user-role-analysis-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 Detailed report saved to: apps/api/scripts/user-role-analysis-report.json');

  await prisma.$disconnect();
  process.exit(0);
}

analyzeUserRoles()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
