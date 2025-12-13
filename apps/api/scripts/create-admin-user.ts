import { PrismaClient } from '@prisma/generated/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n🔐 Admin User Setup\n');

    // Get user email
    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email');
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { emailNormalized: email.toLowerCase() },
    });

    if (!existingUser) {
      console.error('❌ User not found. Please register first via normal signup.');
      process.exit(1);
    }

    // Check if already admin
    const existingAdmin = await prisma.adminRole.findUnique({
      where: { userId: existingUser.id },
    });

    if (existingAdmin) {
      console.log(`\n⚠️  User is already an admin with role: ${existingAdmin.role}`);
      const confirm = await question('Update role? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('Aborted.');
        process.exit(0);
      }
    }

    // Select role
    console.log('\nAvailable roles:');
    console.log('1. SUPER_ADMIN (full system access)');
    console.log('2. ADMIN (most admin features)');
    console.log('3. MODERATOR (content moderation, user support)');
    console.log('4. SUPPORT (user support only)');

    const roleChoice = await question('\nSelect role (1-4): ');
    const roles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'];
    const roleIndex = parseInt(roleChoice) - 1;

    if (roleIndex < 0 || roleIndex > 3) {
      console.error('❌ Invalid role selection');
      process.exit(1);
    }

    const selectedRole = roles[roleIndex];

    // Get permissions based on role
    const { RolePermissions } = await import('../src/shared/constants/admin-permissions');
    const permissions = RolePermissions[selectedRole];

    // Create or update admin role
    const adminRole = existingAdmin
      ? await prisma.adminRole.update({
          where: { userId: existingUser.id },
          data: {
            role: selectedRole as any,
            permissions: permissions as string[],
          },
        })
      : await prisma.adminRole.create({
          data: {
            userId: existingUser.id,
            role: selectedRole as any,
            permissions: permissions as string[],
            twoFactorEnforced: true,
            ipWhitelist: [],
          },
        });

    console.log('\n✅ Admin role created successfully!');
    console.log(`\n📧 Email: ${email}`);
    console.log(`👤 User ID: ${existingUser.id}`);
    console.log(`🔑 Role: ${adminRole.role}`);
    console.log(`📜 Permissions: ${adminRole.permissions.length} permissions`);
    console.log(`🔐 2FA Enforced: ${adminRole.twoFactorEnforced}`);

    if (!existingUser.twoFactorEnabled && adminRole.twoFactorEnforced) {
      console.log('\n⚠️  WARNING: 2FA is enforced but not enabled for this user.');
      console.log('   Please enable 2FA before using admin features.');
    }

    console.log('\n✨ Done!\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdminUser();
