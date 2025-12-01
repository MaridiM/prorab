import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

interface RedisOptions {
	host: string
	port: number
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client: RedisClientType

	constructor(@Inject('REDIS_OPTIONS') private options: RedisOptions) {}

	async onModuleInit() {
		this.client = createClient({
			socket: {
				host: this.options.host,
				port: this.options.port,
			},
		})

		this.client.on('error', (err) => console.error('Redis Client Error', err))

		await this.client.connect()
		console.log('✅ Redis connected')
	}

	async onModuleDestroy() {
		await this.client.quit()
	}

	// ==================== Basic Operations ====================

	async get(key: string): Promise<string | null> {
		const result = await this.client.get(key)
		if (typeof result === 'string') {
			return result
		}
		return null
	}

	async set(key: string, value: string, ttlMs?: number): Promise<void> {
		if (ttlMs) {
			await this.client.set(key, value, { PX: ttlMs })
		} else {
			await this.client.set(key, value)
		}
	}

	async del(key: string): Promise<void> {
		await this.client.del(key)
	}

	async exists(key: string): Promise<boolean> {
		const result = await this.client.exists(key)
		return result === 1
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
		await this.client.sAdd(key, value)
	}

	async sRem(key: string, value: string): Promise<void> {
		await this.client.sRem(key, value)
	}

	async sMembers(key: string): Promise<string[]> {
		return this.client.sMembers(key)
	}

	async sIsMember(key: string, value: string): Promise<boolean> {
		const result = await this.client.sIsMember(key, value)
		return Boolean(result)
	}

	// ==================== Rate Limiting ====================

	async incrementRateLimit(key: string, windowMs: number): Promise<number> {
		const current = await this.client.incr(key)
		if (current === 1) {
			await this.client.pExpire(key, windowMs)
		}
		return current
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

