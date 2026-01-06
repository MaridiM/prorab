import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../shared/guards/auth.guard'
import { CurrentUser, CurrentUserData } from '../../shared/decorators/current-user.decorator'
import { PersonalAccessTokensService } from './personal-access-tokens.service'
import { PersonalAccessToken, GeneratedToken } from './models/personal-access-token.model'
import { GenerateTokenInput } from './dto/generate-token.input'

@Resolver(() => PersonalAccessToken)
export class PersonalAccessTokensResolver {
  constructor(
    private readonly tokensService: PersonalAccessTokensService,
  ) {}

  /**
   * Get all API tokens for the current user
   */
  @Query(() => [PersonalAccessToken], { name: 'myApiTokens' })
  @UseGuards(AuthGuard)
  async myApiTokens(
    @CurrentUser() user: CurrentUserData,
  ): Promise<PersonalAccessToken[]> {
    const tokens = await this.tokensService.listTokens(user.id)
    return tokens.map((t) => ({
      ...t,
      isExpired: t.expiresAt ? t.expiresAt < new Date() : false,
    }))
  }

  /**
   * Generate a new API token
   * Returns the plaintext token ONLY ONCE
   */
  @Mutation(() => GeneratedToken, { name: 'generateApiToken' })
  @UseGuards(AuthGuard)
  async generateApiToken(
    @CurrentUser() user: CurrentUserData,
    @Args('input') input: GenerateTokenInput,
  ): Promise<GeneratedToken> {
    const result = await this.tokensService.generateToken(
      user.id,
      input.name,
      input.expiresInDays,
    )

    return {
      id: result.id,
      name: result.name,
      token: result.token, // Plaintext token!
      tokenPrefix: result.tokenPrefix,
      createdAt: result.createdAt,
      expiresAt: result.expiresAt,
    }
  }

  /**
   * Revoke (delete) an API token
   */
  @Mutation(() => Boolean, { name: 'revokeApiToken' })
  @UseGuards(AuthGuard)
  async revokeApiToken(
    @CurrentUser() user: CurrentUserData,
    @Args('tokenId') tokenId: string,
  ): Promise<boolean> {
    return this.tokensService.revokeToken(user.id, tokenId)
  }
}
