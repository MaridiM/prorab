/**
 * Utility functions for Telegram user handling
 */

/**
 * Checks if an email is a Telegram placeholder email
 * @param email - Email address to check
 * @returns true if email is a Telegram placeholder email
 */
export function isTelegramPlaceholderEmail(email: string | null | undefined): boolean {
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
 * Checks if user is a Telegram OAuth user
 * @param user - User object with oauthProvider field
 * @returns true if user is authenticated via Telegram
 */
export function isTelegramUser(user: { oauthProvider?: string | null } | null | undefined): boolean {
  if (!user) return false
  return user.oauthProvider === 'telegram'
}

/**
 * Gets a user-friendly message about Telegram email
 * @param email - Email address
 * @returns Message or null if not a Telegram email
 */
export function getTelegramEmailMessage(email: string | null | undefined): string | null {
  if (!isTelegramPlaceholderEmail(email)) {
    return null
  }

  return 'Этот email создан автоматически для Telegram-пользователей. На него нельзя отправлять письма. Для получения уведомлений используйте Telegram-бота.'
}




















