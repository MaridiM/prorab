import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type ActivityLog = {
  __typename?: 'ActivityLog';
  /** Action performed */
  action: Scalars['String']['output'];
  /** Admin user email */
  adminUserEmail: Scalars['String']['output'];
  /** Action timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Log ID */
  id: Scalars['String']['output'];
  /** Resource type */
  resource: Scalars['String']['output'];
  /** Resource ID */
  resourceId: Scalars['String']['output'];
};

export type AddPhotoInput = {
  caption: InputMaybe<Scalars['String']['input']>;
  fileSize: InputMaybe<Scalars['Int']['input']>;
  height: InputMaybe<Scalars['Int']['input']>;
  orderIndex: InputMaybe<Scalars['Int']['input']>;
  photoUrl: Scalars['String']['input'];
  reportId: Scalars['String']['input'];
  thumbnailUrl: InputMaybe<Scalars['String']['input']>;
  width: InputMaybe<Scalars['Int']['input']>;
};

export type AdminActionLog = {
  __typename?: 'AdminActionLog';
  action: Scalars['String']['output'];
  /** Admin user email (populated from relation) */
  adminUserEmail: Maybe<Scalars['String']['output']>;
  adminUserId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  details: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  ipAddress: Maybe<Scalars['String']['output']>;
  resource: Scalars['String']['output'];
  resourceId: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
};

export type AdminActionLogFilterInput = {
  action: InputMaybe<Scalars['String']['input']>;
  adminUserId: InputMaybe<Scalars['String']['input']>;
  endDate: InputMaybe<Scalars['DateTime']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  resource: InputMaybe<Scalars['String']['input']>;
  startDate: InputMaybe<Scalars['DateTime']['input']>;
};

export type AdminActionLogsResult = {
  __typename?: 'AdminActionLogsResult';
  logs: Array<AdminActionLog>;
  total: Scalars['Int']['output'];
};

export type AdminActionStatistics = {
  __typename?: 'AdminActionStatistics';
  actionsByAdmin: Scalars['JSON']['output'];
  actionsByResource: Scalars['JSON']['output'];
  actionsByType: Scalars['JSON']['output'];
  totalActions: Scalars['Int']['output'];
};

/** Input for creating a new plan */
export type AdminCreatePlanInput = {
  /** Description of the plan */
  description: InputMaybe<Scalars['String']['input']>;
  /** Features included in the plan */
  features: Array<AdminPlanFeatureInput>;
  /** Whether this plan is marked as popular */
  isPopular: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum active projects allowed (null = unlimited) */
  maxActiveProjects: InputMaybe<Scalars['Int']['input']>;
  /** Maximum team members allowed */
  maxMembers: Scalars['Int']['input'];
  /** Display name of the plan */
  name: Scalars['String']['input'];
  /** Prices in different currencies (at least one required) */
  prices: Array<AdminPlanPriceInput>;
  /** Unique slug for the plan (e.g., "lite", "foreman") */
  slug: Scalars['String']['input'];
  /** Sort order for display */
  sortOrder: InputMaybe<Scalars['Int']['input']>;
  /** Storage limit in GB */
  storageGB: Scalars['Float']['input'];
  /** Number of trial days for new subscriptions (null = no trial) */
  trialDays: InputMaybe<Scalars['Int']['input']>;
};

export type AdminPayment = {
  __typename?: 'AdminPayment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  /** Subscription with team and owner details */
  subscription: Maybe<Scalars['JSON']['output']>;
  subscriptionId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  yookassaPaymentId: Maybe<Scalars['String']['output']>;
};

export type AdminPaymentFilters = {
  /** Created after date */
  createdAfter: InputMaybe<Scalars['DateTime']['input']>;
  /** Created before date */
  createdBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Maximum amount */
  maxAmount: InputMaybe<Scalars['Float']['input']>;
  /** Minimum amount */
  minAmount: InputMaybe<Scalars['Float']['input']>;
  /** Search by team name, owner email, or payment ID */
  search: InputMaybe<Scalars['String']['input']>;
  /** Filter by status (PENDING, SUCCEEDED, FAILED, CANCELLED) */
  status: InputMaybe<Scalars['String']['input']>;
};

/** Payment provider */
export type AdminPaymentProviderModel = {
  __typename?: 'AdminPaymentProviderModel';
  /** Configuration status */
  configStatus: Maybe<PaymentProviderConfigStatus>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Whether the provider is currently active */
  isActive: Scalars['Boolean']['output'];
  /** Whether this is the primary provider */
  isPrimary: Scalars['Boolean']['output'];
  /** Display name of the provider */
  name: Scalars['String']['output'];
  /** Provider type (YOOKASSA, STRIPE) */
  type: PaymentProviderType;
  updatedAt: Scalars['DateTime']['output'];
  /** Webhook URL for this provider */
  webhookUrl: Maybe<Scalars['String']['output']>;
};

export type AdminPaymentsConnection = {
  __typename?: 'AdminPaymentsConnection';
  /** List of payments */
  nodes: Array<AdminPayment>;
  /** Pagination information */
  pageInfo: PageInfo;
  /** Total count of payments */
  totalCount: Scalars['Int']['output'];
};

/** Input for creating a new plan feature */
export type AdminPlanFeatureInput = {
  /** Feature description */
  description: InputMaybe<Scalars['String']['input']>;
  /** Whether this feature is included */
  isIncluded: InputMaybe<Scalars['Boolean']['input']>;
  /** Feature name */
  name: Scalars['String']['input'];
  /** Sort order for display */
  sortOrder: InputMaybe<Scalars['Int']['input']>;
};

/** Plan feature */
export type AdminPlanFeatureModel = {
  __typename?: 'AdminPlanFeatureModel';
  /** Feature description */
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Whether this feature is included */
  isIncluded: Scalars['Boolean']['output'];
  /** Feature name */
  name: Scalars['String']['output'];
  /** Plan ID this feature belongs to */
  planId: Scalars['String']['output'];
  /** Sort order for display */
  sortOrder: Scalars['Int']['output'];
};

/** Filters for querying plans */
export type AdminPlanFilters = {
  /** Filter prices by currency (RUB, USD, EUR) */
  currency: InputMaybe<Scalars['String']['input']>;
  /** Filter by active status */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Search by name, slug, or description */
  search: InputMaybe<Scalars['String']['input']>;
};

/** Subscription plan */
export type AdminPlanModel = {
  __typename?: 'AdminPlanModel';
  createdAt: Scalars['DateTime']['output'];
  /** Description of the plan */
  description: Maybe<Scalars['String']['output']>;
  /** Features included in the plan */
  features: Array<AdminPlanFeatureModel>;
  id: Scalars['ID']['output'];
  /** Whether the plan is currently active */
  isActive: Scalars['Boolean']['output'];
  /** Whether early bird pricing is available */
  isEarlyBird: Scalars['Boolean']['output'];
  /** Whether this plan is marked as popular */
  isPopular: Scalars['Boolean']['output'];
  /** Maximum active projects allowed (null = unlimited) */
  maxActiveProjects: Maybe<Scalars['Int']['output']>;
  /** Maximum team members allowed */
  maxMembers: Scalars['Int']['output'];
  /** Display name of the plan */
  name: Scalars['String']['output'];
  /** Prices in different currencies */
  prices: Array<AdminPlanPriceModel>;
  /** Unique slug for the plan (e.g., "lite", "foreman") */
  slug: Scalars['String']['output'];
  /** Sort order for display */
  sortOrder: Scalars['Int']['output'];
  /** Storage limit in GB */
  storageGB: Scalars['Float']['output'];
  /** Number of subscriptions using this plan */
  subscriptionsCount: Maybe<Scalars['Int']['output']>;
  /** Number of trial days for new subscriptions (null = no trial) */
  trialDays: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Input for creating a new plan price */
export type AdminPlanPriceInput = {
  /** Billing cycle in days */
  billingCycleDays: InputMaybe<Scalars['Int']['input']>;
  /** Currency code (RUB, USD, EUR) */
  currency: Scalars['String']['input'];
  /** Early bird price (discounted) */
  earlyBirdPrice: Scalars['Float']['input'];
  /** Regular price */
  price: Scalars['Float']['input'];
};

/** Plan price in a specific currency */
export type AdminPlanPriceModel = {
  __typename?: 'AdminPlanPriceModel';
  /** Billing cycle in days (default: 30) */
  billingCycleDays: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** Currency code (RUB, USD, EUR) */
  currency: Scalars['String']['output'];
  /** Early bird price (discounted) */
  earlyBirdPrice: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  /** Plan ID this price belongs to */
  planId: Scalars['String']['output'];
  /** Regular price */
  price: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Paginated list of plans */
export type AdminPlansConnection = {
  __typename?: 'AdminPlansConnection';
  /** List of plans */
  nodes: Array<AdminPlanModel>;
  /** Pagination information */
  pageInfo: PageInfo;
  /** Total count of plans */
  totalCount: Scalars['Int']['output'];
};

export type AdminProject = {
  __typename?: 'AdminProject';
  _count: Maybe<ProjectCount>;
  actualCost: Maybe<Scalars['Float']['output']>;
  budget: Maybe<Scalars['Float']['output']>;
  completedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  endDate: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: Maybe<Scalars['JSON']['output']>;
  startDate: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  team: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminProjectFilterInput = {
  ownerId: InputMaybe<Scalars['String']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  startDateFrom: InputMaybe<Scalars['DateTime']['input']>;
  startDateTo: InputMaybe<Scalars['DateTime']['input']>;
  status: InputMaybe<Scalars['String']['input']>;
  teamId: InputMaybe<Scalars['String']['input']>;
};

export type AdminProjectStats = {
  __typename?: 'AdminProjectStats';
  active: Scalars['Int']['output'];
  archived: Scalars['Int']['output'];
  completed: Scalars['Int']['output'];
};

export type AdminProjectsResult = {
  __typename?: 'AdminProjectsResult';
  hasMore: Scalars['Boolean']['output'];
  projects: Array<AdminProject>;
  stats: Maybe<AdminProjectStats>;
  total: Scalars['Int']['output'];
};

export type AdminRoleDetail = {
  __typename?: 'AdminRoleDetail';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ipWhitelist: Array<Scalars['String']['output']>;
  permissions: Array<Scalars['String']['output']>;
  role: AdminRoleType;
  twoFactorEnforced: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['String']['output'];
};

/** Admin role types */
export enum AdminRoleType {
  Admin = 'ADMIN',
  Moderator = 'MODERATOR',
  SuperAdmin = 'SUPER_ADMIN',
  Support = 'SUPPORT'
}

export type AdminSendMessageInput = {
  fromUser: Scalars['Boolean']['input'];
  message: Scalars['String']['input'];
  ticketId: Scalars['String']['input'];
};

export type AdminSubscriptionFilters = {
  /** Created after date */
  createdAfter: InputMaybe<Scalars['DateTime']['input']>;
  /** Created before date */
  createdBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Expiring before date */
  expiringBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Filter by plan (LITE, FOREMAN, BRIGADE) */
  plan: InputMaybe<Scalars['String']['input']>;
  /** Search by team name or owner email */
  search: InputMaybe<Scalars['String']['input']>;
  /** Filter by status */
  status: InputMaybe<Scalars['String']['input']>;
};

export type AdminSubscriptionsConnection = {
  __typename?: 'AdminSubscriptionsConnection';
  /** List of subscriptions */
  nodes: Array<Subscription>;
  /** Pagination information */
  pageInfo: PageInfo;
  /** Total count of subscriptions */
  totalCount: Scalars['Int']['output'];
};

export type AdminSupportStatistics = {
  __typename?: 'AdminSupportStatistics';
  closedTickets: Scalars['Int']['output'];
  inProgressTickets: Scalars['Int']['output'];
  openTickets: Scalars['Int']['output'];
  resolvedTickets: Scalars['Int']['output'];
  ticketsByCategory: Scalars['JSON']['output'];
  ticketsByPriority: Scalars['JSON']['output'];
  totalTickets: Scalars['Int']['output'];
};

export type AdminSupportTicket = {
  __typename?: 'AdminSupportTicket';
  category: Maybe<Scalars['String']['output']>;
  closedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Count of messages in ticket */
  messageCount: Maybe<Scalars['Int']['output']>;
  messages: Maybe<Array<SupportMessage>>;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  subject: Maybe<Scalars['String']['output']>;
  telegramChatId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** User email (populated from relation) */
  userEmail: Maybe<Scalars['String']['output']>;
  /** User full name (populated from relation) */
  userFullName: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type AdminSupportTicketFilterInput = {
  category: InputMaybe<Scalars['String']['input']>;
  endDate: InputMaybe<Scalars['DateTime']['input']>;
  priority: InputMaybe<SupportTicketPriority>;
  search: InputMaybe<Scalars['String']['input']>;
  startDate: InputMaybe<Scalars['DateTime']['input']>;
  status: InputMaybe<SupportTicketStatus>;
  userId: InputMaybe<Scalars['String']['input']>;
};

export type AdminSupportTicketsResult = {
  __typename?: 'AdminSupportTicketsResult';
  hasMore: Scalars['Boolean']['output'];
  tickets: Array<AdminSupportTicket>;
  total: Scalars['Int']['output'];
};

export type AdminTeamCounts = {
  __typename?: 'AdminTeamCounts';
  /** Number of team members */
  members: Scalars['Int']['output'];
  /** Number of projects */
  projects: Scalars['Int']['output'];
};

export type AdminTeamDetails = {
  __typename?: 'AdminTeamDetails';
  /** Aggregated counts */
  _count: AdminTeamCounts;
  /** Team members */
  members: Array<TeamMemberDetails>;
  /** Team owner */
  owner: User;
  /** Team projects */
  projects: Array<Project>;
  /** Team subscription */
  subscription: Maybe<Subscription>;
  /** Team data */
  team: Team;
};

export type AdminTeamFilters = {
  /** Created after date */
  createdAfter: InputMaybe<Scalars['DateTime']['input']>;
  /** Created before date */
  createdBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Maximum number of members */
  maxMembers: InputMaybe<Scalars['Int']['input']>;
  /** Maximum number of projects */
  maxProjects: InputMaybe<Scalars['Int']['input']>;
  /** Minimum number of members */
  minMembers: InputMaybe<Scalars['Int']['input']>;
  /** Minimum number of projects */
  minProjects: InputMaybe<Scalars['Int']['input']>;
  /** Filter by plan type */
  planType: InputMaybe<Scalars['String']['input']>;
  /** Search by team name or owner email */
  search: InputMaybe<Scalars['String']['input']>;
  /** Filter by subscription status */
  subscriptionStatus: InputMaybe<Scalars['String']['input']>;
};

export type AdminTeamStats = {
  __typename?: 'AdminTeamStats';
  /** Number of active projects */
  activeProjects: Scalars['Int']['output'];
  /** Number of completed projects */
  completedProjects: Scalars['Int']['output'];
  /** Total expense amount */
  totalExpenseAmount: Scalars['Float']['output'];
  /** Total number of expenses */
  totalExpenses: Scalars['Int']['output'];
  /** Total number of members */
  totalMembers: Scalars['Int']['output'];
  /** Total number of projects */
  totalProjects: Scalars['Int']['output'];
};

export type AdminTeamsConnection = {
  __typename?: 'AdminTeamsConnection';
  /** List of teams */
  nodes: Array<Team>;
  /** Pagination info */
  pageInfo: PageInfo;
  /** Total count of teams */
  totalCount: Scalars['Int']['output'];
};

/** Admin view of Telegram bot */
export type AdminTelegramBotModel = {
  __typename?: 'AdminTelegramBotModel';
  /** Avatar URL from Telegram or R2 */
  avatarUrl: Maybe<Scalars['String']['output']>;
  /** Unique bot identifier (e.g., "oauth", "support") */
  botName: Scalars['String']['output'];
  /** Can the bot join groups */
  canJoinGroups: Scalars['Boolean']['output'];
  /** Can the bot read all group messages */
  canReadMessages: Scalars['Boolean']['output'];
  /** Configuration status */
  configStatus: Maybe<TelegramBotConfigStatus>;
  createdAt: Scalars['DateTime']['output'];
  /** ID of admin who created this bot */
  createdBy: Maybe<Scalars['String']['output']>;
  /** Bot description/purpose */
  description: Maybe<Scalars['String']['output']>;
  /** Display name for admin panel */
  displayName: Scalars['String']['output'];
  /** Bot first name from Telegram */
  firstName: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Whether the bot is currently active */
  isActive: Scalars['Boolean']['output'];
  /** Whether this is the primary OAuth bot */
  isPrimary: Scalars['Boolean']['output'];
  /** Last time bot info was synced from Telegram */
  lastSyncAt: Maybe<Scalars['DateTime']['output']>;
  /** Does the bot support inline queries */
  supportsInlineQueries: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Bot username (e.g., "ProRabSpaceBot") */
  username: Scalars['String']['output'];
  /** Webhook URL for this bot */
  webhookUrl: Maybe<Scalars['String']['output']>;
};

/** Input for updating an existing plan */
export type AdminUpdatePlanInput = {
  /** Description of the plan */
  description: InputMaybe<Scalars['String']['input']>;
  /** Update all features (replaces existing) */
  features: InputMaybe<Array<AdminPlanFeatureInput>>;
  /** Whether the plan is active */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this plan is marked as popular */
  isPopular: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum active projects allowed */
  maxActiveProjects: InputMaybe<Scalars['Int']['input']>;
  /** Maximum team members allowed */
  maxMembers: InputMaybe<Scalars['Int']['input']>;
  /** Display name of the plan */
  name: InputMaybe<Scalars['String']['input']>;
  /** Update all prices (replaces existing) */
  prices: InputMaybe<Array<AdminPlanPriceInput>>;
  /** Unique slug for the plan */
  slug: InputMaybe<Scalars['String']['input']>;
  /** Sort order for display */
  sortOrder: InputMaybe<Scalars['Int']['input']>;
  /** Storage limit in GB */
  storageGB: InputMaybe<Scalars['Float']['input']>;
  /** Number of trial days for new subscriptions (null = no trial) */
  trialDays: InputMaybe<Scalars['Int']['input']>;
};

export type AdminUpdateSupportTicketInput = {
  category: InputMaybe<Scalars['String']['input']>;
  priority: InputMaybe<SupportTicketPriority>;
  status: InputMaybe<SupportTicketStatus>;
};

export type AdminUpdateTeamInput = {
  /** Team logo URL */
  logoUrl: InputMaybe<Scalars['String']['input']>;
  /** Team name */
  name: InputMaybe<Scalars['String']['input']>;
};

export type AdminUpdateUserInput = {
  /** User avatar URL */
  avatarUrl: InputMaybe<Scalars['String']['input']>;
  /** User email address */
  email: InputMaybe<Scalars['String']['input']>;
  /** Email verification status */
  emailVerified: InputMaybe<Scalars['Boolean']['input']>;
  /** User full name */
  fullName: InputMaybe<Scalars['String']['input']>;
  /** User phone number */
  phone: InputMaybe<Scalars['String']['input']>;
};

export type AdminUserCounts = {
  __typename?: 'AdminUserCounts';
  /** Number of teams owned */
  ownedTeams: Scalars['Int']['output'];
  /** Number of payments made */
  payments: Scalars['Int']['output'];
  /** Number of team memberships */
  teamMemberships: Scalars['Int']['output'];
};

export type AdminUserDetails = {
  __typename?: 'AdminUserDetails';
  /** Aggregated counts */
  _count: AdminUserCounts;
  /** Teams owned by this user */
  ownedTeams: Array<Team>;
  /** Teams where user is a member */
  teamMemberships: Array<TeamMemberInfo>;
  /** User data */
  user: User;
};

export type AdminUserFilters = {
  /** Created after date */
  createdAfter: InputMaybe<Scalars['DateTime']['input']>;
  /** Created before date */
  createdBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Filter by email verification status */
  emailVerified: InputMaybe<Scalars['Boolean']['input']>;
  /** Last login after date */
  lastLoginAfter: InputMaybe<Scalars['DateTime']['input']>;
  /** Last login before date */
  lastLoginBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Filter by admin role type */
  role: InputMaybe<AdminRoleType>;
  /** Search by email, name, or phone */
  search: InputMaybe<Scalars['String']['input']>;
};

export type AdminUsersConnection = {
  __typename?: 'AdminUsersConnection';
  /** List of users */
  nodes: Array<User>;
  /** Pagination info */
  pageInfo: PageInfo;
  /** Total count of users */
  totalCount: Scalars['Int']['output'];
};

/** Filter for announcements */
export type AnnouncementFilterInput = {
  /** Show only active (not expired) */
  activeOnly: InputMaybe<Scalars['Boolean']['input']>;
  /** Show only pinned */
  pinnedOnly: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by priorities */
  priorities: InputMaybe<Array<AnnouncementPriority>>;
  /** Show only published */
  publishedOnly: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by team ID */
  teamId: InputMaybe<Scalars['String']['input']>;
  /** Filter by types */
  types: InputMaybe<Array<AnnouncementType>>;
};

/** Priority level of announcement */
export enum AnnouncementPriority {
  High = 'HIGH',
  Low = 'LOW',
  Normal = 'NORMAL',
  Urgent = 'URGENT'
}

/** Announcement statistics */
export type AnnouncementStatistics = {
  __typename?: 'AnnouncementStatistics';
  /** Draft announcements */
  drafts: Scalars['Int']['output'];
  /** Expired announcements */
  expired: Scalars['Int']['output'];
  /** Announcements by priority: HIGH */
  highPriority: Scalars['Int']['output'];
  /** Announcements by priority: LOW */
  lowPriority: Scalars['Int']['output'];
  /** Announcements by priority: NORMAL */
  normalPriority: Scalars['Int']['output'];
  /** Pinned announcements */
  pinned: Scalars['Int']['output'];
  /** Published announcements */
  published: Scalars['Int']['output'];
  /** Total announcements */
  total: Scalars['Int']['output'];
  /** Announcements by priority: URGENT */
  urgentPriority: Scalars['Int']['output'];
};

/** Type of announcement */
export enum AnnouncementType {
  Error = 'ERROR',
  Info = 'INFO',
  Maintenance = 'MAINTENANCE',
  Success = 'SUCCESS',
  Warning = 'WARNING'
}

export type AssignAdminRoleInput = {
  ipWhitelist: InputMaybe<Array<Scalars['String']['input']>>;
  permissions: InputMaybe<Array<Scalars['String']['input']>>;
  role: AdminRoleType;
  twoFactorEnforced: InputMaybe<Scalars['Boolean']['input']>;
  userId: Scalars['String']['input'];
};

/** Input for assigning a role to a member */
export type AssignRoleInput = {
  /** Custom role ID (null to clear custom role) */
  customRoleId: InputMaybe<Scalars['ID']['input']>;
  /** Team member ID */
  memberId: Scalars['String']['input'];
  /** Assignment reason */
  reason: InputMaybe<Scalars['String']['input']>;
};

export enum AuditCategory {
  Authentication = 'AUTHENTICATION',
  DataAccess = 'DATA_ACCESS',
  Financial = 'FINANCIAL',
  Integrations = 'INTEGRATIONS',
  MemberManagement = 'MEMBER_MANAGEMENT',
  Permissions = 'PERMISSIONS',
  ProjectManagement = 'PROJECT_MANAGEMENT',
  Settings = 'SETTINGS'
}

/** Filter for audit logs */
export type AuditLogFilterInput = {
  category: InputMaybe<AuditCategory>;
  dateFrom: InputMaybe<Scalars['DateTime']['input']>;
  dateTo: InputMaybe<Scalars['DateTime']['input']>;
  resource: InputMaybe<Scalars['String']['input']>;
  teamId: InputMaybe<Scalars['String']['input']>;
  userId: InputMaybe<Scalars['String']['input']>;
};

/** Audit logs connection with pagination */
export type AuditLogsConnection = {
  __typename?: 'AuditLogsConnection';
  hasMore: Scalars['Boolean']['output'];
  logs: Array<TeamAuditLog>;
  totalCount: Scalars['Int']['output'];
};

/** Audit statistics */
export type AuditStatistics = {
  __typename?: 'AuditStatistics';
  byCategory: Array<CategoryCount>;
  logsLast7d: Scalars['Int']['output'];
  logsLast24h: Scalars['Int']['output'];
  logsLast30d: Scalars['Int']['output'];
  topActions: Array<Scalars['String']['output']>;
  totalLogs: Scalars['Int']['output'];
  uniqueUsers: Scalars['Int']['output'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  message: Maybe<Scalars['String']['output']>;
  requiresTwoFactor: Maybe<Scalars['Boolean']['output']>;
  twoFactorToken: Maybe<Scalars['String']['output']>;
  user: Maybe<User>;
};

export type BackupCodesResponse = {
  __typename?: 'BackupCodesResponse';
  backupCodes: Array<Scalars['String']['output']>;
};

/** Bot information from Telegram API */
export type BotInfoModel = {
  __typename?: 'BotInfoModel';
  /** Can the bot join groups */
  canJoinGroups: Scalars['Boolean']['output'];
  /** Can the bot read all group messages */
  canReadMessages: Scalars['Boolean']['output'];
  /** Bot first name */
  firstName: Scalars['String']['output'];
  /** Telegram bot user ID */
  id: Scalars['Float']['output'];
  /** Does the bot support inline queries */
  supportsInlineQueries: Scalars['Boolean']['output'];
  /** Bot username without @ */
  username: Scalars['String']['output'];
};

/** Input for bulk role assignment */
export type BulkAssignRoleInput = {
  /** Custom role ID (null to clear custom roles) */
  customRoleId: InputMaybe<Scalars['ID']['input']>;
  /** Team member IDs */
  memberIds: Array<Scalars['String']['input']>;
  /** Assignment reason */
  reason: InputMaybe<Scalars['String']['input']>;
};

export type BulkCreateWorkLogInput = {
  /** Array of work logs to create */
  workLogs: Array<CreateWorkLogInput>;
};

/** Bulk operation result */
export type BulkOperationResult = {
  __typename?: 'BulkOperationResult';
  /** Error messages */
  errors: Maybe<Array<Scalars['String']['output']>>;
  /** Number of failed operations */
  failedCount: Scalars['Int']['output'];
  /** IDs of failed items */
  failedIds: Maybe<Array<Scalars['String']['output']>>;
  /** Number of successful operations */
  successCount: Scalars['Int']['output'];
  /** IDs of successfully processed items */
  successIds: Maybe<Array<Scalars['String']['output']>>;
};

/** Bulk remove members input */
export type BulkRemoveMembersInput = {
  /** Member IDs to remove */
  memberIds: Array<Scalars['String']['input']>;
  /** Reason for removal */
  reason: InputMaybe<Scalars['String']['input']>;
};

/** Bulk update member input */
export type BulkUpdateMembersInput = {
  /** Assign custom role */
  customRoleId: InputMaybe<Scalars['ID']['input']>;
  /** Member IDs to update */
  memberIds: Array<Scalars['String']['input']>;
  /** Update position */
  position: InputMaybe<Scalars['String']['input']>;
  /** Reason for bulk update */
  reason: InputMaybe<Scalars['String']['input']>;
  /** Update salary amount */
  salaryAmount: InputMaybe<Scalars['Float']['input']>;
  /** Update salary type */
  salaryType: InputMaybe<Scalars['String']['input']>;
};

export type BulkUpdateResult = {
  __typename?: 'BulkUpdateResult';
  /** Number of failed updates */
  failed: Scalars['Int']['output'];
  /** Detailed results for each update */
  results: Scalars['JSON']['output'];
  /** Number of successful updates */
  success: Scalars['Int']['output'];
};

export type BulkUpdateSalaryInput = {
  /** Optional reason for bulk update */
  reason: InputMaybe<Scalars['String']['input']>;
  /** Array of salary updates to apply */
  updates: Array<UpdateMemberSalaryInput>;
};

export type BulkUpdateSystemSettingsInput = {
  settings: Array<UpdateSystemSettingInput>;
};

/** Глобальная бизнес-роль пользователя */
export enum BusinessRole {
  /** Бригадир - владелец команды, не может присоединяться к другим командам */
  Foreman = 'FOREMAN',
  /** Работник - член команды, не может создавать команды */
  Worker = 'WORKER'
}

/** Count by category */
export type CategoryCount = {
  __typename?: 'CategoryCount';
  category: AuditCategory;
  count: Scalars['Int']['output'];
};

export type ChangeEmailInput = {
  /** Новый email адрес */
  newEmail: Scalars['String']['input'];
  /** Код двухфакторной аутентификации (требуется, если 2FA включена) */
  twoFactorCode: InputMaybe<Scalars['String']['input']>;
};

export type ChangeEmailResult = {
  __typename?: 'ChangeEmailResult';
  /** Сообщение о результате операции */
  message: Scalars['String']['output'];
  /** Требуется ли подтверждение нового email (письмо отправлено) */
  pendingVerification: Scalars['Boolean']['output'];
  /** Успешно ли инициировано изменение email */
  success: Scalars['Boolean']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ChangePlanInput = {
  immediate: Scalars['Boolean']['input'];
  newPlan: InputMaybe<Scalars['String']['input']>;
  newPlanId: InputMaybe<Scalars['String']['input']>;
  subscriptionId: Scalars['String']['input'];
};

export type ChartData = {
  __typename?: 'ChartData';
  /** Chart data points */
  data: Array<Scalars['Float']['output']>;
  /** Chart labels */
  labels: Array<Scalars['String']['output']>;
};

export type CheckTelegramAuthInput = {
  token: Scalars['String']['input'];
};

/** Result of clone operation */
export type CloneResult = {
  __typename?: 'CloneResult';
  cloneLogId: Scalars['String']['output'];
  clonedTeamId: Scalars['String']['output'];
  error: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Input for cloning team */
export type CloneTeamInput = {
  cloneMembers: InputMaybe<Scalars['Boolean']['input']>;
  cloneProjects: InputMaybe<Scalars['Boolean']['input']>;
  cloneRoles: InputMaybe<Scalars['Boolean']['input']>;
  newTeamName: Scalars['String']['input'];
  sourceTeamId: Scalars['String']['input'];
};

export type CompleteOnboardingInput = {
  /** ID выбранного цвета (orange, blue, etc) */
  colorId: InputMaybe<Scalars['String']['input']>;
  /** ID выбранной иконки (hammer, wrench, etc) */
  iconId: InputMaybe<Scalars['String']['input']>;
  /** Загруженный файл логотипа */
  logoFile: InputMaybe<Scalars['Upload']['input']>;
  /** ID выбранного тарифного плана из таблицы Plan */
  planId: InputMaybe<Scalars['String']['input']>;
  /** Адрес проекта (необязательно) */
  projectAddress: InputMaybe<Scalars['String']['input']>;
  /** Описание проекта (необязательно) */
  projectDescription: InputMaybe<Scalars['String']['input']>;
  /** Название первого проекта */
  projectName: Scalars['String']['input'];
  /** Название бригады */
  teamName: Scalars['String']['input'];
};

/** Compliance report */
export type ComplianceReport = {
  __typename?: 'ComplianceReport';
  activePolicies: Scalars['Int']['output'];
  generatedAt: Scalars['DateTime']['output'];
  hasDataRetention: Scalars['Boolean']['output'];
  hasGDPRCompliance: Scalars['Boolean']['output'];
  lastAuditDate: Scalars['DateTime']['output'];
  pendingExports: Scalars['Int']['output'];
  teamId: Scalars['String']['output'];
  teamName: Scalars['String']['output'];
  totalAuditLogs: Scalars['Int']['output'];
};

export type ConfirmEmailChangeInput = {
  /** Токен подтверждения из email */
  token: Scalars['String']['input'];
};

export type ConnectionTestResult = {
  __typename?: 'ConnectionTestResult';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

/** Input for creating announcement */
export type CreateAnnouncementInput = {
  /** Announcement content */
  content: Scalars['String']['input'];
  /** Expiration date */
  expiresAt: InputMaybe<Scalars['DateTime']['input']>;
  isPinned: InputMaybe<Scalars['Boolean']['input']>;
  priority: InputMaybe<AnnouncementPriority>;
  /** Publish immediately */
  publishNow: InputMaybe<Scalars['Boolean']['input']>;
  /** Team ID (null = global) */
  teamId: InputMaybe<Scalars['String']['input']>;
  /** Announcement title */
  title: Scalars['String']['input'];
  type: InputMaybe<AnnouncementType>;
};

/** Input for creating a custom role */
export type CreateCustomRoleInput = {
  /** Role color (hex) */
  color: InputMaybe<Scalars['String']['input']>;
  /** Role description */
  description: InputMaybe<Scalars['String']['input']>;
  /** Hierarchy level (auto-calculated if not provided) */
  level: InputMaybe<Scalars['Int']['input']>;
  /** Role name */
  name: Scalars['String']['input'];
  /** Parent role ID for inheritance */
  parentRoleId: InputMaybe<Scalars['ID']['input']>;
  /** Permission keys */
  permissions: Array<Scalars['String']['input']>;
  /** Sort order */
  sortOrder: InputMaybe<Scalars['Int']['input']>;
  /** Team ID */
  teamId: Scalars['String']['input'];
};

/** Input for creating data export request */
export type CreateDataExportInput = {
  format: InputMaybe<ExportFormat>;
  teamId: InputMaybe<Scalars['String']['input']>;
  type: DataExportType;
  userId: InputMaybe<Scalars['String']['input']>;
};

export type CreateExpenseInput = {
  /** Сумма расхода */
  amount: Scalars['Float']['input'];
  /** Категория расхода */
  category: Scalars['String']['input'];
  /** Комментарий к расходу */
  comment: InputMaybe<Scalars['String']['input']>;
  /** Оплачено клиентом */
  paidByClient: InputMaybe<Scalars['Boolean']['input']>;
  /** Массив URL фотографий */
  photos: InputMaybe<Array<Scalars['String']['input']>>;
  /** ID проекта */
  projectId: Scalars['String']['input'];
};

export type CreatePayoutInput = {
  /** Payout amount */
  amount: Scalars['Float']['input'];
  /** Team member ID */
  memberId: Scalars['ID']['input'];
  /** Notes about the payout */
  notes: InputMaybe<Scalars['String']['input']>;
  /** Project ID */
  projectId: Scalars['ID']['input'];
};

export type CreatePhotoReportInput = {
  description: InputMaybe<Scalars['String']['input']>;
  isPublic: InputMaybe<Scalars['Boolean']['input']>;
  projectId: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateProjectInput = {
  /** Адрес объекта */
  address: InputMaybe<Scalars['String']['input']>;
  /** Бюджет проекта */
  budget: InputMaybe<Scalars['Float']['input']>;
  /** Телефон клиента */
  clientPhone: InputMaybe<Scalars['String']['input']>;
  /** Описание проекта */
  description: InputMaybe<Scalars['String']['input']>;
  /** Дата завершения проекта */
  endDate: InputMaybe<Scalars['DateTime']['input']>;
  /** Название проекта */
  name: Scalars['String']['input'];
  /** Заметки о проекте */
  notes: InputMaybe<Scalars['String']['input']>;
  /** Дата начала проекта */
  startDate: InputMaybe<Scalars['DateTime']['input']>;
  /** ID команды */
  teamId: Scalars['String']['input'];
};

/** Input for creating retention policy */
export type CreateRetentionPolicyInput = {
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  resourceType: Scalars['String']['input'];
  retentionDays: Scalars['Int']['input'];
  teamId: InputMaybe<Scalars['String']['input']>;
};

export type CreateSubscriptionInput = {
  plan: InputMaybe<Scalars['String']['input']>;
  /** Plan ID from database (new Plan model) */
  planId: InputMaybe<Scalars['String']['input']>;
  teamId: Scalars['String']['input'];
  useEarlyBird: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateSystemSettingInput = {
  category: SettingCategory;
  defaultValue: InputMaybe<Scalars['String']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  isEncrypted: Scalars['Boolean']['input'];
  isRequired: Scalars['Boolean']['input'];
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
  validationRules: InputMaybe<Scalars['JSON']['input']>;
  value: InputMaybe<Scalars['String']['input']>;
  valueType: SettingValueType;
};

export type CreateTaskInput = {
  /** ID назначенного участника команды */
  assigneeId: InputMaybe<Scalars['String']['input']>;
  /** Описание задачи */
  description: InputMaybe<Scalars['String']['input']>;
  /** Срок выполнения (ISO 8601) */
  dueDate: InputMaybe<Scalars['String']['input']>;
  /** Приоритет задачи */
  priority: InputMaybe<TaskPriority>;
  /** ID проекта */
  projectId: Scalars['String']['input'];
  /** Название задачи */
  title: Scalars['String']['input'];
};

/** Input for creating team from template */
export type CreateTeamFromTemplateInput = {
  ownerId: Scalars['String']['input'];
  teamName: Scalars['String']['input'];
  templateId: Scalars['String']['input'];
};

/** Input for creating team template */
export type CreateTeamTemplateInput = {
  description: InputMaybe<Scalars['String']['input']>;
  isPublic: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  projectSetup: InputMaybe<Scalars['JSON']['input']>;
  roles: Scalars['JSON']['input'];
  settings: Scalars['JSON']['input'];
};

/** Input for creating a new Telegram bot */
export type CreateTelegramBotInput = {
  /** Unique bot identifier (e.g., "oauth", "support", "notifications") */
  botName: Scalars['String']['input'];
  /** Description of bot purpose */
  description: InputMaybe<Scalars['String']['input']>;
  /** Display name for admin panel (e.g., "OAuth Bot", "Support Bot") */
  displayName: Scalars['String']['input'];
  /** Whether the bot should be active */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this is the primary OAuth bot */
  isPrimary: InputMaybe<Scalars['Boolean']['input']>;
  /** Bot token from @BotFather */
  token: Scalars['String']['input'];
};

export type CreateWorkLogInput = {
  /** Date of work (ISO string) */
  date: Scalars['String']['input'];
  /** Description of work done */
  description: InputMaybe<Scalars['String']['input']>;
  /** Hours worked (0.01 - 24.00) */
  hours: Scalars['Float']['input'];
  /** Team member ID */
  memberId: Scalars['ID']['input'];
  /** Project ID */
  projectId: Scalars['ID']['input'];
};

/** Custom team role with permissions */
export type CustomRole = {
  __typename?: 'CustomRole';
  /** Child roles */
  childRoles: Maybe<Array<CustomRole>>;
  /** Role color (hex) */
  color: Maybe<Scalars['String']['output']>;
  /** Creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Creator user ID */
  createdBy: Scalars['String']['output'];
  /** Role description */
  description: Maybe<Scalars['String']['output']>;
  /** Effective permissions (including inherited) */
  effectivePermissions: Maybe<Array<Scalars['String']['output']>>;
  /** Role ID */
  id: Scalars['ID']['output'];
  /** Is role active */
  isActive: Scalars['Boolean']['output'];
  /** Is built-in system role (cannot be deleted) */
  isBuiltIn: Scalars['Boolean']['output'];
  /** Role hierarchy level (0 = base) */
  level: Scalars['Int']['output'];
  /** Number of members with this role */
  memberCount: Maybe<Scalars['Int']['output']>;
  /** Last modifier user ID */
  modifiedBy: Maybe<Scalars['String']['output']>;
  /** Role name (e.g., "Старший прораб", "Бухгалтер") */
  name: Scalars['String']['output'];
  /** Parent role */
  parentRole: Maybe<CustomRole>;
  /** Parent role ID for inheritance */
  parentRoleId: Maybe<Scalars['ID']['output']>;
  /** Array of permission keys */
  permissions: Array<Scalars['String']['output']>;
  /** Display sort order */
  sortOrder: Scalars['Int']['output'];
  /** Team ID */
  teamId: Scalars['String']['output'];
  /** Last update timestamp */
  updatedAt: Scalars['DateTime']['output'];
};

export type DashboardPaymentStats = {
  __typename?: 'DashboardPaymentStats';
  /** Average payment amount */
  averagePayment: Scalars['Float']['output'];
  /** Succeeded payments */
  succeeded: Scalars['Int']['output'];
  /** Revenue this month */
  thisMonthRevenue: Scalars['Float']['output'];
  /** Top paying teams */
  topPayingTeams: Array<TopPayingTeamItem>;
  /** Total payments */
  total: Scalars['Int']['output'];
  /** Total revenue */
  totalRevenue: Scalars['Float']['output'];
};

export type DashboardProjectStats = {
  __typename?: 'DashboardProjectStats';
  /** Active projects */
  active: Scalars['Int']['output'];
  /** Archived projects */
  archived: Scalars['Int']['output'];
  /** Projects by team */
  byTeam: Array<ProjectsByTeamItem>;
  /** Completed projects */
  completed: Scalars['Int']['output'];
  /** Total number of projects */
  total: Scalars['Int']['output'];
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  /** Payment statistics */
  payments: DashboardPaymentStats;
  /** Project statistics */
  projects: DashboardProjectStats;
  /** Storage statistics */
  storage: DashboardStorageStats;
  /** Subscription statistics */
  subscriptions: DashboardSubscriptionStats;
  /** Team statistics */
  teams: DashboardTeamStats;
  /** User statistics */
  users: DashboardUserStats;
};

export type DashboardStorageStats = {
  __typename?: 'DashboardStorageStats';
  /** Average storage per team in bytes */
  averagePerTeam: Scalars['Float']['output'];
  /** Total storage used in bytes */
  totalUsedBytes: Scalars['Float']['output'];
  /** Total storage used in GB */
  totalUsedGB: Scalars['Float']['output'];
};

export type DashboardSubscriptionStats = {
  __typename?: 'DashboardSubscriptionStats';
  /** Active subscriptions */
  active: Scalars['Int']['output'];
  /** Subscriptions by plan */
  byPlan: DashboardSubscriptionsByPlan;
  /** Cancelled subscriptions */
  cancelled: Scalars['Int']['output'];
  /** Total subscriptions */
  total: Scalars['Int']['output'];
  /** Trialing subscriptions */
  trialing: Scalars['Int']['output'];
};

export type DashboardSubscriptionsByPlan = {
  __typename?: 'DashboardSubscriptionsByPlan';
  /** BRIGADE subscriptions */
  BRIGADE: Scalars['Int']['output'];
  /** FOREMAN subscriptions */
  FOREMAN: Scalars['Int']['output'];
  /** LITE subscriptions */
  LITE: Scalars['Int']['output'];
};

export type DashboardTeamStats = {
  __typename?: 'DashboardTeamStats';
  /** Average members per team */
  averageMembers: Scalars['Float']['output'];
  /** New teams this month */
  newThisMonth: Scalars['Int']['output'];
  /** Top teams by member count */
  topTeamsByMembers: Array<TopTeamItem>;
  /** Total number of teams */
  total: Scalars['Int']['output'];
  /** Teams with active subscription */
  withActiveSubscription: Scalars['Int']['output'];
};

export type DashboardUserStats = {
  __typename?: 'DashboardUserStats';
  /** Active users in last month */
  activeLastMonth: Scalars['Int']['output'];
  /** Active users in last week */
  activeLastWeek: Scalars['Int']['output'];
  /** Number of admin users */
  admins: Scalars['Int']['output'];
  /** Users by business role */
  byBusinessRole: UsersByBusinessRole;
  /** Growth rate percentage */
  growthRate: Scalars['Float']['output'];
  /** New users this month */
  newThisMonth: Scalars['Int']['output'];
  /** Total number of users */
  total: Scalars['Int']['output'];
  /** Number of verified users */
  verified: Scalars['Int']['output'];
};

/** Data export request */
export type DataExportRequest = {
  __typename?: 'DataExportRequest';
  completedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  errorMessage: Maybe<Scalars['String']['output']>;
  expiresAt: Maybe<Scalars['DateTime']['output']>;
  fileUrl: Maybe<Scalars['String']['output']>;
  format: ExportFormat;
  id: Scalars['ID']['output'];
  requestedById: Scalars['String']['output'];
  requestedByName: Maybe<Scalars['String']['output']>;
  status: ExportStatus;
  teamId: Maybe<Scalars['String']['output']>;
  teamName: Maybe<Scalars['String']['output']>;
  type: DataExportType;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
};

export enum DataExportType {
  AuditLogs = 'AUDIT_LOGS',
  GdprFull = 'GDPR_FULL',
  TeamData = 'TEAM_DATA',
  UserData = 'USER_DATA'
}

/** Data retention policy */
export type DataRetentionPolicy = {
  __typename?: 'DataRetentionPolicy';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  resourceType: Scalars['String']['output'];
  retentionDays: Scalars['Int']['output'];
  teamId: Maybe<Scalars['String']['output']>;
  teamName: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type DeleteAccountInput = {
  /** Пароль пользователя для подтверждения удаления */
  password: Scalars['String']['input'];
};

export type DeleteResult = {
  __typename?: 'DeleteResult';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Disable2FaInput = {
  token: Scalars['String']['input'];
};

export type EarlyBirdStatsModel = {
  __typename?: 'EarlyBirdStatsModel';
  /** Whether Early Bird program is still available */
  isAvailable: Scalars['Boolean']['output'];
  /** Total Early Bird subscription limit */
  limit: Scalars['Int']['output'];
  /** Remaining Early Bird subscriptions */
  remaining: Scalars['Int']['output'];
  /** Total number of active teams/subscriptions */
  totalTeams: Scalars['Int']['output'];
  /** Number of Early Bird subscriptions used */
  used: Scalars['Int']['output'];
};

export type Enable2FaInput = {
  secret: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type Expense = {
  __typename?: 'Expense';
  /** Сумма расхода */
  amount: Scalars['Float']['output'];
  /** Категория расхода */
  category: Scalars['String']['output'];
  /** Комментарий к расходу */
  comment: Maybe<Scalars['String']['output']>;
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** ID создателя расхода */
  createdById: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** Оплачено клиентом */
  paidByClient: Scalars['Boolean']['output'];
  /** Массив URL фотографий */
  photos: Array<Scalars['String']['output']>;
  /** ID проекта */
  projectId: Scalars['ID']['output'];
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
};

export enum ExportFormat {
  Csv = 'CSV',
  Json = 'JSON',
  Pdf = 'PDF'
}

export enum ExportStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING'
}

export type FileTypeStats = {
  __typename?: 'FileTypeStats';
  /** Number of files */
  count: Scalars['Int']['output'];
  /** File type (avatars, team-logos, etc.) */
  fileType: Scalars['String']['output'];
  /** Total size in bytes */
  totalSize: Scalars['Float']['output'];
};

export type InviteCode = {
  __typename?: 'InviteCode';
  /** Уникальный код приглашения */
  code: Scalars['String']['output'];
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** Дата истечения срока действия */
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Полная ссылка приглашения */
  inviteUrl: Scalars['String']['output'];
  /** Является ли код активным (не истёк и не использован) */
  isActive: Scalars['Boolean']['output'];
  /** Команда */
  team: Maybe<Team>;
  teamId: Scalars['ID']['output'];
  /** Дата использования кода */
  usedAt: Maybe<Scalars['DateTime']['output']>;
  /** ID пользователя, использовавшего код */
  usedBy: Maybe<Scalars['ID']['output']>;
};

export type LoginHistory = {
  __typename?: 'LoginHistory';
  browser: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  device: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  ip: Scalars['String']['output'];
  os: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** Тип логотипа команды */
export enum LogoType {
  Default = 'DEFAULT',
  Generated = 'GENERATED',
  Uploaded = 'UPLOADED'
}

/** Member activity metrics */
export type MemberActivity = {
  __typename?: 'MemberActivity';
  /** Total actions count (work logs, expenses, etc.) */
  actionsCount: Scalars['Int']['output'];
  /** User avatar URL */
  avatarUrl: Maybe<Scalars['String']['output']>;
  /** User email */
  email: Maybe<Scalars['String']['output']>;
  /** Total hours logged */
  hoursLogged: Scalars['Float']['output'];
  /** Date joined the team */
  joinedAt: Scalars['DateTime']['output'];
  /** Last activity timestamp */
  lastActiveAt: Maybe<Scalars['DateTime']['output']>;
  /** Position in team */
  position: Maybe<Scalars['String']['output']>;
  /** Projects participated in */
  projectsCount: Scalars['Int']['output'];
  /** Team role (OWNER/MEMBER) */
  role: Scalars['String']['output'];
  /** User ID */
  userId: Scalars['String']['output'];
  /** User full name */
  userName: Scalars['String']['output'];
};

/** Paginated member activity */
export type MemberActivityConnection = {
  __typename?: 'MemberActivityConnection';
  /** Activity events */
  events: Array<MemberActivityEvent>;
  /** Has more pages */
  hasMore: Scalars['Boolean']['output'];
  /** Total count */
  totalCount: Scalars['Int']['output'];
};

/** Member activity event */
export type MemberActivityEvent = {
  __typename?: 'MemberActivityEvent';
  /** Event timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Event description */
  description: Scalars['String']['output'];
  /** Event ID */
  id: Scalars['ID']['output'];
  /** Additional details (JSON) */
  metadata: Maybe<Scalars['String']['output']>;
  /** Related entity ID */
  relatedId: Maybe<Scalars['String']['output']>;
  /** Related entity type */
  relatedType: Maybe<Scalars['String']['output']>;
  /** Triggered by user ID */
  triggeredBy: Maybe<Scalars['String']['output']>;
  /** Triggered by user name */
  triggeredByName: Maybe<Scalars['String']['output']>;
  /** Activity type */
  type: MemberActivityType;
};

/** Types of member activity events */
export enum MemberActivityType {
  ExpenseAdded = 'EXPENSE_ADDED',
  Joined = 'JOINED',
  PayoutReceived = 'PAYOUT_RECEIVED',
  Removed = 'REMOVED',
  RoleChanged = 'ROLE_CHANGED',
  SalaryChanged = 'SALARY_CHANGED',
  TaskAssigned = 'TASK_ASSIGNED',
  TaskCompleted = 'TASK_COMPLETED',
  WorklogAdded = 'WORKLOG_ADDED'
}

export type MemberAnalytics = {
  __typename?: 'MemberAnalytics';
  avatarUrl: Maybe<Scalars['String']['output']>;
  averagePayoutPerProject: Scalars['Float']['output'];
  completedPayoutsCount: Scalars['Int']['output'];
  joinedAt: Scalars['DateTime']['output'];
  memberEmail: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
  memberName: Scalars['String']['output'];
  pendingPayoutsCount: Scalars['Int']['output'];
  position: Maybe<Scalars['String']['output']>;
  projectsCount: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  salaryAmount: Maybe<Scalars['Float']['output']>;
  salaryType: Scalars['String']['output'];
  totalHoursWorked: Scalars['Float']['output'];
  totalPayouts: Scalars['Float']['output'];
};

/** Export format for member data */
export enum MemberExportFormat {
  Csv = 'CSV',
  Json = 'JSON',
  Xlsx = 'XLSX'
}

/** Filter for team members */
export type MemberFilterInput = {
  /** Filter by custom role IDs */
  customRoleIds: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter by active status (last 30 days) */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Joined after date */
  joinedAfter: InputMaybe<Scalars['DateTime']['input']>;
  /** Joined before date */
  joinedBefore: InputMaybe<Scalars['DateTime']['input']>;
  /** Filter by positions */
  positions: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter by roles */
  roles: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter by salary types */
  salaryTypes: InputMaybe<Array<Scalars['String']['input']>>;
  /** Search by name, email, position */
  search: InputMaybe<Scalars['String']['input']>;
};

export type MemberPayoutDetail = {
  __typename?: 'MemberPayoutDetail';
  /** Calculated payout for this member */
  calculatedPayout: Scalars['Float']['output'];
  memberId: Scalars['ID']['output'];
  memberName: Scalars['String']['output'];
  /** Salary amount or percentage */
  salaryAmount: Maybe<Scalars['Float']['output']>;
  /** Salary type: fixed, percentage, none */
  salaryType: Scalars['String']['output'];
  /** Payout status: pending, paid */
  status: Scalars['String']['output'];
};

/** Member statistics summary */
export type MemberStatistics = {
  __typename?: 'MemberStatistics';
  /** Active members (activity in last 30 days) */
  activeMembers: Scalars['Int']['output'];
  /** Average hours per member */
  averageHours: Scalars['Float']['output'];
  /** Inactive members */
  inactiveMembers: Scalars['Int']['output'];
  /** Total members */
  totalMembers: Scalars['Int']['output'];
  /** Total payroll (fixed salaries) */
  totalPayroll: Scalars['Float']['output'];
  /** Members with custom roles */
  withCustomRoles: Scalars['Int']['output'];
  /** Members with fixed salary */
  withFixedSalary: Scalars['Int']['output'];
  /** Members with no salary */
  withNoSalary: Scalars['Int']['output'];
  /** Members with percentage salary */
  withPercentageSalary: Scalars['Int']['output'];
};

/** Preview of team merge operation */
export type MergePreview = {
  __typename?: 'MergePreview';
  canMerge: Scalars['Boolean']['output'];
  conflictingMembers: Scalars['Int']['output'];
  membersToMove: Scalars['Int']['output'];
  projectsToMove: Scalars['Int']['output'];
  sourceTeamId: Scalars['String']['output'];
  sourceTeamName: Scalars['String']['output'];
  targetTeamId: Scalars['String']['output'];
  targetTeamName: Scalars['String']['output'];
  warnings: Array<Scalars['String']['output']>;
};

/** Result of merge operation */
export type MergeResult = {
  __typename?: 'MergeResult';
  errors: Maybe<Array<Scalars['String']['output']>>;
  membersMoved: Scalars['Int']['output'];
  mergeLogId: Scalars['String']['output'];
  projectsMoved: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

/** Input for merging teams */
export type MergeTeamsInput = {
  deleteSourceTeam: InputMaybe<Scalars['Boolean']['input']>;
  notes: InputMaybe<Scalars['String']['input']>;
  sourceTeamId: Scalars['String']['input'];
  targetTeamId: Scalars['String']['input'];
};

export type MigrationFailure = {
  __typename?: 'MigrationFailure';
  /** Error message */
  error: Scalars['String']['output'];
  /** File URL */
  url: Scalars['String']['output'];
};

export type MoveTaskInput = {
  /** Новый индекс позиции (orderIndex) */
  newOrderIndex: Scalars['Int']['input'];
  /** Новый статус задачи */
  newStatus: TaskStatus;
  /** ID перемещаемой задачи */
  taskId: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Добавить фото к фотоотчёту */
  addPhotoToReport: ReportPhoto;
  /** Activate a plan (set isActive = true) - Admin only */
  adminActivatePlan: AdminPlanModel;
  /** Archive a plan (set isActive = false) - Admin only */
  adminArchivePlan: AdminPlanModel;
  /** Archive project (admin only) */
  adminArchiveProject: AdminProject;
  /** Assign a custom role to a team member */
  adminAssignRole: Scalars['Boolean']['output'];
  /** Assign a custom role to multiple team members */
  adminBulkAssignRole: Scalars['Int']['output'];
  /** Bulk remove team members */
  adminBulkRemoveMembers: BulkOperationResult;
  /** Bulk update team members */
  adminBulkUpdateMembers: BulkOperationResult;
  /** Cancel subscription (Admin only) */
  adminCancelSubscription: Subscription;
  /** Change team subscription plan (Admin only) */
  adminChangeTeamPlan: Team;
  /** Clear payment provider cache (force re-initialization) - Admin only */
  adminClearPaymentProviderCache: Scalars['Boolean']['output'];
  adminCloneTeam: CloneResult;
  adminCreateAnnouncement: TeamAnnouncement;
  /** Create a new custom role */
  adminCreateCustomRole: CustomRole;
  adminCreateDataExportRequest: DataExportRequest;
  /** Create a new plan - Admin only */
  adminCreatePlan: AdminPlanModel;
  adminCreateRetentionPolicy: DataRetentionPolicy;
  adminCreateTeamFromTemplate: CloneResult;
  adminCreateTeamTemplate: TeamTemplate;
  /** Create a new Telegram bot - Admin only */
  adminCreateTelegramBot: AdminTelegramBotModel;
  adminDeleteAnnouncement: Scalars['Boolean']['output'];
  /** Delete a custom role */
  adminDeleteCustomRole: Scalars['Boolean']['output'];
  /** Delete payment (Admin only) */
  adminDeletePayment: Scalars['Boolean']['output'];
  /** Delete a plan (only if no active subscriptions exist) - Admin only */
  adminDeletePlan: Scalars['Boolean']['output'];
  /** Delete project (admin only) */
  adminDeleteProject: DeleteResult;
  adminDeleteRetentionPolicy: Scalars['Boolean']['output'];
  /** Delete subscription (Admin only) */
  adminDeleteSubscription: Scalars['Boolean']['output'];
  /** Delete support ticket (admin only) */
  adminDeleteSupportTicket: DeleteResult;
  /** Delete a team (Admin only) */
  adminDeleteTeam: Scalars['Boolean']['output'];
  adminDeleteTeamTemplate: Scalars['Boolean']['output'];
  /** Delete a Telegram bot - Admin only */
  adminDeleteTelegramBot: Scalars['Boolean']['output'];
  /** Delete webhook for a bot - Admin only */
  adminDeleteTelegramWebhook: Scalars['Boolean']['output'];
  /** Delete a user account (Admin only) */
  adminDeleteUser: Scalars['Boolean']['output'];
  adminMarkAnnouncementAsRead: Scalars['Boolean']['output'];
  adminMergeTeams: MergeResult;
  adminPublishAnnouncement: TeamAnnouncement;
  /** Reactivate cancelled subscription (Admin only) */
  adminReactivateSubscription: Subscription;
  /** Issue refund for payment (Admin only) */
  adminRefundPayment: AdminPayment;
  /** Reload a bot (hot reload without restart) - Admin only */
  adminReloadTelegramBot: Scalars['Boolean']['output'];
  /** Remove a member from a team (Admin only) */
  adminRemoveTeamMember: Scalars['Boolean']['output'];
  /** Send password reset link to user (Admin only) */
  adminResetUserPassword: Scalars['Boolean']['output'];
  /** Send message in support ticket (admin only) */
  adminSendSupportMessage: SupportMessage;
  /** Set webhook for a bot - Admin only */
  adminSetTelegramWebhook: Scalars['Boolean']['output'];
  /** Sync bot information from Telegram API - Admin only */
  adminSyncTelegramBot: AdminTelegramBotModel;
  /** Test payment provider connection - Admin only */
  adminTestPaymentProvider: TestConnectionResult;
  /** Test a bot token without saving it - Admin only */
  adminTestTelegramBot: TestBotResult;
  /** Transfer member to another team */
  adminTransferMember: TeamMemberExtended;
  adminUnpublishAnnouncement: TeamAnnouncement;
  adminUpdateAnnouncement: TeamAnnouncement;
  /** Update an existing custom role */
  adminUpdateCustomRole: CustomRole;
  /** Update payment provider settings and configuration - Admin only */
  adminUpdatePaymentProvider: AdminPaymentProviderModel;
  /** Update payment status (Admin only) */
  adminUpdatePaymentStatus: AdminPayment;
  /** Update an existing plan - Admin only */
  adminUpdatePlan: AdminPlanModel;
  /** Update project status (admin only) */
  adminUpdateProjectStatus: AdminProject;
  adminUpdateRetentionPolicy: DataRetentionPolicy;
  /** Update subscription (Admin only) */
  adminUpdateSubscription: Subscription;
  /** Update support ticket (admin only) */
  adminUpdateSupportTicket: AdminSupportTicket;
  /** Update team information (Admin only) */
  adminUpdateTeam: Team;
  adminUpdateTeamTemplate: TeamTemplate;
  /** Update an existing Telegram bot - Admin only */
  adminUpdateTelegramBot: AdminTelegramBotModel;
  /** Update user information (Admin only) */
  adminUpdateUser: User;
  /** Manually verify user email (Admin only) */
  adminVerifyUserEmail: User;
  /** Архивировать проект */
  archiveProject: Project;
  assignAdminRole: AdminRoleDetail;
  /** Bulk create work log entries (owner or self) */
  bulkCreateWorkLogs: BulkUpdateResult;
  /** Bulk update member salaries (owner only) */
  bulkUpdateMemberSalaries: BulkUpdateResult;
  /** Bulk update system settings (admin only) */
  bulkUpdateSystemSettings: Array<SystemSetting>;
  cancelSubscription: Subscription;
  changeAdminRole: AdminRoleDetail;
  changePassword: Scalars['Boolean']['output'];
  changePlan: Subscription;
  checkTelegramAuth: TelegramAuthStatusPayload;
  /** Close project with final calculations (owner only) */
  closeProject: Project;
  /** Завершение онбординга: создание команды и первого проекта */
  completeOnboarding: OnboardingResult;
  /** Подтвердить изменение email адреса по токену из письма */
  confirmEmailChange: Scalars['Boolean']['output'];
  /** Подтвердить mock платёж (для разработки/тестирования) */
  confirmMockPayment: Scalars['Boolean']['output'];
  /** Создать расход */
  createExpense: Expense;
  /** Создание ссылки-приглашения в команду (только для владельца) */
  createInviteLink: InviteCode;
  /** Create or update payout (mark as paid) (owner only) */
  createPayout: ProjectPayout;
  /** Создать новый фотоотчёт */
  createPhotoReport: PhotoReport;
  /** Создать проект */
  createProject: Project;
  createSubscription: Subscription;
  /** Create a new system setting (super admin only) */
  createSystemSetting: SystemSetting;
  /** Создать задачу */
  createTask: Task;
  /** Create a new work log entry (owner or self) */
  createWorkLog: WorkLog;
  /** Удаление аккаунта пользователя */
  deleteAccount: Scalars['Boolean']['output'];
  /** Удаление аватара пользователя */
  deleteAvatar: User;
  /** Удалить расход */
  deleteExpense: Expense;
  /** Удаление кода приглашения (только для владельца) */
  deleteInviteCode: Scalars['Boolean']['output'];
  /** Удалить фото из фотоотчёта */
  deletePhotoFromReport: Scalars['Boolean']['output'];
  /** Удалить фотоотчёт */
  deletePhotoReport: Scalars['Boolean']['output'];
  /** Delete a system setting (super admin only) */
  deleteSystemSetting: Scalars['Boolean']['output'];
  /** Удалить задачу */
  deleteTask: Task;
  /** Delete a work log entry (owner or creator) */
  deleteWorkLog: Scalars['Boolean']['output'];
  disable2FA: TwoFactorDisableResponse;
  /** Отключение Telegram от аккаунта */
  disconnectTelegram: User;
  enable2FA: TwoFactorEnableResponse;
  forgotPassword: Scalars['Boolean']['output'];
  generate2FASecret: TwoFactorSetup;
  initTelegramAuth: TelegramAuthPayload;
  /** Initialize default system settings (super admin only) */
  initializeDefaultSettings: Scalars['Boolean']['output'];
  /** Инициализировать платёж с автоматическим выбором провайдера по геолокации */
  initializePayment: PaymentUrl;
  /** Инициировать изменение email адреса (требуется 2FA, если включена) */
  initiateEmailChange: ChangeEmailResult;
  /** Присоединение к команде по коду приглашения */
  joinTeamByInvite: TeamMember;
  /** Привязать Telegram аккаунт к текущему пользователю */
  linkTelegramAccount: Scalars['Boolean']['output'];
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  /** Migrate a user's files from one provider to another */
  migrateUserStorage: StorageMigrationResult;
  /** Переместить задачу (drag & drop) */
  moveTask: Task;
  reactivateSubscription: Subscription;
  refreshSession: Maybe<AuthPayload>;
  regenerate2FABackupCodes: BackupCodesResponse;
  register: AuthPayload;
  /** Удаление участника из команды (только для владельца) */
  removeTeamMember: Scalars['Boolean']['output'];
  /** Изменить порядок фотографий */
  reorderReportPhotos: Scalars['Boolean']['output'];
  /** Запросить изменение email адреса. Требуется 2FA код, если двухфакторная аутентификация включена. */
  requestEmailChange: Scalars['Boolean']['output'];
  resendVerificationEmail: Scalars['Boolean']['output'];
  resetPassword: Scalars['Boolean']['output'];
  /** Восстановить проект */
  restoreProject: Project;
  revokeAdminRole: Scalars['Boolean']['output'];
  revokeAllSessions: Scalars['Boolean']['output'];
  revokeAllSessionsIncludingCurrent: Scalars['Boolean']['output'];
  revokeSession: Scalars['Boolean']['output'];
  /** Отправка приглашения в команду по email */
  sendInviteByEmail: SendInviteResult;
  /** Test connection for a service category (admin only) */
  testServiceConnection: ConnectionTestResult;
  /** Test connection to a specific storage provider */
  testStorageProvider: ProviderTestResult;
  updateAdminPermissions: AdminRoleDetail;
  /** Обновить расход */
  updateExpense: Expense;
  updateIpWhitelist: AdminRoleDetail;
  /** Update team member position/specialization (owner only) */
  updateMemberPosition: TeamMember;
  /** Update team member salary settings (owner only) */
  updateMemberSalary: TeamMember;
  updateNotificationSettings: NotificationSettings;
  /** Update payment method and receipt for payout (owner only) */
  updatePayoutPayment: ProjectPayout;
  /** Обновить подпись фото */
  updatePhotoCaption: ReportPhoto;
  /** Обновить фотоотчёт */
  updatePhotoReport: PhotoReport;
  /** Обновление профиля пользователя */
  updateProfile: User;
  /** Обновить проект */
  updateProject: Project;
  /** Обновить прогресс проекта */
  updateProjectProgress: Project;
  /** Обновить предпочтение хранилища пользователя */
  updateStoragePreference: UserStoragePreference;
  /** Update storage provider settings */
  updateStorageSettings: StorageSettings;
  /** Update a system setting value (admin only) */
  updateSystemSetting: SystemSetting;
  /** Обновить задачу */
  updateTask: Task;
  /** Обновление настроек команды (только для владельца) */
  updateTeam: Team;
  updateTwoFactorEnforcement: AdminRoleDetail;
  /** Update a work log entry (owner or creator) */
  updateWorkLog: WorkLog;
  /** Загрузка аватара пользователя */
  uploadAvatar: User;
  /** Загрузить фото в фотоотчёт (с обработкой) */
  uploadPhotoToReport: ReportPhoto;
  verifyEmail: Scalars['Boolean']['output'];
  /** Подтвердить изменение email адреса по токену из письма */
  verifyEmailChange: Scalars['Boolean']['output'];
  verifyTwoFactorLogin: AuthPayload;
};


export type MutationAddPhotoToReportArgs = {
  input: AddPhotoInput;
};


export type MutationAdminActivatePlanArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminArchivePlanArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminArchiveProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationAdminAssignRoleArgs = {
  input: AssignRoleInput;
};


export type MutationAdminBulkAssignRoleArgs = {
  input: BulkAssignRoleInput;
};


export type MutationAdminBulkRemoveMembersArgs = {
  input: BulkRemoveMembersInput;
};


export type MutationAdminBulkUpdateMembersArgs = {
  input: BulkUpdateMembersInput;
};


export type MutationAdminCancelSubscriptionArgs = {
  cancelAtPeriodEnd?: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
};


export type MutationAdminChangeTeamPlanArgs = {
  planType: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationAdminClearPaymentProviderCacheArgs = {
  type: InputMaybe<PaymentProviderType>;
};


export type MutationAdminCloneTeamArgs = {
  input: CloneTeamInput;
};


export type MutationAdminCreateAnnouncementArgs = {
  input: CreateAnnouncementInput;
};


export type MutationAdminCreateCustomRoleArgs = {
  input: CreateCustomRoleInput;
};


export type MutationAdminCreateDataExportRequestArgs = {
  input: CreateDataExportInput;
};


export type MutationAdminCreatePlanArgs = {
  input: AdminCreatePlanInput;
};


export type MutationAdminCreateRetentionPolicyArgs = {
  input: CreateRetentionPolicyInput;
};


export type MutationAdminCreateTeamFromTemplateArgs = {
  input: CreateTeamFromTemplateInput;
};


export type MutationAdminCreateTeamTemplateArgs = {
  input: CreateTeamTemplateInput;
};


export type MutationAdminCreateTelegramBotArgs = {
  input: CreateTelegramBotInput;
};


export type MutationAdminDeleteAnnouncementArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeleteCustomRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type MutationAdminDeletePaymentArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeletePlanArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeleteProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationAdminDeleteRetentionPolicyArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeleteSubscriptionArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeleteSupportTicketArgs = {
  ticketId: Scalars['ID']['input'];
};


export type MutationAdminDeleteTeamArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeleteTeamTemplateArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminDeleteTelegramBotArgs = {
  botId: Scalars['ID']['input'];
};


export type MutationAdminDeleteTelegramWebhookArgs = {
  botId: Scalars['ID']['input'];
};


export type MutationAdminDeleteUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminMarkAnnouncementAsReadArgs = {
  announcementId: Scalars['String']['input'];
};


export type MutationAdminMergeTeamsArgs = {
  input: MergeTeamsInput;
};


export type MutationAdminPublishAnnouncementArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminReactivateSubscriptionArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminRefundPaymentArgs = {
  id: Scalars['String']['input'];
  input: RefundPaymentInput;
};


export type MutationAdminReloadTelegramBotArgs = {
  botId: Scalars['ID']['input'];
};


export type MutationAdminRemoveTeamMemberArgs = {
  memberId: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationAdminResetUserPasswordArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminSendSupportMessageArgs = {
  input: AdminSendMessageInput;
};


export type MutationAdminSetTelegramWebhookArgs = {
  input: SetWebhookInput;
};


export type MutationAdminSyncTelegramBotArgs = {
  botId: Scalars['ID']['input'];
};


export type MutationAdminTestPaymentProviderArgs = {
  type: PaymentProviderType;
};


export type MutationAdminTestTelegramBotArgs = {
  input: TestBotTokenInput;
};


export type MutationAdminTransferMemberArgs = {
  input: TransferMemberInput;
};


export type MutationAdminUnpublishAnnouncementArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminUpdateAnnouncementArgs = {
  input: UpdateAnnouncementInput;
};


export type MutationAdminUpdateCustomRoleArgs = {
  input: UpdateCustomRoleInput;
};


export type MutationAdminUpdatePaymentProviderArgs = {
  input: UpdatePaymentProviderInput;
  type: PaymentProviderType;
};


export type MutationAdminUpdatePaymentStatusArgs = {
  id: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationAdminUpdatePlanArgs = {
  id: Scalars['String']['input'];
  input: AdminUpdatePlanInput;
};


export type MutationAdminUpdateProjectStatusArgs = {
  projectId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationAdminUpdateRetentionPolicyArgs = {
  input: UpdateRetentionPolicyInput;
};


export type MutationAdminUpdateSubscriptionArgs = {
  id: Scalars['String']['input'];
  input: UpdateSubscriptionInput;
};


export type MutationAdminUpdateSupportTicketArgs = {
  input: AdminUpdateSupportTicketInput;
  ticketId: Scalars['ID']['input'];
};


export type MutationAdminUpdateTeamArgs = {
  id: Scalars['String']['input'];
  input: AdminUpdateTeamInput;
};


export type MutationAdminUpdateTeamTemplateArgs = {
  input: UpdateTeamTemplateInput;
};


export type MutationAdminUpdateTelegramBotArgs = {
  botId: Scalars['ID']['input'];
  input: UpdateTelegramBotInput;
};


export type MutationAdminUpdateUserArgs = {
  id: Scalars['String']['input'];
  input: AdminUpdateUserInput;
};


export type MutationAdminVerifyUserEmailArgs = {
  id: Scalars['String']['input'];
};


export type MutationArchiveProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAssignAdminRoleArgs = {
  input: AssignAdminRoleInput;
};


export type MutationBulkCreateWorkLogsArgs = {
  input: BulkCreateWorkLogInput;
};


export type MutationBulkUpdateMemberSalariesArgs = {
  input: BulkUpdateSalaryInput;
};


export type MutationBulkUpdateSystemSettingsArgs = {
  input: BulkUpdateSystemSettingsInput;
};


export type MutationCancelSubscriptionArgs = {
  subscriptionId: Scalars['String']['input'];
};


export type MutationChangeAdminRoleArgs = {
  newRole: Scalars['String']['input'];
  roleId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationChangePlanArgs = {
  input: ChangePlanInput;
};


export type MutationCheckTelegramAuthArgs = {
  input: CheckTelegramAuthInput;
};


export type MutationCloseProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationCompleteOnboardingArgs = {
  input: CompleteOnboardingInput;
};


export type MutationConfirmEmailChangeArgs = {
  input: ConfirmEmailChangeInput;
};


export type MutationConfirmMockPaymentArgs = {
  paymentId: Scalars['String']['input'];
};


export type MutationCreateExpenseArgs = {
  input: CreateExpenseInput;
};


export type MutationCreateInviteLinkArgs = {
  expiresInDays?: InputMaybe<Scalars['Int']['input']>;
  teamId: Scalars['ID']['input'];
};


export type MutationCreatePayoutArgs = {
  input: CreatePayoutInput;
};


export type MutationCreatePhotoReportArgs = {
  input: CreatePhotoReportInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateSubscriptionArgs = {
  input: CreateSubscriptionInput;
};


export type MutationCreateSystemSettingArgs = {
  input: CreateSystemSettingInput;
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationCreateWorkLogArgs = {
  input: CreateWorkLogInput;
};


export type MutationDeleteAccountArgs = {
  input: DeleteAccountInput;
};


export type MutationDeleteExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteInviteCodeArgs = {
  codeId: Scalars['ID']['input'];
};


export type MutationDeletePhotoFromReportArgs = {
  photoId: Scalars['String']['input'];
};


export type MutationDeletePhotoReportArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteSystemSettingArgs = {
  key: Scalars['String']['input'];
};


export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDisable2FaArgs = {
  input: Disable2FaInput;
};


export type MutationEnable2FaArgs = {
  input: Enable2FaInput;
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationInitializePaymentArgs = {
  providerType: InputMaybe<Scalars['String']['input']>;
  subscriptionId: Scalars['String']['input'];
  targetPlan: InputMaybe<Scalars['String']['input']>;
  targetPlanId: InputMaybe<Scalars['String']['input']>;
};


export type MutationInitiateEmailChangeArgs = {
  input: ChangeEmailInput;
};


export type MutationJoinTeamByInviteArgs = {
  code: Scalars['String']['input'];
};


export type MutationLinkTelegramAccountArgs = {
  token: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMigrateUserStorageArgs = {
  fromProvider: StorageProviderType;
  toProvider: StorageProviderType;
  userId: Scalars['String']['input'];
};


export type MutationMoveTaskArgs = {
  input: MoveTaskInput;
};


export type MutationReactivateSubscriptionArgs = {
  subscriptionId: Scalars['String']['input'];
};


export type MutationRegenerate2FaBackupCodesArgs = {
  input: RegenerateBackupCodesInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveTeamMemberArgs = {
  memberId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationReorderReportPhotosArgs = {
  photoIds: Array<Scalars['String']['input']>;
  reportId: Scalars['String']['input'];
};


export type MutationRequestEmailChangeArgs = {
  input: RequestChangeEmailInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationRestoreProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRevokeAdminRoleArgs = {
  roleId: Scalars['String']['input'];
};


export type MutationRevokeSessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationSendInviteByEmailArgs = {
  input: SendInviteByEmailInput;
};


export type MutationTestServiceConnectionArgs = {
  category: SettingCategory;
};


export type MutationTestStorageProviderArgs = {
  provider: StorageProviderType;
};


export type MutationUpdateAdminPermissionsArgs = {
  input: UpdateAdminPermissionsInput;
};


export type MutationUpdateExpenseArgs = {
  input: UpdateExpenseInput;
};


export type MutationUpdateIpWhitelistArgs = {
  input: UpdateIpWhitelistInput;
};


export type MutationUpdateMemberPositionArgs = {
  input: UpdateMemberPositionInput;
};


export type MutationUpdateMemberSalaryArgs = {
  input: UpdateMemberSalaryInput;
};


export type MutationUpdateNotificationSettingsArgs = {
  input: UpdateNotificationSettingsInput;
};


export type MutationUpdatePayoutPaymentArgs = {
  input: UpdatePayoutPaymentInput;
};


export type MutationUpdatePhotoCaptionArgs = {
  caption: Scalars['String']['input'];
  photoId: Scalars['String']['input'];
};


export type MutationUpdatePhotoReportArgs = {
  input: UpdatePhotoReportInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
};


export type MutationUpdateProjectProgressArgs = {
  id: Scalars['ID']['input'];
  progress: Scalars['Int']['input'];
};


export type MutationUpdateStoragePreferenceArgs = {
  input: UpdateStoragePreferenceInput;
};


export type MutationUpdateStorageSettingsArgs = {
  input: UpdateStorageSettingsInput;
};


export type MutationUpdateSystemSettingArgs = {
  input: UpdateSystemSettingInput;
};


export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
};


export type MutationUpdateTwoFactorEnforcementArgs = {
  input: UpdateTwoFactorInput;
};


export type MutationUpdateWorkLogArgs = {
  input: UpdateWorkLogInput;
};


export type MutationUploadAvatarArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadPhotoToReportArgs = {
  input: UploadPhotoInput;
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
};


export type MutationVerifyEmailChangeArgs = {
  input: VerifyEmailChangeInput;
};


export type MutationVerifyTwoFactorLoginArgs = {
  code: Scalars['String']['input'];
  twoFactorToken: Scalars['String']['input'];
};

export enum NotificationFrequency {
  Daily = 'DAILY',
  Instant = 'INSTANT',
  Weekly = 'WEEKLY'
}

export type NotificationSettings = {
  __typename?: 'NotificationSettings';
  appEmail: Scalars['Boolean']['output'];
  appPush: Scalars['Boolean']['output'];
  appSms: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  emailFrequency: NotificationFrequency;
  id: Scalars['String']['output'];
  marketingEmail: Scalars['Boolean']['output'];
  marketingPush: Scalars['Boolean']['output'];
  notifyExpenseAdded: Scalars['Boolean']['output'];
  notifyMemberInvited: Scalars['Boolean']['output'];
  notifyMemberJoined: Scalars['Boolean']['output'];
  notifyMemberRemoved: Scalars['Boolean']['output'];
  notifyPayoutCalculated: Scalars['Boolean']['output'];
  notifyPayoutPaid: Scalars['Boolean']['output'];
  notifyPhotoReportCreated: Scalars['Boolean']['output'];
  notifyProjectCompleted: Scalars['Boolean']['output'];
  notifyProjectCreated: Scalars['Boolean']['output'];
  notifySubscriptionExpiring: Scalars['Boolean']['output'];
  notifyTaskAssigned: Scalars['Boolean']['output'];
  notifyTaskCompleted: Scalars['Boolean']['output'];
  pushFrequency: NotificationFrequency;
  quietHoursEnabled: Scalars['Boolean']['output'];
  quietHoursEnd: Maybe<Scalars['String']['output']>;
  quietHoursStart: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type OnboardingResult = {
  __typename?: 'OnboardingResult';
  /** Сообщение для пользователя */
  message: Scalars['String']['output'];
  /** Созданный первый проект */
  project: Project;
  /** Успешность операции */
  success: Scalars['Boolean']['output'];
  /** Созданная команда */
  team: Team;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** Current page number */
  currentPage: Scalars['Int']['output'];
  /** Has next page */
  hasNextPage: Scalars['Boolean']['output'];
  /** Has previous page */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** Total pages */
  totalPages: Scalars['Int']['output'];
};

export type PaginationInput = {
  /** Items per page */
  limit: Scalars['Int']['input'];
  /** Page number (starts at 1) */
  page: Scalars['Int']['input'];
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  failureReason: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  paidAt: Maybe<Scalars['DateTime']['output']>;
  paymentMethod: Maybe<Scalars['String']['output']>;
  refundedAt: Maybe<Scalars['DateTime']['output']>;
  status: PaymentStatus;
  subscriptionId: Scalars['String']['output'];
  teamId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  yookassaPaymentId: Scalars['String']['output'];
};

/** Метод оплаты для выплат персоналу */
export enum PaymentMethod {
  /** Банковская карта */
  Card = 'CARD',
  /** Наличные */
  Cash = 'CASH',
  /** Система быстрых платежей (СБП) */
  Sbp = 'SBP',
  /** Банковский перевод */
  Transfer = 'TRANSFER'
}

/** Payment provider configuration (safe for admin viewing) */
export type PaymentProviderConfig = {
  __typename?: 'PaymentProviderConfig';
  /** Whether publishable key is configured (Stripe only) */
  hasPublishableKey: Maybe<Scalars['Boolean']['output']>;
  /** Whether secret key is configured (value not exposed) */
  hasSecretKey: Scalars['Boolean']['output'];
  /** Whether webhook secret is configured (value not exposed) */
  hasWebhookSecret: Scalars['Boolean']['output'];
  /** Shop ID (Yookassa only, not sensitive) */
  shopId: Maybe<Scalars['String']['output']>;
};

/** Payment provider configuration input */
export type PaymentProviderConfigInput = {
  /** Publishable key (Stripe only) */
  publishableKey: InputMaybe<Scalars['String']['input']>;
  /** Secret key (API key) */
  secretKey: InputMaybe<Scalars['String']['input']>;
  /** Shop ID (Yookassa only) */
  shopId: InputMaybe<Scalars['String']['input']>;
  /** Webhook secret for signature verification */
  webhookSecret: InputMaybe<Scalars['String']['input']>;
};

/** Payment provider configuration status */
export type PaymentProviderConfigStatus = {
  __typename?: 'PaymentProviderConfigStatus';
  /** Whether publishable key is configured (Stripe) */
  hasPublishableKey: Maybe<Scalars['Boolean']['output']>;
  /** Whether secret key is configured */
  hasSecretKey: Scalars['Boolean']['output'];
  /** Whether shop ID is configured (Yookassa) */
  hasShopId: Maybe<Scalars['Boolean']['output']>;
  /** Whether webhook secret is configured */
  hasWebhookSecret: Scalars['Boolean']['output'];
};

/** Payment provider for user selection */
export type PaymentProviderModel = {
  __typename?: 'PaymentProviderModel';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isPrimary: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: PaymentProviderType;
};

/** Payment provider types */
export enum PaymentProviderType {
  Stripe = 'STRIPE',
  Yookassa = 'YOOKASSA'
}

export type PaymentStats = {
  __typename?: 'PaymentStats';
  /** Average payment amount */
  averagePayment: Scalars['Float']['output'];
  /** Payments count by status */
  byStatus: PaymentsByStatus;
  /** Number of failed payments */
  failedPayments: Scalars['Int']['output'];
  /** Number of pending payments */
  pendingPayments: Scalars['Int']['output'];
  /** Number of succeeded payments */
  succeededPayments: Scalars['Int']['output'];
  /** Total number of payments */
  totalPayments: Scalars['Int']['output'];
  /** Total revenue from succeeded payments */
  totalRevenue: Scalars['Float']['output'];
};

export enum PaymentStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Succeeded = 'SUCCEEDED'
}

export type PaymentUrl = {
  __typename?: 'PaymentUrl';
  paymentId: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type PaymentsByStatus = {
  __typename?: 'PaymentsByStatus';
  /** Number of CANCELLED payments */
  CANCELLED: Scalars['Int']['output'];
  /** Number of FAILED payments */
  FAILED: Scalars['Int']['output'];
  /** Number of PENDING payments */
  PENDING: Scalars['Int']['output'];
  /** Number of SUCCEEDED payments */
  SUCCEEDED: Scalars['Int']['output'];
};

export type PayoutSummary = {
  __typename?: 'PayoutSummary';
  /** Project budget */
  budget: Scalars['Float']['output'];
  /** Detailed payouts for each member */
  members: Array<MemberPayoutDetail>;
  /** Net profit after expenses */
  netProfit: Scalars['Float']['output'];
  /** Owner profit after all payouts */
  ownerProfit: Scalars['Float']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  /** Total expenses */
  totalExpenses: Scalars['Float']['output'];
  /** Total payouts to members */
  totalPayouts: Scalars['Float']['output'];
};

/** Permission category for UI grouping */
export type PermissionCategory = {
  __typename?: 'PermissionCategory';
  /** Category description */
  description: Scalars['String']['output'];
  /** Icon name */
  icon: Scalars['String']['output'];
  /** Category key */
  key: Scalars['String']['output'];
  /** Category label */
  label: Scalars['String']['output'];
  /** Permissions in this category */
  permissions: Array<PermissionDefinition>;
};

/** Permission definition with metadata */
export type PermissionDefinition = {
  __typename?: 'PermissionDefinition';
  /** Category key */
  category: Scalars['String']['output'];
  /** Permission description */
  description: Scalars['String']['output'];
  /** Permission key */
  key: Scalars['String']['output'];
  /** Permission name */
  name: Scalars['String']['output'];
};

export type PersonnelAnalytics = {
  __typename?: 'PersonnelAnalytics';
  averageHoursPerMember: Scalars['Float']['output'];
  averagePayoutPerMember: Scalars['Float']['output'];
  generatedAt: Scalars['DateTime']['output'];
  members: Array<MemberAnalytics>;
  projects: Array<ProjectAnalytics>;
  teamId: Scalars['String']['output'];
  teamName: Scalars['String']['output'];
  totalHoursWorked: Scalars['Float']['output'];
  totalMembers: Scalars['Int']['output'];
  totalPayouts: Scalars['Float']['output'];
};

export type PhotoReport = {
  __typename?: 'PhotoReport';
  coverPhotoUrl: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdById: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isPublic: Scalars['Boolean']['output'];
  photos: Maybe<Array<ReportPhoto>>;
  projectId: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewCount: Scalars['Int']['output'];
};

export type PlanLimits = {
  __typename?: 'PlanLimits';
  features: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  maxActiveProjects: Maybe<Scalars['Float']['output']>;
  maxMembers: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  storageGB: Scalars['Float']['output'];
};

/** Position distribution count */
export type PositionCount = {
  __typename?: 'PositionCount';
  /** Count of members with this position */
  count: Scalars['Int']['output'];
  /** Position name */
  position: Scalars['String']['output'];
};

export type Project = {
  __typename?: 'Project';
  /** Адрес объекта */
  address: Maybe<Scalars['String']['output']>;
  /** Дата архивации */
  archivedAt: Maybe<Scalars['DateTime']['output']>;
  /** Бюджет проекта */
  budget: Maybe<Scalars['Float']['output']>;
  /** Телефон клиента */
  clientPhone: Maybe<Scalars['String']['output']>;
  /** Дата закрытия проекта */
  closedAt: Maybe<Scalars['DateTime']['output']>;
  /** Дата завершения */
  completedAt: Maybe<Scalars['DateTime']['output']>;
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** ID создателя проекта */
  createdById: Scalars['ID']['output'];
  /** Описание проекта */
  description: Maybe<Scalars['String']['output']>;
  /** Дата завершения проекта */
  endDate: Maybe<Scalars['DateTime']['output']>;
  /** Финальная прибыль после закрытия */
  finalProfit: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  /** Название проекта */
  name: Scalars['String']['output'];
  /** Заметки о проекте */
  notes: Maybe<Scalars['String']['output']>;
  /** URL фотографии проекта */
  photoUrl: Maybe<Scalars['String']['output']>;
  /** Прогресс выполнения (0-100) */
  progress: Scalars['Int']['output'];
  /** Дата начала проекта */
  startDate: Maybe<Scalars['DateTime']['output']>;
  /** Статус проекта */
  status: ProjectStatus;
  /** ID команды */
  teamId: Scalars['ID']['output'];
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
};

export type ProjectAnalytics = {
  __typename?: 'ProjectAnalytics';
  budget: Maybe<Scalars['Float']['output']>;
  endDate: Maybe<Scalars['DateTime']['output']>;
  membersCount: Scalars['Int']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  startDate: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  totalHoursWorked: Scalars['Float']['output'];
  totalPayouts: Scalars['Float']['output'];
};

export type ProjectCount = {
  __typename?: 'ProjectCount';
  expenses: Scalars['Int']['output'];
  photoReports: Scalars['Int']['output'];
  tasks: Scalars['Int']['output'];
};

export type ProjectFilterInput = {
  /** Поиск по названию или адресу */
  searchQuery: InputMaybe<Scalars['String']['input']>;
  /** Смещение */
  skip: InputMaybe<Scalars['Int']['input']>;
  /** Фильтр по статусу */
  status: InputMaybe<ProjectStatus>;
  /** Количество записей */
  take: InputMaybe<Scalars['Int']['input']>;
};

export type ProjectPayout = {
  __typename?: 'ProjectPayout';
  /** Actual paid amount */
  actualAmount: Maybe<Scalars['Float']['output']>;
  /** Calculated payout amount */
  calculatedAmount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Team member receiving this payout */
  member: TeamMember;
  memberId: Scalars['ID']['output'];
  /** Notes about the payout */
  notes: Maybe<Scalars['String']['output']>;
  /** Date when payout was paid */
  paidAt: Maybe<Scalars['DateTime']['output']>;
  /** Payment method used for this payout */
  paymentMethod: Maybe<PaymentMethod>;
  /** Project this payout belongs to */
  project: Project;
  projectId: Scalars['ID']['output'];
  /** URL to receipt/proof of payment */
  receiptUrl: Maybe<Scalars['String']['output']>;
  /** Payout status: pending, paid */
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProjectStats = {
  __typename?: 'ProjectStats';
  /** Количество расходов */
  expenseCount: Scalars['Int']['output'];
  /** Прибыль (budget - totalExpenses) */
  profit: Scalars['Float']['output'];
  /** Количество фотоотчётов */
  reportCount: Scalars['Int']['output'];
  /** Количество задач */
  taskCount: Scalars['Int']['output'];
  /** Общая сумма расходов */
  totalExpenses: Scalars['Float']['output'];
};

/** Статус проекта */
export enum ProjectStatus {
  /** Активный проект */
  Active = 'ACTIVE',
  /** Архивный проект */
  Archived = 'ARCHIVED',
  /** Завершённый проект */
  Completed = 'COMPLETED'
}

/** Storage usage per project */
export type ProjectStorageUsage = {
  __typename?: 'ProjectStorageUsage';
  /** Number of files */
  filesCount: Scalars['Int']['output'];
  /** Percentage of total team storage */
  percentage: Scalars['Float']['output'];
  /** Project ID */
  projectId: Scalars['String']['output'];
  /** Project name */
  projectName: Scalars['String']['output'];
  /** Used storage in bytes */
  usedBytes: Scalars['Float']['output'];
};

export type ProjectsByTeamItem = {
  __typename?: 'ProjectsByTeamItem';
  /** Projects count */
  projectsCount: Scalars['Int']['output'];
  /** Team ID */
  teamId: Scalars['String']['output'];
  /** Team name */
  teamName: Scalars['String']['output'];
};

export type ProviderFileStats = {
  __typename?: 'ProviderFileStats';
  /** Number of files */
  fileCount: Scalars['Int']['output'];
  /** Provider name */
  provider: Scalars['String']['output'];
  /** Total size in bytes */
  totalSize: Scalars['Float']['output'];
};

export type ProviderTestResult = {
  __typename?: 'ProviderTestResult';
  /** Test latency in milliseconds */
  latency: Maybe<Scalars['Int']['output']>;
  /** Test result message */
  message: Scalars['String']['output'];
  /** Provider type */
  provider: StorageProviderType;
  /** Whether test was successful */
  success: Scalars['Boolean']['output'];
};

export type PublicPhotoReport = {
  __typename?: 'PublicPhotoReport';
  coverPhotoUrl: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  photos: Array<ReportPhoto>;
  project: PublicProject;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  viewCount: Scalars['Int']['output'];
};

export type PublicProject = {
  __typename?: 'PublicProject';
  address: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Get actions by resource (admin only) */
  actionsByResource: Array<AdminActionLog>;
  /** Get admin action log by ID (admin only) */
  adminActionLog: Maybe<AdminActionLog>;
  /** Get admin action logs with filters (admin only) */
  adminActionLogs: AdminActionLogsResult;
  /** Get admin action statistics (admin only) */
  adminActionStatistics: AdminActionStatistics;
  /** Get comprehensive dashboard statistics (Admin only) */
  adminDashboardStats: DashboardStats;
  /** Export team members data */
  adminExportMembers: Scalars['String']['output'];
  adminGetAnnouncementById: TeamAnnouncement;
  adminGetAnnouncementStatistics: AnnouncementStatistics;
  adminGetAnnouncements: Array<TeamAnnouncement>;
  adminGetAuditLogs: AuditLogsConnection;
  adminGetAuditStatistics: AuditStatistics;
  adminGetCloneLogs: Array<TeamCloneLog>;
  adminGetComplianceReport: ComplianceReport;
  adminGetDataExportRequests: Array<DataExportRequest>;
  /** Get member activity history with pagination */
  adminGetMemberActivityHistory: MemberActivityConnection;
  /** Get member details by ID */
  adminGetMemberById: TeamMemberExtended;
  /** Get role assignment history for a specific member */
  adminGetMemberRoleHistory: Array<RoleAssignmentHistory>;
  /** Get team member statistics */
  adminGetMemberStatistics: MemberStatistics;
  adminGetMergeLogs: Array<TeamMergeLog>;
  adminGetMergePreview: MergePreview;
  /** Get all available permissions organized by category */
  adminGetPermissionCategories: Array<PermissionCategory>;
  adminGetRetentionPolicies: Array<DataRetentionPolicy>;
  /** Get role assignment history for a team */
  adminGetRoleAssignmentHistory: Array<RoleAssignmentHistory>;
  /** Get a custom role by ID */
  adminGetRoleById: CustomRole;
  /** Get role hierarchy tree for a team */
  adminGetRoleHierarchy: Array<RoleHierarchyNode>;
  /** Get role statistics for a team */
  adminGetRoleStatistics: RoleStatistics;
  /** Get team members with filtering and pagination */
  adminGetTeamMembers: Array<TeamMemberExtended>;
  adminGetTeamOperationsStatistics: TeamOperationsStatistics;
  /** Get all custom roles for a team */
  adminGetTeamRoles: Array<CustomRole>;
  adminGetTeamTemplateById: TeamTemplate;
  adminGetTeamTemplates: Array<TeamTemplate>;
  /** Get detailed information about a specific payment (Admin only) */
  adminPayment: AdminPayment;
  /** Get specific payment provider by type - Admin only */
  adminPaymentProvider: AdminPaymentProviderModel;
  /** Get payment provider configuration (secrets are masked) - Admin only */
  adminPaymentProviderConfig: PaymentProviderConfig;
  /** Get all payment providers - Admin only */
  adminPaymentProviders: Array<AdminPaymentProviderModel>;
  /** Get payment statistics (Admin only) */
  adminPaymentStats: PaymentStats;
  /** Get paginated list of payments with filters (Admin only) */
  adminPayments: AdminPaymentsConnection;
  /** Get detailed information about a specific plan by ID - Admin only */
  adminPlan: AdminPlanModel;
  /** Get detailed information about a specific plan by slug - Admin only */
  adminPlanBySlug: AdminPlanModel;
  /** Get all plans (with optional filters) - Admin only */
  adminPlans: Array<AdminPlanModel>;
  /** Get paginated list of plans with filters - Admin only */
  adminPlansPaginated: AdminPlansConnection;
  /** Get project by ID with details (admin only) */
  adminProject: Maybe<AdminProject>;
  /** Get all projects with filters (admin only) */
  adminProjects: AdminProjectsResult;
  /** Get recent admin activity logs (Admin only) */
  adminRecentActivity: Array<ActivityLog>;
  /** Get revenue chart data for the last 12 months (Admin only) */
  adminRevenueChart: ChartData;
  adminRole: AdminRoleDetail;
  adminRoleByUserId: Maybe<AdminRoleDetail>;
  adminRoles: Array<AdminRoleDetail>;
  /** Get detailed information about a specific subscription (Admin only) */
  adminSubscription: Subscription;
  /** Get subscription statistics (Admin only) */
  adminSubscriptionStats: SubscriptionStats;
  /** Get paginated list of subscriptions with filters (Admin only) */
  adminSubscriptions: AdminSubscriptionsConnection;
  /** Get support tickets statistics (admin only) */
  adminSupportStatistics: AdminSupportStatistics;
  /** Get support ticket by ID (admin only) */
  adminSupportTicket: AdminSupportTicket;
  /** Get all support tickets with filters (admin only) */
  adminSupportTickets: AdminSupportTicketsResult;
  /** Get system health status (Admin only) */
  adminSystemHealth: SystemHealth;
  /** Get detailed information about a specific team (Admin only) */
  adminTeam: AdminTeamDetails;
  /** Get combined team analytics (all data in one call) */
  adminTeamAnalytics: TeamAnalytics;
  /** Get team composition analysis (roles, positions, salary distribution) */
  adminTeamComposition: TeamComposition;
  /** Get team growth chart data (members and projects over time) */
  adminTeamGrowthChart: TeamGrowthChart;
  /** Get team KPIs (Key Performance Indicators) */
  adminTeamKPIs: TeamKpIs;
  /** Get member activity metrics for a team */
  adminTeamMemberActivity: Array<MemberActivity>;
  /** Get statistics for a specific team (Admin only) */
  adminTeamStats: AdminTeamStats;
  /** Get storage usage breakdown for a team */
  adminTeamStorageUsage: TeamStorageUsage;
  /** Get paginated list of teams with filters (Admin only) */
  adminTeams: AdminTeamsConnection;
  /** Get specific Telegram bot by ID - Admin only */
  adminTelegramBot: Maybe<AdminTelegramBotModel>;
  /** Get webhook information for a bot from Telegram API - Admin only */
  adminTelegramBotWebhookInfo: WebhookInfoModel;
  /** Get all Telegram bots - Admin only */
  adminTelegramBots: Array<AdminTelegramBotModel>;
  /** Get detailed information about a specific user (Admin only) */
  adminUser: AdminUserDetails;
  /** Get activity logs for a specific user (Admin only) */
  adminUserActivity: Array<UserActivity>;
  /** Get user growth chart data for the last 12 months (Admin only) */
  adminUserGrowthChart: ChartData;
  /** Get active sessions for a specific user (Admin only) */
  adminUserSessions: Array<UserSession>;
  /** Get paginated list of users with filters (Admin only) */
  adminUsers: AdminUsersConnection;
  /** Получить доступные платёжные провайдеры (Yookassa, Stripe) */
  availablePaymentProviders: Array<PaymentProviderModel>;
  /** Get available plans for public (active plans only) */
  availablePlans: Array<AdminPlanModel>;
  availablePlansDetailed: Array<AdminPlanModel>;
  /** Получить доступные варианты хранилища */
  availableStorageProviders: Array<StorageProviderOption>;
  canAddProject: Scalars['Boolean']['output'];
  currentPlanLimits: PlanLimits;
  earlyBirdStats: EarlyBirdStatsModel;
  /** Получить расход по ID */
  expense: Expense;
  /** Получить расходы по категории */
  expensesByCategory: Array<Expense>;
  /** Получить все расходы проекта */
  expensesByProject: Array<Expense>;
  /** Export personnel analytics to CSV (owner only) */
  exportPersonnelAnalytics: Scalars['String']['output'];
  /** Export project work logs to CSV (owner or team member) */
  exportProjectWorkLogs: Scalars['String']['output'];
  /** Simple health check */
  health: Scalars['String']['output'];
  loginHistory: Array<LoginHistory>;
  me: Maybe<User>;
  /** Get all payouts for a team member (owner or member themselves) */
  memberPayouts: Array<ProjectPayout>;
  /** Get salary change history for a team member (owner only) */
  memberSalaryHistory: Array<TeamMemberSalaryHistory>;
  /** Получить задачи, назначенные участнику */
  memberTasks: Array<Task>;
  /** Get all work logs for a team member (owner or self) */
  memberWorkLogs: Array<WorkLog>;
  /** Получить настройки хранилища пользователя */
  myStoragePreference: UserStoragePreference;
  mySubscription: Maybe<Subscription>;
  mySubscriptionHistory: Array<Subscription>;
  /** Получить все задачи пользователя (созданные или назначенные) */
  myTasks: Array<Task>;
  /** Получение всех команд, в которых состоит пользователь */
  myTeams: Array<Team>;
  paymentsBySubscription: Array<Payment>;
  /** Calculate payout summary for a project (owner only) */
  payoutSummary: PayoutSummary;
  /** Get personnel analytics for a team (owner only) */
  personnelAnalytics: PersonnelAnalytics;
  /** Получить фотоотчёт по ID */
  photoReport: PhotoReport;
  planBySlug: Maybe<AdminPlanModel>;
  /** Получить проект по ID */
  project: Project;
  /** Get all payouts for a project (owner only) */
  projectPayouts: Array<ProjectPayout>;
  /** Получить все фотоотчёты проекта */
  projectPhotoReports: Array<PhotoReport>;
  /** Статистика проекта */
  projectStats: ProjectStats;
  /** Получить задачи проекта, сгруппированные по статусу (для Kanban) */
  projectTasks: TasksByStatus;
  /** Get all work logs for a project (owner or team member) */
  projectWorkLogs: Array<WorkLog>;
  /** Получить проекты команды */
  projectsByTeam: Array<Project>;
  /** Публичный эндпоинт: получить фотоотчёт по slug (без аутентификации) */
  publicPhotoReport: PublicPhotoReport;
  /** Get recent actions by admin user (admin only) */
  recentAdminActions: Array<AdminActionLog>;
  sessions: Array<Session>;
  /** Get current storage provider settings */
  storageSettings: StorageSettings;
  /** Get storage usage statistics */
  storageStats: StorageStats;
  subscription: Subscription;
  /** Get a single system setting by key (admin only) */
  systemSetting: Maybe<SystemSetting>;
  /** Get all system settings (admin only) */
  systemSettings: Array<SystemSetting>;
  /** Получить задачу по ID */
  task: Task;
  /** Получение команды по ID */
  team: Maybe<Team>;
  /** Получение кодов приглашения команды (только для владельца) */
  teamInvites: Array<InviteCode>;
  /** Получение участников команды */
  teamMembers: Array<TeamMember>;
  /** Получение агрегированной статистики команды (расходы, бюджет, участники) */
  teamStats: TeamStats;
  /** Test connection to all storage providers */
  testStorageProviders: Array<ProviderTestResult>;
  twoFactorStatus: TwoFactorStatus;
  usageStats: UsageStats;
  /** Get work logs for a date range */
  workLogsByDateRange: Array<WorkLog>;
};


export type QueryActionsByResourceArgs = {
  limit?: Scalars['Float']['input'];
  resource: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
};


export type QueryAdminActionLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminActionLogsArgs = {
  filter: InputMaybe<AdminActionLogFilterInput>;
};


export type QueryAdminActionStatisticsArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};


export type QueryAdminExportMembersArgs = {
  format: MemberExportFormat;
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetAnnouncementByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminGetAnnouncementStatisticsArgs = {
  teamId: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminGetAnnouncementsArgs = {
  filter: InputMaybe<AnnouncementFilterInput>;
};


export type QueryAdminGetAuditLogsArgs = {
  filter: InputMaybe<AuditLogFilterInput>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryAdminGetAuditStatisticsArgs = {
  teamId: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminGetComplianceReportArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetDataExportRequestsArgs = {
  teamId: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminGetMemberActivityHistoryArgs = {
  memberId: Scalars['String']['input'];
  pagination: InputMaybe<PaginationInput>;
};


export type QueryAdminGetMemberByIdArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryAdminGetMemberRoleHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  memberId: Scalars['String']['input'];
};


export type QueryAdminGetMemberStatisticsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetMergePreviewArgs = {
  sourceTeamId: Scalars['String']['input'];
  targetTeamId: Scalars['String']['input'];
};


export type QueryAdminGetRetentionPoliciesArgs = {
  teamId: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminGetRoleAssignmentHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetRoleByIdArgs = {
  roleId: Scalars['ID']['input'];
};


export type QueryAdminGetRoleHierarchyArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetRoleStatisticsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetTeamMembersArgs = {
  filter: InputMaybe<MemberFilterInput>;
  pagination: InputMaybe<PaginationInput>;
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetTeamRolesArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminGetTeamTemplateByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminGetTeamTemplatesArgs = {
  filter: InputMaybe<TeamTemplateFilterInput>;
};


export type QueryAdminPaymentArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminPaymentProviderArgs = {
  baseUrl: InputMaybe<Scalars['String']['input']>;
  type: PaymentProviderType;
};


export type QueryAdminPaymentProviderConfigArgs = {
  type: PaymentProviderType;
};


export type QueryAdminPaymentProvidersArgs = {
  baseUrl: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminPaymentsArgs = {
  filters: InputMaybe<AdminPaymentFilters>;
  pagination: PaginationInput;
};


export type QueryAdminPlanArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminPlanBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryAdminPlansArgs = {
  filters: InputMaybe<AdminPlanFilters>;
};


export type QueryAdminPlansPaginatedArgs = {
  filters: InputMaybe<AdminPlanFilters>;
  pagination: PaginationInput;
};


export type QueryAdminProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminProjectsArgs = {
  filter: InputMaybe<AdminProjectFilterInput>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryAdminRecentActivityArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAdminRoleArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminRoleByUserIdArgs = {
  userId: Scalars['String']['input'];
};


export type QueryAdminRolesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  role: InputMaybe<Scalars['String']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminSubscriptionArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminSubscriptionsArgs = {
  filters: InputMaybe<AdminSubscriptionFilters>;
  pagination: PaginationInput;
};


export type QueryAdminSupportTicketArgs = {
  ticketId: Scalars['ID']['input'];
};


export type QueryAdminSupportTicketsArgs = {
  filter: InputMaybe<AdminSupportTicketFilterInput>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryAdminTeamArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminTeamAnalyticsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamCompositionArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamGrowthChartArgs = {
  months?: Scalars['Int']['input'];
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamKpIsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamMemberActivityArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamStatsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamStorageUsageArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryAdminTeamsArgs = {
  filters: InputMaybe<AdminTeamFilters>;
  pagination: PaginationInput;
};


export type QueryAdminTelegramBotArgs = {
  baseUrl: InputMaybe<Scalars['String']['input']>;
  botName: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
};


export type QueryAdminTelegramBotWebhookInfoArgs = {
  botId: Scalars['ID']['input'];
};


export type QueryAdminTelegramBotsArgs = {
  baseUrl: InputMaybe<Scalars['String']['input']>;
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryAdminUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminUserActivityArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  userId: Scalars['String']['input'];
};


export type QueryAdminUserSessionsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryAdminUsersArgs = {
  filters: InputMaybe<AdminUserFilters>;
  pagination: PaginationInput;
};


export type QueryAvailablePlansArgs = {
  currency: InputMaybe<Scalars['String']['input']>;
};


export type QueryCanAddProjectArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryCurrentPlanLimitsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExpensesByCategoryArgs = {
  category: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryExpensesByProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryExportPersonnelAnalyticsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryExportProjectWorkLogsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryMemberPayoutsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberSalaryHistoryArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberTasksArgs = {
  assigneeId: Scalars['ID']['input'];
};


export type QueryMemberWorkLogsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryPaymentsBySubscriptionArgs = {
  subscriptionId: Scalars['String']['input'];
};


export type QueryPayoutSummaryArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryPersonnelAnalyticsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryPhotoReportArgs = {
  id: Scalars['String']['input'];
};


export type QueryPlanBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectPayoutsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryProjectPhotoReportsArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryProjectStatsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryProjectTasksArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryProjectWorkLogsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryProjectsByTeamArgs = {
  filter: InputMaybe<ProjectFilterInput>;
  teamId: Scalars['ID']['input'];
};


export type QueryPublicPhotoReportArgs = {
  slug: Scalars['String']['input'];
};


export type QueryRecentAdminActionsArgs = {
  adminUserId: Scalars['ID']['input'];
  limit?: Scalars['Float']['input'];
};


export type QuerySubscriptionArgs = {
  id: Scalars['String']['input'];
};


export type QuerySystemSettingArgs = {
  key: Scalars['String']['input'];
};


export type QuerySystemSettingsArgs = {
  category: InputMaybe<SettingCategory>;
};


export type QueryTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeamInvitesArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryTeamMembersArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryTeamStatsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryUsageStatsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryWorkLogsByDateRangeArgs = {
  endDate: Scalars['DateTime']['input'];
  projectId: Scalars['ID']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type RefundPaymentInput = {
  /** Refund amount */
  amount: Scalars['Float']['input'];
  /** Refund reason */
  reason: Scalars['String']['input'];
};

export type RegenerateBackupCodesInput = {
  token: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: InputMaybe<Scalars['String']['input']>;
};

export type ReportPhoto = {
  __typename?: 'ReportPhoto';
  caption: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  fileSize: Maybe<Scalars['Int']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  orderIndex: Scalars['Int']['output'];
  photoUrl: Scalars['String']['output'];
  reportId: Scalars['String']['output'];
  thumbnailUrl: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

export type RequestChangeEmailInput = {
  /** Новый email адрес */
  newEmail: Scalars['String']['input'];
  /** Код двухфакторной аутентификации (требуется, если 2FA включена) */
  twoFactorCode: InputMaybe<Scalars['String']['input']>;
};

export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

/** Role assignment history entry */
export type RoleAssignmentHistory = {
  __typename?: 'RoleAssignmentHistory';
  /** User ID who made the assignment */
  assignedBy: Scalars['String']['output'];
  /** Assignment timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** History entry ID */
  id: Scalars['ID']['output'];
  /** Team member ID */
  memberId: Scalars['String']['output'];
  /** New role name/ID */
  newRole: Scalars['String']['output'];
  /** Previous role name/ID */
  previousRole: Maybe<Scalars['String']['output']>;
  /** Assignment reason */
  reason: Maybe<Scalars['String']['output']>;
  /** CustomRole ID if applicable */
  roleId: Maybe<Scalars['ID']['output']>;
  /** Team ID */
  teamId: Scalars['String']['output'];
};

/** Role distribution count */
export type RoleCount = {
  __typename?: 'RoleCount';
  /** Count of members with this role */
  count: Scalars['Int']['output'];
  /** Role name */
  role: Scalars['String']['output'];
};

/** Role hierarchy tree node */
export type RoleHierarchyNode = {
  __typename?: 'RoleHierarchyNode';
  /** Child roles */
  children: Maybe<Array<RoleHierarchyNode>>;
  /** Role color */
  color: Maybe<Scalars['String']['output']>;
  /** Role ID */
  id: Scalars['ID']['output'];
  /** Is built-in role */
  isBuiltIn: Scalars['Boolean']['output'];
  /** Hierarchy level */
  level: Scalars['Int']['output'];
  /** Number of members */
  memberCount: Scalars['Int']['output'];
  /** Role name */
  name: Scalars['String']['output'];
  /** Number of permissions */
  permissionCount: Scalars['Int']['output'];
};

/** Role statistics */
export type RoleStatistics = {
  __typename?: 'RoleStatistics';
  /** Active roles */
  activeRoles: Scalars['Int']['output'];
  /** Built-in roles */
  builtInRoles: Scalars['Int']['output'];
  /** Inactive roles */
  inactiveRoles: Scalars['Int']['output'];
  /** Members with custom roles */
  membersWithCustomRoles: Scalars['Int']['output'];
  /** Members with default roles */
  membersWithDefaultRoles: Scalars['Int']['output'];
  /** Total team members */
  totalMembers: Scalars['Int']['output'];
  /** Total custom roles */
  totalRoles: Scalars['Int']['output'];
};

/** Salary type distribution */
export type SalaryDistribution = {
  __typename?: 'SalaryDistribution';
  /** Members with fixed salary */
  fixed: Scalars['Int']['output'];
  /** Members without salary settings */
  none: Scalars['Int']['output'];
  /** Members with percentage-based salary */
  percentage: Scalars['Int']['output'];
  /** Total salary amount (fixed + calculated) */
  totalAmount: Scalars['Float']['output'];
};

export type SendInviteByEmailInput = {
  /** Email адрес приглашаемого пользователя */
  email: Scalars['String']['input'];
  /** Срок действия приглашения в днях (по умолчанию 7) */
  expiresInDays: InputMaybe<Scalars['Int']['input']>;
  /** ID команды */
  teamId: Scalars['ID']['input'];
};

export type SendInviteResult = {
  __typename?: 'SendInviteResult';
  /** Было ли письмо успешно отправлено */
  emailSent: Scalars['Boolean']['output'];
  /** Созданный код приглашения */
  inviteCode: InviteCode;
};

export type Session = {
  __typename?: 'Session';
  browser: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  current: Scalars['Boolean']['output'];
  device: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  ip: Maybe<Scalars['String']['output']>;
  os: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
};

/** Input for setting webhook */
export type SetWebhookInput = {
  /** Bot ID */
  botId: Scalars['String']['input'];
  /** Custom webhook URL (optional, uses default if not provided) */
  webhookUrl: InputMaybe<Scalars['String']['input']>;
};

/** System setting categories */
export enum SettingCategory {
  Ai = 'AI',
  Analytics = 'ANALYTICS',
  Email = 'EMAIL',
  General = 'GENERAL',
  Payment = 'PAYMENT',
  Security = 'SECURITY',
  Sms = 'SMS',
  Social = 'SOCIAL',
  Storage = 'STORAGE',
  Telegram = 'TELEGRAM'
}

/** System setting value types */
export enum SettingValueType {
  Boolean = 'BOOLEAN',
  Encrypted = 'ENCRYPTED',
  Json = 'JSON',
  Number = 'NUMBER',
  String = 'STRING'
}

export type StorageMigrationResult = {
  __typename?: 'StorageMigrationResult';
  /** Failed migrations */
  failedCount: Scalars['Int']['output'];
  /** List of failures */
  failures: Array<MigrationFailure>;
  /** Source provider */
  fromProvider: StorageProviderType;
  /** Successfully migrated files */
  successCount: Scalars['Int']['output'];
  /** Destination provider */
  toProvider: StorageProviderType;
  /** Total files to migrate */
  totalFiles: Scalars['Int']['output'];
  /** User ID */
  userId: Scalars['String']['output'];
};

export type StorageProviderOption = {
  __typename?: 'StorageProviderOption';
  /** Whether this provider is available */
  available: Scalars['Boolean']['output'];
  /** Whether this is currently selected */
  current: Scalars['Boolean']['output'];
  /** Provider description */
  description: Scalars['String']['output'];
  /** Provider display name */
  name: Scalars['String']['output'];
  /** Provider type */
  provider: UserStorageProviderType;
};

/** Available storage provider types */
export enum StorageProviderType {
  Cloudinary = 'CLOUDINARY',
  Local = 'LOCAL',
  R2 = 'R2'
}

export type StorageSettings = {
  __typename?: 'StorageSettings';
  /** Storage admin mode (local | cloudinary | r2 | user_choice) */
  adminMode: Scalars['String']['output'];
  /** Auto-migrate files on provider switch */
  autoMigrate: Scalars['Boolean']['output'];
  /** Cloudinary API key */
  cloudinaryApiKey: Maybe<Scalars['String']['output']>;
  /** Whether Cloudinary API secret is set */
  cloudinaryApiSecretSet: Scalars['Boolean']['output'];
  /** Cloudinary cloud name */
  cloudinaryCloudName: Maybe<Scalars['String']['output']>;
  /** Default storage provider (local | cloudinary | r2) */
  defaultProvider: Scalars['String']['output'];
  /** Whether R2 access key ID is set */
  r2AccessKeyIdSet: Scalars['Boolean']['output'];
  /** Cloudflare account ID */
  r2AccountId: Maybe<Scalars['String']['output']>;
  /** R2 bucket name */
  r2BucketName: Maybe<Scalars['String']['output']>;
  /** R2 public URL */
  r2PublicUrl: Maybe<Scalars['String']['output']>;
  /** Whether R2 secret access key is set */
  r2SecretAccessKeySet: Scalars['Boolean']['output'];
};

export type StorageStats = {
  __typename?: 'StorageStats';
  /** Files grouped by provider */
  filesByProvider: Array<ProviderFileStats>;
  /** Files grouped by type */
  filesByType: Array<FileTypeStats>;
  /** Total number of files */
  totalFiles: Scalars['Int']['output'];
  /** Total size in bytes */
  totalSize: Scalars['Float']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  cancelAtPeriodEnd: Scalars['Boolean']['output'];
  cancelledAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentPeriodEnd: Scalars['DateTime']['output'];
  currentPeriodStart: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isEarlyBird: Scalars['Boolean']['output'];
  limits: PlanLimits;
  plan: SubscriptionPlan;
  /** Plan ID from database (new Plan model) */
  planId: Maybe<Scalars['String']['output']>;
  /** Plan reference from database */
  planRef: Maybe<AdminPlanModel>;
  status: SubscriptionStatus;
  /** Team with owner and members details */
  team: Maybe<Scalars['JSON']['output']>;
  teamId: Scalars['String']['output'];
  trialEndsAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  yookassaSubscriptionId: Maybe<Scalars['String']['output']>;
};

export enum SubscriptionPlan {
  Brigade = 'BRIGADE',
  Foreman = 'FOREMAN',
  Lite = 'LITE'
}

export type SubscriptionStats = {
  __typename?: 'SubscriptionStats';
  /** Number of active subscriptions */
  activeSubscriptions: Scalars['Int']['output'];
  /** Subscriptions count by plan */
  byPlan: SubscriptionsByPlan;
  /** Number of cancelled subscriptions */
  cancelledSubscriptions: Scalars['Int']['output'];
  /** Total revenue from all subscriptions */
  totalRevenue: Scalars['Float']['output'];
  /** Total number of subscriptions */
  totalSubscriptions: Scalars['Int']['output'];
  /** Number of trialing subscriptions */
  trialingSubscriptions: Scalars['Int']['output'];
};

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  PastDue = 'PAST_DUE',
  PendingPayment = 'PENDING_PAYMENT',
  Trialing = 'TRIALING'
}

export type SubscriptionsByPlan = {
  __typename?: 'SubscriptionsByPlan';
  /** Number of BRIGADE subscriptions */
  BRIGADE: Scalars['Int']['output'];
  /** Number of FOREMAN subscriptions */
  FOREMAN: Scalars['Int']['output'];
  /** Number of LITE subscriptions */
  LITE: Scalars['Int']['output'];
};

export type SupportMessage = {
  __typename?: 'SupportMessage';
  createdAt: Scalars['DateTime']['output'];
  fromUser: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  ticketId: Scalars['ID']['output'];
};

/** Priority level of a support ticket */
export enum SupportTicketPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Urgent = 'URGENT'
}

/** Status of a support ticket */
export enum SupportTicketStatus {
  Closed = 'CLOSED',
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Resolved = 'RESOLVED',
  WaitingUser = 'WAITING_USER'
}

export type SystemHealth = {
  __typename?: 'SystemHealth';
  /** Database health status */
  database: Scalars['Boolean']['output'];
  /** Last backup timestamp */
  lastBackup: Maybe<Scalars['DateTime']['output']>;
  /** Storage availability */
  storageAvailable: Scalars['Boolean']['output'];
};

export type SystemSetting = {
  __typename?: 'SystemSetting';
  category: SettingCategory;
  createdAt: Scalars['DateTime']['output'];
  defaultValue: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isEncrypted: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy: Maybe<Scalars['String']['output']>;
  validationRules: Maybe<Scalars['JSON']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueType: SettingValueType;
};

export type Task = {
  __typename?: 'Task';
  /** Назначенный участник */
  assignee: Maybe<TeamMember>;
  /** ID назначенного участника */
  assigneeId: Maybe<Scalars['ID']['output']>;
  /** Чек-лист задачи (JSON) */
  checklist: Maybe<Scalars['JSON']['output']>;
  /** Дата завершения */
  completedAt: Maybe<Scalars['DateTime']['output']>;
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** Создатель задачи */
  createdBy: Maybe<User>;
  /** ID создателя задачи */
  createdById: Scalars['ID']['output'];
  /** Описание задачи */
  description: Maybe<Scalars['String']['output']>;
  /** Срок выполнения */
  dueDate: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** Индекс порядка для drag & drop */
  orderIndex: Scalars['Int']['output'];
  /** Приоритет задачи */
  priority: TaskPriority;
  /** ID проекта */
  projectId: Scalars['ID']['output'];
  /** Статус задачи */
  status: TaskStatus;
  /** Название задачи */
  title: Scalars['String']['output'];
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
};

/** Приоритет задачи */
export enum TaskPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Urgent = 'URGENT'
}

/** Статус задачи */
export enum TaskStatus {
  Done = 'DONE',
  InProgress = 'IN_PROGRESS',
  Todo = 'TODO'
}

export type TasksByStatus = {
  __typename?: 'TasksByStatus';
  /** Задачи со статусом DONE */
  done: Array<Task>;
  /** Задачи со статусом IN_PROGRESS */
  inProgress: Array<Task>;
  /** Задачи со статусом TODO */
  todo: Array<Task>;
};

export type Team = {
  __typename?: 'Team';
  /** Team counts (resolved field) */
  _count: Maybe<TeamCounts>;
  /** ID цвета (orange, blue, etc) */
  colorId: Maybe<Scalars['String']['output']>;
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** ID иконки (hammer, wrench, etc) */
  iconId: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Тип логотипа */
  logoType: LogoType;
  /** URL загруженного логотипа */
  logoUrl: Maybe<Scalars['String']['output']>;
  /** Название бригады */
  name: Scalars['String']['output'];
  /** Team owner (resolved field) */
  owner: Maybe<User>;
  /** ID владельца команды */
  ownerId: Scalars['ID']['output'];
  /** Подписка команды */
  subscription: Maybe<Subscription>;
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
};

/** Combined team analytics data */
export type TeamAnalytics = {
  __typename?: 'TeamAnalytics';
  /** Team composition analysis */
  composition: TeamComposition;
  /** Growth chart data */
  growthChart: TeamGrowthChart;
  /** Key performance indicators */
  kpis: TeamKpIs;
  /** Member activity metrics */
  memberActivity: Array<MemberActivity>;
  /** Storage usage breakdown */
  storageUsage: TeamStorageUsage;
  /** Team ID */
  teamId: Scalars['String']['output'];
  /** Team name */
  teamName: Scalars['String']['output'];
};

/** Team announcement */
export type TeamAnnouncement = {
  __typename?: 'TeamAnnouncement';
  /** Announcement content */
  content: Scalars['String']['output'];
  /** Creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Creator user ID */
  createdBy: Scalars['String']['output'];
  /** Expiration date */
  expiresAt: Maybe<Scalars['DateTime']['output']>;
  /** Has current user read this */
  hasRead: Maybe<Scalars['Boolean']['output']>;
  /** Announcement ID */
  id: Scalars['ID']['output'];
  /** Is announcement expired */
  isExpired: Scalars['Boolean']['output'];
  /** Is pinned to top */
  isPinned: Scalars['Boolean']['output'];
  /** Is announcement published */
  isPublished: Scalars['Boolean']['output'];
  /** Priority level */
  priority: AnnouncementPriority;
  /** Publication date */
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  /** Number of reads */
  readCount: Scalars['Int']['output'];
  /** Team ID (null = global) */
  teamId: Maybe<Scalars['String']['output']>;
  /** Announcement title */
  title: Scalars['String']['output'];
  /** Total team members (for read percentage) */
  totalMembers: Scalars['Int']['output'];
  /** Announcement type */
  type: AnnouncementType;
  /** Last update timestamp */
  updatedAt: Scalars['DateTime']['output'];
};

/** Team audit log entry */
export type TeamAuditLog = {
  __typename?: 'TeamAuditLog';
  action: Scalars['String']['output'];
  category: AuditCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ipAddress: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  newValue: Maybe<Scalars['JSON']['output']>;
  oldValue: Maybe<Scalars['JSON']['output']>;
  resource: Scalars['String']['output'];
  resourceId: Maybe<Scalars['String']['output']>;
  teamId: Scalars['String']['output'];
  teamName: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
};

/** Team clone operation log */
export type TeamCloneLog = {
  __typename?: 'TeamCloneLog';
  clonedById: Scalars['String']['output'];
  clonedByName: Maybe<Scalars['String']['output']>;
  clonedSettings: Scalars['JSON']['output'];
  clonedTeamId: Scalars['String']['output'];
  clonedTeamName: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  sourceTeamId: Scalars['String']['output'];
  sourceTeamName: Maybe<Scalars['String']['output']>;
};

/** Team composition analysis */
export type TeamComposition = {
  __typename?: 'TeamComposition';
  /** Members grouped by position */
  byPosition: Array<PositionCount>;
  /** Members grouped by role */
  byRole: Array<RoleCount>;
  /** Salary type distribution */
  salaryDistribution: SalaryDistribution;
  /** Total team members count */
  totalMembers: Scalars['Int']['output'];
};

export type TeamCounts = {
  __typename?: 'TeamCounts';
  /** Number of team members */
  members: Scalars['Int']['output'];
  /** Number of projects */
  projects: Scalars['Int']['output'];
};

/** Team growth chart data over time */
export type TeamGrowthChart = {
  __typename?: 'TeamGrowthChart';
  /** Month labels (e.g., "Jan 2025") */
  labels: Array<Scalars['String']['output']>;
  /** Member count data points */
  memberData: Array<Scalars['Int']['output']>;
  /** Project count data points */
  projectData: Array<Scalars['Int']['output']>;
};

/** Team key performance indicators */
export type TeamKpIs = {
  __typename?: 'TeamKPIs';
  /** Active projects count */
  activeProjectsCount: Scalars['Int']['output'];
  /** Archived projects count */
  archivedProjectsCount: Scalars['Int']['output'];
  /** Average hours per member */
  avgHoursPerMember: Scalars['Float']['output'];
  /** Average project duration in days */
  avgProjectDurationDays: Scalars['Int']['output'];
  /** Completed projects count */
  completedProjectsCount: Scalars['Int']['output'];
  /** Member retention rate (0-100%) */
  memberRetention: Scalars['Float']['output'];
  /** Profit (budget - expenses) */
  profit: Scalars['Float']['output'];
  /** Project completion rate (0-100%) */
  projectCompletionRate: Scalars['Float']['output'];
  /** Total budget across projects */
  totalBudget: Scalars['Float']['output'];
  /** Total expenses amount */
  totalExpenses: Scalars['Float']['output'];
  /** Total hours worked by team */
  totalHoursWorked: Scalars['Float']['output'];
  /** Total team members */
  totalMembers: Scalars['Int']['output'];
  /** Total revenue from projects */
  totalRevenue: Scalars['Float']['output'];
};

export type TeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['ID']['output'];
  /** Дата присоединения к команде */
  joinedAt: Scalars['DateTime']['output'];
  /** Должность/специализация (например, "Прораб", "Электрик", "Маляр") */
  position: Maybe<Scalars['String']['output']>;
  /** Роль в команде (OWNER/MEMBER) */
  role: TeamRole;
  /** Сумма зарплаты или процент (0-100) */
  salaryAmount: Maybe<Scalars['Float']['output']>;
  /** Тип зарплаты: fixed, percentage, none */
  salaryType: Scalars['String']['output'];
  /** Статистика участника */
  stats: Maybe<TeamMemberStats>;
  /** Команда */
  team: Maybe<Team>;
  teamId: Scalars['ID']['output'];
  /** Пользователь */
  user: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type TeamMemberDetails = {
  __typename?: 'TeamMemberDetails';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  user: User;
};

/** Extended team member information */
export type TeamMemberExtended = {
  __typename?: 'TeamMemberExtended';
  /** User avatar URL */
  avatarUrl: Maybe<Scalars['String']['output']>;
  /** Custom role color */
  customRoleColor: Maybe<Scalars['String']['output']>;
  /** Custom role ID */
  customRoleId: Maybe<Scalars['ID']['output']>;
  /** Custom role name */
  customRoleName: Maybe<Scalars['String']['output']>;
  /** User email */
  email: Scalars['String']['output'];
  /** Total hours logged */
  hoursLogged: Scalars['Float']['output'];
  /** Member ID */
  id: Scalars['ID']['output'];
  /** Join date */
  joinedAt: Scalars['DateTime']['output'];
  /** Last activity timestamp */
  lastActiveAt: Maybe<Scalars['DateTime']['output']>;
  /** User phone */
  phone: Maybe<Scalars['String']['output']>;
  /** Position/Job title */
  position: Maybe<Scalars['String']['output']>;
  /** Total projects participated */
  projectsCount: Scalars['Int']['output'];
  /** Team role (OWNER/MEMBER) */
  role: Scalars['String']['output'];
  /** Salary amount */
  salaryAmount: Maybe<Scalars['Float']['output']>;
  /** Salary type (fixed/percentage/none) */
  salaryType: Scalars['String']['output'];
  /** Total tasks assigned */
  tasksCount: Scalars['Int']['output'];
  /** Team ID */
  teamId: Scalars['String']['output'];
  /** Total expenses added */
  totalExpenses: Scalars['Float']['output'];
  /** Total payouts received */
  totalPayouts: Scalars['Float']['output'];
  /** User ID */
  userId: Scalars['String']['output'];
  /** User full name */
  userName: Scalars['String']['output'];
};

export type TeamMemberInfo = {
  __typename?: 'TeamMemberInfo';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  team: Team;
};

export type TeamMemberSalaryHistory = {
  __typename?: 'TeamMemberSalaryHistory';
  changedBy: Maybe<User>;
  /** User who made the change */
  changedByUserId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  member: Maybe<TeamMember>;
  memberId: Scalars['ID']['output'];
  /** New salary amount */
  newAmount: Maybe<Scalars['Float']['output']>;
  /** New salary type */
  newType: Scalars['String']['output'];
  /** Previous salary amount */
  previousAmount: Maybe<Scalars['Float']['output']>;
  /** Previous salary type (null for first entry) */
  previousType: Maybe<Scalars['String']['output']>;
  /** Reason for the change */
  reason: Maybe<Scalars['String']['output']>;
};

export type TeamMemberStats = {
  __typename?: 'TeamMemberStats';
  /** Средняя выплата на проект */
  averagePayoutPerProject: Scalars['Float']['output'];
  /** Количество завершённых выплат */
  completedPayoutsCount: Scalars['Int']['output'];
  /** Количество ожидающих выплат */
  pendingPayoutsCount: Scalars['Int']['output'];
  /** Количество проектов, в которых участвует */
  projectCount: Scalars['Int']['output'];
  /** Общая сумма всех выплат за всё время */
  totalPayouts: Scalars['Float']['output'];
};

/** Team merge operation log */
export type TeamMergeLog = {
  __typename?: 'TeamMergeLog';
  createdAt: Scalars['DateTime']['output'];
  dataSnapshot: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  membersMoved: Scalars['Int']['output'];
  mergedById: Scalars['String']['output'];
  mergedByName: Maybe<Scalars['String']['output']>;
  notes: Maybe<Scalars['String']['output']>;
  projectsMoved: Scalars['Int']['output'];
  sourceTeamId: Scalars['String']['output'];
  sourceTeamName: Maybe<Scalars['String']['output']>;
  targetTeamId: Scalars['String']['output'];
  targetTeamName: Maybe<Scalars['String']['output']>;
};

/** Team operations statistics */
export type TeamOperationsStatistics = {
  __typename?: 'TeamOperationsStatistics';
  publicTemplates: Scalars['Int']['output'];
  teamsCreatedFromTemplates: Scalars['Int']['output'];
  totalClones: Scalars['Int']['output'];
  totalMerges: Scalars['Int']['output'];
  totalTemplates: Scalars['Int']['output'];
};

/** Роль участника в конкретной команде */
export enum TeamRole {
  /** Участник команды - ограниченные права */
  Member = 'MEMBER',
  /** Владелец команды - полные права на управление */
  Owner = 'OWNER'
}

export type TeamStats = {
  __typename?: 'TeamStats';
  activeProjectsCount: Scalars['Int']['output'];
  membersCount: Scalars['Int']['output'];
  profit: Scalars['Float']['output'];
  totalBudget: Scalars['Float']['output'];
  totalExpenses: Scalars['Float']['output'];
  totalHours: Scalars['Float']['output'];
};

/** Team storage usage breakdown */
export type TeamStorageUsage = {
  __typename?: 'TeamStorageUsage';
  /** Storage breakdown by project */
  byProject: Array<ProjectStorageUsage>;
  /** Total storage limit in bytes */
  totalBytes: Scalars['Float']['output'];
  /** Used storage in bytes */
  usedBytes: Scalars['Float']['output'];
  /** Used storage in gigabytes */
  usedGB: Scalars['Float']['output'];
  /** Used percentage (0-100) */
  usedPercentage: Scalars['Float']['output'];
};

/** Team template for creating teams from predefined configurations */
export type TeamTemplate = {
  __typename?: 'TeamTemplate';
  createdAt: Scalars['DateTime']['output'];
  createdById: Scalars['String']['output'];
  createdByName: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  projectSetup: Maybe<Scalars['JSON']['output']>;
  roles: Scalars['JSON']['output'];
  settings: Scalars['JSON']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Filter for team templates */
export type TeamTemplateFilterInput = {
  createdById: InputMaybe<Scalars['String']['input']>;
  publicOnly: InputMaybe<Scalars['Boolean']['input']>;
};

export type TelegramAuthPayload = {
  __typename?: 'TelegramAuthPayload';
  deepLink: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  token: Scalars['String']['output'];
};

export type TelegramAuthStatusPayload = {
  __typename?: 'TelegramAuthStatusPayload';
  completed: Scalars['Boolean']['output'];
  refreshToken: Maybe<Scalars['String']['output']>;
  sessionToken: Maybe<Scalars['String']['output']>;
  user: Maybe<User>;
};

/** Telegram bot configuration status */
export type TelegramBotConfigStatus = {
  __typename?: 'TelegramBotConfigStatus';
  /** Whether bot token is configured */
  hasToken: Scalars['Boolean']['output'];
  /** Whether webhook is configured */
  hasWebhook: Scalars['Boolean']['output'];
  /** Whether bot is registered and active */
  isRegistered: Scalars['Boolean']['output'];
};

/** Test bot token result */
export type TestBotResult = {
  __typename?: 'TestBotResult';
  /** Bot information if token is valid */
  botInfo: Maybe<BotInfoModel>;
  /** Error message if token is invalid */
  error: Maybe<Scalars['String']['output']>;
  /** Whether the token is valid */
  valid: Scalars['Boolean']['output'];
};

/** Input for testing a bot token */
export type TestBotTokenInput = {
  /** Bot token to test */
  token: Scalars['String']['input'];
};

/** Test connection result */
export type TestConnectionResult = {
  __typename?: 'TestConnectionResult';
  /** Error message if failed */
  error: Maybe<Scalars['String']['output']>;
  /** Success or informational message */
  message: Maybe<Scalars['String']['output']>;
  /** Whether the connection test was successful */
  success: Scalars['Boolean']['output'];
};

export type TopPayingTeamItem = {
  __typename?: 'TopPayingTeamItem';
  /** Team ID */
  teamId: Scalars['String']['output'];
  /** Team name */
  teamName: Scalars['String']['output'];
  /** Total paid amount */
  totalPaid: Scalars['Float']['output'];
};

export type TopTeamItem = {
  __typename?: 'TopTeamItem';
  /** Team ID */
  id: Scalars['String']['output'];
  /** Members count */
  membersCount: Scalars['Int']['output'];
  /** Team name */
  name: Scalars['String']['output'];
  /** Owner name */
  ownerName: Scalars['String']['output'];
};

/** Transfer member to another team */
export type TransferMemberInput = {
  /** Member ID to transfer */
  memberId: Scalars['String']['input'];
  /** New position in target team */
  newPosition: InputMaybe<Scalars['String']['input']>;
  /** Transfer reason */
  reason: InputMaybe<Scalars['String']['input']>;
  /** Target team ID */
  targetTeamId: Scalars['String']['input'];
};

export type TwoFactorDisableResponse = {
  __typename?: 'TwoFactorDisableResponse';
  success: Scalars['Boolean']['output'];
};

export type TwoFactorEnableResponse = {
  __typename?: 'TwoFactorEnableResponse';
  backupCodes: Array<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type TwoFactorSetup = {
  __typename?: 'TwoFactorSetup';
  manualEntryCode: Scalars['String']['output'];
  qrCodeUrl: Scalars['String']['output'];
  secret: Scalars['String']['output'];
};

export type TwoFactorStatus = {
  __typename?: 'TwoFactorStatus';
  backupCodesRemaining: Scalars['Float']['output'];
  enabled: Scalars['Boolean']['output'];
};

export type UpdateAdminPermissionsInput = {
  permissions: Array<Scalars['String']['input']>;
  roleId: Scalars['String']['input'];
};

/** Input for updating announcement */
export type UpdateAnnouncementInput = {
  content: InputMaybe<Scalars['String']['input']>;
  expiresAt: InputMaybe<Scalars['DateTime']['input']>;
  /** Announcement ID */
  id: Scalars['ID']['input'];
  isPinned: InputMaybe<Scalars['Boolean']['input']>;
  priority: InputMaybe<AnnouncementPriority>;
  title: InputMaybe<Scalars['String']['input']>;
  type: InputMaybe<AnnouncementType>;
};

/** Input for updating a custom role */
export type UpdateCustomRoleInput = {
  /** Role color (hex) */
  color: InputMaybe<Scalars['String']['input']>;
  /** Role description */
  description: InputMaybe<Scalars['String']['input']>;
  /** Role ID */
  id: Scalars['ID']['input'];
  /** Is role active */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Role name */
  name: InputMaybe<Scalars['String']['input']>;
  /** Parent role ID for inheritance */
  parentRoleId: InputMaybe<Scalars['ID']['input']>;
  /** Permission keys */
  permissions: InputMaybe<Array<Scalars['String']['input']>>;
  /** Sort order */
  sortOrder: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateExpenseInput = {
  /** Сумма расхода */
  amount: InputMaybe<Scalars['Float']['input']>;
  /** Категория расхода */
  category: InputMaybe<Scalars['String']['input']>;
  /** Комментарий к расходу */
  comment: InputMaybe<Scalars['String']['input']>;
  /** ID расхода */
  id: Scalars['String']['input'];
  /** Оплачено клиентом */
  paidByClient: InputMaybe<Scalars['Boolean']['input']>;
  /** Массив URL фотографий */
  photos: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateIpWhitelistInput = {
  ipAddresses: Array<Scalars['String']['input']>;
  roleId: Scalars['String']['input'];
};

export type UpdateMemberPositionInput = {
  /** Team member ID */
  memberId: Scalars['ID']['input'];
  /** Position/specialization (null to remove) */
  position: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMemberSalaryInput = {
  /** Team member ID */
  memberId: Scalars['ID']['input'];
  /** Reason for salary change (optional) */
  reason: InputMaybe<Scalars['String']['input']>;
  /** Salary amount (for fixed) or percentage (0-100) */
  salaryAmount: InputMaybe<Scalars['Float']['input']>;
  /** Salary type: fixed, percentage, none */
  salaryType: Scalars['String']['input'];
};

export type UpdateNotificationSettingsInput = {
  appEmail: InputMaybe<Scalars['Boolean']['input']>;
  appPush: InputMaybe<Scalars['Boolean']['input']>;
  appSms: InputMaybe<Scalars['Boolean']['input']>;
  emailFrequency: InputMaybe<NotificationFrequency>;
  marketingEmail: InputMaybe<Scalars['Boolean']['input']>;
  marketingPush: InputMaybe<Scalars['Boolean']['input']>;
  notifyExpenseAdded: InputMaybe<Scalars['Boolean']['input']>;
  notifyMemberInvited: InputMaybe<Scalars['Boolean']['input']>;
  notifyMemberJoined: InputMaybe<Scalars['Boolean']['input']>;
  notifyMemberRemoved: InputMaybe<Scalars['Boolean']['input']>;
  notifyPayoutCalculated: InputMaybe<Scalars['Boolean']['input']>;
  notifyPayoutPaid: InputMaybe<Scalars['Boolean']['input']>;
  notifyPhotoReportCreated: InputMaybe<Scalars['Boolean']['input']>;
  notifyProjectCompleted: InputMaybe<Scalars['Boolean']['input']>;
  notifyProjectCreated: InputMaybe<Scalars['Boolean']['input']>;
  notifySubscriptionExpiring: InputMaybe<Scalars['Boolean']['input']>;
  notifyTaskAssigned: InputMaybe<Scalars['Boolean']['input']>;
  notifyTaskCompleted: InputMaybe<Scalars['Boolean']['input']>;
  pushFrequency: InputMaybe<NotificationFrequency>;
  quietHoursEnabled: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursEnd: InputMaybe<Scalars['String']['input']>;
  quietHoursStart: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating payment provider settings */
export type UpdatePaymentProviderInput = {
  /** Provider configuration (credentials) */
  config: InputMaybe<PaymentProviderConfigInput>;
  /** Whether the provider is active */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this is the primary provider (only one can be primary) */
  isPrimary: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdatePayoutPaymentInput = {
  /** Метод оплаты */
  paymentMethod: PaymentMethod;
  /** ID выплаты */
  payoutId: Scalars['ID']['input'];
  /** URL чека/квитанции об оплате */
  receiptUrl: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePhotoReportInput = {
  description: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isPublic: InputMaybe<Scalars['Boolean']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileInput = {
  fullName: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  /** Адрес объекта */
  address: InputMaybe<Scalars['String']['input']>;
  /** Бюджет проекта */
  budget: InputMaybe<Scalars['Float']['input']>;
  /** Телефон клиента */
  clientPhone: InputMaybe<Scalars['String']['input']>;
  /** Описание проекта */
  description: InputMaybe<Scalars['String']['input']>;
  /** Дата завершения проекта */
  endDate: InputMaybe<Scalars['DateTime']['input']>;
  /** Название проекта */
  name: InputMaybe<Scalars['String']['input']>;
  /** Заметки о проекте */
  notes: InputMaybe<Scalars['String']['input']>;
  /** URL фотографии проекта */
  photoUrl: InputMaybe<Scalars['String']['input']>;
  /** Прогресс выполнения (0-100) */
  progress: InputMaybe<Scalars['Int']['input']>;
  /** Дата начала проекта */
  startDate: InputMaybe<Scalars['DateTime']['input']>;
};

/** Input for updating retention policy */
export type UpdateRetentionPolicyInput = {
  id: Scalars['ID']['input'];
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  retentionDays: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateStoragePreferenceInput = {
  /** Preferred storage provider (local, cloudinary, or r2) */
  provider: UserStorageProviderType;
};

export type UpdateStorageSettingsInput = {
  adminMode: InputMaybe<Scalars['String']['input']>;
  autoMigrate: InputMaybe<Scalars['Boolean']['input']>;
  cloudinaryApiKey: InputMaybe<Scalars['String']['input']>;
  cloudinaryApiSecret: InputMaybe<Scalars['String']['input']>;
  cloudinaryCloudName: InputMaybe<Scalars['String']['input']>;
  defaultProvider: InputMaybe<Scalars['String']['input']>;
  r2AccessKeyId: InputMaybe<Scalars['String']['input']>;
  r2AccountId: InputMaybe<Scalars['String']['input']>;
  r2BucketName: InputMaybe<Scalars['String']['input']>;
  r2PublicUrl: InputMaybe<Scalars['String']['input']>;
  r2SecretAccessKey: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubscriptionInput = {
  /** Cancel at period end */
  cancelAtPeriodEnd: InputMaybe<Scalars['Boolean']['input']>;
  /** Current period end date */
  currentPeriodEnd: InputMaybe<Scalars['DateTime']['input']>;
  /** Subscription plan */
  plan: InputMaybe<Scalars['String']['input']>;
  /** Subscription status */
  status: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSystemSettingInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type UpdateTaskInput = {
  /** ID назначенного участника команды */
  assigneeId: InputMaybe<Scalars['String']['input']>;
  /** Описание задачи */
  description: InputMaybe<Scalars['String']['input']>;
  /** Срок выполнения (ISO 8601) */
  dueDate: InputMaybe<Scalars['String']['input']>;
  /** Приоритет задачи */
  priority: InputMaybe<TaskPriority>;
  /** Статус задачи */
  status: InputMaybe<TaskStatus>;
  /** Название задачи */
  title: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTeamInput = {
  colorId: InputMaybe<Scalars['String']['input']>;
  iconId: InputMaybe<Scalars['String']['input']>;
  logoFile: InputMaybe<Scalars['Upload']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  teamId: Scalars['ID']['input'];
};

/** Input for updating team template */
export type UpdateTeamTemplateInput = {
  description: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isPublic: InputMaybe<Scalars['Boolean']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  projectSetup: InputMaybe<Scalars['JSON']['input']>;
  roles: InputMaybe<Scalars['JSON']['input']>;
  settings: InputMaybe<Scalars['JSON']['input']>;
};

/** Input for updating an existing Telegram bot */
export type UpdateTelegramBotInput = {
  /** Avatar URL (usually auto-fetched from Telegram) */
  avatarUrl: InputMaybe<Scalars['String']['input']>;
  /** Updated description */
  description: InputMaybe<Scalars['String']['input']>;
  /** Updated display name */
  displayName: InputMaybe<Scalars['String']['input']>;
  /** Whether the bot should be active */
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this is the primary OAuth bot */
  isPrimary: InputMaybe<Scalars['Boolean']['input']>;
  /** New bot token (only if changing) */
  token: InputMaybe<Scalars['String']['input']>;
  /** Custom webhook URL (advanced) */
  webhookUrl: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTwoFactorInput = {
  enforced: Scalars['Boolean']['input'];
  roleId: Scalars['String']['input'];
};

export type UpdateWorkLogInput = {
  /** Date of work (ISO string) */
  date: InputMaybe<Scalars['String']['input']>;
  /** Description of work done */
  description: InputMaybe<Scalars['String']['input']>;
  /** Hours worked (0.01 - 24.00) */
  hours: InputMaybe<Scalars['Float']['input']>;
  /** Work log ID */
  id: Scalars['ID']['input'];
};

export type UploadPhotoInput = {
  caption: InputMaybe<Scalars['String']['input']>;
  file: Scalars['Upload']['input'];
  orderIndex: InputMaybe<Scalars['Int']['input']>;
  reportId: Scalars['String']['input'];
};

export type UsageStats = {
  __typename?: 'UsageStats';
  activeProjects: Scalars['Float']['output'];
  limits: PlanLimits;
  storageUsedGB: Scalars['Float']['output'];
  totalMembers: Scalars['Float']['output'];
};

export type User = {
  __typename?: 'User';
  adminRole: Maybe<AdminRoleDetail>;
  /** URL аватарки пользователя */
  avatarUrl: Maybe<Scalars['String']['output']>;
  /** Глобальная бизнес-роль: FOREMAN или WORKER */
  businessRole: Maybe<BusinessRole>;
  businessRoleAssignedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  fullName: Scalars['String']['output'];
  hasCompletedOnboarding: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  notificationSettings: Maybe<NotificationSettings>;
  phone: Maybe<Scalars['String']['output']>;
  /** Telegram Chat ID пользователя */
  telegramChatId: Maybe<Scalars['String']['output']>;
  /** URL фото из Telegram */
  telegramPhotoUrl: Maybe<Scalars['String']['output']>;
  /** Telegram Username пользователя */
  telegramUsername: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserActivity = {
  __typename?: 'UserActivity';
  /** Action type (e.g., UPDATE_USER, DELETE_USER) */
  action: Scalars['String']['output'];
  /** When the action occurred */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** IP address of the actor */
  ipAddress: Maybe<Scalars['String']['output']>;
  /** Resource type affected */
  resource: Scalars['String']['output'];
  /** Resource ID affected */
  resourceId: Scalars['String']['output'];
};

export type UserSession = {
  __typename?: 'UserSession';
  /** Session creation date */
  createdAt: Scalars['DateTime']['output'];
  /** Session expiration date */
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** IP address */
  ipAddress: Maybe<Scalars['String']['output']>;
  /** Session token (masked) */
  token: Scalars['String']['output'];
  /** User agent string */
  userAgent: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserStoragePreference = {
  __typename?: 'UserStoragePreference';
  /** Currently active storage provider for this user */
  activeProvider: UserStorageProviderType;
  /** Whether user can change storage preference (admin allows user_choice) */
  canChangeProvider: Scalars['Boolean']['output'];
  /** Date of last migration */
  migratedAt: Maybe<Scalars['DateTime']['output']>;
  /** Previous provider if migrated */
  migratedFrom: Maybe<UserStorageProviderType>;
  /** User's preferred storage provider (null = use system default) */
  preferredProvider: Maybe<UserStorageProviderType>;
};

/** Available storage provider types for users */
export enum UserStorageProviderType {
  Cloudinary = 'CLOUDINARY',
  Local = 'LOCAL',
  R2 = 'R2'
}

export type UsersByBusinessRole = {
  __typename?: 'UsersByBusinessRole';
  /** FOREMAN users */
  FOREMAN: Scalars['Int']['output'];
  /** WORKER users */
  WORKER: Scalars['Int']['output'];
  /** Unassigned users */
  unassigned: Scalars['Int']['output'];
};

export type VerifyEmailChangeInput = {
  /** Токен подтверждения изменения email */
  token: Scalars['String']['input'];
};

/** Webhook information from Telegram */
export type WebhookInfoModel = {
  __typename?: 'WebhookInfoModel';
  /** Allowed update types */
  allowedUpdates: Maybe<Array<Scalars['String']['output']>>;
  /** Whether a custom certificate is used */
  hasCustomCertificate: Scalars['Boolean']['output'];
  /** Unix timestamp of last error */
  lastErrorDate: Maybe<Scalars['Float']['output']>;
  /** Last error message */
  lastErrorMessage: Maybe<Scalars['String']['output']>;
  /** Maximum allowed connections */
  maxConnections: Maybe<Scalars['Float']['output']>;
  /** Number of pending updates */
  pendingUpdateCount: Scalars['Float']['output'];
  /** Current webhook URL */
  url: Scalars['String']['output'];
};

export type WorkLog = {
  __typename?: 'WorkLog';
  createdAt: Scalars['DateTime']['output'];
  createdById: Scalars['ID']['output'];
  date: Scalars['DateTime']['output'];
  /** Description of work done */
  description: Maybe<Scalars['String']['output']>;
  /** Hours worked (max 999.99) */
  hours: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  member: Maybe<TeamMember>;
  memberId: Scalars['String']['output'];
  project: Maybe<Project>;
  projectId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type DashboardStatsFieldsFragment = { __typename?: 'DashboardStats', users: { __typename?: 'DashboardUserStats', total: number, verified: number, admins: number, newThisMonth: number, growthRate: number, activeLastWeek: number, activeLastMonth: number, byBusinessRole: { __typename?: 'UsersByBusinessRole', FOREMAN: number, WORKER: number, unassigned: number } }, teams: { __typename?: 'DashboardTeamStats', total: number, withActiveSubscription: number, averageMembers: number, newThisMonth: number, topTeamsByMembers: Array<{ __typename?: 'TopTeamItem', id: string, name: string, membersCount: number, ownerName: string }> }, projects: { __typename?: 'DashboardProjectStats', total: number, active: number, completed: number, archived: number, byTeam: Array<{ __typename?: 'ProjectsByTeamItem', teamId: string, teamName: string, projectsCount: number }> }, subscriptions: { __typename?: 'DashboardSubscriptionStats', total: number, active: number, trialing: number, cancelled: number, byPlan: { __typename?: 'DashboardSubscriptionsByPlan', LITE: number, FOREMAN: number, BRIGADE: number } }, payments: { __typename?: 'DashboardPaymentStats', total: number, succeeded: number, totalRevenue: number, thisMonthRevenue: number, averagePayment: number, topPayingTeams: Array<{ __typename?: 'TopPayingTeamItem', teamId: string, teamName: string, totalPaid: number }> }, storage: { __typename?: 'DashboardStorageStats', totalUsedBytes: number, totalUsedGB: number, averagePerTeam: number } };

export type ChartDataFieldsFragment = { __typename?: 'ChartData', labels: Array<string>, data: Array<number> };

export type ActivityLogFieldsFragment = { __typename?: 'ActivityLog', id: string, action: string, resource: string, resourceId: string, adminUserEmail: string, createdAt: string };

export type SystemHealthFieldsFragment = { __typename?: 'SystemHealth', database: boolean, storageAvailable: boolean, lastBackup: string | null };

export type AdminDashboardStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminDashboardStatsQuery = { __typename?: 'Query', adminDashboardStats: { __typename?: 'DashboardStats', users: { __typename?: 'DashboardUserStats', total: number, verified: number, admins: number, newThisMonth: number, growthRate: number, activeLastWeek: number, activeLastMonth: number, byBusinessRole: { __typename?: 'UsersByBusinessRole', FOREMAN: number, WORKER: number, unassigned: number } }, teams: { __typename?: 'DashboardTeamStats', total: number, withActiveSubscription: number, averageMembers: number, newThisMonth: number, topTeamsByMembers: Array<{ __typename?: 'TopTeamItem', id: string, name: string, membersCount: number, ownerName: string }> }, projects: { __typename?: 'DashboardProjectStats', total: number, active: number, completed: number, archived: number, byTeam: Array<{ __typename?: 'ProjectsByTeamItem', teamId: string, teamName: string, projectsCount: number }> }, subscriptions: { __typename?: 'DashboardSubscriptionStats', total: number, active: number, trialing: number, cancelled: number, byPlan: { __typename?: 'DashboardSubscriptionsByPlan', LITE: number, FOREMAN: number, BRIGADE: number } }, payments: { __typename?: 'DashboardPaymentStats', total: number, succeeded: number, totalRevenue: number, thisMonthRevenue: number, averagePayment: number, topPayingTeams: Array<{ __typename?: 'TopPayingTeamItem', teamId: string, teamName: string, totalPaid: number }> }, storage: { __typename?: 'DashboardStorageStats', totalUsedBytes: number, totalUsedGB: number, averagePerTeam: number } } };

export type AdminRevenueChartQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminRevenueChartQuery = { __typename?: 'Query', adminRevenueChart: { __typename?: 'ChartData', labels: Array<string>, data: Array<number> } };

export type AdminUserGrowthChartQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminUserGrowthChartQuery = { __typename?: 'Query', adminUserGrowthChart: { __typename?: 'ChartData', labels: Array<string>, data: Array<number> } };

export type AdminRecentActivityQueryVariables = Exact<{
  limit: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminRecentActivityQuery = { __typename?: 'Query', adminRecentActivity: Array<{ __typename?: 'ActivityLog', id: string, action: string, resource: string, resourceId: string, adminUserEmail: string, createdAt: string }> };

export type AdminSystemHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminSystemHealthQuery = { __typename?: 'Query', adminSystemHealth: { __typename?: 'SystemHealth', database: boolean, storageAvailable: boolean, lastBackup: string | null } };

export type TeamAuditLogFieldsFragment = { __typename?: 'TeamAuditLog', id: string, teamId: string, userId: string | null, action: string, category: AuditCategory, resource: string, resourceId: string | null, oldValue: any | null, newValue: any | null, ipAddress: string | null, userAgent: string | null, metadata: any | null, createdAt: string, userName: string | null, teamName: string | null };

export type DataRetentionPolicyFieldsFragment = { __typename?: 'DataRetentionPolicy', id: string, teamId: string | null, resourceType: string, retentionDays: number, isActive: boolean, createdAt: string, updatedAt: string, teamName: string | null };

export type DataExportRequestFieldsFragment = { __typename?: 'DataExportRequest', id: string, teamId: string | null, userId: string | null, requestedById: string, type: DataExportType, status: ExportStatus, format: ExportFormat, fileUrl: string | null, expiresAt: string | null, completedAt: string | null, errorMessage: string | null, createdAt: string, teamName: string | null, userName: string | null, requestedByName: string | null };

export type AuditStatisticsFieldsFragment = { __typename?: 'AuditStatistics', totalLogs: number, logsLast24h: number, logsLast7d: number, logsLast30d: number, topActions: Array<string>, uniqueUsers: number, byCategory: Array<{ __typename?: 'CategoryCount', category: AuditCategory, count: number }> };

export type ComplianceReportFieldsFragment = { __typename?: 'ComplianceReport', teamId: string, teamName: string, totalAuditLogs: number, activePolicies: number, pendingExports: number, hasGDPRCompliance: boolean, hasDataRetention: boolean, lastAuditDate: string, generatedAt: string };

export type AdminGetAuditLogsQueryVariables = Exact<{
  filter: InputMaybe<AuditLogFilterInput>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type AdminGetAuditLogsQuery = { __typename?: 'Query', adminGetAuditLogs: { __typename?: 'AuditLogsConnection', totalCount: number, hasMore: boolean, logs: Array<{ __typename?: 'TeamAuditLog', id: string, teamId: string, userId: string | null, action: string, category: AuditCategory, resource: string, resourceId: string | null, oldValue: any | null, newValue: any | null, ipAddress: string | null, userAgent: string | null, metadata: any | null, createdAt: string, userName: string | null, teamName: string | null }> } };

export type AdminGetAuditStatisticsQueryVariables = Exact<{
  teamId: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminGetAuditStatisticsQuery = { __typename?: 'Query', adminGetAuditStatistics: { __typename?: 'AuditStatistics', totalLogs: number, logsLast24h: number, logsLast7d: number, logsLast30d: number, topActions: Array<string>, uniqueUsers: number, byCategory: Array<{ __typename?: 'CategoryCount', category: AuditCategory, count: number }> } };

export type AdminGetRetentionPoliciesQueryVariables = Exact<{
  teamId: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminGetRetentionPoliciesQuery = { __typename?: 'Query', adminGetRetentionPolicies: Array<{ __typename?: 'DataRetentionPolicy', id: string, teamId: string | null, resourceType: string, retentionDays: number, isActive: boolean, createdAt: string, updatedAt: string, teamName: string | null }> };

export type AdminGetDataExportRequestsQueryVariables = Exact<{
  teamId: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminGetDataExportRequestsQuery = { __typename?: 'Query', adminGetDataExportRequests: Array<{ __typename?: 'DataExportRequest', id: string, teamId: string | null, userId: string | null, requestedById: string, type: DataExportType, status: ExportStatus, format: ExportFormat, fileUrl: string | null, expiresAt: string | null, completedAt: string | null, errorMessage: string | null, createdAt: string, teamName: string | null, userName: string | null, requestedByName: string | null }> };

export type AdminGetComplianceReportQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminGetComplianceReportQuery = { __typename?: 'Query', adminGetComplianceReport: { __typename?: 'ComplianceReport', teamId: string, teamName: string, totalAuditLogs: number, activePolicies: number, pendingExports: number, hasGDPRCompliance: boolean, hasDataRetention: boolean, lastAuditDate: string, generatedAt: string } };

export type AdminCreateRetentionPolicyMutationVariables = Exact<{
  input: CreateRetentionPolicyInput;
}>;


export type AdminCreateRetentionPolicyMutation = { __typename?: 'Mutation', adminCreateRetentionPolicy: { __typename?: 'DataRetentionPolicy', id: string, teamId: string | null, resourceType: string, retentionDays: number, isActive: boolean, createdAt: string, updatedAt: string, teamName: string | null } };

export type AdminUpdateRetentionPolicyMutationVariables = Exact<{
  input: UpdateRetentionPolicyInput;
}>;


export type AdminUpdateRetentionPolicyMutation = { __typename?: 'Mutation', adminUpdateRetentionPolicy: { __typename?: 'DataRetentionPolicy', id: string, teamId: string | null, resourceType: string, retentionDays: number, isActive: boolean, createdAt: string, updatedAt: string, teamName: string | null } };

export type AdminDeleteRetentionPolicyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeleteRetentionPolicyMutation = { __typename?: 'Mutation', adminDeleteRetentionPolicy: boolean };

export type AdminCreateDataExportRequestMutationVariables = Exact<{
  input: CreateDataExportInput;
}>;


export type AdminCreateDataExportRequestMutation = { __typename?: 'Mutation', adminCreateDataExportRequest: { __typename?: 'DataExportRequest', id: string, teamId: string | null, userId: string | null, requestedById: string, type: DataExportType, status: ExportStatus, format: ExportFormat, fileUrl: string | null, expiresAt: string | null, completedAt: string | null, errorMessage: string | null, createdAt: string, teamName: string | null, userName: string | null, requestedByName: string | null } };

export type TeamAnnouncementFieldsFragment = { __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null };

export type AnnouncementStatisticsFieldsFragment = { __typename?: 'AnnouncementStatistics', total: number, published: number, drafts: number, pinned: number, expired: number, lowPriority: number, normalPriority: number, highPriority: number, urgentPriority: number };

export type AdminGetAnnouncementsQueryVariables = Exact<{
  filter: InputMaybe<AnnouncementFilterInput>;
}>;


export type AdminGetAnnouncementsQuery = { __typename?: 'Query', adminGetAnnouncements: Array<{ __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null }> };

export type AdminGetAnnouncementByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminGetAnnouncementByIdQuery = { __typename?: 'Query', adminGetAnnouncementById: { __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null } };

export type AdminGetAnnouncementStatisticsQueryVariables = Exact<{
  teamId: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminGetAnnouncementStatisticsQuery = { __typename?: 'Query', adminGetAnnouncementStatistics: { __typename?: 'AnnouncementStatistics', total: number, published: number, drafts: number, pinned: number, expired: number, lowPriority: number, normalPriority: number, highPriority: number, urgentPriority: number } };

export type AdminCreateAnnouncementMutationVariables = Exact<{
  input: CreateAnnouncementInput;
}>;


export type AdminCreateAnnouncementMutation = { __typename?: 'Mutation', adminCreateAnnouncement: { __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null } };

export type AdminUpdateAnnouncementMutationVariables = Exact<{
  input: UpdateAnnouncementInput;
}>;


export type AdminUpdateAnnouncementMutation = { __typename?: 'Mutation', adminUpdateAnnouncement: { __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null } };

export type AdminDeleteAnnouncementMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeleteAnnouncementMutation = { __typename?: 'Mutation', adminDeleteAnnouncement: boolean };

export type AdminPublishAnnouncementMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminPublishAnnouncementMutation = { __typename?: 'Mutation', adminPublishAnnouncement: { __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null } };

export type AdminUnpublishAnnouncementMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminUnpublishAnnouncementMutation = { __typename?: 'Mutation', adminUnpublishAnnouncement: { __typename?: 'TeamAnnouncement', id: string, teamId: string | null, title: string, content: string, priority: AnnouncementPriority, type: AnnouncementType, isPinned: boolean, expiresAt: string | null, publishedAt: string | null, createdBy: string, createdAt: string, updatedAt: string, isPublished: boolean, isExpired: boolean, readCount: number, totalMembers: number, hasRead: boolean | null } };

export type AdminMarkAnnouncementAsReadMutationVariables = Exact<{
  announcementId: Scalars['String']['input'];
}>;


export type AdminMarkAnnouncementAsReadMutation = { __typename?: 'Mutation', adminMarkAnnouncementAsRead: boolean };

export type AdminActionLogsQueryVariables = Exact<{
  filter: InputMaybe<AdminActionLogFilterInput>;
}>;


export type AdminActionLogsQuery = { __typename?: 'Query', adminActionLogs: { __typename?: 'AdminActionLogsResult', total: number, logs: Array<{ __typename?: 'AdminActionLog', id: string, adminUserId: string, adminUserEmail: string | null, action: string, resource: string, resourceId: string | null, details: any | null, ipAddress: string | null, userAgent: string | null, createdAt: string }> } };

export type AdminActionLogQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminActionLogQuery = { __typename?: 'Query', adminActionLog: { __typename?: 'AdminActionLog', id: string, adminUserId: string, action: string, resource: string, resourceId: string | null, details: any | null, ipAddress: string | null, userAgent: string | null, createdAt: string } | null };

export type RecentAdminActionsQueryVariables = Exact<{
  adminUserId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
}>;


export type RecentAdminActionsQuery = { __typename?: 'Query', recentAdminActions: Array<{ __typename?: 'AdminActionLog', id: string, adminUserId: string, action: string, resource: string, resourceId: string | null, details: any | null, ipAddress: string | null, userAgent: string | null, createdAt: string }> };

export type ActionsByResourceQueryVariables = Exact<{
  resource: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
}>;


export type ActionsByResourceQuery = { __typename?: 'Query', actionsByResource: Array<{ __typename?: 'AdminActionLog', id: string, adminUserId: string, action: string, resource: string, resourceId: string | null, details: any | null, ipAddress: string | null, userAgent: string | null, createdAt: string }> };

export type AdminActionStatisticsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
}>;


export type AdminActionStatisticsQuery = { __typename?: 'Query', adminActionStatistics: { __typename?: 'AdminActionStatistics', totalActions: number, actionsByType: any, actionsByResource: any, actionsByAdmin: any } };

export type GetAdminPaymentProvidersQueryVariables = Exact<{
  baseUrl: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAdminPaymentProvidersQuery = { __typename?: 'Query', adminPaymentProviders: Array<{ __typename?: 'AdminPaymentProviderModel', id: string, type: PaymentProviderType, name: string, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, createdAt: string, updatedAt: string, configStatus: { __typename?: 'PaymentProviderConfigStatus', hasShopId: boolean | null, hasSecretKey: boolean, hasWebhookSecret: boolean, hasPublishableKey: boolean | null } | null }> };

export type GetAdminPaymentProviderQueryVariables = Exact<{
  type: PaymentProviderType;
  baseUrl: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAdminPaymentProviderQuery = { __typename?: 'Query', adminPaymentProvider: { __typename?: 'AdminPaymentProviderModel', id: string, type: PaymentProviderType, name: string, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, createdAt: string, updatedAt: string, configStatus: { __typename?: 'PaymentProviderConfigStatus', hasShopId: boolean | null, hasSecretKey: boolean, hasWebhookSecret: boolean, hasPublishableKey: boolean | null } | null } };

export type GetProviderConfigQueryVariables = Exact<{
  type: PaymentProviderType;
}>;


export type GetProviderConfigQuery = { __typename?: 'Query', adminPaymentProviderConfig: { __typename?: 'PaymentProviderConfig', shopId: string | null, hasSecretKey: boolean, hasWebhookSecret: boolean, hasPublishableKey: boolean | null } };

export type UpdateAdminPaymentProviderMutationVariables = Exact<{
  type: PaymentProviderType;
  input: UpdatePaymentProviderInput;
}>;


export type UpdateAdminPaymentProviderMutation = { __typename?: 'Mutation', adminUpdatePaymentProvider: { __typename?: 'AdminPaymentProviderModel', id: string, type: PaymentProviderType, name: string, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, updatedAt: string, configStatus: { __typename?: 'PaymentProviderConfigStatus', hasShopId: boolean | null, hasSecretKey: boolean, hasWebhookSecret: boolean, hasPublishableKey: boolean | null } | null } };

export type TestPaymentProviderMutationVariables = Exact<{
  type: PaymentProviderType;
}>;


export type TestPaymentProviderMutation = { __typename?: 'Mutation', adminTestPaymentProvider: { __typename?: 'TestConnectionResult', success: boolean, message: string | null, error: string | null } };

export type ClearProviderCacheMutationVariables = Exact<{
  type: InputMaybe<PaymentProviderType>;
}>;


export type ClearProviderCacheMutation = { __typename?: 'Mutation', adminClearPaymentProviderCache: boolean };

export type PageInfoFieldsFragment = { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number };

export type AdminPaymentFieldsFragment = { __typename?: 'AdminPayment', id: string, subscriptionId: string, amount: number, currency: string, status: string, yookassaPaymentId: string | null, createdAt: string, updatedAt: string, subscription: any | null };

export type AdminPaymentsQueryVariables = Exact<{
  filters: InputMaybe<AdminPaymentFilters>;
  pagination: PaginationInput;
}>;


export type AdminPaymentsQuery = { __typename?: 'Query', adminPayments: { __typename?: 'AdminPaymentsConnection', totalCount: number, nodes: Array<{ __typename?: 'AdminPayment', id: string, subscriptionId: string, amount: number, currency: string, status: string, yookassaPaymentId: string | null, createdAt: string, updatedAt: string, subscription: any | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number } } };

export type AdminPaymentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminPaymentQuery = { __typename?: 'Query', adminPayment: { __typename?: 'AdminPayment', id: string, subscriptionId: string, amount: number, currency: string, status: string, yookassaPaymentId: string | null, createdAt: string, updatedAt: string, subscription: any | null } };

export type AdminPaymentStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminPaymentStatsQuery = { __typename?: 'Query', adminPaymentStats: { __typename?: 'PaymentStats', totalPayments: number, succeededPayments: number, pendingPayments: number, failedPayments: number, totalRevenue: number, averagePayment: number, byStatus: { __typename?: 'PaymentsByStatus', PENDING: number, SUCCEEDED: number, FAILED: number, CANCELLED: number } } };

export type AdminUpdatePaymentStatusMutationVariables = Exact<{
  id: Scalars['String']['input'];
  status: Scalars['String']['input'];
}>;


export type AdminUpdatePaymentStatusMutation = { __typename?: 'Mutation', adminUpdatePaymentStatus: { __typename?: 'AdminPayment', id: string, subscriptionId: string, amount: number, currency: string, status: string, yookassaPaymentId: string | null, createdAt: string, updatedAt: string, subscription: any | null } };

export type AdminRefundPaymentMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: RefundPaymentInput;
}>;


export type AdminRefundPaymentMutation = { __typename?: 'Mutation', adminRefundPayment: { __typename?: 'AdminPayment', id: string, subscriptionId: string, amount: number, currency: string, status: string, yookassaPaymentId: string | null, createdAt: string, updatedAt: string, subscription: any | null } };

export type AdminDeletePaymentMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeletePaymentMutation = { __typename?: 'Mutation', adminDeletePayment: boolean };

export type GetAdminPlansQueryVariables = Exact<{
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAdminPlansQuery = { __typename?: 'Query', adminPlans: Array<{ __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> }> };

export type GetAdminPlansPaginatedQueryVariables = Exact<{
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  currency: InputMaybe<Scalars['String']['input']>;
  pagination: PaginationInput;
}>;


export type GetAdminPlansPaginatedQuery = { __typename?: 'Query', adminPlansPaginated: { __typename?: 'AdminPlansConnection', totalCount: number, nodes: Array<{ __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> }>, pageInfo: { __typename?: 'PageInfo', currentPage: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetAdminPlanQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetAdminPlanQuery = { __typename?: 'Query', adminPlan: { __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> } };

export type GetAdminPlanBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetAdminPlanBySlugQuery = { __typename?: 'Query', adminPlanBySlug: { __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> } };

export type GetAvailablePlansQueryVariables = Exact<{
  currency: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAvailablePlansQuery = { __typename?: 'Query', availablePlans: Array<{ __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, createdAt: string, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> }> };

export type CreateAdminPlanMutationVariables = Exact<{
  input: AdminCreatePlanInput;
}>;


export type CreateAdminPlanMutation = { __typename?: 'Mutation', adminCreatePlan: { __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, createdAt: string, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> } };

export type UpdateAdminPlanMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: AdminUpdatePlanInput;
}>;


export type UpdateAdminPlanMutation = { __typename?: 'Mutation', adminUpdatePlan: { __typename?: 'AdminPlanModel', id: string, name: string, slug: string, description: string | null, isActive: boolean, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, updatedAt: string, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }>, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number }> } };

export type ArchiveAdminPlanMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ArchiveAdminPlanMutation = { __typename?: 'Mutation', adminArchivePlan: { __typename?: 'AdminPlanModel', id: string, isActive: boolean, updatedAt: string } };

export type ActivateAdminPlanMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ActivateAdminPlanMutation = { __typename?: 'Mutation', adminActivatePlan: { __typename?: 'AdminPlanModel', id: string, isActive: boolean, updatedAt: string } };

export type DeleteAdminPlanMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteAdminPlanMutation = { __typename?: 'Mutation', adminDeletePlan: boolean };

export type AdminProjectsQueryVariables = Exact<{
  filter: InputMaybe<AdminProjectFilterInput>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type AdminProjectsQuery = { __typename?: 'Query', adminProjects: { __typename?: 'AdminProjectsResult', total: number, hasMore: boolean, projects: Array<{ __typename?: 'AdminProject', id: string, name: string, description: string | null, status: string, budget: number | null, actualCost: number | null, startDate: string | null, endDate: string | null, completedAt: string | null, createdAt: string, updatedAt: string, team: any | null, owner: any | null, _count: { __typename?: 'ProjectCount', expenses: number, photoReports: number, tasks: number } | null }>, stats: { __typename?: 'AdminProjectStats', active: number, completed: number, archived: number } | null } };

export type AdminProjectDetailedQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminProjectDetailedQuery = { __typename?: 'Query', adminProject: { __typename?: 'AdminProject', id: string, name: string, description: string | null, status: string, budget: number | null, actualCost: number | null, startDate: string | null, endDate: string | null, completedAt: string | null, createdAt: string, updatedAt: string, team: any | null, owner: any | null, _count: { __typename?: 'ProjectCount', expenses: number, photoReports: number, tasks: number } | null } | null };

export type AdminProjectQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminProjectQuery = { __typename?: 'Query', adminProject: { __typename?: 'AdminProject', id: string, name: string, description: string | null, status: string, budget: number | null, actualCost: number | null, startDate: string | null, endDate: string | null, completedAt: string | null, createdAt: string, updatedAt: string, team: any | null, owner: any | null, _count: { __typename?: 'ProjectCount', expenses: number, photoReports: number, tasks: number } | null } | null };

export type AdminUpdateProjectStatusMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;


export type AdminUpdateProjectStatusMutation = { __typename?: 'Mutation', adminUpdateProjectStatus: { __typename?: 'AdminProject', id: string, status: string, updatedAt: string } };

export type AdminDeleteProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type AdminDeleteProjectMutation = { __typename?: 'Mutation', adminDeleteProject: { __typename?: 'DeleteResult', success: boolean, message: string } };

export type AdminArchiveProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type AdminArchiveProjectMutation = { __typename?: 'Mutation', adminArchiveProject: { __typename?: 'AdminProject', id: string, status: string, updatedAt: string } };

export type CustomRoleFieldsFragment = { __typename?: 'CustomRole', id: string, teamId: string, name: string, description: string | null, color: string | null, permissions: Array<string>, parentRoleId: string | null, level: number, isActive: boolean, isBuiltIn: boolean, sortOrder: number, createdBy: string, modifiedBy: string | null, createdAt: string, updatedAt: string, memberCount: number | null, effectivePermissions: Array<string> | null };

export type RoleAssignmentHistoryFieldsFragment = { __typename?: 'RoleAssignmentHistory', id: string, memberId: string, teamId: string, previousRole: string | null, newRole: string, roleId: string | null, assignedBy: string, reason: string | null, createdAt: string };

export type PermissionDefinitionFieldsFragment = { __typename?: 'PermissionDefinition', key: string, name: string, description: string, category: string };

export type PermissionCategoryFieldsFragment = { __typename?: 'PermissionCategory', key: string, label: string, description: string, icon: string, permissions: Array<{ __typename?: 'PermissionDefinition', key: string, name: string, description: string, category: string }> };

export type RoleHierarchyNodeFieldsFragment = { __typename?: 'RoleHierarchyNode', id: string, name: string, color: string | null, level: number, memberCount: number, permissionCount: number, isBuiltIn: boolean };

export type RoleStatisticsFieldsFragment = { __typename?: 'RoleStatistics', totalRoles: number, activeRoles: number, inactiveRoles: number, builtInRoles: number, totalMembers: number, membersWithCustomRoles: number, membersWithDefaultRoles: number };

export type AdminGetTeamRolesQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminGetTeamRolesQuery = { __typename?: 'Query', adminGetTeamRoles: Array<{ __typename?: 'CustomRole', id: string, teamId: string, name: string, description: string | null, color: string | null, permissions: Array<string>, parentRoleId: string | null, level: number, isActive: boolean, isBuiltIn: boolean, sortOrder: number, createdBy: string, modifiedBy: string | null, createdAt: string, updatedAt: string, memberCount: number | null, effectivePermissions: Array<string> | null, parentRole: { __typename?: 'CustomRole', id: string, name: string, color: string | null } | null, childRoles: Array<{ __typename?: 'CustomRole', id: string, name: string, color: string | null }> | null }> };

export type AdminGetRoleByIdQueryVariables = Exact<{
  roleId: Scalars['ID']['input'];
}>;


export type AdminGetRoleByIdQuery = { __typename?: 'Query', adminGetRoleById: { __typename?: 'CustomRole', id: string, teamId: string, name: string, description: string | null, color: string | null, permissions: Array<string>, parentRoleId: string | null, level: number, isActive: boolean, isBuiltIn: boolean, sortOrder: number, createdBy: string, modifiedBy: string | null, createdAt: string, updatedAt: string, memberCount: number | null, effectivePermissions: Array<string> | null, parentRole: { __typename?: 'CustomRole', id: string, name: string, color: string | null, permissions: Array<string> } | null, childRoles: Array<{ __typename?: 'CustomRole', id: string, name: string, color: string | null, memberCount: number | null }> | null } };

export type AdminGetRoleHierarchyQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminGetRoleHierarchyQuery = { __typename?: 'Query', adminGetRoleHierarchy: Array<{ __typename?: 'RoleHierarchyNode', id: string, name: string, color: string | null, level: number, memberCount: number, permissionCount: number, isBuiltIn: boolean, children: Array<{ __typename?: 'RoleHierarchyNode', id: string, name: string, color: string | null, level: number, memberCount: number, permissionCount: number, isBuiltIn: boolean, children: Array<{ __typename?: 'RoleHierarchyNode', id: string, name: string, color: string | null, level: number, memberCount: number, permissionCount: number, isBuiltIn: boolean }> | null }> | null }> };

export type AdminGetPermissionCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminGetPermissionCategoriesQuery = { __typename?: 'Query', adminGetPermissionCategories: Array<{ __typename?: 'PermissionCategory', key: string, label: string, description: string, icon: string, permissions: Array<{ __typename?: 'PermissionDefinition', key: string, name: string, description: string, category: string }> }> };

export type AdminGetRoleAssignmentHistoryQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminGetRoleAssignmentHistoryQuery = { __typename?: 'Query', adminGetRoleAssignmentHistory: Array<{ __typename?: 'RoleAssignmentHistory', id: string, memberId: string, teamId: string, previousRole: string | null, newRole: string, roleId: string | null, assignedBy: string, reason: string | null, createdAt: string }> };

export type AdminGetMemberRoleHistoryQueryVariables = Exact<{
  memberId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminGetMemberRoleHistoryQuery = { __typename?: 'Query', adminGetMemberRoleHistory: Array<{ __typename?: 'RoleAssignmentHistory', id: string, memberId: string, teamId: string, previousRole: string | null, newRole: string, roleId: string | null, assignedBy: string, reason: string | null, createdAt: string }> };

export type AdminGetRoleStatisticsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminGetRoleStatisticsQuery = { __typename?: 'Query', adminGetRoleStatistics: { __typename?: 'RoleStatistics', totalRoles: number, activeRoles: number, inactiveRoles: number, builtInRoles: number, totalMembers: number, membersWithCustomRoles: number, membersWithDefaultRoles: number } };

export type AdminCreateCustomRoleMutationVariables = Exact<{
  input: CreateCustomRoleInput;
}>;


export type AdminCreateCustomRoleMutation = { __typename?: 'Mutation', adminCreateCustomRole: { __typename?: 'CustomRole', id: string, teamId: string, name: string, description: string | null, color: string | null, permissions: Array<string>, parentRoleId: string | null, level: number, isActive: boolean, isBuiltIn: boolean, sortOrder: number, createdBy: string, modifiedBy: string | null, createdAt: string, updatedAt: string, memberCount: number | null, effectivePermissions: Array<string> | null } };

export type AdminUpdateCustomRoleMutationVariables = Exact<{
  input: UpdateCustomRoleInput;
}>;


export type AdminUpdateCustomRoleMutation = { __typename?: 'Mutation', adminUpdateCustomRole: { __typename?: 'CustomRole', id: string, teamId: string, name: string, description: string | null, color: string | null, permissions: Array<string>, parentRoleId: string | null, level: number, isActive: boolean, isBuiltIn: boolean, sortOrder: number, createdBy: string, modifiedBy: string | null, createdAt: string, updatedAt: string, memberCount: number | null, effectivePermissions: Array<string> | null } };

export type AdminDeleteCustomRoleMutationVariables = Exact<{
  roleId: Scalars['ID']['input'];
}>;


export type AdminDeleteCustomRoleMutation = { __typename?: 'Mutation', adminDeleteCustomRole: boolean };

export type AdminAssignRoleMutationVariables = Exact<{
  input: AssignRoleInput;
}>;


export type AdminAssignRoleMutation = { __typename?: 'Mutation', adminAssignRole: boolean };

export type AdminBulkAssignRoleMutationVariables = Exact<{
  input: BulkAssignRoleInput;
}>;


export type AdminBulkAssignRoleMutation = { __typename?: 'Mutation', adminBulkAssignRole: number };

export type GetAdminRolesQueryVariables = Exact<{
  role: InputMaybe<Scalars['String']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Float']['input']>;
  offset: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetAdminRolesQuery = { __typename?: 'Query', adminRoles: Array<{ __typename?: 'AdminRoleDetail', id: string, userId: string, role: AdminRoleType, permissions: Array<string>, twoFactorEnforced: boolean, ipWhitelist: Array<string>, createdAt: string, updatedAt: string, user: { __typename?: 'User', id: string, email: string, fullName: string } }> };

export type GetAdminRoleQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetAdminRoleQuery = { __typename?: 'Query', adminRole: { __typename?: 'AdminRoleDetail', id: string, userId: string, role: AdminRoleType, permissions: Array<string>, twoFactorEnforced: boolean, ipWhitelist: Array<string>, createdAt: string, updatedAt: string, user: { __typename?: 'User', id: string, email: string, fullName: string } } };

export type GetAdminRoleByUserIdQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetAdminRoleByUserIdQuery = { __typename?: 'Query', adminRoleByUserId: { __typename?: 'AdminRoleDetail', id: string, userId: string, role: AdminRoleType, permissions: Array<string>, twoFactorEnforced: boolean, ipWhitelist: Array<string>, createdAt: string, updatedAt: string, user: { __typename?: 'User', id: string, email: string, fullName: string } } | null };

export type AssignAdminRoleMutationVariables = Exact<{
  input: AssignAdminRoleInput;
}>;


export type AssignAdminRoleMutation = { __typename?: 'Mutation', assignAdminRole: { __typename?: 'AdminRoleDetail', id: string, userId: string, role: AdminRoleType, permissions: Array<string>, twoFactorEnforced: boolean, ipWhitelist: Array<string>, createdAt: string, updatedAt: string, user: { __typename?: 'User', id: string, email: string, fullName: string } } };

export type UpdateAdminPermissionsMutationVariables = Exact<{
  input: UpdateAdminPermissionsInput;
}>;


export type UpdateAdminPermissionsMutation = { __typename?: 'Mutation', updateAdminPermissions: { __typename?: 'AdminRoleDetail', id: string, userId: string, role: AdminRoleType, permissions: Array<string>, updatedAt: string } };

export type UpdateTwoFactorEnforcementMutationVariables = Exact<{
  input: UpdateTwoFactorInput;
}>;


export type UpdateTwoFactorEnforcementMutation = { __typename?: 'Mutation', updateTwoFactorEnforcement: { __typename?: 'AdminRoleDetail', id: string, userId: string, twoFactorEnforced: boolean, updatedAt: string } };

export type UpdateIpWhitelistMutationVariables = Exact<{
  input: UpdateIpWhitelistInput;
}>;


export type UpdateIpWhitelistMutation = { __typename?: 'Mutation', updateIpWhitelist: { __typename?: 'AdminRoleDetail', id: string, userId: string, ipWhitelist: Array<string>, updatedAt: string } };

export type ChangeAdminRoleMutationVariables = Exact<{
  roleId: Scalars['String']['input'];
  newRole: Scalars['String']['input'];
}>;


export type ChangeAdminRoleMutation = { __typename?: 'Mutation', changeAdminRole: { __typename?: 'AdminRoleDetail', id: string, userId: string, role: AdminRoleType, permissions: Array<string>, updatedAt: string } };

export type RevokeAdminRoleMutationVariables = Exact<{
  roleId: Scalars['String']['input'];
}>;


export type RevokeAdminRoleMutation = { __typename?: 'Mutation', revokeAdminRole: boolean };

export type SystemSettingsQueryVariables = Exact<{
  category: InputMaybe<SettingCategory>;
}>;


export type SystemSettingsQuery = { __typename?: 'Query', systemSettings: Array<{ __typename?: 'SystemSetting', id: string, key: string, category: SettingCategory, name: string, description: string | null, valueType: SettingValueType, value: string | null, defaultValue: string | null, isEncrypted: boolean, isRequired: boolean, updatedBy: string | null, updatedAt: string, createdAt: string }> };

export type SystemSettingQueryVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type SystemSettingQuery = { __typename?: 'Query', systemSetting: { __typename?: 'SystemSetting', id: string, key: string, category: SettingCategory, name: string, description: string | null, valueType: SettingValueType, value: string | null, defaultValue: string | null, isEncrypted: boolean, isRequired: boolean, updatedBy: string | null, updatedAt: string, createdAt: string } | null };

export type CreateSystemSettingMutationVariables = Exact<{
  input: CreateSystemSettingInput;
}>;


export type CreateSystemSettingMutation = { __typename?: 'Mutation', createSystemSetting: { __typename?: 'SystemSetting', id: string, key: string, category: SettingCategory, name: string, description: string | null, valueType: SettingValueType, value: string | null, defaultValue: string | null, isEncrypted: boolean, isRequired: boolean, updatedBy: string | null, updatedAt: string, createdAt: string } };

export type UpdateSystemSettingMutationVariables = Exact<{
  input: UpdateSystemSettingInput;
}>;


export type UpdateSystemSettingMutation = { __typename?: 'Mutation', updateSystemSetting: { __typename?: 'SystemSetting', id: string, key: string, category: SettingCategory, name: string, description: string | null, valueType: SettingValueType, value: string | null, defaultValue: string | null, isEncrypted: boolean, isRequired: boolean, updatedBy: string | null, updatedAt: string, createdAt: string } };

export type BulkUpdateSystemSettingsMutationVariables = Exact<{
  input: BulkUpdateSystemSettingsInput;
}>;


export type BulkUpdateSystemSettingsMutation = { __typename?: 'Mutation', bulkUpdateSystemSettings: Array<{ __typename?: 'SystemSetting', id: string, key: string, category: SettingCategory, name: string, value: string | null, updatedAt: string }> };

export type DeleteSystemSettingMutationVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type DeleteSystemSettingMutation = { __typename?: 'Mutation', deleteSystemSetting: boolean };

export type TestServiceConnectionMutationVariables = Exact<{
  category: SettingCategory;
}>;


export type TestServiceConnectionMutation = { __typename?: 'Mutation', testServiceConnection: { __typename?: 'ConnectionTestResult', success: boolean, message: string } };

export type InitializeDefaultSettingsMutationVariables = Exact<{ [key: string]: never; }>;


export type InitializeDefaultSettingsMutation = { __typename?: 'Mutation', initializeDefaultSettings: boolean };

export type GetStorageSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStorageSettingsQuery = { __typename?: 'Query', storageSettings: { __typename?: 'StorageSettings', adminMode: string, defaultProvider: string, autoMigrate: boolean, cloudinaryCloudName: string | null, cloudinaryApiKey: string | null, cloudinaryApiSecretSet: boolean, r2AccountId: string | null, r2AccessKeyIdSet: boolean, r2SecretAccessKeySet: boolean, r2BucketName: string | null, r2PublicUrl: string | null } };

export type GetStorageStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStorageStatsQuery = { __typename?: 'Query', storageStats: { __typename?: 'StorageStats', totalFiles: number, totalSize: number, filesByProvider: Array<{ __typename?: 'ProviderFileStats', provider: string, fileCount: number, totalSize: number }>, filesByType: Array<{ __typename?: 'FileTypeStats', fileType: string, count: number, totalSize: number }> } };

export type TestStorageProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type TestStorageProvidersQuery = { __typename?: 'Query', testStorageProviders: Array<{ __typename?: 'ProviderTestResult', provider: StorageProviderType, success: boolean, message: string, latency: number | null }> };

export type UpdateStorageSettingsMutationVariables = Exact<{
  input: UpdateStorageSettingsInput;
}>;


export type UpdateStorageSettingsMutation = { __typename?: 'Mutation', updateStorageSettings: { __typename?: 'StorageSettings', adminMode: string, defaultProvider: string, autoMigrate: boolean, cloudinaryCloudName: string | null, cloudinaryApiKey: string | null, cloudinaryApiSecretSet: boolean, r2AccountId: string | null, r2AccessKeyIdSet: boolean, r2SecretAccessKeySet: boolean, r2BucketName: string | null, r2PublicUrl: string | null } };

export type TestStorageProviderMutationVariables = Exact<{
  provider: StorageProviderType;
}>;


export type TestStorageProviderMutation = { __typename?: 'Mutation', testStorageProvider: { __typename?: 'ProviderTestResult', provider: StorageProviderType, success: boolean, message: string, latency: number | null } };

export type MigrateUserStorageMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  fromProvider: StorageProviderType;
  toProvider: StorageProviderType;
}>;


export type MigrateUserStorageMutation = { __typename?: 'Mutation', migrateUserStorage: { __typename?: 'StorageMigrationResult', userId: string, fromProvider: StorageProviderType, toProvider: StorageProviderType, totalFiles: number, successCount: number, failedCount: number, failures: Array<{ __typename?: 'MigrationFailure', url: string, error: string }> } };

export type AdminSubscriptionFieldsFragment = { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, cancelAtPeriodEnd: boolean, trialEndsAt: string | null, createdAt: string, updatedAt: string, team: any | null };

export type AdminSubscriptionsQueryVariables = Exact<{
  filters: InputMaybe<AdminSubscriptionFilters>;
  pagination: PaginationInput;
}>;


export type AdminSubscriptionsQuery = { __typename?: 'Query', adminSubscriptions: { __typename?: 'AdminSubscriptionsConnection', totalCount: number, nodes: Array<{ __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, cancelAtPeriodEnd: boolean, trialEndsAt: string | null, createdAt: string, updatedAt: string, team: any | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number } } };

export type AdminSubscriptionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminSubscriptionQuery = { __typename?: 'Query', adminSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, cancelAtPeriodEnd: boolean, trialEndsAt: string | null, createdAt: string, updatedAt: string, team: any | null } };

export type AdminSubscriptionStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminSubscriptionStatsQuery = { __typename?: 'Query', adminSubscriptionStats: { __typename?: 'SubscriptionStats', totalSubscriptions: number, activeSubscriptions: number, trialingSubscriptions: number, cancelledSubscriptions: number, byPlan: { __typename?: 'SubscriptionsByPlan', LITE: number, FOREMAN: number, BRIGADE: number } } };

export type AdminCancelSubscriptionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminCancelSubscriptionMutation = { __typename?: 'Mutation', adminCancelSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, cancelAtPeriodEnd: boolean, trialEndsAt: string | null, createdAt: string, updatedAt: string, team: any | null } };

export type AdminChangeTeamPlanMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  planType: Scalars['String']['input'];
}>;


export type AdminChangeTeamPlanMutation = { __typename?: 'Mutation', adminChangeTeamPlan: { __typename?: 'Team', id: string, name: string, ownerId: string } };

export type AdminDeleteSubscriptionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeleteSubscriptionMutation = { __typename?: 'Mutation', adminDeleteSubscription: boolean };

export type AdminSupportTicketsQueryVariables = Exact<{
  filter: InputMaybe<AdminSupportTicketFilterInput>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type AdminSupportTicketsQuery = { __typename?: 'Query', adminSupportTickets: { __typename?: 'AdminSupportTicketsResult', total: number, hasMore: boolean, tickets: Array<{ __typename?: 'AdminSupportTicket', id: string, userId: string, userEmail: string | null, userFullName: string | null, telegramChatId: string, subject: string | null, status: SupportTicketStatus, priority: SupportTicketPriority, category: string | null, createdAt: string, updatedAt: string, closedAt: string | null, messageCount: number | null }> } };

export type AdminSupportTicketQueryVariables = Exact<{
  ticketId: Scalars['ID']['input'];
}>;


export type AdminSupportTicketQuery = { __typename?: 'Query', adminSupportTicket: { __typename?: 'AdminSupportTicket', id: string, userId: string, userEmail: string | null, userFullName: string | null, telegramChatId: string, subject: string | null, status: SupportTicketStatus, priority: SupportTicketPriority, category: string | null, createdAt: string, updatedAt: string, closedAt: string | null, messages: Array<{ __typename?: 'SupportMessage', id: string, ticketId: string, fromUser: boolean, message: string, createdAt: string }> | null } };

export type AdminSupportStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminSupportStatisticsQuery = { __typename?: 'Query', adminSupportStatistics: { __typename?: 'AdminSupportStatistics', totalTickets: number, openTickets: number, inProgressTickets: number, resolvedTickets: number, closedTickets: number, ticketsByPriority: any, ticketsByCategory: any } };

export type AdminUpdateSupportTicketMutationVariables = Exact<{
  ticketId: Scalars['ID']['input'];
  input: AdminUpdateSupportTicketInput;
}>;


export type AdminUpdateSupportTicketMutation = { __typename?: 'Mutation', adminUpdateSupportTicket: { __typename?: 'AdminSupportTicket', id: string, status: SupportTicketStatus, priority: SupportTicketPriority, category: string | null, updatedAt: string, closedAt: string | null } };

export type AdminSendSupportMessageMutationVariables = Exact<{
  input: AdminSendMessageInput;
}>;


export type AdminSendSupportMessageMutation = { __typename?: 'Mutation', adminSendSupportMessage: { __typename?: 'SupportMessage', id: string, ticketId: string, fromUser: boolean, message: string, createdAt: string } };

export type AdminDeleteSupportTicketMutationVariables = Exact<{
  ticketId: Scalars['ID']['input'];
}>;


export type AdminDeleteSupportTicketMutation = { __typename?: 'Mutation', adminDeleteSupportTicket: { __typename?: 'DeleteResult', success: boolean, message: string } };

export type TeamGrowthChartFieldsFragment = { __typename?: 'TeamGrowthChart', labels: Array<string>, memberData: Array<number>, projectData: Array<number> };

export type MemberActivityFieldsFragment = { __typename?: 'MemberActivity', userId: string, userName: string, avatarUrl: string | null, email: string | null, role: string, position: string | null, actionsCount: number, lastActiveAt: string | null, hoursLogged: number, projectsCount: number, joinedAt: string };

export type RoleCountFieldsFragment = { __typename?: 'RoleCount', role: string, count: number };

export type PositionCountFieldsFragment = { __typename?: 'PositionCount', position: string, count: number };

export type SalaryDistributionFieldsFragment = { __typename?: 'SalaryDistribution', fixed: number, percentage: number, none: number, totalAmount: number };

export type TeamCompositionFieldsFragment = { __typename?: 'TeamComposition', totalMembers: number, byRole: Array<{ __typename?: 'RoleCount', role: string, count: number }>, byPosition: Array<{ __typename?: 'PositionCount', position: string, count: number }>, salaryDistribution: { __typename?: 'SalaryDistribution', fixed: number, percentage: number, none: number, totalAmount: number } };

export type ProjectStorageUsageFieldsFragment = { __typename?: 'ProjectStorageUsage', projectId: string, projectName: string, usedBytes: number, filesCount: number, percentage: number };

export type TeamStorageUsageFieldsFragment = { __typename?: 'TeamStorageUsage', totalBytes: number, usedBytes: number, usedPercentage: number, usedGB: number, byProject: Array<{ __typename?: 'ProjectStorageUsage', projectId: string, projectName: string, usedBytes: number, filesCount: number, percentage: number }> };

export type TeamKpIsFieldsFragment = { __typename?: 'TeamKPIs', memberRetention: number, projectCompletionRate: number, avgProjectDurationDays: number, totalRevenue: number, activeProjectsCount: number, completedProjectsCount: number, archivedProjectsCount: number, totalMembers: number, totalHoursWorked: number, avgHoursPerMember: number, totalExpenses: number, totalBudget: number, profit: number };

export type TeamAnalyticsFieldsFragment = { __typename?: 'TeamAnalytics', teamId: string, teamName: string, kpis: { __typename?: 'TeamKPIs', memberRetention: number, projectCompletionRate: number, avgProjectDurationDays: number, totalRevenue: number, activeProjectsCount: number, completedProjectsCount: number, archivedProjectsCount: number, totalMembers: number, totalHoursWorked: number, avgHoursPerMember: number, totalExpenses: number, totalBudget: number, profit: number }, growthChart: { __typename?: 'TeamGrowthChart', labels: Array<string>, memberData: Array<number>, projectData: Array<number> }, memberActivity: Array<{ __typename?: 'MemberActivity', userId: string, userName: string, avatarUrl: string | null, email: string | null, role: string, position: string | null, actionsCount: number, lastActiveAt: string | null, hoursLogged: number, projectsCount: number, joinedAt: string }>, composition: { __typename?: 'TeamComposition', totalMembers: number, byRole: Array<{ __typename?: 'RoleCount', role: string, count: number }>, byPosition: Array<{ __typename?: 'PositionCount', position: string, count: number }>, salaryDistribution: { __typename?: 'SalaryDistribution', fixed: number, percentage: number, none: number, totalAmount: number } }, storageUsage: { __typename?: 'TeamStorageUsage', totalBytes: number, usedBytes: number, usedPercentage: number, usedGB: number, byProject: Array<{ __typename?: 'ProjectStorageUsage', projectId: string, projectName: string, usedBytes: number, filesCount: number, percentage: number }> } };

export type AdminTeamGrowthChartQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  months?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminTeamGrowthChartQuery = { __typename?: 'Query', adminTeamGrowthChart: { __typename?: 'TeamGrowthChart', labels: Array<string>, memberData: Array<number>, projectData: Array<number> } };

export type AdminTeamMemberActivityQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminTeamMemberActivityQuery = { __typename?: 'Query', adminTeamMemberActivity: Array<{ __typename?: 'MemberActivity', userId: string, userName: string, avatarUrl: string | null, email: string | null, role: string, position: string | null, actionsCount: number, lastActiveAt: string | null, hoursLogged: number, projectsCount: number, joinedAt: string }> };

export type AdminTeamCompositionQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminTeamCompositionQuery = { __typename?: 'Query', adminTeamComposition: { __typename?: 'TeamComposition', totalMembers: number, byRole: Array<{ __typename?: 'RoleCount', role: string, count: number }>, byPosition: Array<{ __typename?: 'PositionCount', position: string, count: number }>, salaryDistribution: { __typename?: 'SalaryDistribution', fixed: number, percentage: number, none: number, totalAmount: number } } };

export type AdminTeamStorageUsageQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminTeamStorageUsageQuery = { __typename?: 'Query', adminTeamStorageUsage: { __typename?: 'TeamStorageUsage', totalBytes: number, usedBytes: number, usedPercentage: number, usedGB: number, byProject: Array<{ __typename?: 'ProjectStorageUsage', projectId: string, projectName: string, usedBytes: number, filesCount: number, percentage: number }> } };

export type AdminTeamKpIsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminTeamKpIsQuery = { __typename?: 'Query', adminTeamKPIs: { __typename?: 'TeamKPIs', memberRetention: number, projectCompletionRate: number, avgProjectDurationDays: number, totalRevenue: number, activeProjectsCount: number, completedProjectsCount: number, archivedProjectsCount: number, totalMembers: number, totalHoursWorked: number, avgHoursPerMember: number, totalExpenses: number, totalBudget: number, profit: number } };

export type AdminTeamAnalyticsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminTeamAnalyticsQuery = { __typename?: 'Query', adminTeamAnalytics: { __typename?: 'TeamAnalytics', teamId: string, teamName: string, kpis: { __typename?: 'TeamKPIs', memberRetention: number, projectCompletionRate: number, avgProjectDurationDays: number, totalRevenue: number, activeProjectsCount: number, completedProjectsCount: number, archivedProjectsCount: number, totalMembers: number, totalHoursWorked: number, avgHoursPerMember: number, totalExpenses: number, totalBudget: number, profit: number }, growthChart: { __typename?: 'TeamGrowthChart', labels: Array<string>, memberData: Array<number>, projectData: Array<number> }, memberActivity: Array<{ __typename?: 'MemberActivity', userId: string, userName: string, avatarUrl: string | null, email: string | null, role: string, position: string | null, actionsCount: number, lastActiveAt: string | null, hoursLogged: number, projectsCount: number, joinedAt: string }>, composition: { __typename?: 'TeamComposition', totalMembers: number, byRole: Array<{ __typename?: 'RoleCount', role: string, count: number }>, byPosition: Array<{ __typename?: 'PositionCount', position: string, count: number }>, salaryDistribution: { __typename?: 'SalaryDistribution', fixed: number, percentage: number, none: number, totalAmount: number } }, storageUsage: { __typename?: 'TeamStorageUsage', totalBytes: number, usedBytes: number, usedPercentage: number, usedGB: number, byProject: Array<{ __typename?: 'ProjectStorageUsage', projectId: string, projectName: string, usedBytes: number, filesCount: number, percentage: number }> } } };

export type TeamMemberExtendedFieldsFragment = { __typename?: 'TeamMemberExtended', id: string, teamId: string, userId: string, role: string, position: string | null, joinedAt: string, salaryType: string, salaryAmount: number | null, customRoleId: string | null, userName: string, email: string, avatarUrl: string | null, phone: string | null, customRoleName: string | null, customRoleColor: string | null, projectsCount: number, hoursLogged: number, totalExpenses: number, tasksCount: number, totalPayouts: number, lastActiveAt: string | null };

export type MemberActivityEventFieldsFragment = { __typename?: 'MemberActivityEvent', id: string, type: MemberActivityType, description: string, metadata: string | null, relatedId: string | null, relatedType: string | null, createdAt: string, triggeredBy: string | null, triggeredByName: string | null };

export type BulkOperationResultFieldsFragment = { __typename?: 'BulkOperationResult', successCount: number, failedCount: number, errors: Array<string> | null, successIds: Array<string> | null, failedIds: Array<string> | null };

export type MemberStatisticsFieldsFragment = { __typename?: 'MemberStatistics', totalMembers: number, activeMembers: number, inactiveMembers: number, withCustomRoles: number, withFixedSalary: number, withPercentageSalary: number, withNoSalary: number, averageHours: number, totalPayroll: number };

export type AdminGetTeamMembersQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  filter: InputMaybe<MemberFilterInput>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type AdminGetTeamMembersQuery = { __typename?: 'Query', adminGetTeamMembers: Array<{ __typename?: 'TeamMemberExtended', id: string, teamId: string, userId: string, role: string, position: string | null, joinedAt: string, salaryType: string, salaryAmount: number | null, customRoleId: string | null, userName: string, email: string, avatarUrl: string | null, phone: string | null, customRoleName: string | null, customRoleColor: string | null, projectsCount: number, hoursLogged: number, totalExpenses: number, tasksCount: number, totalPayouts: number, lastActiveAt: string | null }> };

export type AdminGetMemberByIdQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type AdminGetMemberByIdQuery = { __typename?: 'Query', adminGetMemberById: { __typename?: 'TeamMemberExtended', id: string, teamId: string, userId: string, role: string, position: string | null, joinedAt: string, salaryType: string, salaryAmount: number | null, customRoleId: string | null, userName: string, email: string, avatarUrl: string | null, phone: string | null, customRoleName: string | null, customRoleColor: string | null, projectsCount: number, hoursLogged: number, totalExpenses: number, tasksCount: number, totalPayouts: number, lastActiveAt: string | null } };

export type AdminGetMemberActivityHistoryQueryVariables = Exact<{
  memberId: Scalars['String']['input'];
  pagination: InputMaybe<PaginationInput>;
}>;


export type AdminGetMemberActivityHistoryQuery = { __typename?: 'Query', adminGetMemberActivityHistory: { __typename?: 'MemberActivityConnection', totalCount: number, hasMore: boolean, events: Array<{ __typename?: 'MemberActivityEvent', id: string, type: MemberActivityType, description: string, metadata: string | null, relatedId: string | null, relatedType: string | null, createdAt: string, triggeredBy: string | null, triggeredByName: string | null }> } };

export type AdminGetMemberStatisticsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminGetMemberStatisticsQuery = { __typename?: 'Query', adminGetMemberStatistics: { __typename?: 'MemberStatistics', totalMembers: number, activeMembers: number, inactiveMembers: number, withCustomRoles: number, withFixedSalary: number, withPercentageSalary: number, withNoSalary: number, averageHours: number, totalPayroll: number } };

export type AdminExportMembersQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  format: MemberExportFormat;
}>;


export type AdminExportMembersQuery = { __typename?: 'Query', adminExportMembers: string };

export type AdminBulkUpdateMembersMutationVariables = Exact<{
  input: BulkUpdateMembersInput;
}>;


export type AdminBulkUpdateMembersMutation = { __typename?: 'Mutation', adminBulkUpdateMembers: { __typename?: 'BulkOperationResult', successCount: number, failedCount: number, errors: Array<string> | null, successIds: Array<string> | null, failedIds: Array<string> | null } };

export type AdminBulkRemoveMembersMutationVariables = Exact<{
  input: BulkRemoveMembersInput;
}>;


export type AdminBulkRemoveMembersMutation = { __typename?: 'Mutation', adminBulkRemoveMembers: { __typename?: 'BulkOperationResult', successCount: number, failedCount: number, errors: Array<string> | null, successIds: Array<string> | null, failedIds: Array<string> | null } };

export type AdminTransferMemberMutationVariables = Exact<{
  input: TransferMemberInput;
}>;


export type AdminTransferMemberMutation = { __typename?: 'Mutation', adminTransferMember: { __typename?: 'TeamMemberExtended', id: string, teamId: string, userId: string, role: string, position: string | null, joinedAt: string, salaryType: string, salaryAmount: number | null, customRoleId: string | null, userName: string, email: string, avatarUrl: string | null, phone: string | null, customRoleName: string | null, customRoleColor: string | null, projectsCount: number, hoursLogged: number, totalExpenses: number, tasksCount: number, totalPayouts: number, lastActiveAt: string | null } };

export type TeamTemplateFieldsFragment = { __typename?: 'TeamTemplate', id: string, name: string, description: string | null, settings: any, roles: any, projectSetup: any | null, isPublic: boolean, createdById: string, createdAt: string, updatedAt: string, createdByName: string | null };

export type TeamMergeLogFieldsFragment = { __typename?: 'TeamMergeLog', id: string, sourceTeamId: string, targetTeamId: string, mergedById: string, membersMoved: number, projectsMoved: number, dataSnapshot: any, notes: string | null, createdAt: string, sourceTeamName: string | null, targetTeamName: string | null, mergedByName: string | null };

export type TeamCloneLogFieldsFragment = { __typename?: 'TeamCloneLog', id: string, sourceTeamId: string, clonedTeamId: string, clonedById: string, clonedSettings: any, createdAt: string, sourceTeamName: string | null, clonedTeamName: string | null, clonedByName: string | null };

export type MergePreviewFieldsFragment = { __typename?: 'MergePreview', sourceTeamId: string, sourceTeamName: string, targetTeamId: string, targetTeamName: string, membersToMove: number, projectsToMove: number, conflictingMembers: number, warnings: Array<string>, canMerge: boolean };

export type MergeResultFieldsFragment = { __typename?: 'MergeResult', success: boolean, mergeLogId: string, membersMoved: number, projectsMoved: number, errors: Array<string> | null };

export type CloneResultFieldsFragment = { __typename?: 'CloneResult', success: boolean, clonedTeamId: string, cloneLogId: string, error: string | null };

export type TeamOperationsStatisticsFieldsFragment = { __typename?: 'TeamOperationsStatistics', totalTemplates: number, publicTemplates: number, totalMerges: number, totalClones: number, teamsCreatedFromTemplates: number };

export type AdminGetTeamTemplatesQueryVariables = Exact<{
  filter: InputMaybe<TeamTemplateFilterInput>;
}>;


export type AdminGetTeamTemplatesQuery = { __typename?: 'Query', adminGetTeamTemplates: Array<{ __typename?: 'TeamTemplate', id: string, name: string, description: string | null, settings: any, roles: any, projectSetup: any | null, isPublic: boolean, createdById: string, createdAt: string, updatedAt: string, createdByName: string | null }> };

export type AdminGetTeamTemplateByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminGetTeamTemplateByIdQuery = { __typename?: 'Query', adminGetTeamTemplateById: { __typename?: 'TeamTemplate', id: string, name: string, description: string | null, settings: any, roles: any, projectSetup: any | null, isPublic: boolean, createdById: string, createdAt: string, updatedAt: string, createdByName: string | null } };

export type AdminGetMergePreviewQueryVariables = Exact<{
  sourceTeamId: Scalars['String']['input'];
  targetTeamId: Scalars['String']['input'];
}>;


export type AdminGetMergePreviewQuery = { __typename?: 'Query', adminGetMergePreview: { __typename?: 'MergePreview', sourceTeamId: string, sourceTeamName: string, targetTeamId: string, targetTeamName: string, membersToMove: number, projectsToMove: number, conflictingMembers: number, warnings: Array<string>, canMerge: boolean } };

export type AdminGetMergeLogsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminGetMergeLogsQuery = { __typename?: 'Query', adminGetMergeLogs: Array<{ __typename?: 'TeamMergeLog', id: string, sourceTeamId: string, targetTeamId: string, mergedById: string, membersMoved: number, projectsMoved: number, dataSnapshot: any, notes: string | null, createdAt: string, sourceTeamName: string | null, targetTeamName: string | null, mergedByName: string | null }> };

export type AdminGetCloneLogsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminGetCloneLogsQuery = { __typename?: 'Query', adminGetCloneLogs: Array<{ __typename?: 'TeamCloneLog', id: string, sourceTeamId: string, clonedTeamId: string, clonedById: string, clonedSettings: any, createdAt: string, sourceTeamName: string | null, clonedTeamName: string | null, clonedByName: string | null }> };

export type AdminGetTeamOperationsStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminGetTeamOperationsStatisticsQuery = { __typename?: 'Query', adminGetTeamOperationsStatistics: { __typename?: 'TeamOperationsStatistics', totalTemplates: number, publicTemplates: number, totalMerges: number, totalClones: number, teamsCreatedFromTemplates: number } };

export type AdminCreateTeamTemplateMutationVariables = Exact<{
  input: CreateTeamTemplateInput;
}>;


export type AdminCreateTeamTemplateMutation = { __typename?: 'Mutation', adminCreateTeamTemplate: { __typename?: 'TeamTemplate', id: string, name: string, description: string | null, settings: any, roles: any, projectSetup: any | null, isPublic: boolean, createdById: string, createdAt: string, updatedAt: string, createdByName: string | null } };

export type AdminUpdateTeamTemplateMutationVariables = Exact<{
  input: UpdateTeamTemplateInput;
}>;


export type AdminUpdateTeamTemplateMutation = { __typename?: 'Mutation', adminUpdateTeamTemplate: { __typename?: 'TeamTemplate', id: string, name: string, description: string | null, settings: any, roles: any, projectSetup: any | null, isPublic: boolean, createdById: string, createdAt: string, updatedAt: string, createdByName: string | null } };

export type AdminDeleteTeamTemplateMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeleteTeamTemplateMutation = { __typename?: 'Mutation', adminDeleteTeamTemplate: boolean };

export type AdminMergeTeamsMutationVariables = Exact<{
  input: MergeTeamsInput;
}>;


export type AdminMergeTeamsMutation = { __typename?: 'Mutation', adminMergeTeams: { __typename?: 'MergeResult', success: boolean, mergeLogId: string, membersMoved: number, projectsMoved: number, errors: Array<string> | null } };

export type AdminCloneTeamMutationVariables = Exact<{
  input: CloneTeamInput;
}>;


export type AdminCloneTeamMutation = { __typename?: 'Mutation', adminCloneTeam: { __typename?: 'CloneResult', success: boolean, clonedTeamId: string, cloneLogId: string, error: string | null } };

export type AdminCreateTeamFromTemplateMutationVariables = Exact<{
  input: CreateTeamFromTemplateInput;
}>;


export type AdminCreateTeamFromTemplateMutation = { __typename?: 'Mutation', adminCreateTeamFromTemplate: { __typename?: 'CloneResult', success: boolean, clonedTeamId: string, cloneLogId: string, error: string | null } };

export type AdminTeamFieldsFragment = { __typename?: 'Team', id: string, name: string, logoUrl: string | null, ownerId: string, createdAt: string, updatedAt: string };

export type AdminTeamDetailsFieldsFragment = { __typename?: 'AdminTeamDetails', team: { __typename?: 'Team', id: string, name: string, logoUrl: string | null, ownerId: string, createdAt: string, updatedAt: string }, owner: { __typename?: 'User', id: string, email: string, fullName: string, avatarUrl: string | null }, subscription: { __typename?: 'Subscription', id: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodEnd: string } | null, projects: Array<{ __typename?: 'Project', id: string, name: string, status: ProjectStatus, budget: number | null, createdAt: string }>, _count: { __typename?: 'AdminTeamCounts', members: number, projects: number } };

export type AdminTeamStatsFieldsFragment = { __typename?: 'AdminTeamStats', totalMembers: number, totalProjects: number, totalExpenses: number, totalExpenseAmount: number, activeProjects: number, completedProjects: number };

export type AdminTeamsQueryVariables = Exact<{
  filters: InputMaybe<AdminTeamFilters>;
  pagination: PaginationInput;
}>;


export type AdminTeamsQuery = { __typename?: 'Query', adminTeams: { __typename?: 'AdminTeamsConnection', totalCount: number, nodes: Array<{ __typename?: 'Team', id: string, name: string, logoUrl: string | null, ownerId: string, createdAt: string, updatedAt: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number } } };

export type AdminTeamQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminTeamQuery = { __typename?: 'Query', adminTeam: { __typename?: 'AdminTeamDetails', team: { __typename?: 'Team', id: string, name: string, logoUrl: string | null, ownerId: string, createdAt: string, updatedAt: string }, owner: { __typename?: 'User', id: string, email: string, fullName: string, avatarUrl: string | null }, subscription: { __typename?: 'Subscription', id: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodEnd: string } | null, projects: Array<{ __typename?: 'Project', id: string, name: string, status: ProjectStatus, budget: number | null, createdAt: string }>, _count: { __typename?: 'AdminTeamCounts', members: number, projects: number } } };

export type AdminTeamStatsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type AdminTeamStatsQuery = { __typename?: 'Query', adminTeamStats: { __typename?: 'AdminTeamStats', totalMembers: number, totalProjects: number, totalExpenses: number, totalExpenseAmount: number, activeProjects: number, completedProjects: number } };

export type AdminUpdateTeamMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: AdminUpdateTeamInput;
}>;


export type AdminUpdateTeamMutation = { __typename?: 'Mutation', adminUpdateTeam: { __typename?: 'Team', id: string, name: string, logoUrl: string | null, ownerId: string, createdAt: string, updatedAt: string } };

export type AdminDeleteTeamMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeleteTeamMutation = { __typename?: 'Mutation', adminDeleteTeam: boolean };

export type GetAdminTelegramBotsQueryVariables = Exact<{
  includeInactive: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetAdminTelegramBotsQuery = { __typename?: 'Query', adminTelegramBots: Array<{ __typename?: 'AdminTelegramBotModel', id: string, botName: string, username: string, displayName: string, description: string | null, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, avatarUrl: string | null, firstName: string | null, canJoinGroups: boolean, canReadMessages: boolean, supportsInlineQueries: boolean, createdAt: string, updatedAt: string, lastSyncAt: string | null, configStatus: { __typename?: 'TelegramBotConfigStatus', hasToken: boolean, hasWebhook: boolean, isRegistered: boolean } | null }> };

export type GetAdminTelegramBotQueryVariables = Exact<{
  id: InputMaybe<Scalars['ID']['input']>;
  botName: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAdminTelegramBotQuery = { __typename?: 'Query', adminTelegramBot: { __typename?: 'AdminTelegramBotModel', id: string, botName: string, username: string, displayName: string, description: string | null, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, avatarUrl: string | null, firstName: string | null, canJoinGroups: boolean, canReadMessages: boolean, supportsInlineQueries: boolean, createdAt: string, updatedAt: string, lastSyncAt: string | null, configStatus: { __typename?: 'TelegramBotConfigStatus', hasToken: boolean, hasWebhook: boolean, isRegistered: boolean } | null } | null };

export type AdminCreateTelegramBotMutationVariables = Exact<{
  input: CreateTelegramBotInput;
}>;


export type AdminCreateTelegramBotMutation = { __typename?: 'Mutation', adminCreateTelegramBot: { __typename?: 'AdminTelegramBotModel', id: string, botName: string, username: string, displayName: string, description: string | null, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, avatarUrl: string | null, createdAt: string, updatedAt: string } };

export type AdminUpdateTelegramBotMutationVariables = Exact<{
  botId: Scalars['ID']['input'];
  input: UpdateTelegramBotInput;
}>;


export type AdminUpdateTelegramBotMutation = { __typename?: 'Mutation', adminUpdateTelegramBot: { __typename?: 'AdminTelegramBotModel', id: string, botName: string, username: string, displayName: string, description: string | null, isActive: boolean, isPrimary: boolean, webhookUrl: string | null, avatarUrl: string | null, updatedAt: string } };

export type AdminDeleteTelegramBotMutationVariables = Exact<{
  botId: Scalars['ID']['input'];
}>;


export type AdminDeleteTelegramBotMutation = { __typename?: 'Mutation', adminDeleteTelegramBot: boolean };

export type AdminSyncTelegramBotMutationVariables = Exact<{
  botId: Scalars['ID']['input'];
}>;


export type AdminSyncTelegramBotMutation = { __typename?: 'Mutation', adminSyncTelegramBot: { __typename?: 'AdminTelegramBotModel', id: string, username: string, displayName: string, firstName: string | null, avatarUrl: string | null, canJoinGroups: boolean, canReadMessages: boolean, supportsInlineQueries: boolean, lastSyncAt: string | null } };

export type AdminTestTelegramBotMutationVariables = Exact<{
  input: TestBotTokenInput;
}>;


export type AdminTestTelegramBotMutation = { __typename?: 'Mutation', adminTestTelegramBot: { __typename?: 'TestBotResult', valid: boolean, error: string | null, botInfo: { __typename?: 'BotInfoModel', id: number, username: string, firstName: string, canJoinGroups: boolean, canReadMessages: boolean, supportsInlineQueries: boolean } | null } };

export type AdminSetTelegramWebhookMutationVariables = Exact<{
  input: SetWebhookInput;
}>;


export type AdminSetTelegramWebhookMutation = { __typename?: 'Mutation', adminSetTelegramWebhook: boolean };

export type AdminDeleteTelegramWebhookMutationVariables = Exact<{
  botId: Scalars['ID']['input'];
}>;


export type AdminDeleteTelegramWebhookMutation = { __typename?: 'Mutation', adminDeleteTelegramWebhook: boolean };

export type AdminReloadTelegramBotMutationVariables = Exact<{
  botId: Scalars['ID']['input'];
}>;


export type AdminReloadTelegramBotMutation = { __typename?: 'Mutation', adminReloadTelegramBot: boolean };

export type AdminTelegramBotWebhookInfoQueryVariables = Exact<{
  botId: Scalars['ID']['input'];
}>;


export type AdminTelegramBotWebhookInfoQuery = { __typename?: 'Query', adminTelegramBotWebhookInfo: { __typename?: 'WebhookInfoModel', url: string, hasCustomCertificate: boolean, pendingUpdateCount: number, lastErrorDate: number | null, lastErrorMessage: string | null, maxConnections: number | null, allowedUpdates: Array<string> | null } };

export type AdminUserFieldsFragment = { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, telegramChatId: string | null, emailVerified: boolean, avatarUrl: string | null, businessRole: BusinessRole | null, hasCompletedOnboarding: boolean, createdAt: string, updatedAt: string, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null };

export type AdminUserDetailsFieldsFragment = { __typename?: 'AdminUserDetails', user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, telegramChatId: string | null, emailVerified: boolean, avatarUrl: string | null, businessRole: BusinessRole | null, hasCompletedOnboarding: boolean, createdAt: string, updatedAt: string, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null }, _count: { __typename?: 'AdminUserCounts', ownedTeams: number, payments: number } };

export type AdminUsersQueryVariables = Exact<{
  filters: InputMaybe<AdminUserFilters>;
  pagination: PaginationInput;
}>;


export type AdminUsersQuery = { __typename?: 'Query', adminUsers: { __typename?: 'AdminUsersConnection', totalCount: number, nodes: Array<{ __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, telegramChatId: string | null, emailVerified: boolean, avatarUrl: string | null, businessRole: BusinessRole | null, hasCompletedOnboarding: boolean, createdAt: string, updatedAt: string, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number } } };

export type AdminUserQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminUserQuery = { __typename?: 'Query', adminUser: { __typename?: 'AdminUserDetails', user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, telegramChatId: string | null, emailVerified: boolean, avatarUrl: string | null, businessRole: BusinessRole | null, hasCompletedOnboarding: boolean, createdAt: string, updatedAt: string, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null }, _count: { __typename?: 'AdminUserCounts', ownedTeams: number, payments: number } } };

export type AdminUpdateUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: AdminUpdateUserInput;
}>;


export type AdminUpdateUserMutation = { __typename?: 'Mutation', adminUpdateUser: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, telegramChatId: string | null, emailVerified: boolean, avatarUrl: string | null, businessRole: BusinessRole | null, hasCompletedOnboarding: boolean, createdAt: string, updatedAt: string, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null } };

export type AdminVerifyUserEmailMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminVerifyUserEmailMutation = { __typename?: 'Mutation', adminVerifyUserEmail: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, telegramChatId: string | null, emailVerified: boolean, avatarUrl: string | null, businessRole: BusinessRole | null, hasCompletedOnboarding: boolean, createdAt: string, updatedAt: string, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null } };

export type AdminDeleteUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminDeleteUserMutation = { __typename?: 'Mutation', adminDeleteUser: boolean };

export type MemberAnalyticsFieldsFragment = { __typename?: 'MemberAnalytics', memberId: string, memberName: string, memberEmail: string, avatarUrl: string | null, role: string, position: string | null, salaryType: string, salaryAmount: number | null, projectsCount: number, totalHoursWorked: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number, joinedAt: string };

export type ProjectAnalyticsFieldsFragment = { __typename?: 'ProjectAnalytics', projectId: string, projectName: string, budget: number | null, totalHoursWorked: number, totalPayouts: number, membersCount: number, status: string, startDate: string | null, endDate: string | null };

export type PersonnelAnalyticsFieldsFragment = { __typename?: 'PersonnelAnalytics', teamId: string, teamName: string, totalMembers: number, totalHoursWorked: number, totalPayouts: number, averageHoursPerMember: number, averagePayoutPerMember: number, generatedAt: string, members: Array<{ __typename?: 'MemberAnalytics', memberId: string, memberName: string, memberEmail: string, avatarUrl: string | null, role: string, position: string | null, salaryType: string, salaryAmount: number | null, projectsCount: number, totalHoursWorked: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number, joinedAt: string }>, projects: Array<{ __typename?: 'ProjectAnalytics', projectId: string, projectName: string, budget: number | null, totalHoursWorked: number, totalPayouts: number, membersCount: number, status: string, startDate: string | null, endDate: string | null }> };

export type PersonnelAnalyticsQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type PersonnelAnalyticsQuery = { __typename?: 'Query', personnelAnalytics: { __typename?: 'PersonnelAnalytics', teamId: string, teamName: string, totalMembers: number, totalHoursWorked: number, totalPayouts: number, averageHoursPerMember: number, averagePayoutPerMember: number, generatedAt: string, members: Array<{ __typename?: 'MemberAnalytics', memberId: string, memberName: string, memberEmail: string, avatarUrl: string | null, role: string, position: string | null, salaryType: string, salaryAmount: number | null, projectsCount: number, totalHoursWorked: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number, joinedAt: string }>, projects: Array<{ __typename?: 'ProjectAnalytics', projectId: string, projectName: string, budget: number | null, totalHoursWorked: number, totalPayouts: number, membersCount: number, status: string, startDate: string | null, endDate: string | null }> } };

export type ExportPersonnelAnalyticsQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type ExportPersonnelAnalyticsQuery = { __typename?: 'Query', exportPersonnelAnalytics: string };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', message: string | null, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, businessRole: BusinessRole | null, businessRoleAssignedAt: string | null } | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', requiresTwoFactor: boolean | null, twoFactorToken: string | null, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, businessRole: BusinessRole | null, businessRoleAssignedAt: string | null } | null } };

export type VerifyTwoFactorLoginMutationVariables = Exact<{
  twoFactorToken: Scalars['String']['input'];
  code: Scalars['String']['input'];
}>;


export type VerifyTwoFactorLoginMutation = { __typename?: 'Mutation', verifyTwoFactorLogin: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, businessRole: BusinessRole | null, businessRoleAssignedAt: string | null } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshSessionMutation = { __typename?: 'Mutation', refreshSession: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, businessRole: BusinessRole | null, businessRoleAssignedAt: string | null } | null } | null };

export type VerifyEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: boolean };

export type ResendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendVerificationEmailMutation = { __typename?: 'Mutation', resendVerificationEmail: boolean };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: boolean };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: boolean };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: boolean };

export type InitiateEmailChangeMutationVariables = Exact<{
  input: ChangeEmailInput;
}>;


export type InitiateEmailChangeMutation = { __typename?: 'Mutation', initiateEmailChange: { __typename?: 'ChangeEmailResult', success: boolean, pendingVerification: boolean, message: string } };

export type VerifyEmailChangeMutationVariables = Exact<{
  input: VerifyEmailChangeInput;
}>;


export type VerifyEmailChangeMutation = { __typename?: 'Mutation', verifyEmailChange: boolean };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null } };

export type UpdateNotificationSettingsMutationVariables = Exact<{
  input: UpdateNotificationSettingsInput;
}>;


export type UpdateNotificationSettingsMutation = { __typename?: 'Mutation', updateNotificationSettings: { __typename?: 'NotificationSettings', id: string, appPush: boolean, appEmail: boolean, appSms: boolean, marketingPush: boolean, marketingEmail: boolean, notifyProjectCreated: boolean, notifyProjectCompleted: boolean, notifyExpenseAdded: boolean, notifyPayoutCalculated: boolean, notifyPayoutPaid: boolean, notifyMemberInvited: boolean, notifyMemberJoined: boolean, notifyMemberRemoved: boolean, notifyTaskAssigned: boolean, notifyTaskCompleted: boolean, notifyPhotoReportCreated: boolean, notifySubscriptionExpiring: boolean, emailFrequency: NotificationFrequency, pushFrequency: NotificationFrequency, quietHoursEnabled: boolean, quietHoursStart: string | null, quietHoursEnd: string | null } };

export type RevokeSessionMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;


export type RevokeSessionMutation = { __typename?: 'Mutation', revokeSession: boolean };

export type RevokeAllSessionsMutationVariables = Exact<{ [key: string]: never; }>;


export type RevokeAllSessionsMutation = { __typename?: 'Mutation', revokeAllSessions: boolean };

export type RevokeAllSessionsIncludingCurrentMutationVariables = Exact<{ [key: string]: never; }>;


export type RevokeAllSessionsIncludingCurrentMutation = { __typename?: 'Mutation', revokeAllSessionsIncludingCurrent: boolean };

export type InitTelegramAuthMutationVariables = Exact<{ [key: string]: never; }>;


export type InitTelegramAuthMutation = { __typename?: 'Mutation', initTelegramAuth: { __typename?: 'TelegramAuthPayload', token: string, deepLink: string, expiresAt: string } };

export type CheckTelegramAuthMutationVariables = Exact<{
  input: CheckTelegramAuthInput;
}>;


export type CheckTelegramAuthMutation = { __typename?: 'Mutation', checkTelegramAuth: { __typename?: 'TelegramAuthStatusPayload', completed: boolean, sessionToken: string | null, refreshToken: string | null, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, businessRole: BusinessRole | null, businessRoleAssignedAt: string | null } | null } };

export type LinkTelegramAccountMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type LinkTelegramAccountMutation = { __typename?: 'Mutation', linkTelegramAccount: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, avatarUrl: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, businessRole: BusinessRole | null, businessRoleAssignedAt: string | null, createdAt: string, notificationSettings: { __typename?: 'NotificationSettings', id: string, appPush: boolean, appEmail: boolean, appSms: boolean, marketingPush: boolean, marketingEmail: boolean, notifyProjectCreated: boolean, notifyProjectCompleted: boolean, notifyExpenseAdded: boolean, notifyPayoutCalculated: boolean, notifyPayoutPaid: boolean, notifyMemberInvited: boolean, notifyMemberJoined: boolean, notifyMemberRemoved: boolean, notifyTaskAssigned: boolean, notifyTaskCompleted: boolean, notifyPhotoReportCreated: boolean, notifySubscriptionExpiring: boolean, emailFrequency: NotificationFrequency, pushFrequency: NotificationFrequency, quietHoursEnabled: boolean, quietHoursStart: string | null, quietHoursEnd: string | null } | null, adminRole: { __typename?: 'AdminRoleDetail', id: string, role: AdminRoleType, permissions: Array<string> } | null } | null };

export type SessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type SessionsQuery = { __typename?: 'Query', sessions: Array<{ __typename?: 'Session', id: string, userAgent: string | null, ip: string | null, city: string | null, country: string | null, device: string | null, browser: string | null, os: string | null, createdAt: string, current: boolean }> };

export type LoginHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type LoginHistoryQuery = { __typename?: 'Query', loginHistory: Array<{ __typename?: 'LoginHistory', id: string, ip: string, userAgent: string | null, city: string | null, country: string | null, device: string | null, browser: string | null, os: string | null, createdAt: string }> };

export type UploadAvatarMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
}>;


export type UploadAvatarMutation = { __typename?: 'Mutation', uploadAvatar: { __typename?: 'User', id: string, avatarUrl: string | null, fullName: string, email: string } };

export type DeleteAvatarMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAvatarMutation = { __typename?: 'Mutation', deleteAvatar: { __typename?: 'User', id: string, avatarUrl: string | null, fullName: string, email: string } };

export type ExpenseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ExpenseQuery = { __typename?: 'Query', expense: { __typename?: 'Expense', id: string, projectId: string, amount: number, category: string, photos: Array<string>, comment: string | null, paidByClient: boolean, createdById: string, createdAt: string, updatedAt: string } };

export type ExpensesByProjectQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ExpensesByProjectQuery = { __typename?: 'Query', expensesByProject: Array<{ __typename?: 'Expense', id: string, projectId: string, amount: number, category: string, photos: Array<string>, comment: string | null, paidByClient: boolean, createdById: string, createdAt: string, updatedAt: string }> };

export type ExpensesByCategoryQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  category: Scalars['String']['input'];
}>;


export type ExpensesByCategoryQuery = { __typename?: 'Query', expensesByCategory: Array<{ __typename?: 'Expense', id: string, projectId: string, amount: number, category: string, photos: Array<string>, comment: string | null, paidByClient: boolean, createdById: string, createdAt: string, updatedAt: string }> };

export type CreateExpenseMutationVariables = Exact<{
  input: CreateExpenseInput;
}>;


export type CreateExpenseMutation = { __typename?: 'Mutation', createExpense: { __typename?: 'Expense', id: string, projectId: string, amount: number, category: string, photos: Array<string>, comment: string | null, paidByClient: boolean, createdById: string, createdAt: string, updatedAt: string } };

export type UpdateExpenseMutationVariables = Exact<{
  input: UpdateExpenseInput;
}>;


export type UpdateExpenseMutation = { __typename?: 'Mutation', updateExpense: { __typename?: 'Expense', id: string, projectId: string, amount: number, category: string, photos: Array<string>, comment: string | null, paidByClient: boolean, updatedAt: string } };

export type DeleteExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteExpenseMutation = { __typename?: 'Mutation', deleteExpense: { __typename?: 'Expense', id: string } };

export type ProjectPayoutFieldsFragment = { __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } };

export type MemberPayoutDetailFieldsFragment = { __typename?: 'MemberPayoutDetail', memberId: string, memberName: string, salaryType: string, salaryAmount: number | null, calculatedPayout: number, status: string };

export type PayoutSummaryFieldsFragment = { __typename?: 'PayoutSummary', projectId: string, projectName: string, budget: number, totalExpenses: number, netProfit: number, totalPayouts: number, ownerProfit: number, members: Array<{ __typename?: 'MemberPayoutDetail', memberId: string, memberName: string, salaryType: string, salaryAmount: number | null, calculatedPayout: number, status: string }> };

export type PayoutSummaryQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type PayoutSummaryQuery = { __typename?: 'Query', payoutSummary: { __typename?: 'PayoutSummary', projectId: string, projectName: string, budget: number, totalExpenses: number, netProfit: number, totalPayouts: number, ownerProfit: number, members: Array<{ __typename?: 'MemberPayoutDetail', memberId: string, memberName: string, salaryType: string, salaryAmount: number | null, calculatedPayout: number, status: string }> } };

export type ProjectPayoutsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectPayoutsQuery = { __typename?: 'Query', projectPayouts: Array<{ __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } }> };

export type MemberPayoutsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type MemberPayoutsQuery = { __typename?: 'Query', memberPayouts: Array<{ __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } }> };

export type UpdateMemberSalaryMutationVariables = Exact<{
  input: UpdateMemberSalaryInput;
}>;


export type UpdateMemberSalaryMutation = { __typename?: 'Mutation', updateMemberSalary: { __typename?: 'TeamMember', id: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } };

export type CreatePayoutMutationVariables = Exact<{
  input: CreatePayoutInput;
}>;


export type CreatePayoutMutation = { __typename?: 'Mutation', createPayout: { __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } } };

export type CloseProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type CloseProjectMutation = { __typename?: 'Mutation', closeProject: { __typename?: 'Project', id: string, status: ProjectStatus, closedAt: string | null, finalProfit: number | null } };

export type UpdatePayoutPaymentMutationVariables = Exact<{
  input: UpdatePayoutPaymentInput;
}>;


export type UpdatePayoutPaymentMutation = { __typename?: 'Mutation', updatePayoutPayment: { __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } } };

export type PhotoReportFieldsFragment = { __typename?: 'PhotoReport', id: string, slug: string, projectId: string, title: string, description: string | null, coverPhotoUrl: string | null, isPublic: boolean, viewCount: number, createdById: string, createdAt: string, updatedAt: string, publishedAt: string | null };

export type PublicPhotoReportFieldsFragment = { __typename?: 'PublicPhotoReport', slug: string, title: string, description: string | null, coverPhotoUrl: string | null, viewCount: number, createdAt: string, publishedAt: string | null, project: { __typename?: 'PublicProject', name: string, address: string | null } };

export type ReportPhotoFieldsFragment = { __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string };

export type CreatePhotoReportMutationVariables = Exact<{
  input: CreatePhotoReportInput;
}>;


export type CreatePhotoReportMutation = { __typename?: 'Mutation', createPhotoReport: { __typename?: 'PhotoReport', id: string, slug: string, projectId: string, title: string, description: string | null, coverPhotoUrl: string | null, isPublic: boolean, viewCount: number, createdById: string, createdAt: string, updatedAt: string, publishedAt: string | null, photos: Array<{ __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string }> | null } };

export type UpdatePhotoReportMutationVariables = Exact<{
  input: UpdatePhotoReportInput;
}>;


export type UpdatePhotoReportMutation = { __typename?: 'Mutation', updatePhotoReport: { __typename?: 'PhotoReport', id: string, slug: string, projectId: string, title: string, description: string | null, coverPhotoUrl: string | null, isPublic: boolean, viewCount: number, createdById: string, createdAt: string, updatedAt: string, publishedAt: string | null, photos: Array<{ __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string }> | null } };

export type DeletePhotoReportMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeletePhotoReportMutation = { __typename?: 'Mutation', deletePhotoReport: boolean };

export type UploadPhotoToReportMutationVariables = Exact<{
  input: UploadPhotoInput;
}>;


export type UploadPhotoToReportMutation = { __typename?: 'Mutation', uploadPhotoToReport: { __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string } };

export type AddPhotoToReportMutationVariables = Exact<{
  input: AddPhotoInput;
}>;


export type AddPhotoToReportMutation = { __typename?: 'Mutation', addPhotoToReport: { __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string } };

export type DeletePhotoFromReportMutationVariables = Exact<{
  photoId: Scalars['String']['input'];
}>;


export type DeletePhotoFromReportMutation = { __typename?: 'Mutation', deletePhotoFromReport: boolean };

export type ReorderReportPhotosMutationVariables = Exact<{
  reportId: Scalars['String']['input'];
  photoIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ReorderReportPhotosMutation = { __typename?: 'Mutation', reorderReportPhotos: boolean };

export type UpdatePhotoCaptionMutationVariables = Exact<{
  photoId: Scalars['String']['input'];
  caption: Scalars['String']['input'];
}>;


export type UpdatePhotoCaptionMutation = { __typename?: 'Mutation', updatePhotoCaption: { __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string } };

export type ProjectPhotoReportsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
}>;


export type ProjectPhotoReportsQuery = { __typename?: 'Query', projectPhotoReports: Array<{ __typename?: 'PhotoReport', id: string, slug: string, projectId: string, title: string, description: string | null, coverPhotoUrl: string | null, isPublic: boolean, viewCount: number, createdById: string, createdAt: string, updatedAt: string, publishedAt: string | null, photos: Array<{ __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string }> | null }> };

export type PhotoReportQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type PhotoReportQuery = { __typename?: 'Query', photoReport: { __typename?: 'PhotoReport', id: string, slug: string, projectId: string, title: string, description: string | null, coverPhotoUrl: string | null, isPublic: boolean, viewCount: number, createdById: string, createdAt: string, updatedAt: string, publishedAt: string | null, photos: Array<{ __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string }> | null } };

export type PublicPhotoReportQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type PublicPhotoReportQuery = { __typename?: 'Query', publicPhotoReport: { __typename?: 'PublicPhotoReport', slug: string, title: string, description: string | null, coverPhotoUrl: string | null, viewCount: number, createdAt: string, publishedAt: string | null, photos: Array<{ __typename?: 'ReportPhoto', id: string, photoUrl: string, thumbnailUrl: string | null, caption: string | null, orderIndex: number, width: number | null, height: number | null, fileSize: number | null, createdAt: string }>, project: { __typename?: 'PublicProject', name: string, address: string | null } } };

export type ProjectQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProjectQuery = { __typename?: 'Query', project: { __typename?: 'Project', id: string, teamId: string, name: string, address: string | null, description: string | null, budget: number | null, clientPhone: string | null, startDate: string | null, endDate: string | null, photoUrl: string | null, progress: number, notes: string | null, status: ProjectStatus, createdById: string, createdAt: string, updatedAt: string, archivedAt: string | null, completedAt: string | null } };

export type ProjectsByTeamQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
  filter: InputMaybe<ProjectFilterInput>;
}>;


export type ProjectsByTeamQuery = { __typename?: 'Query', projectsByTeam: Array<{ __typename?: 'Project', id: string, teamId: string, name: string, address: string | null, budget: number | null, progress: number, status: ProjectStatus, startDate: string | null, endDate: string | null, photoUrl: string | null, createdAt: string }> };

export type ProjectStatsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectStatsQuery = { __typename?: 'Query', projectStats: { __typename?: 'ProjectStats', totalExpenses: number, profit: number, expenseCount: number, taskCount: number, reportCount: number } };

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'Project', id: string, teamId: string, name: string, address: string | null, description: string | null, budget: number | null, clientPhone: string | null, startDate: string | null, endDate: string | null, notes: string | null, progress: number, status: ProjectStatus, createdAt: string } };

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'Project', id: string, teamId: string, name: string, address: string | null, description: string | null, budget: number | null, clientPhone: string | null, startDate: string | null, endDate: string | null, photoUrl: string | null, progress: number, notes: string | null, status: ProjectStatus, updatedAt: string } };

export type ArchiveProjectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ArchiveProjectMutation = { __typename?: 'Mutation', archiveProject: { __typename?: 'Project', id: string, status: ProjectStatus, archivedAt: string | null } };

export type RestoreProjectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RestoreProjectMutation = { __typename?: 'Mutation', restoreProject: { __typename?: 'Project', id: string, status: ProjectStatus, archivedAt: string | null } };

export type UpdateProjectProgressMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  progress: Scalars['Int']['input'];
}>;


export type UpdateProjectProgressMutation = { __typename?: 'Mutation', updateProjectProgress: { __typename?: 'Project', id: string, progress: number, status: ProjectStatus, completedAt: string | null } };

export type SubscriptionFieldsFragment = { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } };

export type PlanLimitsFieldsFragment = { __typename?: 'PlanLimits', id: string, slug: string, name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> };

export type PaymentFieldsFragment = { __typename?: 'Payment', id: string, subscriptionId: string, teamId: string, amount: number, currency: string, status: PaymentStatus, yookassaPaymentId: string, paymentMethod: string | null, description: string | null, failureReason: string | null, paidAt: string | null, refundedAt: string | null, createdAt: string, updatedAt: string };

export type PlanPriceFieldsFragment = { __typename?: 'AdminPlanPriceModel', id: string, planId: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number, createdAt: string, updatedAt: string };

export type PlanFeatureFieldsFragment = { __typename?: 'AdminPlanFeatureModel', id: string, planId: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number };

export type AdminPlanFieldsFragment = { __typename?: 'AdminPlanModel', id: string, slug: string, name: string, description: string | null, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isActive: boolean, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, planId: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number, createdAt: string, updatedAt: string }>, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, planId: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }> };

export type MySubscriptionQueryVariables = Exact<{ [key: string]: never; }>;


export type MySubscriptionQuery = { __typename?: 'Query', mySubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } | null };

export type MySubscriptionHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type MySubscriptionHistoryQuery = { __typename?: 'Query', mySubscriptionHistory: Array<{ __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } }> };

export type GetSubscriptionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetSubscriptionQuery = { __typename?: 'Query', subscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type CurrentPlanLimitsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type CurrentPlanLimitsQuery = { __typename?: 'Query', currentPlanLimits: { __typename?: 'PlanLimits', id: string, slug: string, name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } };

export type UsageStatsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type UsageStatsQuery = { __typename?: 'Query', usageStats: { __typename?: 'UsageStats', activeProjects: number, totalMembers: number, storageUsedGB: number, limits: { __typename?: 'PlanLimits', id: string, slug: string, name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type CanAddProjectQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type CanAddProjectQuery = { __typename?: 'Query', canAddProject: boolean };

export type PaymentsBySubscriptionQueryVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type PaymentsBySubscriptionQuery = { __typename?: 'Query', paymentsBySubscription: Array<{ __typename?: 'Payment', id: string, subscriptionId: string, teamId: string, amount: number, currency: string, status: PaymentStatus, yookassaPaymentId: string, paymentMethod: string | null, description: string | null, failureReason: string | null, paidAt: string | null, refundedAt: string | null, createdAt: string, updatedAt: string }> };

export type AvailablePlansQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailablePlansQuery = { __typename?: 'Query', availablePlans: Array<{ __typename?: 'AdminPlanModel', id: string, slug: string, name: string, description: string | null, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isActive: boolean, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, planId: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number, createdAt: string, updatedAt: string }>, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, planId: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }> }> };

export type AvailablePlansDetailedQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailablePlansDetailedQuery = { __typename?: 'Query', availablePlansDetailed: Array<{ __typename?: 'AdminPlanModel', id: string, slug: string, name: string, description: string | null, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isActive: boolean, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, planId: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number, createdAt: string, updatedAt: string }>, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, planId: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }> }> };

export type PlanBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type PlanBySlugQuery = { __typename?: 'Query', planBySlug: { __typename?: 'AdminPlanModel', id: string, slug: string, name: string, description: string | null, maxActiveProjects: number | null, maxMembers: number, storageGB: number, isActive: boolean, isPopular: boolean, sortOrder: number, isEarlyBird: boolean, trialDays: number | null, subscriptionsCount: number | null, createdAt: string, updatedAt: string, prices: Array<{ __typename?: 'AdminPlanPriceModel', id: string, planId: string, currency: string, price: number, earlyBirdPrice: number, billingCycleDays: number, createdAt: string, updatedAt: string }>, features: Array<{ __typename?: 'AdminPlanFeatureModel', id: string, planId: string, name: string, description: string | null, isIncluded: boolean, sortOrder: number }> } | null };

export type EarlyBirdStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type EarlyBirdStatsQuery = { __typename?: 'Query', earlyBirdStats: { __typename?: 'EarlyBirdStatsModel', used: number, limit: number, remaining: number, isAvailable: boolean, totalTeams: number } };

export type CreateSubscriptionMutationVariables = Exact<{
  input: CreateSubscriptionInput;
}>;


export type CreateSubscriptionMutation = { __typename?: 'Mutation', createSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type ChangePlanMutationVariables = Exact<{
  input: ChangePlanInput;
}>;


export type ChangePlanMutation = { __typename?: 'Mutation', changePlan: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type CancelSubscriptionMutationVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type CancelSubscriptionMutation = { __typename?: 'Mutation', cancelSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type ReactivateSubscriptionMutationVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type ReactivateSubscriptionMutation = { __typename?: 'Mutation', reactivateSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, planId: string | null, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, planRef: { __typename?: 'AdminPlanModel', id: string, name: string, trialDays: number | null } | null, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type PaymentProviderFieldsFragment = { __typename?: 'PaymentProviderModel', id: string, type: PaymentProviderType, name: string, isActive: boolean, isPrimary: boolean };

export type AvailablePaymentProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailablePaymentProvidersQuery = { __typename?: 'Query', availablePaymentProviders: Array<{ __typename?: 'PaymentProviderModel', id: string, type: PaymentProviderType, name: string, isActive: boolean, isPrimary: boolean }> };

export type InitializePaymentMutationVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
  providerType: InputMaybe<Scalars['String']['input']>;
  targetPlanId: InputMaybe<Scalars['String']['input']>;
  targetPlan: InputMaybe<Scalars['String']['input']>;
}>;


export type InitializePaymentMutation = { __typename?: 'Mutation', initializePayment: { __typename?: 'PaymentUrl', url: string, paymentId: string } };

export type ConfirmMockPaymentMutationVariables = Exact<{
  paymentId: Scalars['String']['input'];
}>;


export type ConfirmMockPaymentMutation = { __typename?: 'Mutation', confirmMockPayment: boolean };

export type TaskFieldsFragment = { __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null };

export type TaskQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TaskQuery = { __typename?: 'Query', task: { __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } };

export type ProjectTasksQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectTasksQuery = { __typename?: 'Query', projectTasks: { __typename?: 'TasksByStatus', todo: Array<{ __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null }>, inProgress: Array<{ __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null }>, done: Array<{ __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null }> } };

export type MemberTasksQueryVariables = Exact<{
  assigneeId: Scalars['ID']['input'];
}>;


export type MemberTasksQuery = { __typename?: 'Query', memberTasks: Array<{ __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null }> };

export type MyTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type MyTasksQuery = { __typename?: 'Query', myTasks: Array<{ __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null }> };

export type CreateTaskMutationVariables = Exact<{
  input: CreateTaskInput;
}>;


export type CreateTaskMutation = { __typename?: 'Mutation', createTask: { __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } };

export type UpdateTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
}>;


export type UpdateTaskMutation = { __typename?: 'Mutation', updateTask: { __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } };

export type MoveTaskMutationVariables = Exact<{
  input: MoveTaskInput;
}>;


export type MoveTaskMutation = { __typename?: 'Mutation', moveTask: { __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } };

export type DeleteTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTaskMutation = { __typename?: 'Mutation', deleteTask: { __typename?: 'Task', id: string, projectId: string, title: string, description: string | null, status: TaskStatus, assigneeId: string | null, priority: TaskPriority, dueDate: string | null, orderIndex: number, checklist: any | null, createdById: string, createdAt: string, updatedAt: string, completedAt: string | null, assignee: { __typename?: 'TeamMember', id: string, user: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } | null, createdBy: { __typename?: 'User', id: string, fullName: string, avatarUrl: string | null } | null } };

export type MyTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyTeamsQuery = { __typename?: 'Query', myTeams: Array<{ __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, ownerId: string, createdAt: string, updatedAt: string, subscription: { __typename?: 'Subscription', plan: SubscriptionPlan } | null }> };

export type TeamQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TeamQuery = { __typename?: 'Query', team: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, ownerId: string, createdAt: string, updatedAt: string } | null };

export type TeamMembersQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type TeamMembersQuery = { __typename?: 'Query', teamMembers: Array<{ __typename?: 'TeamMember', id: string, teamId: string, userId: string, role: TeamRole, position: string | null, salaryType: string, salaryAmount: number | null, joinedAt: string, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, avatarUrl: string | null } | null, stats: { __typename?: 'TeamMemberStats', projectCount: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number } | null }> };

export type TeamStatsQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type TeamStatsQuery = { __typename?: 'Query', teamStats: { __typename?: 'TeamStats', totalExpenses: number, totalBudget: number, profit: number, activeProjectsCount: number, membersCount: number, totalHours: number } };

export type CompleteOnboardingMutationVariables = Exact<{
  input: CompleteOnboardingInput;
}>;


export type CompleteOnboardingMutation = { __typename?: 'Mutation', completeOnboarding: { __typename?: 'OnboardingResult', success: boolean, message: string, team: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, createdAt: string }, project: { __typename?: 'Project', id: string, name: string, address: string | null, description: string | null, status: ProjectStatus, progress: number, createdAt: string } } };

export type UpdateTeamMutationVariables = Exact<{
  input: UpdateTeamInput;
}>;


export type UpdateTeamMutation = { __typename?: 'Mutation', updateTeam: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, updatedAt: string } };

export type RemoveTeamMemberMutationVariables = Exact<{
  teamId: Scalars['ID']['input'];
  memberId: Scalars['ID']['input'];
}>;


export type RemoveTeamMemberMutation = { __typename?: 'Mutation', removeTeamMember: boolean };

export type CreateInviteLinkMutationVariables = Exact<{
  teamId: Scalars['ID']['input'];
  expiresInDays: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateInviteLinkMutation = { __typename?: 'Mutation', createInviteLink: { __typename?: 'InviteCode', id: string, teamId: string, code: string, expiresAt: string, usedBy: string | null, usedAt: string | null, createdAt: string, isActive: boolean, inviteUrl: string } };

export type SendInviteByEmailMutationVariables = Exact<{
  input: SendInviteByEmailInput;
}>;


export type SendInviteByEmailMutation = { __typename?: 'Mutation', sendInviteByEmail: { __typename?: 'SendInviteResult', emailSent: boolean, inviteCode: { __typename?: 'InviteCode', id: string, teamId: string, code: string, expiresAt: string, usedBy: string | null, usedAt: string | null, createdAt: string, isActive: boolean, inviteUrl: string } } };

export type JoinTeamByInviteMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type JoinTeamByInviteMutation = { __typename?: 'Mutation', joinTeamByInvite: { __typename?: 'TeamMember', id: string, teamId: string, userId: string, role: TeamRole, joinedAt: string, team: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null } | null } };

export type TeamInvitesQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type TeamInvitesQuery = { __typename?: 'Query', teamInvites: Array<{ __typename?: 'InviteCode', id: string, teamId: string, code: string, expiresAt: string, usedBy: string | null, usedAt: string | null, createdAt: string, isActive: boolean, inviteUrl: string }> };

export type DeleteInviteCodeMutationVariables = Exact<{
  codeId: Scalars['ID']['input'];
}>;


export type DeleteInviteCodeMutation = { __typename?: 'Mutation', deleteInviteCode: boolean };

export type UpdateMemberPositionMutationVariables = Exact<{
  input: UpdateMemberPositionInput;
}>;


export type UpdateMemberPositionMutation = { __typename?: 'Mutation', updateMemberPosition: { __typename?: 'TeamMember', id: string, teamId: string, userId: string, role: TeamRole, position: string | null, joinedAt: string } };

export type MemberSalaryHistoryQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type MemberSalaryHistoryQuery = { __typename?: 'Query', memberSalaryHistory: Array<{ __typename?: 'TeamMemberSalaryHistory', id: string, memberId: string, previousType: string | null, previousAmount: number | null, newType: string, newAmount: number | null, reason: string | null, changedByUserId: string, createdAt: string, changedBy: { __typename?: 'User', id: string, fullName: string, email: string } | null }> };

export type DisconnectTelegramMutationVariables = Exact<{ [key: string]: never; }>;


export type DisconnectTelegramMutation = { __typename?: 'Mutation', disconnectTelegram: { __typename?: 'User', id: string, telegramChatId: string | null, telegramUsername: string | null, telegramPhotoUrl: string | null } };

export type TwoFactorStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type TwoFactorStatusQuery = { __typename?: 'Query', twoFactorStatus: { __typename?: 'TwoFactorStatus', enabled: boolean, backupCodesRemaining: number } };

export type Generate2FaSecretMutationVariables = Exact<{ [key: string]: never; }>;


export type Generate2FaSecretMutation = { __typename?: 'Mutation', generate2FASecret: { __typename?: 'TwoFactorSetup', secret: string, qrCodeUrl: string, manualEntryCode: string } };

export type Enable2FaMutationVariables = Exact<{
  input: Enable2FaInput;
}>;


export type Enable2FaMutation = { __typename?: 'Mutation', enable2FA: { __typename?: 'TwoFactorEnableResponse', success: boolean, backupCodes: Array<string> } };

export type Disable2FaMutationVariables = Exact<{
  input: Disable2FaInput;
}>;


export type Disable2FaMutation = { __typename?: 'Mutation', disable2FA: { __typename?: 'TwoFactorDisableResponse', success: boolean } };

export type Regenerate2FaBackupCodesMutationVariables = Exact<{
  input: RegenerateBackupCodesInput;
}>;


export type Regenerate2FaBackupCodesMutation = { __typename?: 'Mutation', regenerate2FABackupCodes: { __typename?: 'BackupCodesResponse', backupCodes: Array<string> } };

export type WorkLogFieldsFragment = { __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null };

export type ProjectWorkLogsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectWorkLogsQuery = { __typename?: 'Query', projectWorkLogs: Array<{ __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null }> };

export type MemberWorkLogsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type MemberWorkLogsQuery = { __typename?: 'Query', memberWorkLogs: Array<{ __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null }> };

export type WorkLogsByDateRangeQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
}>;


export type WorkLogsByDateRangeQuery = { __typename?: 'Query', workLogsByDateRange: Array<{ __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null }> };

export type CreateWorkLogMutationVariables = Exact<{
  input: CreateWorkLogInput;
}>;


export type CreateWorkLogMutation = { __typename?: 'Mutation', createWorkLog: { __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null } };

export type UpdateWorkLogMutationVariables = Exact<{
  input: UpdateWorkLogInput;
}>;


export type UpdateWorkLogMutation = { __typename?: 'Mutation', updateWorkLog: { __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: TeamRole, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null } };

export type DeleteWorkLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWorkLogMutation = { __typename?: 'Mutation', deleteWorkLog: boolean };

export type ExportProjectWorkLogsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ExportProjectWorkLogsQuery = { __typename?: 'Query', exportProjectWorkLogs: string };

export const DashboardStatsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DashboardStatsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DashboardStats"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"verified"}},{"kind":"Field","name":{"kind":"Name","value":"admins"}},{"kind":"Field","name":{"kind":"Name","value":"newThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"growthRate"}},{"kind":"Field","name":{"kind":"Name","value":"byBusinessRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"FOREMAN"}},{"kind":"Field","name":{"kind":"Name","value":"WORKER"}},{"kind":"Field","name":{"kind":"Name","value":"unassigned"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activeLastWeek"}},{"kind":"Field","name":{"kind":"Name","value":"activeLastMonth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"withActiveSubscription"}},{"kind":"Field","name":{"kind":"Name","value":"averageMembers"}},{"kind":"Field","name":{"kind":"Name","value":"newThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"topTeamsByMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"ownerName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"archived"}},{"kind":"Field","name":{"kind":"Name","value":"byTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"trialing"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled"}},{"kind":"Field","name":{"kind":"Name","value":"byPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"LITE"}},{"kind":"Field","name":{"kind":"Name","value":"FOREMAN"}},{"kind":"Field","name":{"kind":"Name","value":"BRIGADE"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"thisMonthRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayment"}},{"kind":"Field","name":{"kind":"Name","value":"topPayingTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalPaid"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"storage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalUsedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"totalUsedGB"}},{"kind":"Field","name":{"kind":"Name","value":"averagePerTeam"}}]}}]}}]} as unknown as DocumentNode<DashboardStatsFieldsFragment, unknown>;
export const ChartDataFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ChartDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChartData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<ChartDataFieldsFragment, unknown>;
export const ActivityLogFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ActivityLogFieldsFragment, unknown>;
export const SystemHealthFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SystemHealthFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SystemHealth"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"database"}},{"kind":"Field","name":{"kind":"Name","value":"storageAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"lastBackup"}}]}}]} as unknown as DocumentNode<SystemHealthFieldsFragment, unknown>;
export const TeamAuditLogFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAuditLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAuditLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"oldValue"}},{"kind":"Field","name":{"kind":"Name","value":"newValue"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}}]}}]} as unknown as DocumentNode<TeamAuditLogFieldsFragment, unknown>;
export const DataRetentionPolicyFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataRetentionPolicyFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataRetentionPolicy"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceType"}},{"kind":"Field","name":{"kind":"Name","value":"retentionDays"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}}]}}]} as unknown as DocumentNode<DataRetentionPolicyFieldsFragment, unknown>;
export const DataExportRequestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataExportRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataExportRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"requestedById"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"requestedByName"}}]}}]} as unknown as DocumentNode<DataExportRequestFieldsFragment, unknown>;
export const AuditStatisticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuditStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuditStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalLogs"}},{"kind":"Field","name":{"kind":"Name","value":"logsLast24h"}},{"kind":"Field","name":{"kind":"Name","value":"logsLast7d"}},{"kind":"Field","name":{"kind":"Name","value":"logsLast30d"}},{"kind":"Field","name":{"kind":"Name","value":"byCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topActions"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueUsers"}}]}}]} as unknown as DocumentNode<AuditStatisticsFieldsFragment, unknown>;
export const ComplianceReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ComplianceReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ComplianceReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalAuditLogs"}},{"kind":"Field","name":{"kind":"Name","value":"activePolicies"}},{"kind":"Field","name":{"kind":"Name","value":"pendingExports"}},{"kind":"Field","name":{"kind":"Name","value":"hasGDPRCompliance"}},{"kind":"Field","name":{"kind":"Name","value":"hasDataRetention"}},{"kind":"Field","name":{"kind":"Name","value":"lastAuditDate"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]} as unknown as DocumentNode<ComplianceReportFieldsFragment, unknown>;
export const TeamAnnouncementFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<TeamAnnouncementFieldsFragment, unknown>;
export const AnnouncementStatisticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AnnouncementStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AnnouncementStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"drafts"}},{"kind":"Field","name":{"kind":"Name","value":"pinned"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"lowPriority"}},{"kind":"Field","name":{"kind":"Name","value":"normalPriority"}},{"kind":"Field","name":{"kind":"Name","value":"highPriority"}},{"kind":"Field","name":{"kind":"Name","value":"urgentPriority"}}]}}]} as unknown as DocumentNode<AnnouncementStatisticsFieldsFragment, unknown>;
export const PageInfoFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]} as unknown as DocumentNode<PageInfoFieldsFragment, unknown>;
export const AdminPaymentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPayment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"}}]}}]} as unknown as DocumentNode<AdminPaymentFieldsFragment, unknown>;
export const CustomRoleFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomRoleFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomRole"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"parentRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}}]}}]} as unknown as DocumentNode<CustomRoleFieldsFragment, unknown>;
export const RoleAssignmentHistoryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleAssignmentHistoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleAssignmentHistory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"previousRole"}},{"kind":"Field","name":{"kind":"Name","value":"newRole"}},{"kind":"Field","name":{"kind":"Name","value":"roleId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedBy"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RoleAssignmentHistoryFieldsFragment, unknown>;
export const PermissionDefinitionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PermissionDefinitionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionDefinition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<PermissionDefinitionFieldsFragment, unknown>;
export const PermissionCategoryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PermissionCategoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionCategory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PermissionDefinitionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PermissionDefinitionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionDefinition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<PermissionCategoryFieldsFragment, unknown>;
export const RoleHierarchyNodeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleHierarchyNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleHierarchyNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"permissionCount"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}}]}}]} as unknown as DocumentNode<RoleHierarchyNodeFieldsFragment, unknown>;
export const RoleStatisticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRoles"}},{"kind":"Field","name":{"kind":"Name","value":"activeRoles"}},{"kind":"Field","name":{"kind":"Name","value":"inactiveRoles"}},{"kind":"Field","name":{"kind":"Name","value":"builtInRoles"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"membersWithCustomRoles"}},{"kind":"Field","name":{"kind":"Name","value":"membersWithDefaultRoles"}}]}}]} as unknown as DocumentNode<RoleStatisticsFieldsFragment, unknown>;
export const AdminSubscriptionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}}]}}]} as unknown as DocumentNode<AdminSubscriptionFieldsFragment, unknown>;
export const TeamKpIsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamKPIsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamKPIs"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberRetention"}},{"kind":"Field","name":{"kind":"Name","value":"projectCompletionRate"}},{"kind":"Field","name":{"kind":"Name","value":"avgProjectDurationDays"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"completedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"archivedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"avgHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}}]} as unknown as DocumentNode<TeamKpIsFieldsFragment, unknown>;
export const TeamGrowthChartFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamGrowthChartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamGrowthChart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"}},{"kind":"Field","name":{"kind":"Name","value":"projectData"}}]}}]} as unknown as DocumentNode<TeamGrowthChartFieldsFragment, unknown>;
export const MemberActivityFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberActivity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"actionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}}]} as unknown as DocumentNode<MemberActivityFieldsFragment, unknown>;
export const RoleCountFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]} as unknown as DocumentNode<RoleCountFieldsFragment, unknown>;
export const PositionCountFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PositionCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]} as unknown as DocumentNode<PositionCountFieldsFragment, unknown>;
export const SalaryDistributionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryDistributionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalaryDistribution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"none"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}}]} as unknown as DocumentNode<SalaryDistributionFieldsFragment, unknown>;
export const TeamCompositionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamCompositionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamComposition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"byPosition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryDistribution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SalaryDistributionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PositionCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryDistributionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalaryDistribution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"none"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}}]} as unknown as DocumentNode<TeamCompositionFieldsFragment, unknown>;
export const ProjectStorageUsageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"filesCount"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}}]} as unknown as DocumentNode<ProjectStorageUsageFieldsFragment, unknown>;
export const TeamStorageUsageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"usedGB"}},{"kind":"Field","name":{"kind":"Name","value":"byProject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectStorageUsageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"filesCount"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}}]} as unknown as DocumentNode<TeamStorageUsageFieldsFragment, unknown>;
export const TeamAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamKPIsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"growthChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamGrowthChartFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"memberActivity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberActivityFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"composition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamCompositionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storageUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamStorageUsageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PositionCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryDistributionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalaryDistribution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"none"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"filesCount"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamKPIsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamKPIs"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberRetention"}},{"kind":"Field","name":{"kind":"Name","value":"projectCompletionRate"}},{"kind":"Field","name":{"kind":"Name","value":"avgProjectDurationDays"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"completedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"archivedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"avgHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamGrowthChartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamGrowthChart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"}},{"kind":"Field","name":{"kind":"Name","value":"projectData"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberActivity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"actionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamCompositionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamComposition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"byPosition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryDistribution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SalaryDistributionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"usedGB"}},{"kind":"Field","name":{"kind":"Name","value":"byProject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectStorageUsageFields"}}]}}]}}]} as unknown as DocumentNode<TeamAnalyticsFieldsFragment, unknown>;
export const TeamMemberExtendedFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamMemberExtendedFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMemberExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleName"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleColor"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"tasksCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}}]}}]} as unknown as DocumentNode<TeamMemberExtendedFieldsFragment, unknown>;
export const MemberActivityEventFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberActivityEventFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberActivityEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"relatedId"}},{"kind":"Field","name":{"kind":"Name","value":"relatedType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"triggeredBy"}},{"kind":"Field","name":{"kind":"Name","value":"triggeredByName"}}]}}]} as unknown as DocumentNode<MemberActivityEventFieldsFragment, unknown>;
export const BulkOperationResultFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BulkOperationResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BulkOperationResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"successCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedCount"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"successIds"}},{"kind":"Field","name":{"kind":"Name","value":"failedIds"}}]}}]} as unknown as DocumentNode<BulkOperationResultFieldsFragment, unknown>;
export const MemberStatisticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"activeMembers"}},{"kind":"Field","name":{"kind":"Name","value":"inactiveMembers"}},{"kind":"Field","name":{"kind":"Name","value":"withCustomRoles"}},{"kind":"Field","name":{"kind":"Name","value":"withFixedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"withPercentageSalary"}},{"kind":"Field","name":{"kind":"Name","value":"withNoSalary"}},{"kind":"Field","name":{"kind":"Name","value":"averageHours"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayroll"}}]}}]} as unknown as DocumentNode<MemberStatisticsFieldsFragment, unknown>;
export const TeamTemplateFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"projectSetup"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<TeamTemplateFieldsFragment, unknown>;
export const TeamMergeLogFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamMergeLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMergeLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"mergedById"}},{"kind":"Field","name":{"kind":"Name","value":"membersMoved"}},{"kind":"Field","name":{"kind":"Name","value":"projectsMoved"}},{"kind":"Field","name":{"kind":"Name","value":"dataSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"mergedByName"}}]}}]} as unknown as DocumentNode<TeamMergeLogFieldsFragment, unknown>;
export const TeamCloneLogFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamCloneLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamCloneLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"clonedById"}},{"kind":"Field","name":{"kind":"Name","value":"clonedSettings"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"clonedByName"}}]}}]} as unknown as DocumentNode<TeamCloneLogFieldsFragment, unknown>;
export const MergePreviewFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergePreviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergePreview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"membersToMove"}},{"kind":"Field","name":{"kind":"Name","value":"projectsToMove"}},{"kind":"Field","name":{"kind":"Name","value":"conflictingMembers"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"canMerge"}}]}}]} as unknown as DocumentNode<MergePreviewFieldsFragment, unknown>;
export const MergeResultFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergeResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"mergeLogId"}},{"kind":"Field","name":{"kind":"Name","value":"membersMoved"}},{"kind":"Field","name":{"kind":"Name","value":"projectsMoved"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}}]}}]} as unknown as DocumentNode<MergeResultFieldsFragment, unknown>;
export const CloneResultFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CloneResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CloneResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"cloneLogId"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]} as unknown as DocumentNode<CloneResultFieldsFragment, unknown>;
export const TeamOperationsStatisticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamOperationsStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamOperationsStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalTemplates"}},{"kind":"Field","name":{"kind":"Name","value":"publicTemplates"}},{"kind":"Field","name":{"kind":"Name","value":"totalMerges"}},{"kind":"Field","name":{"kind":"Name","value":"totalClones"}},{"kind":"Field","name":{"kind":"Name","value":"teamsCreatedFromTemplates"}}]}}]} as unknown as DocumentNode<TeamOperationsStatisticsFieldsFragment, unknown>;
export const AdminTeamFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminTeamFieldsFragment, unknown>;
export const AdminTeamDetailsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamDetailsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminTeamDetails"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTeamFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"}},{"kind":"Field","name":{"kind":"Name","value":"projects"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminTeamDetailsFieldsFragment, unknown>;
export const AdminTeamStatsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamStatsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminTeamStats"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalProjects"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenseAmount"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"completedProjects"}}]}}]} as unknown as DocumentNode<AdminTeamStatsFieldsFragment, unknown>;
export const AdminUserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}}]} as unknown as DocumentNode<AdminUserFieldsFragment, unknown>;
export const AdminUserDetailsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserDetailsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserDetails"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ownedTeams"}},{"kind":"Field","name":{"kind":"Name","value":"payments"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}}]} as unknown as DocumentNode<AdminUserDetailsFieldsFragment, unknown>;
export const MemberAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}}]} as unknown as DocumentNode<MemberAnalyticsFieldsFragment, unknown>;
export const ProjectAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}}]} as unknown as DocumentNode<ProjectAnalyticsFieldsFragment, unknown>;
export const PersonnelAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonnelAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PersonnelAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averageHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberAnalyticsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectAnalyticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}}]} as unknown as DocumentNode<PersonnelAnalyticsFieldsFragment, unknown>;
export const ProjectPayoutFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectPayoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectPayout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"receiptUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectPayoutFieldsFragment, unknown>;
export const MemberPayoutDetailFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberPayoutDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberPayoutDetail"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedPayout"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<MemberPayoutDetailFieldsFragment, unknown>;
export const PayoutSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PayoutSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayoutSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"netProfit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"ownerProfit"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberPayoutDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberPayoutDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberPayoutDetail"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedPayout"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<PayoutSummaryFieldsFragment, unknown>;
export const PhotoReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]} as unknown as DocumentNode<PhotoReportFieldsFragment, unknown>;
export const PublicPhotoReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PublicPhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicPhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<PublicPhotoReportFieldsFragment, unknown>;
export const ReportPhotoFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ReportPhotoFieldsFragment, unknown>;
export const SubscriptionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SubscriptionFieldsFragment, unknown>;
export const PlanLimitsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<PlanLimitsFieldsFragment, unknown>;
export const PaymentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"failureReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"refundedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PaymentFieldsFragment, unknown>;
export const PlanPriceFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanPriceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanPriceModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PlanPriceFieldsFragment, unknown>;
export const PlanFeatureFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFeatureFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanFeatureModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]} as unknown as DocumentNode<PlanFeatureFieldsFragment, unknown>;
export const AdminPlanFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanPriceFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanFeatureFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanPriceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanPriceModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFeatureFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanFeatureModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]} as unknown as DocumentNode<AdminPlanFieldsFragment, unknown>;
export const PaymentProviderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentProviderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}}]}}]} as unknown as DocumentNode<PaymentProviderFieldsFragment, unknown>;
export const TaskFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<TaskFieldsFragment, unknown>;
export const WorkLogFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<WorkLogFieldsFragment, unknown>;
export const AdminDashboardStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDashboardStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDashboardStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DashboardStatsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DashboardStatsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DashboardStats"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"verified"}},{"kind":"Field","name":{"kind":"Name","value":"admins"}},{"kind":"Field","name":{"kind":"Name","value":"newThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"growthRate"}},{"kind":"Field","name":{"kind":"Name","value":"byBusinessRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"FOREMAN"}},{"kind":"Field","name":{"kind":"Name","value":"WORKER"}},{"kind":"Field","name":{"kind":"Name","value":"unassigned"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activeLastWeek"}},{"kind":"Field","name":{"kind":"Name","value":"activeLastMonth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"withActiveSubscription"}},{"kind":"Field","name":{"kind":"Name","value":"averageMembers"}},{"kind":"Field","name":{"kind":"Name","value":"newThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"topTeamsByMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"ownerName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"archived"}},{"kind":"Field","name":{"kind":"Name","value":"byTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"trialing"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled"}},{"kind":"Field","name":{"kind":"Name","value":"byPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"LITE"}},{"kind":"Field","name":{"kind":"Name","value":"FOREMAN"}},{"kind":"Field","name":{"kind":"Name","value":"BRIGADE"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"thisMonthRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayment"}},{"kind":"Field","name":{"kind":"Name","value":"topPayingTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalPaid"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"storage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalUsedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"totalUsedGB"}},{"kind":"Field","name":{"kind":"Name","value":"averagePerTeam"}}]}}]}}]} as unknown as DocumentNode<AdminDashboardStatsQuery, AdminDashboardStatsQueryVariables>;
export const AdminRevenueChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminRevenueChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRevenueChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ChartDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ChartDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChartData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<AdminRevenueChartQuery, AdminRevenueChartQueryVariables>;
export const AdminUserGrowthChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUserGrowthChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUserGrowthChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ChartDataFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ChartDataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ChartData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<AdminUserGrowthChartQuery, AdminUserGrowthChartQueryVariables>;
export const AdminRecentActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminRecentActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRecentActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AdminRecentActivityQuery, AdminRecentActivityQueryVariables>;
export const AdminSystemHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSystemHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSystemHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SystemHealthFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SystemHealthFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SystemHealth"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"database"}},{"kind":"Field","name":{"kind":"Name","value":"storageAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"lastBackup"}}]}}]} as unknown as DocumentNode<AdminSystemHealthQuery, AdminSystemHealthQueryVariables>;
export const AdminGetAuditLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetAuditLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AuditLogFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetAuditLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAuditLogFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAuditLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAuditLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"oldValue"}},{"kind":"Field","name":{"kind":"Name","value":"newValue"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}}]}}]} as unknown as DocumentNode<AdminGetAuditLogsQuery, AdminGetAuditLogsQueryVariables>;
export const AdminGetAuditStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetAuditStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetAuditStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuditStatisticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuditStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuditStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalLogs"}},{"kind":"Field","name":{"kind":"Name","value":"logsLast24h"}},{"kind":"Field","name":{"kind":"Name","value":"logsLast7d"}},{"kind":"Field","name":{"kind":"Name","value":"logsLast30d"}},{"kind":"Field","name":{"kind":"Name","value":"byCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topActions"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueUsers"}}]}}]} as unknown as DocumentNode<AdminGetAuditStatisticsQuery, AdminGetAuditStatisticsQueryVariables>;
export const AdminGetRetentionPoliciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetRetentionPolicies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetRetentionPolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DataRetentionPolicyFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataRetentionPolicyFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataRetentionPolicy"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceType"}},{"kind":"Field","name":{"kind":"Name","value":"retentionDays"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}}]}}]} as unknown as DocumentNode<AdminGetRetentionPoliciesQuery, AdminGetRetentionPoliciesQueryVariables>;
export const AdminGetDataExportRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetDataExportRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetDataExportRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DataExportRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataExportRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataExportRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"requestedById"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"requestedByName"}}]}}]} as unknown as DocumentNode<AdminGetDataExportRequestsQuery, AdminGetDataExportRequestsQueryVariables>;
export const AdminGetComplianceReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetComplianceReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetComplianceReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ComplianceReportFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ComplianceReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ComplianceReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalAuditLogs"}},{"kind":"Field","name":{"kind":"Name","value":"activePolicies"}},{"kind":"Field","name":{"kind":"Name","value":"pendingExports"}},{"kind":"Field","name":{"kind":"Name","value":"hasGDPRCompliance"}},{"kind":"Field","name":{"kind":"Name","value":"hasDataRetention"}},{"kind":"Field","name":{"kind":"Name","value":"lastAuditDate"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]} as unknown as DocumentNode<AdminGetComplianceReportQuery, AdminGetComplianceReportQueryVariables>;
export const AdminCreateRetentionPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateRetentionPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRetentionPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateRetentionPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DataRetentionPolicyFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataRetentionPolicyFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataRetentionPolicy"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceType"}},{"kind":"Field","name":{"kind":"Name","value":"retentionDays"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}}]}}]} as unknown as DocumentNode<AdminCreateRetentionPolicyMutation, AdminCreateRetentionPolicyMutationVariables>;
export const AdminUpdateRetentionPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateRetentionPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRetentionPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateRetentionPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DataRetentionPolicyFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataRetentionPolicyFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataRetentionPolicy"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceType"}},{"kind":"Field","name":{"kind":"Name","value":"retentionDays"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}}]}}]} as unknown as DocumentNode<AdminUpdateRetentionPolicyMutation, AdminUpdateRetentionPolicyMutationVariables>;
export const AdminDeleteRetentionPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteRetentionPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteRetentionPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteRetentionPolicyMutation, AdminDeleteRetentionPolicyMutationVariables>;
export const AdminCreateDataExportRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateDataExportRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDataExportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateDataExportRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DataExportRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DataExportRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DataExportRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"requestedById"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"requestedByName"}}]}}]} as unknown as DocumentNode<AdminCreateDataExportRequestMutation, AdminCreateDataExportRequestMutationVariables>;
export const AdminGetAnnouncementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetAnnouncements"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AnnouncementFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetAnnouncements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnnouncementFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<AdminGetAnnouncementsQuery, AdminGetAnnouncementsQueryVariables>;
export const AdminGetAnnouncementByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetAnnouncementById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetAnnouncementById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnnouncementFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<AdminGetAnnouncementByIdQuery, AdminGetAnnouncementByIdQueryVariables>;
export const AdminGetAnnouncementStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetAnnouncementStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetAnnouncementStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AnnouncementStatisticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AnnouncementStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AnnouncementStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"drafts"}},{"kind":"Field","name":{"kind":"Name","value":"pinned"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"lowPriority"}},{"kind":"Field","name":{"kind":"Name","value":"normalPriority"}},{"kind":"Field","name":{"kind":"Name","value":"highPriority"}},{"kind":"Field","name":{"kind":"Name","value":"urgentPriority"}}]}}]} as unknown as DocumentNode<AdminGetAnnouncementStatisticsQuery, AdminGetAnnouncementStatisticsQueryVariables>;
export const AdminCreateAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAnnouncementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnnouncementFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<AdminCreateAnnouncementMutation, AdminCreateAnnouncementMutationVariables>;
export const AdminUpdateAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAnnouncementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnnouncementFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<AdminUpdateAnnouncementMutation, AdminUpdateAnnouncementMutationVariables>;
export const AdminDeleteAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteAnnouncementMutation, AdminDeleteAnnouncementMutationVariables>;
export const AdminPublishAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminPublishAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPublishAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnnouncementFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<AdminPublishAnnouncementMutation, AdminPublishAnnouncementMutationVariables>;
export const AdminUnpublishAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUnpublishAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUnpublishAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnnouncementFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnnouncementFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnnouncement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isPublished"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"readCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"hasRead"}}]}}]} as unknown as DocumentNode<AdminUnpublishAnnouncementMutation, AdminUnpublishAnnouncementMutationVariables>;
export const AdminMarkAnnouncementAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminMarkAnnouncementAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"announcementId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMarkAnnouncementAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"announcementId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"announcementId"}}}]}]}}]} as unknown as DocumentNode<AdminMarkAnnouncementAsReadMutation, AdminMarkAnnouncementAsReadMutationVariables>;
export const AdminActionLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminActionLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminActionLogFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminActionLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserId"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<AdminActionLogsQuery, AdminActionLogsQueryVariables>;
export const AdminActionLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminActionLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminActionLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserId"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminActionLogQuery, AdminActionLogQueryVariables>;
export const RecentAdminActionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecentAdminActions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"adminUserId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentAdminActions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"adminUserId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"adminUserId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserId"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<RecentAdminActionsQuery, RecentAdminActionsQueryVariables>;
export const ActionsByResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActionsByResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resource"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionsByResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"resource"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resource"}}},{"kind":"Argument","name":{"kind":"Name","value":"resourceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"adminUserId"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ActionsByResourceQuery, ActionsByResourceQueryVariables>;
export const AdminActionStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminActionStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminActionStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalActions"}},{"kind":"Field","name":{"kind":"Name","value":"actionsByType"}},{"kind":"Field","name":{"kind":"Name","value":"actionsByResource"}},{"kind":"Field","name":{"kind":"Name","value":"actionsByAdmin"}}]}}]}}]} as unknown as DocumentNode<AdminActionStatisticsQuery, AdminActionStatisticsQueryVariables>;
export const GetAdminPaymentProvidersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminPaymentProviders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPaymentProviders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"baseUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseUrl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"configStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasShopId"}},{"kind":"Field","name":{"kind":"Name","value":"hasSecretKey"}},{"kind":"Field","name":{"kind":"Name","value":"hasWebhookSecret"}},{"kind":"Field","name":{"kind":"Name","value":"hasPublishableKey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminPaymentProvidersQuery, GetAdminPaymentProvidersQueryVariables>;
export const GetAdminPaymentProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminPaymentProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPaymentProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"baseUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseUrl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"configStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasShopId"}},{"kind":"Field","name":{"kind":"Name","value":"hasSecretKey"}},{"kind":"Field","name":{"kind":"Name","value":"hasWebhookSecret"}},{"kind":"Field","name":{"kind":"Name","value":"hasPublishableKey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminPaymentProviderQuery, GetAdminPaymentProviderQueryVariables>;
export const GetProviderConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProviderConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPaymentProviderConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shopId"}},{"kind":"Field","name":{"kind":"Name","value":"hasSecretKey"}},{"kind":"Field","name":{"kind":"Name","value":"hasWebhookSecret"}},{"kind":"Field","name":{"kind":"Name","value":"hasPublishableKey"}}]}}]}}]} as unknown as DocumentNode<GetProviderConfigQuery, GetProviderConfigQueryVariables>;
export const UpdateAdminPaymentProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAdminPaymentProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePaymentProviderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdatePaymentProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"configStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasShopId"}},{"kind":"Field","name":{"kind":"Name","value":"hasSecretKey"}},{"kind":"Field","name":{"kind":"Name","value":"hasWebhookSecret"}},{"kind":"Field","name":{"kind":"Name","value":"hasPublishableKey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateAdminPaymentProviderMutation, UpdateAdminPaymentProviderMutationVariables>;
export const TestPaymentProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TestPaymentProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTestPaymentProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<TestPaymentProviderMutation, TestPaymentProviderMutationVariables>;
export const ClearProviderCacheDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearProviderCache"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminClearPaymentProviderCache"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}]}]}}]} as unknown as DocumentNode<ClearProviderCacheMutation, ClearProviderCacheMutationVariables>;
export const AdminPaymentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPayments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPaymentFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPayment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]} as unknown as DocumentNode<AdminPaymentsQuery, AdminPaymentsQueryVariables>;
export const AdminPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPayment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"}}]}}]} as unknown as DocumentNode<AdminPaymentQuery, AdminPaymentQueryVariables>;
export const AdminPaymentStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPaymentStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPaymentStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalPayments"}},{"kind":"Field","name":{"kind":"Name","value":"succeededPayments"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayments"}},{"kind":"Field","name":{"kind":"Name","value":"failedPayments"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayment"}},{"kind":"Field","name":{"kind":"Name","value":"byStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"PENDING"}},{"kind":"Field","name":{"kind":"Name","value":"SUCCEEDED"}},{"kind":"Field","name":{"kind":"Name","value":"FAILED"}},{"kind":"Field","name":{"kind":"Name","value":"CANCELLED"}}]}}]}}]}}]} as unknown as DocumentNode<AdminPaymentStatsQuery, AdminPaymentStatsQueryVariables>;
export const AdminUpdatePaymentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdatePaymentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdatePaymentStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPayment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"}}]}}]} as unknown as DocumentNode<AdminUpdatePaymentStatusMutation, AdminUpdatePaymentStatusMutationVariables>;
export const AdminRefundPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminRefundPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefundPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRefundPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPayment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"}}]}}]} as unknown as DocumentNode<AdminRefundPaymentMutation, AdminRefundPaymentMutationVariables>;
export const AdminDeletePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeletePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeletePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeletePaymentMutation, AdminDeletePaymentMutationVariables>;
export const GetAdminPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminPlans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminPlansQuery, GetAdminPlansQueryVariables>;
export const GetAdminPlansPaginatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminPlansPaginated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currency"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPlansPaginated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"currency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currency"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}}]}}]} as unknown as DocumentNode<GetAdminPlansPaginatedQuery, GetAdminPlansPaginatedQueryVariables>;
export const GetAdminPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminPlanQuery, GetAdminPlanQueryVariables>;
export const GetAdminPlanBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminPlanBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPlanBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminPlanBySlugQuery, GetAdminPlanBySlugQueryVariables>;
export const GetAvailablePlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAvailablePlans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currency"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availablePlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"currency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currency"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAvailablePlansQuery, GetAvailablePlansQueryVariables>;
export const CreateAdminPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAdminPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCreatePlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateAdminPlanMutation, CreateAdminPlanMutationVariables>;
export const UpdateAdminPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAdminPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUpdatePlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateAdminPlanMutation, UpdateAdminPlanMutationVariables>;
export const ArchiveAdminPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveAdminPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminArchivePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveAdminPlanMutation, ArchiveAdminPlanMutationVariables>;
export const ActivateAdminPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateAdminPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminActivatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ActivateAdminPlanMutation, ActivateAdminPlanMutationVariables>;
export const DeleteAdminPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAdminPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeletePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAdminPlanMutation, DeleteAdminPlanMutationVariables>;
export const AdminProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProjectFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"actualCost"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"}},{"kind":"Field","name":{"kind":"Name","value":"photoReports"}},{"kind":"Field","name":{"kind":"Name","value":"tasks"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"archived"}}]}}]}}]}}]} as unknown as DocumentNode<AdminProjectsQuery, AdminProjectsQueryVariables>;
export const AdminProjectDetailedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProjectDetailed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"actualCost"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"}},{"kind":"Field","name":{"kind":"Name","value":"photoReports"}},{"kind":"Field","name":{"kind":"Name","value":"tasks"}}]}}]}}]}}]} as unknown as DocumentNode<AdminProjectDetailedQuery, AdminProjectDetailedQueryVariables>;
export const AdminProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"actualCost"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"}},{"kind":"Field","name":{"kind":"Name","value":"photoReports"}},{"kind":"Field","name":{"kind":"Name","value":"tasks"}}]}}]}}]}}]} as unknown as DocumentNode<AdminProjectQuery, AdminProjectQueryVariables>;
export const AdminUpdateProjectStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateProjectStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateProjectStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateProjectStatusMutation, AdminUpdateProjectStatusMutationVariables>;
export const AdminDeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<AdminDeleteProjectMutation, AdminDeleteProjectMutationVariables>;
export const AdminArchiveProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminArchiveProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminArchiveProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminArchiveProjectMutation, AdminArchiveProjectMutationVariables>;
export const AdminGetTeamRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetTeamRoles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetTeamRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomRoleFields"}},{"kind":"Field","name":{"kind":"Name","value":"parentRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"childRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomRoleFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomRole"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"parentRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}}]}}]} as unknown as DocumentNode<AdminGetTeamRolesQuery, AdminGetTeamRolesQueryVariables>;
export const AdminGetRoleByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetRoleById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetRoleById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomRoleFields"}},{"kind":"Field","name":{"kind":"Name","value":"parentRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}},{"kind":"Field","name":{"kind":"Name","value":"childRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomRoleFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomRole"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"parentRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}}]}}]} as unknown as DocumentNode<AdminGetRoleByIdQuery, AdminGetRoleByIdQueryVariables>;
export const AdminGetRoleHierarchyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetRoleHierarchy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetRoleHierarchy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleHierarchyNodeFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleHierarchyNodeFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleHierarchyNodeFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleHierarchyNodeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleHierarchyNode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"permissionCount"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}}]}}]} as unknown as DocumentNode<AdminGetRoleHierarchyQuery, AdminGetRoleHierarchyQueryVariables>;
export const AdminGetPermissionCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetPermissionCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetPermissionCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PermissionCategoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PermissionDefinitionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionDefinition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PermissionCategoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionCategory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PermissionDefinitionFields"}}]}}]}}]} as unknown as DocumentNode<AdminGetPermissionCategoriesQuery, AdminGetPermissionCategoriesQueryVariables>;
export const AdminGetRoleAssignmentHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetRoleAssignmentHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetRoleAssignmentHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleAssignmentHistoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleAssignmentHistoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleAssignmentHistory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"previousRole"}},{"kind":"Field","name":{"kind":"Name","value":"newRole"}},{"kind":"Field","name":{"kind":"Name","value":"roleId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedBy"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AdminGetRoleAssignmentHistoryQuery, AdminGetRoleAssignmentHistoryQueryVariables>;
export const AdminGetMemberRoleHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetMemberRoleHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetMemberRoleHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleAssignmentHistoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleAssignmentHistoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleAssignmentHistory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"previousRole"}},{"kind":"Field","name":{"kind":"Name","value":"newRole"}},{"kind":"Field","name":{"kind":"Name","value":"roleId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedBy"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AdminGetMemberRoleHistoryQuery, AdminGetMemberRoleHistoryQueryVariables>;
export const AdminGetRoleStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetRoleStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetRoleStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleStatisticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRoles"}},{"kind":"Field","name":{"kind":"Name","value":"activeRoles"}},{"kind":"Field","name":{"kind":"Name","value":"inactiveRoles"}},{"kind":"Field","name":{"kind":"Name","value":"builtInRoles"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"membersWithCustomRoles"}},{"kind":"Field","name":{"kind":"Name","value":"membersWithDefaultRoles"}}]}}]} as unknown as DocumentNode<AdminGetRoleStatisticsQuery, AdminGetRoleStatisticsQueryVariables>;
export const AdminCreateCustomRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateCustomRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCustomRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateCustomRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomRoleFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomRoleFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomRole"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"parentRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}}]}}]} as unknown as DocumentNode<AdminCreateCustomRoleMutation, AdminCreateCustomRoleMutationVariables>;
export const AdminUpdateCustomRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateCustomRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCustomRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateCustomRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomRoleFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomRoleFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomRole"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"parentRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isBuiltIn"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}}]}}]} as unknown as DocumentNode<AdminUpdateCustomRoleMutation, AdminUpdateCustomRoleMutationVariables>;
export const AdminDeleteCustomRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteCustomRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteCustomRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteCustomRoleMutation, AdminDeleteCustomRoleMutationVariables>;
export const AdminAssignRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminAssignRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminAssignRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AdminAssignRoleMutation, AdminAssignRoleMutationVariables>;
export const AdminBulkAssignRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminBulkAssignRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkAssignRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminBulkAssignRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AdminBulkAssignRoleMutation, AdminBulkAssignRoleMutationVariables>;
export const GetAdminRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminRoles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"ipWhitelist"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminRolesQuery, GetAdminRolesQueryVariables>;
export const GetAdminRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"ipWhitelist"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminRoleQuery, GetAdminRoleQueryVariables>;
export const GetAdminRoleByUserIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminRoleByUserId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminRoleByUserId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"ipWhitelist"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminRoleByUserIdQuery, GetAdminRoleByUserIdQueryVariables>;
export const AssignAdminRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignAdminRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignAdminRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignAdminRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"ipWhitelist"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AssignAdminRoleMutation, AssignAdminRoleMutationVariables>;
export const UpdateAdminPermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAdminPermissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAdminPermissionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAdminPermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateAdminPermissionsMutation, UpdateAdminPermissionsMutationVariables>;
export const UpdateTwoFactorEnforcementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTwoFactorEnforcement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTwoFactorInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTwoFactorEnforcement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateTwoFactorEnforcementMutation, UpdateTwoFactorEnforcementMutationVariables>;
export const UpdateIpWhitelistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateIpWhitelist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateIpWhitelistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateIpWhitelist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"ipWhitelist"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateIpWhitelistMutation, UpdateIpWhitelistMutationVariables>;
export const ChangeAdminRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeAdminRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newRole"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeAdminRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"newRole"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newRole"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ChangeAdminRoleMutation, ChangeAdminRoleMutationVariables>;
export const RevokeAdminRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAdminRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAdminRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}}]}]}}]} as unknown as DocumentNode<RevokeAdminRoleMutation, RevokeAdminRoleMutationVariables>;
export const SystemSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SystemSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SettingCategory"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"systemSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"isEncrypted"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<SystemSettingsQuery, SystemSettingsQueryVariables>;
export const SystemSettingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SystemSetting"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"systemSetting"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"isEncrypted"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<SystemSettingQuery, SystemSettingQueryVariables>;
export const CreateSystemSettingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSystemSetting"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSystemSettingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSystemSetting"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"isEncrypted"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateSystemSettingMutation, CreateSystemSettingMutationVariables>;
export const UpdateSystemSettingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSystemSetting"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSystemSettingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSystemSetting"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"isEncrypted"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateSystemSettingMutation, UpdateSystemSettingMutationVariables>;
export const BulkUpdateSystemSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkUpdateSystemSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkUpdateSystemSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkUpdateSystemSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<BulkUpdateSystemSettingsMutation, BulkUpdateSystemSettingsMutationVariables>;
export const DeleteSystemSettingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSystemSetting"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSystemSetting"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}]}]}}]} as unknown as DocumentNode<DeleteSystemSettingMutation, DeleteSystemSettingMutationVariables>;
export const TestServiceConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TestServiceConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SettingCategory"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testServiceConnection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<TestServiceConnectionMutation, TestServiceConnectionMutationVariables>;
export const InitializeDefaultSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitializeDefaultSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initializeDefaultSettings"}}]}}]} as unknown as DocumentNode<InitializeDefaultSettingsMutation, InitializeDefaultSettingsMutationVariables>;
export const GetStorageSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStorageSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storageSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMode"}},{"kind":"Field","name":{"kind":"Name","value":"defaultProvider"}},{"kind":"Field","name":{"kind":"Name","value":"autoMigrate"}},{"kind":"Field","name":{"kind":"Name","value":"cloudinaryCloudName"}},{"kind":"Field","name":{"kind":"Name","value":"cloudinaryApiKey"}},{"kind":"Field","name":{"kind":"Name","value":"cloudinaryApiSecretSet"}},{"kind":"Field","name":{"kind":"Name","value":"r2AccountId"}},{"kind":"Field","name":{"kind":"Name","value":"r2AccessKeyIdSet"}},{"kind":"Field","name":{"kind":"Name","value":"r2SecretAccessKeySet"}},{"kind":"Field","name":{"kind":"Name","value":"r2BucketName"}},{"kind":"Field","name":{"kind":"Name","value":"r2PublicUrl"}}]}}]}}]} as unknown as DocumentNode<GetStorageSettingsQuery, GetStorageSettingsQueryVariables>;
export const GetStorageStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStorageStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storageStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalFiles"}},{"kind":"Field","name":{"kind":"Name","value":"totalSize"}},{"kind":"Field","name":{"kind":"Name","value":"filesByProvider"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"fileCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalSize"}}]}},{"kind":"Field","name":{"kind":"Name","value":"filesByType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileType"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"totalSize"}}]}}]}}]}}]} as unknown as DocumentNode<GetStorageStatsQuery, GetStorageStatsQueryVariables>;
export const TestStorageProvidersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TestStorageProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testStorageProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"latency"}}]}}]}}]} as unknown as DocumentNode<TestStorageProvidersQuery, TestStorageProvidersQueryVariables>;
export const UpdateStorageSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStorageSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStorageSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStorageSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMode"}},{"kind":"Field","name":{"kind":"Name","value":"defaultProvider"}},{"kind":"Field","name":{"kind":"Name","value":"autoMigrate"}},{"kind":"Field","name":{"kind":"Name","value":"cloudinaryCloudName"}},{"kind":"Field","name":{"kind":"Name","value":"cloudinaryApiKey"}},{"kind":"Field","name":{"kind":"Name","value":"cloudinaryApiSecretSet"}},{"kind":"Field","name":{"kind":"Name","value":"r2AccountId"}},{"kind":"Field","name":{"kind":"Name","value":"r2AccessKeyIdSet"}},{"kind":"Field","name":{"kind":"Name","value":"r2SecretAccessKeySet"}},{"kind":"Field","name":{"kind":"Name","value":"r2BucketName"}},{"kind":"Field","name":{"kind":"Name","value":"r2PublicUrl"}}]}}]}}]} as unknown as DocumentNode<UpdateStorageSettingsMutation, UpdateStorageSettingsMutationVariables>;
export const TestStorageProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TestStorageProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StorageProviderType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testStorageProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"latency"}}]}}]}}]} as unknown as DocumentNode<TestStorageProviderMutation, TestStorageProviderMutationVariables>;
export const MigrateUserStorageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MigrateUserStorage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromProvider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StorageProviderType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toProvider"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StorageProviderType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"migrateUserStorage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromProvider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromProvider"}}},{"kind":"Argument","name":{"kind":"Name","value":"toProvider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toProvider"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fromProvider"}},{"kind":"Field","name":{"kind":"Name","value":"toProvider"}},{"kind":"Field","name":{"kind":"Name","value":"totalFiles"}},{"kind":"Field","name":{"kind":"Name","value":"successCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedCount"}},{"kind":"Field","name":{"kind":"Name","value":"failures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<MigrateUserStorageMutation, MigrateUserStorageMutationVariables>;
export const AdminSubscriptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSubscriptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSubscriptionFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSubscriptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSubscriptionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]} as unknown as DocumentNode<AdminSubscriptionsQuery, AdminSubscriptionsQueryVariables>;
export const AdminSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}}]}}]} as unknown as DocumentNode<AdminSubscriptionQuery, AdminSubscriptionQueryVariables>;
export const AdminSubscriptionStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSubscriptionStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSubscriptionStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalSubscriptions"}},{"kind":"Field","name":{"kind":"Name","value":"activeSubscriptions"}},{"kind":"Field","name":{"kind":"Name","value":"trialingSubscriptions"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledSubscriptions"}},{"kind":"Field","name":{"kind":"Name","value":"byPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"LITE"}},{"kind":"Field","name":{"kind":"Name","value":"FOREMAN"}},{"kind":"Field","name":{"kind":"Name","value":"BRIGADE"}}]}}]}}]}}]} as unknown as DocumentNode<AdminSubscriptionStatsQuery, AdminSubscriptionStatsQueryVariables>;
export const AdminCancelSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCancelSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCancelSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"}}]}}]} as unknown as DocumentNode<AdminCancelSubscriptionMutation, AdminCancelSubscriptionMutationVariables>;
export const AdminChangeTeamPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminChangeTeamPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"planType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminChangeTeamPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"planType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"planType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<AdminChangeTeamPlanMutation, AdminChangeTeamPlanMutationVariables>;
export const AdminDeleteSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteSubscriptionMutation, AdminDeleteSubscriptionMutationVariables>;
export const AdminSupportTicketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSupportTickets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSupportTicketFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSupportTickets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"userFullName"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}}]} as unknown as DocumentNode<AdminSupportTicketsQuery, AdminSupportTicketsQueryVariables>;
export const AdminSupportTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSupportTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSupportTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ticketId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"userFullName"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"fromUser"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<AdminSupportTicketQuery, AdminSupportTicketQueryVariables>;
export const AdminSupportStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSupportStatistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSupportStatistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalTickets"}},{"kind":"Field","name":{"kind":"Name","value":"openTickets"}},{"kind":"Field","name":{"kind":"Name","value":"inProgressTickets"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedTickets"}},{"kind":"Field","name":{"kind":"Name","value":"closedTickets"}},{"kind":"Field","name":{"kind":"Name","value":"ticketsByPriority"}},{"kind":"Field","name":{"kind":"Name","value":"ticketsByCategory"}}]}}]}}]} as unknown as DocumentNode<AdminSupportStatisticsQuery, AdminSupportStatisticsQueryVariables>;
export const AdminUpdateSupportTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateSupportTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUpdateSupportTicketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateSupportTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ticketId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateSupportTicketMutation, AdminUpdateSupportTicketMutationVariables>;
export const AdminSendSupportMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminSendSupportMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSendMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSendSupportMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"fromUser"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminSendSupportMessageMutation, AdminSendSupportMessageMutationVariables>;
export const AdminDeleteSupportTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteSupportTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteSupportTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ticketId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<AdminDeleteSupportTicketMutation, AdminDeleteSupportTicketMutationVariables>;
export const AdminTeamGrowthChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamGrowthChart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"months"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamGrowthChart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"months"},"value":{"kind":"Variable","name":{"kind":"Name","value":"months"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamGrowthChartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamGrowthChartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamGrowthChart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"}},{"kind":"Field","name":{"kind":"Name","value":"projectData"}}]}}]} as unknown as DocumentNode<AdminTeamGrowthChartQuery, AdminTeamGrowthChartQueryVariables>;
export const AdminTeamMemberActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamMemberActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamMemberActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberActivityFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberActivity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"actionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}}]} as unknown as DocumentNode<AdminTeamMemberActivityQuery, AdminTeamMemberActivityQueryVariables>;
export const AdminTeamCompositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamComposition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamComposition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamCompositionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PositionCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryDistributionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalaryDistribution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"none"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamCompositionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamComposition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"byPosition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryDistribution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SalaryDistributionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}}]}}]} as unknown as DocumentNode<AdminTeamCompositionQuery, AdminTeamCompositionQueryVariables>;
export const AdminTeamStorageUsageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamStorageUsage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamStorageUsage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamStorageUsageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"filesCount"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"usedGB"}},{"kind":"Field","name":{"kind":"Name","value":"byProject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectStorageUsageFields"}}]}}]}}]} as unknown as DocumentNode<AdminTeamStorageUsageQuery, AdminTeamStorageUsageQueryVariables>;
export const AdminTeamKpIsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamKPIs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamKPIs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamKPIsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamKPIsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamKPIs"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberRetention"}},{"kind":"Field","name":{"kind":"Name","value":"projectCompletionRate"}},{"kind":"Field","name":{"kind":"Name","value":"avgProjectDurationDays"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"completedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"archivedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"avgHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}}]} as unknown as DocumentNode<AdminTeamKpIsQuery, AdminTeamKpIsQueryVariables>;
export const AdminTeamAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamAnalyticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamKPIsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamKPIs"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberRetention"}},{"kind":"Field","name":{"kind":"Name","value":"projectCompletionRate"}},{"kind":"Field","name":{"kind":"Name","value":"avgProjectDurationDays"}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"completedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"archivedProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"avgHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamGrowthChartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamGrowthChart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"labels"}},{"kind":"Field","name":{"kind":"Name","value":"memberData"}},{"kind":"Field","name":{"kind":"Name","value":"projectData"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberActivityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberActivity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"actionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RoleCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionCountFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PositionCount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryDistributionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalaryDistribution"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"none"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamCompositionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamComposition"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"byPosition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionCountFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryDistribution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SalaryDistributionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"filesCount"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamStorageUsageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamStorageUsage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedBytes"}},{"kind":"Field","name":{"kind":"Name","value":"usedPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"usedGB"}},{"kind":"Field","name":{"kind":"Name","value":"byProject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectStorageUsageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamKPIsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"growthChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamGrowthChartFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"memberActivity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberActivityFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"composition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamCompositionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storageUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamStorageUsageFields"}}]}}]}}]} as unknown as DocumentNode<AdminTeamAnalyticsQuery, AdminTeamAnalyticsQueryVariables>;
export const AdminGetTeamMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetTeamMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetTeamMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamMemberExtendedFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamMemberExtendedFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMemberExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleName"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleColor"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"tasksCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}}]}}]} as unknown as DocumentNode<AdminGetTeamMembersQuery, AdminGetTeamMembersQueryVariables>;
export const AdminGetMemberByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetMemberById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetMemberById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamMemberExtendedFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamMemberExtendedFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMemberExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleName"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleColor"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"tasksCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}}]}}]} as unknown as DocumentNode<AdminGetMemberByIdQuery, AdminGetMemberByIdQueryVariables>;
export const AdminGetMemberActivityHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetMemberActivityHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetMemberActivityHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberActivityEventFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberActivityEventFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberActivityEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"relatedId"}},{"kind":"Field","name":{"kind":"Name","value":"relatedType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"triggeredBy"}},{"kind":"Field","name":{"kind":"Name","value":"triggeredByName"}}]}}]} as unknown as DocumentNode<AdminGetMemberActivityHistoryQuery, AdminGetMemberActivityHistoryQueryVariables>;
export const AdminGetMemberStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetMemberStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetMemberStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberStatisticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"activeMembers"}},{"kind":"Field","name":{"kind":"Name","value":"inactiveMembers"}},{"kind":"Field","name":{"kind":"Name","value":"withCustomRoles"}},{"kind":"Field","name":{"kind":"Name","value":"withFixedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"withPercentageSalary"}},{"kind":"Field","name":{"kind":"Name","value":"withNoSalary"}},{"kind":"Field","name":{"kind":"Name","value":"averageHours"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayroll"}}]}}]} as unknown as DocumentNode<AdminGetMemberStatisticsQuery, AdminGetMemberStatisticsQueryVariables>;
export const AdminExportMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminExportMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"format"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberExportFormat"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminExportMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"Variable","name":{"kind":"Name","value":"format"}}}]}]}}]} as unknown as DocumentNode<AdminExportMembersQuery, AdminExportMembersQueryVariables>;
export const AdminBulkUpdateMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminBulkUpdateMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkUpdateMembersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminBulkUpdateMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BulkOperationResultFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BulkOperationResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BulkOperationResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"successCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedCount"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"successIds"}},{"kind":"Field","name":{"kind":"Name","value":"failedIds"}}]}}]} as unknown as DocumentNode<AdminBulkUpdateMembersMutation, AdminBulkUpdateMembersMutationVariables>;
export const AdminBulkRemoveMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminBulkRemoveMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkRemoveMembersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminBulkRemoveMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BulkOperationResultFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BulkOperationResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BulkOperationResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"successCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedCount"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"successIds"}},{"kind":"Field","name":{"kind":"Name","value":"failedIds"}}]}}]} as unknown as DocumentNode<AdminBulkRemoveMembersMutation, AdminBulkRemoveMembersMutationVariables>;
export const AdminTransferMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminTransferMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransferMemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTransferMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamMemberExtendedFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamMemberExtendedFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMemberExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleName"}},{"kind":"Field","name":{"kind":"Name","value":"customRoleColor"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hoursLogged"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"tasksCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"lastActiveAt"}}]}}]} as unknown as DocumentNode<AdminTransferMemberMutation, AdminTransferMemberMutationVariables>;
export const AdminGetTeamTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetTeamTemplates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamTemplateFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetTeamTemplates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamTemplateFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"projectSetup"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<AdminGetTeamTemplatesQuery, AdminGetTeamTemplatesQueryVariables>;
export const AdminGetTeamTemplateByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetTeamTemplateById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetTeamTemplateById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamTemplateFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"projectSetup"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<AdminGetTeamTemplateByIdQuery, AdminGetTeamTemplateByIdQueryVariables>;
export const AdminGetMergePreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetMergePreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sourceTeamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetTeamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetMergePreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sourceTeamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sourceTeamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetTeamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetTeamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergePreviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergePreviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergePreview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"membersToMove"}},{"kind":"Field","name":{"kind":"Name","value":"projectsToMove"}},{"kind":"Field","name":{"kind":"Name","value":"conflictingMembers"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"canMerge"}}]}}]} as unknown as DocumentNode<AdminGetMergePreviewQuery, AdminGetMergePreviewQueryVariables>;
export const AdminGetMergeLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetMergeLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetMergeLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamMergeLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamMergeLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMergeLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"mergedById"}},{"kind":"Field","name":{"kind":"Name","value":"membersMoved"}},{"kind":"Field","name":{"kind":"Name","value":"projectsMoved"}},{"kind":"Field","name":{"kind":"Name","value":"dataSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"targetTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"mergedByName"}}]}}]} as unknown as DocumentNode<AdminGetMergeLogsQuery, AdminGetMergeLogsQueryVariables>;
export const AdminGetCloneLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetCloneLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetCloneLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamCloneLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamCloneLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamCloneLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"clonedById"}},{"kind":"Field","name":{"kind":"Name","value":"clonedSettings"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sourceTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamName"}},{"kind":"Field","name":{"kind":"Name","value":"clonedByName"}}]}}]} as unknown as DocumentNode<AdminGetCloneLogsQuery, AdminGetCloneLogsQueryVariables>;
export const AdminGetTeamOperationsStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGetTeamOperationsStatistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGetTeamOperationsStatistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamOperationsStatisticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamOperationsStatisticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamOperationsStatistics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalTemplates"}},{"kind":"Field","name":{"kind":"Name","value":"publicTemplates"}},{"kind":"Field","name":{"kind":"Name","value":"totalMerges"}},{"kind":"Field","name":{"kind":"Name","value":"totalClones"}},{"kind":"Field","name":{"kind":"Name","value":"teamsCreatedFromTemplates"}}]}}]} as unknown as DocumentNode<AdminGetTeamOperationsStatisticsQuery, AdminGetTeamOperationsStatisticsQueryVariables>;
export const AdminCreateTeamTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateTeamTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTeamTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateTeamTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamTemplateFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"projectSetup"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<AdminCreateTeamTemplateMutation, AdminCreateTeamTemplateMutationVariables>;
export const AdminUpdateTeamTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateTeamTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTeamTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateTeamTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TeamTemplateFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TeamTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TeamTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"projectSetup"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<AdminUpdateTeamTemplateMutation, AdminUpdateTeamTemplateMutationVariables>;
export const AdminDeleteTeamTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteTeamTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteTeamTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteTeamTemplateMutation, AdminDeleteTeamTemplateMutationVariables>;
export const AdminMergeTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminMergeTeams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MergeTeamsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminMergeTeams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergeResultFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergeResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergeResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"mergeLogId"}},{"kind":"Field","name":{"kind":"Name","value":"membersMoved"}},{"kind":"Field","name":{"kind":"Name","value":"projectsMoved"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}}]}}]} as unknown as DocumentNode<AdminMergeTeamsMutation, AdminMergeTeamsMutationVariables>;
export const AdminCloneTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCloneTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CloneTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCloneTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CloneResultFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CloneResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CloneResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"cloneLogId"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]} as unknown as DocumentNode<AdminCloneTeamMutation, AdminCloneTeamMutationVariables>;
export const AdminCreateTeamFromTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateTeamFromTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTeamFromTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateTeamFromTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CloneResultFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CloneResultFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CloneResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"clonedTeamId"}},{"kind":"Field","name":{"kind":"Name","value":"cloneLogId"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]} as unknown as DocumentNode<AdminCreateTeamFromTemplateMutation, AdminCreateTeamFromTemplateMutationVariables>;
export const AdminTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminTeamFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTeamFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]} as unknown as DocumentNode<AdminTeamsQuery, AdminTeamsQueryVariables>;
export const AdminTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTeamDetailsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamDetailsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminTeamDetails"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTeamFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"}},{"kind":"Field","name":{"kind":"Name","value":"projects"}}]}}]}}]} as unknown as DocumentNode<AdminTeamQuery, AdminTeamQueryVariables>;
export const AdminTeamStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTeamStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTeamStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTeamStatsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamStatsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminTeamStats"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalProjects"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenseAmount"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"completedProjects"}}]}}]} as unknown as DocumentNode<AdminTeamStatsQuery, AdminTeamStatsQueryVariables>;
export const AdminUpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUpdateTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminTeamFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminTeamFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AdminUpdateTeamMutation, AdminUpdateTeamMutationVariables>;
export const AdminDeleteTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteTeamMutation, AdminDeleteTeamMutationVariables>;
export const GetAdminTelegramBotsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminTelegramBots"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTelegramBots"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeInactive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"botName"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"canJoinGroups"}},{"kind":"Field","name":{"kind":"Name","value":"canReadMessages"}},{"kind":"Field","name":{"kind":"Name","value":"supportsInlineQueries"}},{"kind":"Field","name":{"kind":"Name","value":"configStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasToken"}},{"kind":"Field","name":{"kind":"Name","value":"hasWebhook"}},{"kind":"Field","name":{"kind":"Name","value":"isRegistered"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminTelegramBotsQuery, GetAdminTelegramBotsQueryVariables>;
export const GetAdminTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"botName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"botName"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"canJoinGroups"}},{"kind":"Field","name":{"kind":"Name","value":"canReadMessages"}},{"kind":"Field","name":{"kind":"Name","value":"supportsInlineQueries"}},{"kind":"Field","name":{"kind":"Name","value":"configStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasToken"}},{"kind":"Field","name":{"kind":"Name","value":"hasWebhook"}},{"kind":"Field","name":{"kind":"Name","value":"isRegistered"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminTelegramBotQuery, GetAdminTelegramBotQueryVariables>;
export const AdminCreateTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTelegramBotInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCreateTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"botName"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminCreateTelegramBotMutation, AdminCreateTelegramBotMutationVariables>;
export const AdminUpdateTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTelegramBotInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"botId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"botName"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateTelegramBotMutation, AdminUpdateTelegramBotMutationVariables>;
export const AdminDeleteTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"botId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botId"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteTelegramBotMutation, AdminDeleteTelegramBotMutationVariables>;
export const AdminSyncTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminSyncTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSyncTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"botId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"canJoinGroups"}},{"kind":"Field","name":{"kind":"Name","value":"canReadMessages"}},{"kind":"Field","name":{"kind":"Name","value":"supportsInlineQueries"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}}]}}]}}]} as unknown as DocumentNode<AdminSyncTelegramBotMutation, AdminSyncTelegramBotMutationVariables>;
export const AdminTestTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminTestTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TestBotTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTestTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"botInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"canJoinGroups"}},{"kind":"Field","name":{"kind":"Name","value":"canReadMessages"}},{"kind":"Field","name":{"kind":"Name","value":"supportsInlineQueries"}}]}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<AdminTestTelegramBotMutation, AdminTestTelegramBotMutationVariables>;
export const AdminSetTelegramWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminSetTelegramWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetWebhookInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminSetTelegramWebhook"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AdminSetTelegramWebhookMutation, AdminSetTelegramWebhookMutationVariables>;
export const AdminDeleteTelegramWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteTelegramWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteTelegramWebhook"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"botId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botId"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteTelegramWebhookMutation, AdminDeleteTelegramWebhookMutationVariables>;
export const AdminReloadTelegramBotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminReloadTelegramBot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminReloadTelegramBot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"botId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botId"}}}]}]}}]} as unknown as DocumentNode<AdminReloadTelegramBotMutation, AdminReloadTelegramBotMutationVariables>;
export const AdminTelegramBotWebhookInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTelegramBotWebhookInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"botId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminTelegramBotWebhookInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"botId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"botId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"hasCustomCertificate"}},{"kind":"Field","name":{"kind":"Name","value":"pendingUpdateCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"maxConnections"}},{"kind":"Field","name":{"kind":"Name","value":"allowedUpdates"}}]}}]}}]} as unknown as DocumentNode<AdminTelegramBotWebhookInfoQuery, AdminTelegramBotWebhookInfoQueryVariables>;
export const AdminUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const AdminUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserDetailsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserDetailsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserDetails"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"_count"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ownedTeams"}},{"kind":"Field","name":{"kind":"Name","value":"payments"}}]}}]}}]} as unknown as DocumentNode<AdminUserQuery, AdminUserQueryVariables>;
export const AdminUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateUserMutation, AdminUpdateUserMutationVariables>;
export const AdminVerifyUserEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminVerifyUserEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminVerifyUserEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}}]} as unknown as DocumentNode<AdminVerifyUserEmailMutation, AdminVerifyUserEmailMutationVariables>;
export const AdminDeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDeleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteUserMutation, AdminDeleteUserMutationVariables>;
export const PersonnelAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PersonnelAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personnelAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonnelAnalyticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonnelAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PersonnelAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averageHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberAnalyticsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectAnalyticsFields"}}]}}]}}]} as unknown as DocumentNode<PersonnelAnalyticsQuery, PersonnelAnalyticsQueryVariables>;
export const ExportPersonnelAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportPersonnelAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportPersonnelAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}]}]}}]} as unknown as DocumentNode<ExportPersonnelAnalyticsQuery, ExportPersonnelAnalyticsQueryVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"businessRoleAssignedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"businessRoleAssignedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requiresTwoFactor"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const VerifyTwoFactorLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyTwoFactorLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"twoFactorToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyTwoFactorLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"twoFactorToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"twoFactorToken"}}},{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"businessRoleAssignedAt"}}]}}]}}]}}]} as unknown as DocumentNode<VerifyTwoFactorLoginMutation, VerifyTwoFactorLoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"businessRoleAssignedAt"}}]}}]}}]}}]} as unknown as DocumentNode<RefreshSessionMutation, RefreshSessionMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"}}]}}]} as unknown as DocumentNode<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const InitiateEmailChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitiateEmailChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initiateEmailChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"pendingVerification"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<InitiateEmailChangeMutation, InitiateEmailChangeMutationVariables>;
export const VerifyEmailChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmailChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailChangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmailChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<VerifyEmailChangeMutation, VerifyEmailChangeMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const UpdateNotificationSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNotificationSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNotificationSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNotificationSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appPush"}},{"kind":"Field","name":{"kind":"Name","value":"appEmail"}},{"kind":"Field","name":{"kind":"Name","value":"appSms"}},{"kind":"Field","name":{"kind":"Name","value":"marketingPush"}},{"kind":"Field","name":{"kind":"Name","value":"marketingEmail"}},{"kind":"Field","name":{"kind":"Name","value":"notifyProjectCreated"}},{"kind":"Field","name":{"kind":"Name","value":"notifyProjectCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"notifyExpenseAdded"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPayoutCalculated"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPayoutPaid"}},{"kind":"Field","name":{"kind":"Name","value":"notifyMemberInvited"}},{"kind":"Field","name":{"kind":"Name","value":"notifyMemberJoined"}},{"kind":"Field","name":{"kind":"Name","value":"notifyMemberRemoved"}},{"kind":"Field","name":{"kind":"Name","value":"notifyTaskAssigned"}},{"kind":"Field","name":{"kind":"Name","value":"notifyTaskCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPhotoReportCreated"}},{"kind":"Field","name":{"kind":"Name","value":"notifySubscriptionExpiring"}},{"kind":"Field","name":{"kind":"Name","value":"emailFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"pushFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursStart"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursEnd"}}]}}]}}]} as unknown as DocumentNode<UpdateNotificationSettingsMutation, UpdateNotificationSettingsMutationVariables>;
export const RevokeSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}]}]}}]} as unknown as DocumentNode<RevokeSessionMutation, RevokeSessionMutationVariables>;
export const RevokeAllSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAllSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAllSessions"}}]}}]} as unknown as DocumentNode<RevokeAllSessionsMutation, RevokeAllSessionsMutationVariables>;
export const RevokeAllSessionsIncludingCurrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAllSessionsIncludingCurrent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAllSessionsIncludingCurrent"}}]}}]} as unknown as DocumentNode<RevokeAllSessionsIncludingCurrentMutation, RevokeAllSessionsIncludingCurrentMutationVariables>;
export const InitTelegramAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitTelegramAuth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initTelegramAuth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"deepLink"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}}]}}]} as unknown as DocumentNode<InitTelegramAuthMutation, InitTelegramAuthMutationVariables>;
export const CheckTelegramAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckTelegramAuth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckTelegramAuthInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkTelegramAuth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"businessRoleAssignedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sessionToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<CheckTelegramAuthMutation, CheckTelegramAuthMutationVariables>;
export const LinkTelegramAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LinkTelegramAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linkTelegramAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<LinkTelegramAccountMutation, LinkTelegramAccountMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"businessRole"}},{"kind":"Field","name":{"kind":"Name","value":"businessRoleAssignedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"notificationSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appPush"}},{"kind":"Field","name":{"kind":"Name","value":"appEmail"}},{"kind":"Field","name":{"kind":"Name","value":"appSms"}},{"kind":"Field","name":{"kind":"Name","value":"marketingPush"}},{"kind":"Field","name":{"kind":"Name","value":"marketingEmail"}},{"kind":"Field","name":{"kind":"Name","value":"notifyProjectCreated"}},{"kind":"Field","name":{"kind":"Name","value":"notifyProjectCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"notifyExpenseAdded"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPayoutCalculated"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPayoutPaid"}},{"kind":"Field","name":{"kind":"Name","value":"notifyMemberInvited"}},{"kind":"Field","name":{"kind":"Name","value":"notifyMemberJoined"}},{"kind":"Field","name":{"kind":"Name","value":"notifyMemberRemoved"}},{"kind":"Field","name":{"kind":"Name","value":"notifyTaskAssigned"}},{"kind":"Field","name":{"kind":"Name","value":"notifyTaskCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"notifyPhotoReportCreated"}},{"kind":"Field","name":{"kind":"Name","value":"notifySubscriptionExpiring"}},{"kind":"Field","name":{"kind":"Name","value":"emailFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"pushFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursStart"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursEnd"}}]}},{"kind":"Field","name":{"kind":"Name","value":"adminRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const SessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"ip"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"device"}},{"kind":"Field","name":{"kind":"Name","value":"browser"}},{"kind":"Field","name":{"kind":"Name","value":"os"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"current"}}]}}]}}]} as unknown as DocumentNode<SessionsQuery, SessionsQueryVariables>;
export const LoginHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LoginHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ip"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"device"}},{"kind":"Field","name":{"kind":"Name","value":"browser"}},{"kind":"Field","name":{"kind":"Name","value":"os"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<LoginHistoryQuery, LoginHistoryQueryVariables>;
export const UploadAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadAvatar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadAvatar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<UploadAvatarMutation, UploadAvatarMutationVariables>;
export const DeleteAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<DeleteAvatarMutation, DeleteAvatarMutationVariables>;
export const ExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Expense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"photos"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"paidByClient"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ExpenseQuery, ExpenseQueryVariables>;
export const ExpensesByProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpensesByProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expensesByProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"photos"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"paidByClient"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ExpensesByProjectQuery, ExpensesByProjectQueryVariables>;
export const ExpensesByCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpensesByCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expensesByCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"photos"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"paidByClient"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ExpensesByCategoryQuery, ExpensesByCategoryQueryVariables>;
export const CreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"photos"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"paidByClient"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const UpdateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"photos"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"paidByClient"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateExpenseMutation, UpdateExpenseMutationVariables>;
export const DeleteExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const PayoutSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayoutSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payoutSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PayoutSummaryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberPayoutDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberPayoutDetail"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedPayout"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PayoutSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayoutSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"netProfit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"ownerProfit"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberPayoutDetailFields"}}]}}]}}]} as unknown as DocumentNode<PayoutSummaryQuery, PayoutSummaryQueryVariables>;
export const ProjectPayoutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectPayouts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectPayouts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectPayoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectPayoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectPayout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"receiptUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectPayoutsQuery, ProjectPayoutsQueryVariables>;
export const MemberPayoutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberPayouts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberPayouts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectPayoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectPayoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectPayout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"receiptUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<MemberPayoutsQuery, MemberPayoutsQueryVariables>;
export const UpdateMemberSalaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberSalary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberSalaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberSalary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMemberSalaryMutation, UpdateMemberSalaryMutationVariables>;
export const CreatePayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectPayoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectPayoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectPayout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"receiptUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePayoutMutation, CreatePayoutMutationVariables>;
export const CloseProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CloseProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"closeProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"finalProfit"}}]}}]}}]} as unknown as DocumentNode<CloseProjectMutation, CloseProjectMutationVariables>;
export const UpdatePayoutPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePayoutPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePayoutPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePayoutPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectPayoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectPayoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectPayout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"receiptUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePayoutPaymentMutation, UpdatePayoutPaymentMutationVariables>;
export const CreatePhotoReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePhotoReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePhotoReportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPhotoReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoReportFields"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreatePhotoReportMutation, CreatePhotoReportMutationVariables>;
export const UpdatePhotoReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePhotoReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePhotoReportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePhotoReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoReportFields"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdatePhotoReportMutation, UpdatePhotoReportMutationVariables>;
export const DeletePhotoReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePhotoReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePhotoReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeletePhotoReportMutation, DeletePhotoReportMutationVariables>;
export const UploadPhotoToReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadPhotoToReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadPhotoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadPhotoToReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UploadPhotoToReportMutation, UploadPhotoToReportMutationVariables>;
export const AddPhotoToReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPhotoToReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPhotoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPhotoToReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AddPhotoToReportMutation, AddPhotoToReportMutationVariables>;
export const DeletePhotoFromReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePhotoFromReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"photoId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePhotoFromReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"photoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"photoId"}}}]}]}}]} as unknown as DocumentNode<DeletePhotoFromReportMutation, DeletePhotoFromReportMutationVariables>;
export const ReorderReportPhotosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderReportPhotos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reportId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"photoIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderReportPhotos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"reportId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reportId"}}},{"kind":"Argument","name":{"kind":"Name","value":"photoIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"photoIds"}}}]}]}}]} as unknown as DocumentNode<ReorderReportPhotosMutation, ReorderReportPhotosMutationVariables>;
export const UpdatePhotoCaptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePhotoCaption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"photoId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"caption"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePhotoCaption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"photoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"photoId"}}},{"kind":"Argument","name":{"kind":"Name","value":"caption"},"value":{"kind":"Variable","name":{"kind":"Name","value":"caption"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdatePhotoCaptionMutation, UpdatePhotoCaptionMutationVariables>;
export const ProjectPhotoReportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectPhotoReports"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectPhotoReports"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoReportFields"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjectPhotoReportsQuery, ProjectPhotoReportsQueryVariables>;
export const PhotoReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PhotoReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"photoReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoReportFields"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<PhotoReportQuery, PhotoReportQueryVariables>;
export const PublicPhotoReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PublicPhotoReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicPhotoReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PublicPhotoReportFields"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReportPhotoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PublicPhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicPhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<PublicPhotoReportQuery, PublicPhotoReportQueryVariables>;
export const ProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Project"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"clientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<ProjectQuery, ProjectQueryVariables>;
export const ProjectsByTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectsByTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectsByTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ProjectsByTeamQuery, ProjectsByTeamQueryVariables>;
export const ProjectStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCount"}},{"kind":"Field","name":{"kind":"Name","value":"taskCount"}},{"kind":"Field","name":{"kind":"Name","value":"reportCount"}}]}}]}}]} as unknown as DocumentNode<ProjectStatsQuery, ProjectStatsQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"clientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"clientPhone"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const ArchiveProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveProjectMutation, ArchiveProjectMutationVariables>;
export const RestoreProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<RestoreProjectMutation, RestoreProjectMutationVariables>;
export const UpdateProjectProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProjectProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"progress"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProjectProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"progress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"progress"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectProgressMutation, UpdateProjectProgressMutationVariables>;
export const MySubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MySubscriptionQuery, MySubscriptionQueryVariables>;
export const MySubscriptionHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MySubscriptionHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySubscriptionHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MySubscriptionHistoryQuery, MySubscriptionHistoryQueryVariables>;
export const GetSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetSubscriptionQuery, GetSubscriptionQueryVariables>;
export const CurrentPlanLimitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentPlanLimits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPlanLimits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanLimitsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<CurrentPlanLimitsQuery, CurrentPlanLimitsQueryVariables>;
export const UsageStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsageStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usageStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageUsedGB"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanLimitsFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<UsageStatsQuery, UsageStatsQueryVariables>;
export const CanAddProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanAddProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canAddProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}]}]}}]} as unknown as DocumentNode<CanAddProjectQuery, CanAddProjectQueryVariables>;
export const PaymentsBySubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaymentsBySubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentsBySubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"failureReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"refundedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PaymentsBySubscriptionQuery, PaymentsBySubscriptionQueryVariables>;
export const AvailablePlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailablePlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availablePlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPlanFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanPriceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanPriceModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFeatureFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanFeatureModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanPriceFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanFeatureFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AvailablePlansQuery, AvailablePlansQueryVariables>;
export const AvailablePlansDetailedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailablePlansDetailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availablePlansDetailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPlanFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanPriceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanPriceModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFeatureFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanFeatureModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanPriceFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanFeatureFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AvailablePlansDetailedQuery, AvailablePlansDetailedQueryVariables>;
export const PlanBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlanBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"planBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPlanFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanPriceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanPriceModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"earlyBirdPrice"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycleDays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFeatureFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanFeatureModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isIncluded"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminPlanModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPopular"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}},{"kind":"Field","name":{"kind":"Name","value":"prices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanPriceFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanFeatureFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PlanBySlugQuery, PlanBySlugQueryVariables>;
export const EarlyBirdStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EarlyBirdStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"earlyBirdStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"used"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"totalTeams"}}]}}]}}]} as unknown as DocumentNode<EarlyBirdStatsQuery, EarlyBirdStatsQueryVariables>;
export const CreateSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateSubscriptionMutation, CreateSubscriptionMutationVariables>;
export const ChangePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ChangePlanMutation, ChangePlanMutationVariables>;
export const CancelSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CancelSubscriptionMutation, CancelSubscriptionMutationVariables>;
export const ReactivateSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReactivateSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reactivateSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"planRef"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trialDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ReactivateSubscriptionMutation, ReactivateSubscriptionMutationVariables>;
export const AvailablePaymentProvidersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailablePaymentProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availablePaymentProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentProviderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentProviderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentProviderModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}}]}}]} as unknown as DocumentNode<AvailablePaymentProvidersQuery, AvailablePaymentProvidersQueryVariables>;
export const InitializePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitializePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetPlanId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetPlan"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initializePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"providerType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerType"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetPlanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetPlanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetPlan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetPlan"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}}]}}]}}]} as unknown as DocumentNode<InitializePaymentMutation, InitializePaymentMutationVariables>;
export const ConfirmMockPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmMockPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paymentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmMockPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paymentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paymentId"}}}]}]}}]} as unknown as DocumentNode<ConfirmMockPaymentMutation, ConfirmMockPaymentMutationVariables>;
export const TaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Task"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"task"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<TaskQuery, TaskQueryVariables>;
export const ProjectTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"todo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"done"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<ProjectTasksQuery, ProjectTasksQueryVariables>;
export const MemberTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assigneeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assigneeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assigneeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MemberTasksQuery, MemberTasksQueryVariables>;
export const MyTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MyTasksQuery, MyTasksQueryVariables>;
export const CreateTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export const UpdateTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<UpdateTaskMutation, UpdateTaskMutationVariables>;
export const MoveTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MoveTaskMutation, MoveTaskMutationVariables>;
export const DeleteTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<DeleteTaskMutation, DeleteTaskMutationVariables>;
export const MyTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plan"}}]}}]}}]}}]} as unknown as DocumentNode<MyTeamsQuery, MyTeamsQueryVariables>;
export const TeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Team"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<TeamQuery, TeamQueryVariables>;
export const TeamMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}}]}}]}}]}}]} as unknown as DocumentNode<TeamMembersQuery, TeamMembersQueryVariables>;
export const TeamStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHours"}}]}}]}}]} as unknown as DocumentNode<TeamStatsQuery, TeamStatsQueryVariables>;
export const CompleteOnboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOnboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOnboardingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOnboarding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>;
export const UpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const RemoveTeamMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTeamMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTeamMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}]}]}}]} as unknown as DocumentNode<RemoveTeamMemberMutation, RemoveTeamMemberMutationVariables>;
export const CreateInviteLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInviteLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInviteLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expiresInDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"inviteUrl"}}]}}]}}]} as unknown as DocumentNode<CreateInviteLinkMutation, CreateInviteLinkMutationVariables>;
export const SendInviteByEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendInviteByEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendInviteByEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendInviteByEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteCode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"inviteUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}}]}}]}}]} as unknown as DocumentNode<SendInviteByEmailMutation, SendInviteByEmailMutationVariables>;
export const JoinTeamByInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinTeamByInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinTeamByInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}}]}}]}}]}}]} as unknown as DocumentNode<JoinTeamByInviteMutation, JoinTeamByInviteMutationVariables>;
export const TeamInvitesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamInvites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamInvites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"inviteUrl"}}]}}]}}]} as unknown as DocumentNode<TeamInvitesQuery, TeamInvitesQueryVariables>;
export const DeleteInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"codeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"codeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"codeId"}}}]}]}}]} as unknown as DocumentNode<DeleteInviteCodeMutation, DeleteInviteCodeMutationVariables>;
export const UpdateMemberPositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberPosition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberPositionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberPosition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMemberPositionMutation, UpdateMemberPositionMutationVariables>;
export const MemberSalaryHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberSalaryHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberSalaryHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"previousType"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"newType"}},{"kind":"Field","name":{"kind":"Name","value":"newAmount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"changedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<MemberSalaryHistoryQuery, MemberSalaryHistoryQueryVariables>;
export const DisconnectTelegramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisconnectTelegram"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disconnectTelegram"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"telegramUsername"}},{"kind":"Field","name":{"kind":"Name","value":"telegramPhotoUrl"}}]}}]}}]} as unknown as DocumentNode<DisconnectTelegramMutation, DisconnectTelegramMutationVariables>;
export const TwoFactorStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TwoFactorStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"twoFactorStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"backupCodesRemaining"}}]}}]}}]} as unknown as DocumentNode<TwoFactorStatusQuery, TwoFactorStatusQueryVariables>;
export const Generate2FaSecretDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Generate2FASecret"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generate2FASecret"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"manualEntryCode"}}]}}]}}]} as unknown as DocumentNode<Generate2FaSecretMutation, Generate2FaSecretMutationVariables>;
export const Enable2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Enable2FA"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Enable2FAInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enable2FA"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"backupCodes"}}]}}]}}]} as unknown as DocumentNode<Enable2FaMutation, Enable2FaMutationVariables>;
export const Disable2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Disable2FA"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Disable2FAInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disable2FA"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<Disable2FaMutation, Disable2FaMutationVariables>;
export const Regenerate2FaBackupCodesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Regenerate2FABackupCodes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegenerateBackupCodesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regenerate2FABackupCodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backupCodes"}}]}}]}}]} as unknown as DocumentNode<Regenerate2FaBackupCodesMutation, Regenerate2FaBackupCodesMutationVariables>;
export const ProjectWorkLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectWorkLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectWorkLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectWorkLogsQuery, ProjectWorkLogsQueryVariables>;
export const MemberWorkLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberWorkLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberWorkLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<MemberWorkLogsQuery, MemberWorkLogsQueryVariables>;
export const WorkLogsByDateRangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkLogsByDateRange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workLogsByDateRange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<WorkLogsByDateRangeQuery, WorkLogsByDateRangeQueryVariables>;
export const CreateWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<CreateWorkLogMutation, CreateWorkLogMutationVariables>;
export const UpdateWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWorkLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateWorkLogMutation, UpdateWorkLogMutationVariables>;
export const DeleteWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkLogMutation, DeleteWorkLogMutationVariables>;
export const ExportProjectWorkLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportProjectWorkLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportProjectWorkLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<ExportProjectWorkLogsQuery, ExportProjectWorkLogsQueryVariables>;