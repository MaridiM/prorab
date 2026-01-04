import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
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
  @UseGuards(GqlAuthGuard)
  async createDonation(
    @CurrentUser() user: User,
    @Args('input') input: CreateDonationInput,
  ): Promise<DonationUrl> {
    return this.donationsService.createDonation(user.id, input)
  }

  /**
   * Get current user's donations
   */
  @Query(() => [Donation])
  @UseGuards(GqlAuthGuard)
  async myDonations(@CurrentUser() user: User): Promise<Donation[]> {
    return this.donationsService.getUserDonations(user.id)
  }

  /**
   * Get current user's donation statistics
   */
  @Query(() => DonationStats)
  @UseGuards(GqlAuthGuard)
  async myDonationStats(@CurrentUser() user: User): Promise<DonationStats> {
    return this.donationsService.getDonationStats(user.id)
  }
}
