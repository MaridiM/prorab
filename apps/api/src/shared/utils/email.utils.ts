/**
 * Utility functions for email handling
 */

/**
 * Checks if an email is a Telegram placeholder email that cannot receive real emails
 * @param email - Email address to check
 * @returns true if email is a Telegram placeholder email
 */
export function isTelegramPlaceholderEmail(email: string): boolean {
	if (!email) return false

	const normalizedEmail = email.toLowerCase().trim()

	// Check for Telegram placeholder patterns
	const telegramPatterns = [
		/^telegram_\d+@prorab\.space$/,
		/^telegram_\d+@telegram\.org$/,
		/^telegram_\d+@.*$/,
		/@telegram\.org$/,
	]

	return telegramPatterns.some(pattern => pattern.test(normalizedEmail))
}

/**
 * Checks if a user is a Telegram OAuth user (has oauthProvider === 'telegram')
 * @param user - User object with oauthProvider field
 * @returns true if user is authenticated via Telegram
 */
export function isTelegramUser(user: { oauthProvider?: string | null }): boolean {
	return user.oauthProvider === 'telegram'
}

/**
 * Checks if email sending should be skipped for a user
 * @param email - Email address
 * @param user - User object (optional)
 * @returns true if email should not be sent (use Telegram instead)
 */
export function shouldSkipEmail(email: string, user?: { oauthProvider?: string | null }): boolean {
	// Skip if it's a Telegram placeholder email
	if (isTelegramPlaceholderEmail(email)) {
		return true
	}

	// Skip if user is authenticated via Telegram (even if they have a real email)
	// This allows Telegram users to optionally add real email but still prefer Telegram notifications
	if (user && isTelegramUser(user)) {
		// Only skip if email is still a placeholder
		return isTelegramPlaceholderEmail(email)
	}

	return false
}















