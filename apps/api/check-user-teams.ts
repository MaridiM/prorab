import { PrismaClient } from './prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkUserTeams() {
  try {
    // Find user by email (replace with your test user email)
    const userEmail = 'demo@prorab.app'  // Change this!

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        teamMemberships: {
          include: {
            team: true,
          },
        },
      },
    })

    // Get subscriptions separately
    const subscriptions = await prisma.subscription.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: user?.id,
            },
          },
        },
      },
      include: {
        planRef: true,  // plan is a scalar field, planRef is the relation
      },
    })

    if (!user) {
      console.log(`❌ User not found: ${userEmail}`)
      console.log('   Please update email in check-user-teams.ts')
      return
    }

    console.log('\n👤 User Info:\n')
    console.log('━'.repeat(60))
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.firstName || ''} ${user.lastName || ''}`)
    console.log(`ID: ${user.id}`)
    console.log()

    console.log(`📋 Teams (${user.teamMemberships.length}):\n`)
    if (user.teamMemberships.length === 0) {
      console.log('   ❌ No teams found!')
      console.log('   Create a team first: Settings → Teams → Create Team')
    } else {
      user.teamMemberships.forEach((member, i) => {
        console.log(`${i + 1}. ${member.team.name}`)
        console.log(`   Role: ${member.role}`)
        console.log(`   Team ID: ${member.team.id}`)
      })
    }
    console.log()

    console.log(`💳 Subscriptions (${subscriptions.length}):\n`)
    if (subscriptions.length === 0) {
      console.log('   ℹ️  No active subscriptions')
    } else {
      subscriptions.forEach((sub, i) => {
        console.log(`${i + 1}. ${sub.planRef?.name || 'Unknown Plan'}`)
        console.log(`   Status: ${sub.status}`)
        console.log(`   Team ID: ${sub.teamId}`)
        console.log(`   Created: ${sub.createdAt.toISOString()}`)
      })
    }

    console.log('━'.repeat(60))

    if (user.teamMemberships.length === 0) {
      console.log('\n⚠️  ACTION REQUIRED:')
      console.log('   User has no teams! Create a team first.')
      console.log('   Go to: http://localhost:3000/teams → Create Team')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
    await prisma.$disconnect()
  }
}

checkUserTeams()
