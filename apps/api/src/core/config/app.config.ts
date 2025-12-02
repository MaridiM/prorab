export const appConfig = () => ({
	// Server
	port: parseInt(process.env.PORT ?? '8080', 10),
	nodeEnv: process.env.NODE_ENV ?? 'development',
	frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
	graphqlPath: process.env.GRAPHQL_PATH ?? '/graphql',
	databaseUrl: process.env.DATABASE_URL,

	// Redis
	redis: {
		host: process.env.REDIS_HOST ?? 'localhost',
		port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
	},

	// Auth
	auth: {
		sessionSecret: process.env.SESSION_SECRET ?? 'change-me-in-production',
		sessionTtl: parseInt(process.env.SESSION_TTL ?? '604800000', 10), // 7 days
		refreshTokenTtl: parseInt(process.env.REFRESH_TOKEN_TTL ?? '2592000000', 10), // 30 days
		verificationTokenTtl: 24 * 60 * 60 * 1000, // 24 hours
		passwordResetTokenTtl: 60 * 60 * 1000, // 1 hour
		rateLimitAttempts: parseInt(process.env.RATE_LIMIT_ATTEMPTS ?? '5', 10),
		rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW ?? '900000', 10), // 15 minutes
	},

	// Mail (Brevo)
	mail: {
		brevoApiKey: process.env.BREVO_API_KEY ?? '',
		fromEmail: process.env.MAIL_FROM_EMAIL ?? 'noreply@prorab.space',
		fromName: process.env.MAIL_FROM_NAME ?? 'ProRab.space',
	},

	// Upload
	upload: {
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10000000', 10), // 10MB
		maxFiles: parseInt(process.env.MAX_FILES ?? '10', 10),
	},
})
