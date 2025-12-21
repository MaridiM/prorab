import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql'
import { IsString, IsOptional, IsBoolean, IsEnum, IsDate, MaxLength } from 'class-validator'

// ==================== ENUMS ====================

export enum AnnouncementPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(AnnouncementPriority, {
  name: 'AnnouncementPriority',
  description: 'Priority level of announcement',
})

export enum AnnouncementType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE',
}

registerEnumType(AnnouncementType, {
  name: 'AnnouncementType',
  description: 'Type of announcement',
})

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Team announcement' })
export class TeamAnnouncement {
  @Field(() => ID, { description: 'Announcement ID' })
  id: string

  @Field(() => String, { nullable: true, description: 'Team ID (null = global)' })
  teamId?: string

  @Field(() => String, { description: 'Announcement title' })
  title: string

  @Field(() => String, { description: 'Announcement content' })
  content: string

  @Field(() => AnnouncementPriority, { description: 'Priority level' })
  priority: AnnouncementPriority

  @Field(() => AnnouncementType, { description: 'Announcement type' })
  type: AnnouncementType

  @Field(() => Boolean, { description: 'Is pinned to top' })
  isPinned: boolean

  @Field(() => Date, { nullable: true, description: 'Expiration date' })
  expiresAt?: Date

  @Field(() => Date, { nullable: true, description: 'Publication date' })
  publishedAt?: Date

  @Field(() => String, { description: 'Creator user ID' })
  createdBy: string

  @Field(() => Date, { description: 'Creation timestamp' })
  createdAt: Date

  @Field(() => Date, { description: 'Last update timestamp' })
  updatedAt: Date

  // Computed fields
  @Field(() => Boolean, { description: 'Is announcement published' })
  isPublished: boolean

  @Field(() => Boolean, { description: 'Is announcement expired' })
  isExpired: boolean

  @Field(() => Int, { description: 'Number of reads' })
  readCount: number

  @Field(() => Int, { description: 'Total team members (for read percentage)' })
  totalMembers: number

  @Field(() => Boolean, { nullable: true, description: 'Has current user read this' })
  hasRead?: boolean
}

@ObjectType({ description: 'Announcement statistics' })
export class AnnouncementStatistics {
  @Field(() => Int, { description: 'Total announcements' })
  total: number

  @Field(() => Int, { description: 'Published announcements' })
  published: number

  @Field(() => Int, { description: 'Draft announcements' })
  drafts: number

  @Field(() => Int, { description: 'Pinned announcements' })
  pinned: number

  @Field(() => Int, { description: 'Expired announcements' })
  expired: number

  @Field(() => Int, { description: 'Announcements by priority: LOW' })
  lowPriority: number

  @Field(() => Int, { description: 'Announcements by priority: NORMAL' })
  normalPriority: number

  @Field(() => Int, { description: 'Announcements by priority: HIGH' })
  highPriority: number

  @Field(() => Int, { description: 'Announcements by priority: URGENT' })
  urgentPriority: number
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Input for creating announcement' })
export class CreateAnnouncementInput {
  @Field(() => String, { nullable: true, description: 'Team ID (null = global)' })
  @IsOptional()
  @IsString()
  teamId?: string

  @Field(() => String, { description: 'Announcement title' })
  @IsString()
  @MaxLength(200)
  title: string

  @Field(() => String, { description: 'Announcement content' })
  @IsString()
  content: string

  @Field(() => AnnouncementPriority, { nullable: true, defaultValue: AnnouncementPriority.NORMAL })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority

  @Field(() => AnnouncementType, { nullable: true, defaultValue: AnnouncementType.INFO })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean

  @Field(() => Date, { nullable: true, description: 'Expiration date' })
  @IsOptional()
  @IsDate()
  expiresAt?: Date

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Publish immediately' })
  @IsOptional()
  @IsBoolean()
  publishNow?: boolean
}

@InputType({ description: 'Input for updating announcement' })
export class UpdateAnnouncementInput {
  @Field(() => ID, { description: 'Announcement ID' })
  @IsString()
  id: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  content?: string

  @Field(() => AnnouncementPriority, { nullable: true })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority

  @Field(() => AnnouncementType, { nullable: true })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date
}

@InputType({ description: 'Filter for announcements' })
export class AnnouncementFilterInput {
  @Field(() => String, { nullable: true, description: 'Filter by team ID' })
  @IsOptional()
  @IsString()
  teamId?: string

  @Field(() => Boolean, { nullable: true, description: 'Show only published' })
  @IsOptional()
  @IsBoolean()
  publishedOnly?: boolean

  @Field(() => Boolean, { nullable: true, description: 'Show only pinned' })
  @IsOptional()
  @IsBoolean()
  pinnedOnly?: boolean

  @Field(() => Boolean, { nullable: true, description: 'Show only active (not expired)' })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean

  @Field(() => [AnnouncementPriority], { nullable: true, description: 'Filter by priorities' })
  @IsOptional()
  priorities?: AnnouncementPriority[]

  @Field(() => [AnnouncementType], { nullable: true, description: 'Filter by types' })
  @IsOptional()
  types?: AnnouncementType[]
}
