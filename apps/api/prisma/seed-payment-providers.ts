import { PrismaClient, PaymentProviderType } from './generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '../../.env' })
dotenv.config()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set')
  process.exit(1)
}

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedPaymentProviders() {
  console.log('🔧 Seeding payment providers...');

  try {
    // Check if providers already exist
    const existingProviders = await prisma.paymentProvider.findMany();

    if (existingProviders.length > 0) {
      console.log(`✅ Found ${existingProviders.length} existing providers:`);
      existingProviders.forEach((p) => {
        console.log(`   - ${p.name} (${p.type}): ${p.isActive ? '✅ Active' : '❌ Inactive'} ${p.isPrimary ? '⭐ Primary' : ''}`);
      });

      // Update providers to ensure at least one is active and primary
      const yookassa = existingProviders.find(p => p.type === PaymentProviderType.YOOKASSA);
      const stripe = existingProviders.find(p => p.type === PaymentProviderType.STRIPE);

      // Make Stripe primary if it exists, otherwise Yookassa
      if (stripe) {
        await prisma.paymentProvider.update({
          where: { id: stripe.id },
          data: { isActive: true, isPrimary: true },
        });
        console.log('✅ Updated Stripe to be active and primary');

        if (yookassa) {
          await prisma.paymentProvider.update({
            where: { id: yookassa.id },
            data: { isActive: true, isPrimary: false },
          });
          console.log('✅ Updated Yookassa to be active (secondary)');
        }
      } else if (yookassa) {
        await prisma.paymentProvider.update({
          where: { id: yookassa.id },
          data: { isActive: true, isPrimary: true },
        });
        console.log('✅ Updated Yookassa to be active and primary');
      }

      return;
    }

    // Create default payment providers
    console.log('📝 Creating default payment providers...');

    // 1. Stripe (Primary - for international)
    const stripe = await prisma.paymentProvider.create({
      data: {
        type: PaymentProviderType.STRIPE,
        name: 'Stripe',
        isActive: true,
        isPrimary: true, // Primary provider
      },
    });
    console.log(`✅ Created: ${stripe.name} (Primary)`);

    // 2. Yookassa (Secondary - for CIS countries)
    const yookassa = await prisma.paymentProvider.create({
      data: {
        type: PaymentProviderType.YOOKASSA,
        name: 'ЮKassa',
        isActive: true,
        isPrimary: false,
      },
    });
    console.log(`✅ Created: ${yookassa.name} (Secondary)`);

    console.log('\n🎉 Payment providers seeded successfully!');
    console.log('   - Stripe: Active, Primary (for Ukraine, Europe, USA)');
    console.log('   - Yookassa: Active, Secondary (for Russia, Belarus, CIS)');
    console.log('\n💡 Auto-selection by IP will work now!');
  } catch (error) {
    console.error('❌ Error seeding payment providers:', error);
    throw error;
  } finally {
    await pool.end()
    await prisma.$disconnect();
  }
}

seedPaymentProviders()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
