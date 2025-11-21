import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { PrismaService } from './core/prisma/prisma.service'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.enableCors()
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	)

	const configService = app.get(ConfigService)
	const prismaService = app.get(PrismaService)
	prismaService.enableShutdownHooks(app)
	const port = configService.get<number>('PORT') ?? 3001
	await app.listen(port)
	console.log(`API ready on http://localhost:${port}/graphql`)
}
bootstrap().catch(error => {
	console.error('Failed to start API', error)
	process.exit(1)
})
