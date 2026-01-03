import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { RedisService } from './redis.service'

@Global()
@Module({
	providers: [
		{
			provide: 'REDIS_OPTIONS',
			useFactory: (configService: ConfigService) => ({
				host: configService.get('redis.host'),
				port: configService.get('redis.port'),
				password: configService.get('redis.password'),
			}),
			inject: [ConfigService],
		},
		RedisService,
	],
	exports: [RedisService],
})
export class RedisModule {}

