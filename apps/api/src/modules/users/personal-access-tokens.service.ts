import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { createHash, randomBytes } from 'crypto'

export interface GenerateTokenResult {
  id: string
  name: string
  token: string // Plaintext token (only returned once)
  tokenPrefix: string
  createdAt: Date
  expiresAt: Date | null
}

export interface TokenInfo {
  id: string
  name: string
  tokenPrefix: string
  lastUsedAt: Date | null
  lastUsedIp: string | null
  createdAt: Date
  expiresAt: Date | null
}

@Injectable()
export class PersonalAccessTokensService {
  private readonly logger = new Logger(PersonalAccessTokensService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a new personal access token
   * Returns the plaintext token ONLY ONCE - it cannot be retrieved later
   */
  async generateToken(
    userId: string,
    name: string,
    expiresInDays?: number,
  ): Promise<GenerateTokenResult> {
    // Generate secure random token (32 bytes = 64 hex chars)
    const rawToken = randomBytes(32).toString('hex')
    const token = `prorab_${rawToken}`
    
    // Hash the token for storage (SHA256)
    const tokenHash = createHash('sha256').update(token).digest('hex')
    
    // Token prefix for identification (first 12 chars after prefix)
    const tokenPrefix = `prorab_${rawToken.substring(0, 8)}...`
    
    // Calculate expiration date if specified
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const pat = await this.prisma.personalAccessToken.create({
      data: {
        userId,
        name,
        tokenHash,
        tokenPrefix,
        expiresAt,
      },
    })

    this.logger.log(`Generated new API token "${name}" for user ${userId}`)

    return {
      id: pat.id,
      name: pat.name,
      token, // Return plaintext token ONLY HERE
      tokenPrefix: pat.tokenPrefix,
      createdAt: pat.createdAt,
      expiresAt: pat.expiresAt,
    }
  }

  /**
   * List all tokens for a user (without the actual token value)
   */
  async listTokens(userId: string): Promise<TokenInfo[]> {
    const tokens = await this.prisma.personalAccessToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        lastUsedAt: true,
        lastUsedIp: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return tokens
  }

  /**
   * Revoke (delete) a token
   */
  async revokeToken(userId: string, tokenId: string): Promise<boolean> {
    const token = await this.prisma.personalAccessToken.findFirst({
      where: { id: tokenId, userId },
    })

    if (!token) {
      return false
    }

    await this.prisma.personalAccessToken.delete({
      where: { id: tokenId },
    })

    this.logger.log(`Revoked API token "${token.name}" for user ${userId}`)
    return true
  }

  /**
   * Validate a token and return the associated user ID
   * Used by AuthGuard for API authentication
   */
  async validateToken(token: string, ip?: string): Promise<string | null> {
    if (!token.startsWith('prorab_')) {
      return null
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')

    const pat = await this.prisma.personalAccessToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
      },
    })

    if (!pat) {
      return null
    }

    // Check expiration
    if (pat.expiresAt && pat.expiresAt < new Date()) {
      this.logger.warn(`Expired API token used for user ${pat.userId}`)
      return null
    }

    // Update last used timestamp (fire and forget)
    this.prisma.personalAccessToken.update({
      where: { id: pat.id },
      data: {
        lastUsedAt: new Date(),
        lastUsedIp: ip || null,
      },
    }).catch((err) => {
      this.logger.error(`Failed to update token last used: ${err.message}`)
    })

    return pat.userId
  }
}
