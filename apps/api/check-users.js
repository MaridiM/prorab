const { PrismaClient } = require('@prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('Total users in database:', userCount);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          fullName: true,
          emailVerified: true,
          adminRole: {
            select: {
              role: true
            }
          }
        }
      });
      console.log('\nFirst 5 users:');
      users.forEach(u => {
        console.log('  - ' + u.email + ' (' + (u.fullName || 'No name') + ') - Admin: ' + (u.adminRole ? u.adminRole.role : 'No'));
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
