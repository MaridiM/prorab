import { Logger, ValidationPipe, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { graphqlUploadExpress } from 'graphql-upload-minimal'
import { join } from 'path'
import { json, urlencoded } from 'express'

import { AppModule } from './app.module'
import { PrismaService } from './core/prisma/prisma.service'
import { GraphQLValidationPipe } from './shared/pipes/graphql-validation.pipe'
import { SystemSettingsService } from './modules/admin/services/system-settings.service'

const IS_DEV = process.env.NODE_ENV !== 'production'

async function bootstrap() {
	const logger = new Logger('Bootstrap')

	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		// Configuring logging based on the environment
		logger: IS_DEV 
			? ['log', 'error', 'warn', 'debug', 'verbose'] 
			: ['log', 'error', 'warn'],
		bodyParser: false, // 👈 Disable global body parser to handle multipart streams correctly
	})

	const config = app.get(ConfigService)

	// ✅ Trust proxy for correct IP detection (production: behind Nginx/Cloudflare/ALB)
	// This ensures req.ip returns the real client IP, not the proxy IP
	app.set('trust proxy', true)

	// ✅ Serve static assets (uploads)
	app.useStaticAssets(join(process.cwd(), 'uploads'), {
		prefix: '/uploads/',
	})

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
							connectSrc: ["'self'", 'https:', 'wss:', 'http:'],
						},
				  },
		}),
	)

	// ✅ Cookie parser with secret
	const cookieSecret = config.get<string>('auth.sessionSecret')
	app.use(cookieParser(cookieSecret))

	// ✅ GraphQL file upload middleware (Must be before body parsers)
	const graphqlPath = config.get<string>('graphqlPath') ?? '/graphql'
	app.use(graphqlPath, graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }))

	// ✅ Body parsers (Manually added after upload middleware)
	app.use(json({ limit: '10mb' }))
	app.use(urlencoded({ extended: true, limit: '10mb' }))

	// ✅ Global validation pipe (customized to handle GraphQLUpload)
	app.useGlobalPipes(
		new GraphQLValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			exceptionFactory: (errors) => {
				console.error('Validation Errors:', JSON.stringify(errors, null, 2));
				return new BadRequestException(errors);
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
		allowedHeaders: [
			'Content-Type', 
			'Authorization', 
			'X-Requested-With',
			'apollo-require-preflight',  // Required for Apollo Client
		],
	})

	// ✅ Prisma shutdown hooks
	const prismaService = app.get(PrismaService)
	prismaService.enableShutdownHooks(app)

	// ✅ Initialize system settings and sync environment variables
	try {
		const systemSettingsService = app.get(SystemSettingsService)
		await systemSettingsService.initializeDefaultSettings()
		await systemSettingsService.syncEnvToDatabase()
		logger.log('✅ System settings initialized and synchronized')
	} catch (error) {
		logger.warn('⚠️  Failed to initialize/sync system settings:', error.message)
	}

	// ✅ Start server
	const port = config.get<number>('port') ?? 8080
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
