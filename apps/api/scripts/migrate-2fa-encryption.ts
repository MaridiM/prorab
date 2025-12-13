/**
 * Migration script to re-encrypt 2FA secrets from base64 to AES-256-GCM
 *
 * This script:
 * 1. Finds all users with 2FA enabled
 * 2. Decrypts their secrets using old base64 method
 * 3. Re-encrypts using new AES-256-GCM method
 * 4. Updates the database
 *
 * Run with: npx ts-node scripts/migrate-2fa-encryption.ts
 */

import { PrismaClient } from '@prisma/generated/client'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
	console.error('❌ ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
	console.error('   Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
	process.exit(1)
}

const encryptionKey = Buffer.from(ENCRYPTION_KEY, 'hex')

/**
 * Decrypt legacy base64-encoded secret
 */
function decryptLegacySecret(encryptedSecret: string): string {
	return Buffer.from(encryptedSecret, 'base64').toString('utf-8')
}

/**
 * Encrypt secret using AES-256-GCM
 */
function encryptSecretAES(secret: string): string {
	const algorithm = 'aes-256-gcm'
	const iv = crypto.randomBytes(16)

	const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv)
	let encrypted = cipher.update(secret, 'utf8', 'hex')
	encrypted += cipher.final('hex')
	const authTag = cipher.getAuthTag()

	// Format: iv:encrypted:authTag (all hex-encoded)
	return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

/**
 * Check if secret is already encrypted with AES-256-GCM
 */
function isAESEncrypted(encryptedSecret: string): boolean {
	return encryptedSecret.includes(':') && encryptedSecret.split(':').length === 3
}

async function migrateTwoFactorEncryption() {
	console.log('🔐 Starting 2FA encryption migration...\n')

	try {
		// Find all users with 2FA enabled
		const usersWithTwoFactor = await prisma.user.findMany({
			where: {
				twoFactorEnabled: true,
				twoFactorSecret: { not: null },
			},
			select: {
				id: true,
				email: true,
				twoFactorSecret: true,
			},
		})

		console.log(`📊 Found ${usersWithTwoFactor.length} users with 2FA enabled\n`)

		if (usersWithTwoFactor.length === 0) {
			console.log('✅ No users to migrate. All done!')
			return
		}

		let migratedCount = 0
		let skippedCount = 0
		let errorCount = 0

		for (const user of usersWithTwoFactor) {
			if (!user.twoFactorSecret) {
				console.log(`⚠️  [${user.email}] No secret found, skipping...`)
				skippedCount++
				continue
			}

			// Check if already migrated
			if (isAESEncrypted(user.twoFactorSecret)) {
				console.log(`✓  [${user.email}] Already encrypted with AES-256-GCM, skipping...`)
				skippedCount++
				continue
			}

			try {
				// Decrypt legacy secret
				const decryptedSecret = decryptLegacySecret(user.twoFactorSecret)

				// Re-encrypt with AES-256-GCM
				const reEncryptedSecret = encryptSecretAES(decryptedSecret)

				// Update database
				await prisma.user.update({
					where: { id: user.id },
					data: { twoFactorSecret: reEncryptedSecret },
				})

				console.log(`✅ [${user.email}] Successfully migrated to AES-256-GCM`)
				migratedCount++
			} catch (error) {
				console.error(`❌ [${user.email}] Migration failed:`, error.message)
				errorCount++
			}
		}

		console.log('\n' + '='.repeat(60))
		console.log('📊 Migration Summary:')
		console.log('='.repeat(60))
		console.log(`✅ Migrated:  ${migratedCount}`)
		console.log(`⚠️  Skipped:   ${skippedCount}`)
		console.log(`❌ Errors:    ${errorCount}`)
		console.log('='.repeat(60))

		if (errorCount > 0) {
			console.log('\n⚠️  Some migrations failed. Please review the errors above.')
			process.exit(1)
		} else {
			console.log('\n🎉 Migration completed successfully!')
		}
	} catch (error) {
		console.error('\n❌ Migration failed:', error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

// Run migration
migrateTwoFactorEncryption()
	.then(() => {
		process.exit(0)
	})
	.catch((error) => {
		console.error('Fatal error:', error)
		process.exit(1)
	})
