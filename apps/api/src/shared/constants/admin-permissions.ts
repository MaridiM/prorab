/**
 * Admin Panel Permissions System
 *
 * Permission naming convention: RESOURCE_ACTION
 * - RESOURCE: The entity or feature (USER, TEAM, SETTINGS, etc.)
 * - ACTION: The operation (VIEW, CREATE, UPDATE, DELETE, MANAGE)
 */

export const AdminPermissions = {
  // ==================== USER MANAGEMENT ====================
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_IMPERSONATE: 'users:impersonate', // Login as user
  USERS_EXPORT: 'users:export',

  // ==================== TEAM MANAGEMENT ====================
  TEAMS_VIEW: 'teams:view',
  TEAMS_CREATE: 'teams:create',
  TEAMS_UPDATE: 'teams:update',
  TEAMS_DELETE: 'teams:delete',
  TEAMS_EXPORT: 'teams:export',

  // ==================== PROJECT MANAGEMENT ====================
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_UPDATE: 'projects:update',
  PROJECTS_MANAGE: 'projects:manage',
  PROJECTS_DELETE: 'projects:delete',
  PROJECTS_EXPORT: 'projects:export',

  // ==================== SUBSCRIPTION MANAGEMENT ====================
  SUBSCRIPTIONS_VIEW: 'subscriptions:view',
  SUBSCRIPTIONS_UPDATE: 'subscriptions:update',
  SUBSCRIPTIONS_CANCEL: 'subscriptions:cancel',
  SUBSCRIPTIONS_REFUND: 'subscriptions:refund',

  // ==================== PLAN MANAGEMENT ====================
  PLANS_VIEW: 'plans:view',
  PLANS_MANAGE: 'plans:manage', // Create, update, archive, delete plans

  // ==================== PAYMENT MANAGEMENT ====================
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_REFUND: 'payments:refund',
  PAYMENTS_EXPORT: 'payments:export',
  PAYMENT_PROVIDERS_VIEW: 'payment_providers:view',
  PAYMENT_PROVIDERS_MANAGE: 'payment_providers:manage', // Configure payment providers

  // ==================== SYSTEM SETTINGS ====================
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_PAYMENT: 'settings:payment', // Yookassa settings
  SETTINGS_EMAIL: 'settings:email', // Brevo settings
  SETTINGS_TELEGRAM: 'settings:telegram', // Telegram bot settings
  SETTINGS_STORAGE: 'settings:storage', // R2 storage settings
  SETTINGS_AI: 'settings:ai', // AI service settings
  SETTINGS_SECURITY: 'settings:security', // Security configurations

  // ==================== STORAGE MANAGEMENT ====================
  STORAGE_VIEW: 'storage:view',
  STORAGE_MANAGE: 'storage:manage',
  STORAGE_MIGRATE: 'storage:migrate',

  // ==================== ADMIN ROLE MANAGEMENT ====================
  ADMIN_ROLES_VIEW: 'admin_roles:view',
  ADMIN_ROLES_CREATE: 'admin_roles:create',
  ADMIN_ROLES_UPDATE: 'admin_roles:update',
  ADMIN_ROLES_DELETE: 'admin_roles:delete',

  // ==================== SUPPORT MANAGEMENT ====================
  SUPPORT_TICKETS_VIEW: 'support_tickets:view',
  SUPPORT_TICKETS_REPLY: 'support_tickets:reply',
  SUPPORT_TICKETS_MANAGE: 'support_tickets:manage',
  SUPPORT_TICKETS_CLOSE: 'support_tickets:close',
  SUPPORT_TICKETS_ASSIGN: 'support_tickets:assign',
  SUPPORT_TICKETS_DELETE: 'support_tickets:delete',
  SUPPORT_FAQ_MANAGE: 'support_faq:manage',

  // ==================== CONTENT MODERATION ====================
  CONTENT_VIEW: 'content:view',
  CONTENT_DELETE: 'content:delete',
  CONTENT_REPORTS_VIEW: 'content:reports:view',
  CONTENT_REPORTS_HANDLE: 'content:reports:handle',

  // ==================== ANALYTICS & LOGS ====================
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  LOGS_VIEW: 'logs:view',
  LOGS_EXPORT: 'logs:export',
  AUDIT_LOGS_VIEW: 'audit_logs:view',

  // ==================== SYSTEM OPERATIONS ====================
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_NOTIFICATIONS: 'system:notifications', // Send system-wide notifications
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
} as const;

export type AdminPermission = (typeof AdminPermissions)[keyof typeof AdminPermissions];

/**
 * Role-based permission presets
 */
export const RolePermissions = {
  SUPER_ADMIN: Object.values(AdminPermissions), // All permissions

  ADMIN: [
    // User Management
    AdminPermissions.USERS_VIEW,
    AdminPermissions.USERS_UPDATE,
    AdminPermissions.USERS_EXPORT,

    // Team Management
    AdminPermissions.TEAMS_VIEW,
    AdminPermissions.TEAMS_UPDATE,
    AdminPermissions.TEAMS_EXPORT,

    // Project Management
    AdminPermissions.PROJECTS_VIEW,
    AdminPermissions.PROJECTS_UPDATE,
    AdminPermissions.PROJECTS_MANAGE,
    AdminPermissions.PROJECTS_EXPORT,

    // Subscription Management
    AdminPermissions.SUBSCRIPTIONS_VIEW,
    AdminPermissions.SUBSCRIPTIONS_UPDATE,
    AdminPermissions.SUBSCRIPTIONS_CANCEL,

    // Plan Management
    AdminPermissions.PLANS_VIEW,
    AdminPermissions.PLANS_MANAGE,

    // Payment Management
    AdminPermissions.PAYMENTS_VIEW,
    AdminPermissions.PAYMENTS_EXPORT,
    AdminPermissions.PAYMENT_PROVIDERS_VIEW,
    AdminPermissions.PAYMENT_PROVIDERS_MANAGE,

    // System Settings (view only)
    AdminPermissions.SETTINGS_VIEW,

    // Storage Management
    AdminPermissions.STORAGE_VIEW,
    AdminPermissions.STORAGE_MANAGE,
    AdminPermissions.STORAGE_MIGRATE,

    // Support Management
    AdminPermissions.SUPPORT_TICKETS_VIEW,
    AdminPermissions.SUPPORT_TICKETS_REPLY,
    AdminPermissions.SUPPORT_TICKETS_MANAGE,
    AdminPermissions.SUPPORT_TICKETS_CLOSE,
    AdminPermissions.SUPPORT_TICKETS_ASSIGN,
    AdminPermissions.SUPPORT_TICKETS_DELETE,
    AdminPermissions.SUPPORT_FAQ_MANAGE,

    // Analytics
    AdminPermissions.ANALYTICS_VIEW,
    AdminPermissions.ANALYTICS_EXPORT,
    AdminPermissions.LOGS_VIEW,
    AdminPermissions.AUDIT_LOGS_VIEW,
  ],

  MODERATOR: [
    // User Management (limited)
    AdminPermissions.USERS_VIEW,

    // Team Management (limited)
    AdminPermissions.TEAMS_VIEW,

    // Project Management (limited)
    AdminPermissions.PROJECTS_VIEW,

    // Support Management
    AdminPermissions.SUPPORT_TICKETS_VIEW,
    AdminPermissions.SUPPORT_TICKETS_REPLY,
    AdminPermissions.SUPPORT_TICKETS_MANAGE,
    AdminPermissions.SUPPORT_TICKETS_CLOSE,
    AdminPermissions.SUPPORT_FAQ_MANAGE,

    // Content Moderation
    AdminPermissions.CONTENT_VIEW,
    AdminPermissions.CONTENT_DELETE,
    AdminPermissions.CONTENT_REPORTS_VIEW,
    AdminPermissions.CONTENT_REPORTS_HANDLE,

    // Analytics (limited)
    AdminPermissions.ANALYTICS_VIEW,
  ],

  SUPPORT: [
    // Support Management
    AdminPermissions.SUPPORT_TICKETS_VIEW,
    AdminPermissions.SUPPORT_TICKETS_REPLY,
    AdminPermissions.SUPPORT_TICKETS_MANAGE,
    AdminPermissions.SUPPORT_TICKETS_CLOSE,
    AdminPermissions.SUPPORT_FAQ_MANAGE,

    // User Management (view only)
    AdminPermissions.USERS_VIEW,

    // Analytics (limited)
    AdminPermissions.ANALYTICS_VIEW,
  ],
} as const;

/**
 * Check if a permission set includes a specific permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: AdminPermission
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a permission set includes all required permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: AdminPermission[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if a permission set includes any of the required permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: AdminPermission[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}
