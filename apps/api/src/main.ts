import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { graphqlUploadExpress } from 'graphql-upload-minimal'

import { AppModule } from './app.module'
import { PrismaService } from './core/prisma/prisma.service'

const IS_DEV = process.env.NODE_ENV !== 'production'

async function bootstrap() {
	const logger = new Logger('Bootstrap')

	const app = await NestFactory.create(AppModule, {
		// Configuring logging based on the environment
		logger: IS_DEV 
			? ['log', 'error', 'warn', 'debug', 'verbose'] 
			: ['log', 'error', 'warn'],
	})

	const config = app.get(ConfigService)

	// ✅ Enable Graceful Shutdown
	app.enableShutdownHooks()

	// ✅ Security Headers (Helmet)
	app.use(
		helmet({
			crossOriginEmbedderPolicy: false,
			contentSecurityPolicy: IS_DEV
				? false
				: {
						directives: {
							defaultSrc: ["'self'"],
							styleSrc: ["'self'", "'unsafe-inline'"],
							imgSrc: ["'self'", 'data:', 'https:'],
							scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
						},
				  },
		}),
	)

	// ✅ Cookie parser with secret
	const cookieSecret = config.get<string>('auth.sessionSecret')
	app.use(cookieParser(cookieSecret))

	// ✅ GraphQL file upload middleware
	const graphqlPath = config.get<string>('graphqlPath') ?? '/graphql'
	app.use(graphqlPath, graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }))

	// ✅ Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	)

	// ✅ CORS configuration
	const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:3000'
	app.enableCors({
		origin: [frontendUrl, 'http://localhost:3000'],
		credentials: true,
		exposedHeaders: ['set-cookie'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})

	// ✅ Prisma shutdown hooks
	const prismaService = app.get(PrismaService)
	prismaService.enableShutdownHooks(app)

	// ✅ Start server
	const port = config.get<number>('port') ?? 3001
	const nodeEnv = config.get<string>('nodeEnv') ?? 'development'
	
	await app.listen(port)

	// ✅ Startup logging
	logger.log(`🚀 Application is running on: http://localhost:${port}`)
	logger.log(`📊 GraphQL Playground: http://localhost:${port}${graphqlPath}`)
	logger.log(`🌍 Environment: ${nodeEnv}`)
	logger.log(`🔒 CORS enabled for: ${frontendUrl}`)
	logger.log(`📝 Logging level: ${IS_DEV ? 'DETAILED' : 'COMPACT'}`)
}

const bootstrapLogger = new Logger('Bootstrap')
bootstrap().catch(error => {
	bootstrapLogger.error('❌ Application bootstrap failed!', error.stack)
	process.exit(1)
})
