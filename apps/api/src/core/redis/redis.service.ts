import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

interface RedisOptions {
	host: string
	port: number
	password?: string
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name)
	private client: RedisClientType
	private isConnected = false
	private connectionAttempted = false

	constructor(@Inject('REDIS_OPTIONS') private options: RedisOptions) {}

	/**
	 * Check if Redis is currently connected and available
	 */
	isAvailable(): boolean {
		return this.isConnected
	}

	async onModuleInit() {
		this.client = createClient({
			socket: {
				host: this.options.host,
				port: this.options.port,
				reconnectStrategy: (retries) => {
					if (retries > 10) {
						this.logger.warn('Redis reconnection attempts exceeded. Redis features will be unavailable.')
						return false
					}
					return Math.min(retries * 100, 3000)
				},
			},
			...(this.options.password && this.options.password.trim() !== '' && { password: this.options.password }),
		})

		// Only log errors once to avoid spam
		let errorLogged = false
		this.client.on('error', (err) => {
			if (!errorLogged) {
				const errorMsg = err.message || String(err)
				this.logger.error(`Redis connection error: ${errorMsg}`)
				
				// Provide helpful error messages
				if (errorMsg.includes('WRONGPASS') || errorMsg.includes('NOAUTH')) {
					this.logger.warn('Redis authentication failed. Check REDIS_PASSWORD in .env or remove it if Redis has no password.')
				} else if (errorMsg.includes('ECONNREFUSED')) {
					this.logger.warn(`Redis connection refused. Make sure Redis is running on ${this.options.host}:${this.options.port}`)
				} else {
					this.logger.warn('Redis features will be unavailable until connection is established.')
				}
				errorLogged = true
			}
			this.isConnected = false
		})

		this.client.on('connect', () => {
			this.logger.log('Redis connecting...')
		})

		this.client.on('ready', () => {
			this.isConnected = true
			this.logger.log('✅ Redis connected')
			errorLogged = false // Reset error flag on successful connection
		})

		this.client.on('reconnecting', () => {
			this.logger.debug('Redis reconnecting...')
		})

		try {
			await this.client.connect()
			this.connectionAttempted = true
		} catch (error) {
			this.connectionAttempted = true
			const errorMsg = error instanceof Error ? error.message : String(error)
			this.logger.warn(
				`Failed to connect to Redis at ${this.options.host}:${this.options.port}. ` +
				`Error: ${errorMsg}. Redis features will be unavailable.`
			)
			if (errorMsg.includes('WRONGPASS') || errorMsg.includes('NOAUTH')) {
				this.logger.warn('💡 Tip: If Redis has no password, remove REDIS_PASSWORD from .env or set it to empty string.')
			}
			this.isConnected = false
		}
	}

	async onModuleDestroy() {
		if (this.client && this.isConnected) {
			try {
				await this.client.quit()
			} catch (error) {
				this.logger.error('Error disconnecting from Redis', error)
			}
		}
	}

	private ensureConnected(): boolean {
		if (!this.isConnected) {
			this.logger.warn('Redis is not connected. Operation skipped.')
			return false
		}
		return true
	}

	// ==================== Basic Operations ====================

	async get(key: string): Promise<string | null> {
		this.logger.log(`[Redis GET] Key: ${key}, Connected: ${this.isConnected}`)
		if (!this.ensureConnected()) {
			this.logger.warn(`[Redis GET] Not connected, returning null for key: ${key}`)
			return null
		}
		try {
			const result = await this.client.get(key)
			const ttl = await this.client.ttl(key)
			this.logger.log(`[Redis GET] Key: ${key}, Found: ${result ? 'YES' : 'NO'}, TTL: ${ttl}s`)
			if (typeof result === 'string') {
				return result
			}
			return null
		} catch (error) {
			this.logger.error(`Redis get error for key "${key}":`, error)
			return null
		}
	}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		this.logger.log(`[Redis SET] Key: ${key}, TTL: ${ttlSeconds}, Connected: ${this.isConnected}`)
		if (!this.ensureConnected()) {
			this.logger.warn(`[Redis SET] Not connected, skipping set for key: ${key}`)
			return
		}
		try {
			if (ttlSeconds) {
				// Use setEx for setting with expiry (more reliable)
				await this.client.setEx(key, ttlSeconds, value)
				this.logger.log(`[Redis SET] Successfully set key: ${key} with TTL: ${ttlSeconds}s using setEx`)
			} else {
				await this.client.set(key, value)
				this.logger.log(`[Redis SET] Successfully set key: ${key} without TTL`)
			}
			
			// Verify immediately after set
			const verify = await this.client.get(key)
			const ttl = await this.client.ttl(key)
			this.logger.log(`[Redis SET] Verification - Key: ${key}, Found: ${verify ? 'YES' : 'NO'}, TTL: ${ttl}s`)
		} catch (error) {
			this.logger.error(`Redis set error for key "${key}":`, error)
		}
	}

	async del(key: string): Promise<void> {
		if (!this.ensureConnected()) return
		try {
			await this.client.del(key)
		} catch (error) {
			this.logger.error(`Redis del error for key "${key}":`, error)
		}
	}

	async exists(key: string): Promise<boolean> {
		if (!this.ensureConnected()) return false
		try {
			const result = await this.client.exists(key)
			return result === 1
		} catch (error) {
			this.logger.error(`Redis exists error for key "${key}":`, error)
			return false
		}
	}

	// ==================== JSON Operations ====================

	async getJson<T>(key: string): Promise<T | null> {
		const value = await this.get(key)
		if (!value) return null
		try {
			return JSON.parse(value) as T
		} catch {
			return null
		}
	}

	async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
		await this.set(key, JSON.stringify(value), ttlSeconds)
	}

	// ==================== Set Operations ====================

	async sAdd(key: string, value: string): Promise<void> {
		if (!this.ensureConnected()) return
		try {
			await this.client.sAdd(key, value)
		} catch (error) {
			this.logger.error(`Redis sAdd error for key "${key}":`, error)
		}
	}

	async sRem(key: string, value: string): Promise<void> {
		if (!this.ensureConnected()) return
		try {
			await this.client.sRem(key, value)
		} catch (error) {
			this.logger.error(`Redis sRem error for key "${key}":`, error)
		}
	}

	async sMembers(key: string): Promise<string[]> {
		if (!this.ensureConnected()) return []
		try {
			return await this.client.sMembers(key)
		} catch (error) {
			this.logger.error(`Redis sMembers error for key "${key}":`, error)
			return []
		}
	}

	async sIsMember(key: string, value: string): Promise<boolean> {
		if (!this.ensureConnected()) return false
		try {
			const result = await this.client.sIsMember(key, value)
			return Boolean(result)
		} catch (error) {
			this.logger.error(`Redis sIsMember error for key "${key}":`, error)
			return false
		}
	}

	// ==================== Rate Limiting ====================

	async incrementRateLimit(key: string, windowMs: number): Promise<number> {
		if (!this.ensureConnected()) return 0
		try {
			const current = await this.client.incr(key)
			if (current === 1) {
				await this.client.pExpire(key, windowMs)
			}
			return current
		} catch (error) {
			this.logger.error(`Redis incrementRateLimit error for key "${key}":`, error)
			return 0
		}
	}

	async getRateLimit(key: string): Promise<number> {
		const value = await this.get(key)
		return value ? parseInt(value, 10) : 0
	}

	// ==================== Session Operations ====================

	async setSession(
		sessionToken: string,
		data: {
			userId: string
			userAgent?: string
			ip?: string
			createdAt: number
		},
		ttlMs: number,
	): Promise<void> {
		// Convert milliseconds to seconds for Redis
		const ttlSeconds = Math.ceil(ttlMs / 1000)
		await this.setJson(`session:${sessionToken}`, data, ttlSeconds)
		// Track user sessions
		await this.sAdd(`user_sessions:${data.userId}`, sessionToken)
	}

	async getSession(sessionToken: string): Promise<{
		userId: string
		userAgent?: string
		ip?: string
		createdAt: number
	} | null> {
		return this.getJson(`session:${sessionToken}`)
	}

	async deleteSession(sessionToken: string, userId: string): Promise<void> {
		await this.del(`session:${sessionToken}`)
		await this.sRem(`user_sessions:${userId}`, sessionToken)
	}

	async getUserSessions(userId: string): Promise<string[]> {
		return this.sMembers(`user_sessions:${userId}`)
	}

	async deleteAllUserSessions(userId: string): Promise<void> {
		const sessions = await this.getUserSessions(userId)
		for (const session of sessions) {
			await this.del(`session:${session}`)
		}
		await this.del(`user_sessions:${userId}`)
	}

	// ==================== Refresh Token Operations ====================

	async setRefreshToken(
		refreshToken: string,
		data: {
			userId: string
			sessionToken: string
		},
		ttlMs: number,
	): Promise<void> {
		// Convert milliseconds to seconds for Redis
		const ttlSeconds = Math.ceil(ttlMs / 1000)
		await this.setJson(`refresh:${refreshToken}`, data, ttlSeconds)
	}

	async getRefreshToken(refreshToken: string): Promise<{
		userId: string
		sessionToken: string
	} | null> {
		return this.getJson(`refresh:${refreshToken}`)
	}

	async deleteRefreshToken(refreshToken: string): Promise<void> {
		await this.del(`refresh:${refreshToken}`)
	}
}

