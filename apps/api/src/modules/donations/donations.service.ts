import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../core/prisma/prisma.service'
import { PaymentProviderFactory } from '../../core/payments/factories/payment-provider.factory'
import { MailService } from '../../core/mail/mail.service'
import { DonationStatus, PaymentProviderType } from '@prisma/generated/client'
import { CreateDonationInput } from './dto/create-donation.input'

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a donation payment
   * Selects provider based on user preference or automatically
   */
  async createDonation(userId: string, input: CreateDonationInput) {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }

      // Determine provider type
      let providerType = input.providerType

      if (!providerType) {
        // Auto-select provider based on availability
        // Priority: YOOKASSA (for RU) -> STRIPE (international)
        // TELEGRAM_STARS is only used via Telegram bot
        providerType = await this.selectProvider()
      }

      // Create donation record in database
      const donation = await this.prisma.donation.create({
        data: {
          userId,
          amount: input.amount,
          currency: 'RUB',
          providerType,
          providerPaymentId: `temp_${Date.now()}`, // Temporary, will be updated after payment creation
          status: DonationStatus.PENDING,
          message: input.message,
          donorName: input.donorName || user.fullName || undefined,
          isAnonymous: input.isAnonymous || false,
        },
      })

      // Get payment provider
      const provider = await this.paymentProviderFactory.getProvider(providerType)

      // Return URL for payment success/failure
      const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
      const returnUrl = `${baseUrl}/donation/success?donationId=${donation.id}`

      // Create payment
      const paymentResult = await provider.createDonation({
        amount: input.amount,
        currency: 'RUB',
        returnUrl,
        message: input.message,
        donorName: input.donorName,
        isAnonymous: input.isAnonymous,
        customerEmail: user.email,
        metadata: {
          donationId: donation.id,
          userId: user.id,
        },
      })

      // Update donation with provider payment ID
      await this.prisma.donation.update({
        where: { id: donation.id },
        data: {
          providerPaymentId: paymentResult.paymentId,
        },
      })

      return {
        url: paymentResult.confirmationUrl,
        donationId: donation.id,
      }
    } catch (error) {
      this.logger.error('Failed to create donation:', error)
      throw error
    }
  }

  /**
   * Auto-select payment provider
   * Priority: YOOKASSA -> STRIPE
   */
  private async selectProvider(): Promise<PaymentProviderType> {
    try {
      // Check for active providers in database
      const activeProviders = await this.prisma.paymentProvider.findMany({
        where: { isActive: true },
        orderBy: { isPrimary: 'desc' },
      })

      // Filter out TELEGRAM_STARS (only for bot donations)
      const webProviders = activeProviders.filter(
        (p) => p.type !== PaymentProviderType.TELEGRAM_STARS,
      )

      if (webProviders.length > 0) {
        return webProviders[0].type
      }

      // Fallback to STRIPE
      return PaymentProviderType.STRIPE
    } catch (error) {
      this.logger.warn('Failed to select provider from DB, falling back to STRIPE')
      return PaymentProviderType.STRIPE
    }
  }

  /**
   * Handle successful donation payment
   * Called by webhook controllers
   */
  async handleDonationSucceeded(providerPaymentId: string) {
    try {
      // Find donation by provider payment ID
      const donation = await this.prisma.donation.findUnique({
        where: { providerPaymentId },
      })

      if (!donation) {
        this.logger.warn(`Donation not found for provider payment ID: ${providerPaymentId}`)
        return
      }

      if (donation.status === DonationStatus.SUCCEEDED) {
        this.logger.warn(`Donation ${donation.id} already marked as succeeded`)
        return
      }

      // Get user to check badge status and send email
      const user = await this.prisma.user.findUnique({
        where: { id: donation.userId },
        select: { id: true, email: true, fullName: true, hasDonatorBadge: true },
      })

      if (!user) {
        this.logger.warn(`User not found for donation ${donation.id}`)
        return
      }

      // Update donation status
      await this.prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: DonationStatus.SUCCEEDED,
          paidAt: new Date(),
        },
      })

      // Grant donator badge if not already granted
      if (!user.hasDonatorBadge) {
        await this.prisma.user.update({
          where: { id: donation.userId },
          data: { hasDonatorBadge: true },
        })
        this.logger.log(`Granted donator badge to user ${donation.userId}`)
      }

      // Send thank you email
      await this.sendThankYouEmail({
        ...donation,
        user,
      })

      this.logger.log(`Donation ${donation.id} marked as succeeded`)
    } catch (error) {
      this.logger.error('Failed to handle donation succeeded:', error)
      throw error
    }
  }

  /**
   * Send thank you email to donor
   */
  private async sendThankYouEmail(donation: any) {
    try {
      const userName = donation.user.fullName || donation.user.email.split('@')[0]

      await this.mailService.sendDonationThankYouEmail(
        donation.user.email,
        userName,
        `${Number(donation.amount)}`,
        donation.currency,
        donation.message,
      )

      this.logger.log(`Thank you email sent to ${donation.user.email}`)
    } catch (error) {
      this.logger.error('Failed to send thank you email:', error)
      // Don't throw - email failure shouldn't break the flow
    }
  }

  /**
   * Get user's donation history
   */
  async getUserDonations(userId: string) {
    const donations = await this.prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Convert Decimal to number for GraphQL
    return donations.map((donation) => ({
      ...donation,
      amount: Number(donation.amount),
    }))
  }

  /**
   * Get donation statistics for a user
   */
  async getDonationStats(userId: string) {
    const donations = await this.prisma.donation.findMany({
      where: {
        userId,
        status: DonationStatus.SUCCEEDED,
      },
    })

    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0)
    const successfulCount = donations.length

    return {
      totalAmount,
      totalCount: successfulCount,
      successfulCount,
      averageAmount: successfulCount > 0 ? totalAmount / successfulCount : 0,
    }
  }

  /**
   * Get donation by ID
   */
  async getDonationById(donationId: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
    })

    if (!donation) {
      throw new NotFoundException('Donation not found')
    }

    // Convert Decimal to number for GraphQL
    return {
      ...donation,
      amount: Number(donation.amount),
    }
  }

  /**
   * Check donation status with payment provider
   * Useful when webhooks are not received or delayed
   */
  async checkDonationStatus(donationId: string) {
    try {
      const donation = await this.prisma.donation.findUnique({
        where: { id: donationId },
      })

      if (!donation) {
        throw new NotFoundException('Donation not found')
      }

      // Skip check if already succeeded or cancelled
      if (
        donation.status === DonationStatus.SUCCEEDED ||
        donation.status === DonationStatus.CANCELLED ||
        donation.status === DonationStatus.FAILED
      ) {
        return {
          ...donation,
          amount: Number(donation.amount),
        }
      }

      // Skip check for Telegram Stars (status is updated via bot webhook)
      if (donation.providerType === PaymentProviderType.TELEGRAM_STARS) {
        return {
          ...donation,
          amount: Number(donation.amount),
        }
      }

      // Skip check if providerPaymentId is temporary
      if (donation.providerPaymentId.startsWith('temp_')) {
        this.logger.warn(`Donation ${donationId} has temporary payment ID, skipping status check`)
        return {
          ...donation,
          amount: Number(donation.amount),
        }
      }

      // Get payment provider
      const provider = await this.paymentProviderFactory.getProvider(donation.providerType)

      // Check payment status with provider
      const paymentDetails = await provider.getPayment(donation.providerPaymentId)

      // Map provider status to donation status
      let newStatus: DonationStatus = donation.status

      if (paymentDetails.status === 'succeeded') {
        newStatus = DonationStatus.SUCCEEDED
      } else if (paymentDetails.status === 'cancelled') {
        newStatus = DonationStatus.CANCELLED
      } else if (paymentDetails.status === 'failed') {
        newStatus = DonationStatus.FAILED
      }

      // Update donation if status changed
      if (newStatus !== donation.status) {
        const updateData: any = {
          status: newStatus,
        }

        if (newStatus === DonationStatus.SUCCEEDED && paymentDetails.paidAt) {
          updateData.paidAt = paymentDetails.paidAt
        }

        await this.prisma.donation.update({
          where: { id: donationId },
          data: updateData,
        })

        // If succeeded, handle success logic (badge, email, etc.)
        if (newStatus === DonationStatus.SUCCEEDED) {
          await this.handleDonationSucceeded(donation.providerPaymentId)
        }

        this.logger.log(
          `Donation ${donationId} status updated from ${donation.status} to ${newStatus}`,
        )
      }

      // Return updated donation
      const updatedDonation = await this.prisma.donation.findUnique({
        where: { id: donationId },
      })

      return {
        ...updatedDonation!,
        amount: Number(updatedDonation!.amount),
      }
    } catch (error) {
      this.logger.error(`Failed to check donation status for ${donationId}:`, error)
      // Return current donation status even if check failed
      const donation = await this.prisma.donation.findUnique({
        where: { id: donationId },
      })
      if (!donation) {
        throw new NotFoundException('Donation not found')
      }
      return {
        ...donation,
        amount: Number(donation.amount),
      }
    }
  }
}
