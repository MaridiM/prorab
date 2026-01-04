/**
 * Payment Provider Factory
 *
 * Factory for creating payment provider instances
 * Implements Factory Pattern with caching and dynamic provider selection
 *
 * Similar to StorageProviderFactory but for payment gateways
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { SystemSettingsService } from '../../../modules/admin/services/system-settings.service'
import { IPaymentProvider } from '../interfaces/payment-provider.interface'
import { PaymentProviderType, type PaymentProvider } from '@prisma/generated/client'
import { YookassaProvider } from '../providers/yookassa.provider'
import { StripeProvider } from '../providers/stripe.provider'
import { TelegramStarsProvider } from '../providers/telegram-stars.provider'

@Injectable()
export class PaymentProviderFactory {
  private readonly logger = new Logger(PaymentProviderFactory.name)
  private providers: Map<PaymentProviderType, IPaymentProvider> = new Map()

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly systemSettings: SystemSettingsService,
  ) {}

  /**
   * Get payment provider instance
   *
   * Selection logic:
   * 1. If type is specified → return that provider
   * 2. If type is not specified → get primary active provider from DB
   * 3. Fallback → STRIPE (primary provider)
   *
   * @param type - Specific provider type (optional)
   * @returns Payment provider instance
   */
  async getProvider(type?: PaymentProviderType): Promise<IPaymentProvider> {
    // 1. If type is specified, return it
    if (type) {
      return this.getProviderInstance(type)
    }

    // 2. Get primary active provider from database
    try {
      const primaryProvider = await this.prisma.paymentProvider.findFirst({
        where: {
          isActive: true,
          isPrimary: true,
        },
      })

      if (primaryProvider) {
        this.logger.log(`Using primary provider: ${primaryProvider.type}`)
        return this.getProviderInstance(primaryProvider.type)
      }
    } catch (error) {
      this.logger.error('Failed to fetch primary provider from DB:', error)
    }

    // 3. Fallback: STRIPE (primary provider)
    this.logger.warn('No primary provider found, falling back to STRIPE')
    return this.getProviderInstance(PaymentProviderType.STRIPE)
  }

  /**
   * Get provider instance by type (with caching)
   * @param type - Provider type
   * @returns Provider instance
   */
  private getProviderInstance(type: PaymentProviderType): IPaymentProvider {
    // Check cache first
    if (this.providers.has(type)) {
      return this.providers.get(type)!
    }

    // Create new instance
    let provider: IPaymentProvider

    switch (type) {
      case PaymentProviderType.YOOKASSA:
        provider = new YookassaProvider(
          this.configService,
          this.systemSettings,
          this.logger,
        )
        break

      case PaymentProviderType.STRIPE:
        provider = new StripeProvider(
          this.configService,
          this.systemSettings,
          this.logger,
        )
        break

      case PaymentProviderType.TELEGRAM_STARS:
        provider = new TelegramStarsProvider(
          this.configService,
          this.logger,
        )
        break

      default:
        throw new Error(`Unknown payment provider type: ${type}`)
    }

    // Cache instance
    this.providers.set(type, provider)
    this.logger.log(`Created ${type} provider instance`)

    return provider
  }

  /**
   * Get all active providers
   * Useful for admin panel
   */
  async getActiveProviders(): Promise<IPaymentProvider[]> {
    try {
      const activeProviders = await this.prisma.paymentProvider.findMany({
        where: { isActive: true },
      })

      return activeProviders.map((p: PaymentProvider) => this.getProviderInstance(p.type))
    } catch (error) {
      this.logger.error('Failed to fetch active providers:', error)
      // Fallback: return only STRIPE
      return [this.getProviderInstance(PaymentProviderType.STRIPE)]
    }
  }

  /**
   * Test provider connection
   * Used by admin panel to verify credentials
   *
   * @param type - Provider type to test
   * @returns true if connection is successful
   */
  async testProvider(type: PaymentProviderType): Promise<boolean> {
    try {
      const provider = this.getProviderInstance(type)
      return await provider.testConnection()
    } catch (error) {
      this.logger.error(`Failed to test ${type} provider:`, error)
      return false
    }
  }

  /**
   * Clear provider cache
   * Useful when SystemSettings are updated
   */
  clearCache(): void {
    this.providers.clear()
    this.logger.log('Payment provider cache cleared')
  }

  /**
   * Clear specific provider from cache
   * @param type - Provider type to clear
   */
  clearProviderCache(type: PaymentProviderType): void {
    this.providers.delete(type)
    this.logger.log(`Cleared ${type} provider from cache`)
  }
}
