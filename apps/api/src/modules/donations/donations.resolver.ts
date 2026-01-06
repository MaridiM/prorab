import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../shared/guards/auth.guard'
import { CurrentUser, CurrentUserData } from '../../shared/decorators/current-user.decorator'
import { DonationsService } from './donations.service'
import { Donation, DonationUrl, DonationStats } from './models/donation.model'
import { CreateDonationInput } from './dto/create-donation.input'
import { User } from '../users/models/user.model'

@Resolver(() => Donation)
export class DonationsResolver {
  constructor(private readonly donationsService: DonationsService) {}

  /**
   * Create a donation
   */
  @Mutation(() => DonationUrl)
  @UseGuards(AuthGuard)
  async createDonation(
    @CurrentUser() user: CurrentUserData,
    @Args('input') input: CreateDonationInput,
  ): Promise<DonationUrl> {
    return this.donationsService.createDonation(user.id, input)
  }

  /**
   * Get donation by ID
   */
  @Query(() => Donation, { nullable: true })
  @UseGuards(AuthGuard)
  async donation(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Donation | null> {
    try {
      return await this.donationsService.getDonationById(id)
    } catch {
      return null
    }
  }

  /**
   * Get current user's donations
   */
  @Query(() => [Donation])
  @UseGuards(AuthGuard)
  async myDonations(@CurrentUser() user: CurrentUserData): Promise<Donation[]> {
    return this.donationsService.getUserDonations(user.id)
  }

  /**
   * Get current user's donation statistics
   */
  @Query(() => DonationStats)
  @UseGuards(AuthGuard)
  async myDonationStats(@CurrentUser() user: CurrentUserData): Promise<DonationStats> {
    return this.donationsService.getDonationStats(user.id)
  }

  /**
   * Check donation status with payment provider
   * Useful when webhooks are not received
   */
  @Mutation(() => Donation)
  @UseGuards(AuthGuard)
  async checkDonationStatus(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Donation> {
    // Verify donation belongs to user
    const donation = await this.donationsService.getDonationById(id)
    if (donation.userId !== user.id) {
      throw new Error('Donation not found or access denied')
    }
    return this.donationsService.checkDonationStatus(id)
  }
}
