import { Pool } from 'pg'

import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name)
	private readonly pool: Pool
	private readonly databaseUrl: string

	constructor(private readonly configService: ConfigService) {
		// Try ConfigService first (from app.config), then fallback to process.env
		const configUrl = configService.get<string>('databaseUrl')
		const envUrl = process.env.DATABASE_URL
		const databaseUrl = configUrl || envUrl

		// Debug logging
		console.log('[PrismaService] Config DATABASE_URL:', configUrl ? 'SET' : 'NOT SET')
		console.log('[PrismaService] Env DATABASE_URL:', envUrl ? 'SET' : 'NOT SET')

		if (!databaseUrl || typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
			const errorMessage =
				'DATABASE_URL environment variable is not set or is invalid.\n' +
				'Please provide a valid PostgreSQL connection string.\n' +
				'Expected format: postgresql://user:password@host:port/database\n' +
				'Example: postgresql://prorab:prorab@localhost:5433/prorab\n\n' +
				'Create a .env file in the root or apps/api directory with:\n' +
				'DATABASE_URL=postgresql://prorab:prorab@localhost:5433/prorab'
			console.error('❌', errorMessage)
			throw new Error(errorMessage)
		}

		const trimmedUrl = databaseUrl.trim()

		// Validate URL format
		if (!trimmedUrl.startsWith('postgresql://') && !trimmedUrl.startsWith('postgres://')) {
			const errorMessage = `Invalid DATABASE_URL format. Expected postgresql:// or postgres://, got: ${trimmedUrl.substring(0, 20)}...`
			console.error('❌', errorMessage)
			throw new Error(errorMessage)
		}

		// Create pool and adapter before calling super()
		// Ensure connectionString is explicitly set
		const poolConfig = {
			connectionString: trimmedUrl,
		}

		// Double-check connectionString is set
		if (!poolConfig.connectionString) {
			throw new Error('Failed to set connectionString in Pool configuration')
		}

		const pool = new Pool(poolConfig)
		const adapter = new PrismaPg(pool)

		// Call super() before accessing 'this'
		super({ adapter })

		// Now we can safely assign to 'this' properties
		this.pool = pool
		this.databaseUrl = trimmedUrl

		// Log after super() is called
		this.logger.log(`Connecting to database at ${this.maskConnectionString(this.databaseUrl)}`)
	}

	private maskConnectionString(url: string): string {
		try {
			const parsed = new URL(url)
			return `${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}`
		} catch {
			return '***'
		}
	}

	async onModuleInit(): Promise<void> {
		try {
			await this.$connect()
			this.logger.log('✅ Successfully connected to database')
		} catch (error: any) {
			if (error.code === 'ECONNREFUSED' || error.code === 'P1001') {
				this.logger.error('❌ Database connection refused!')
				this.logger.error('Please check:')
				this.logger.error('1. Is PostgreSQL database running?')
				this.logger.error('2. Is DATABASE_URL correctly set in .env file?')
				this.logger.error(`3. Current DATABASE_URL: ${this.maskConnectionString(this.databaseUrl)}`)
				this.logger.error('4. Try connecting manually: psql <your-database-url>')
			}
			// Пробрасываем ошибку дальше, чтобы приложение не запустилось с неработающей БД
			throw error
		}
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect()
		await this.pool.end()
	}

	enableShutdownHooks(app: INestApplication): void {
		app.enableShutdownHooks()
	}
}
