import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

interface RedisOptions {
	host: string
	port: number
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name)
	private client: RedisClientType
	private isConnected = false
	private connectionAttempted = false

	constructor(@Inject('REDIS_OPTIONS') private options: RedisOptions) {}

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
		})

		// Only log errors once to avoid spam
		let errorLogged = false
		this.client.on('error', (err) => {
			if (!errorLogged) {
				this.logger.error(`Redis connection error: ${err.message}`)
				this.logger.warn('Redis features will be unavailable until connection is established.')
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
			this.logger.warn(
				`Failed to connect to Redis at ${this.options.host}:${this.options.port}. ` +
				'Redis features will be unavailable. Make sure Redis is running.'
			)
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
		if (!this.ensureConnected()) return null
		try {
			const result = await this.client.get(key)
			if (typeof result === 'string') {
				return result
			}
			return null
		} catch (error) {
			this.logger.error(`Redis get error for key "${key}":`, error)
			return null
		}
	}

	async set(key: string, value: string, ttlMs?: number): Promise<void> {
		if (!this.ensureConnected()) return
		try {
			if (ttlMs) {
				await this.client.set(key, value, { PX: ttlMs })
			} else {
				await this.client.set(key, value)
			}
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

	async setJson<T>(key: string, value: T, ttlMs?: number): Promise<void> {
		await this.set(key, JSON.stringify(value), ttlMs)
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
		await this.setJson(`session:${sessionToken}`, data, ttlMs)
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
		await this.setJson(`refresh:${refreshToken}`, data, ttlMs)
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

