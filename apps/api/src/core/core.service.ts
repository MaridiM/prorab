import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PrismaService } from './prisma/prisma.service'
import { RedisService } from './redis/redis.service'

/**
 * Base service that provides typed access to Prisma, Redis, Config, and i18n
 * Extend this service to avoid repetitive dependency injection
 */
@Injectable()
export abstract class CoreService {
	protected readonly prisma: PrismaService
	protected readonly redis: RedisService
	protected readonly config: ConfigService

	constructor(
		prisma: PrismaService,
		redis: RedisService,
		config: ConfigService,
	) {
		this.prisma = prisma
		this.redis = redis
		this.config = config
	}

	// ==================== Redis Helpers ====================

	/**
	 * Get string value from Redis
	 */
	protected async redisGet(key: string): Promise<string | null> {
		return this.redis.get(key)
	}

	/**
	 * Set string value in Redis with optional TTL
	 */
	protected async redisSet(key: string, value: string, ttlMs?: number): Promise<void> {
		await this.redis.set(key, value, ttlMs)
	}

	/**
	 * Delete key from Redis
	 */
	protected async redisDel(key: string): Promise<void> {
		await this.redis.del(key)
	}

	/**
	 * Check if key exists in Redis
	 */
	protected async redisExists(key: string): Promise<boolean> {
		return this.redis.exists(key)
	}

	/**
	 * Get JSON value from Redis
	 */
	protected async redisGetJson<T>(key: string): Promise<T | null> {
		return this.redis.getJson<T>(key)
	}

	/**
	 * Set JSON value in Redis with optional TTL
	 */
	protected async redisSetJson<T>(key: string, value: T, ttlMs?: number): Promise<void> {
		await this.redis.setJson(key, value, ttlMs)
	}

	/**
	 * Add member to Redis set
	 */
	protected async redisSAdd(key: string, value: string): Promise<void> {
		await this.redis.sAdd(key, value)
	}

	/**
	 * Remove member from Redis set
	 */
	protected async redisSRem(key: string, value: string): Promise<void> {
		await this.redis.sRem(key, value)
	}

	/**
	 * Get all members from Redis set
	 */
	protected async redisSMembers(key: string): Promise<string[]> {
		return this.redis.sMembers(key)
	}

	/**
	 * Check if member exists in Redis set
	 */
	protected async redisSIsMember(key: string, value: string): Promise<boolean> {
		return this.redis.sIsMember(key, value)
	}

	/**
	 * Increment rate limit counter
	 */
	protected async redisIncrementRateLimit(key: string, windowMs: number): Promise<number> {
		return this.redis.incrementRateLimit(key, windowMs)
	}

	/**
	 * Get rate limit counter value
	 */
	protected async redisGetRateLimit(key: string): Promise<number> {
		return this.redis.getRateLimit(key)
	}
}

