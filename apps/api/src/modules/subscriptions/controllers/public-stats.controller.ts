import { Controller, Get } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

/**
 * Public REST API controller for landing page
 * Provides Early Bird statistics without authentication
 */
@Controller('api/public/stats')
export class PublicStatsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Get Early Bird statistics for landing page
   * Public endpoint - no authentication required
   *
   * @returns Early Bird stats with used count, limit, remaining, availability
   *
   * @example
   * GET /api/public/stats/early-bird
   * Response:
   * {
   *   "used": 127,
   *   "limit": 500,
   *   "remaining": 373,
   *   "isAvailable": true,
   *   "totalTeams": 150
   * }
   */
  @Get('early-bird')
  async getEarlyBirdStats() {
    return this.subscriptionsService.getEarlyBirdStats();
  }
}
