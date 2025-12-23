/**
 * Team-Level Permissions
 * These permissions can be assigned to custom roles within a team
 */

export enum TeamPermissions {
  // ==================== PROJECT PERMISSIONS ====================
  PROJECTS_VIEW = 'projects.view', // View all team projects
  PROJECTS_CREATE = 'projects.create', // Create new projects
  PROJECTS_UPDATE = 'projects.update', // Update project details
  PROJECTS_DELETE = 'projects.delete', // Archive/delete projects
  PROJECTS_CLOSE = 'projects.close', // Close/complete projects
  PROJECTS_MANAGE_BUDGET = 'projects.manage_budget', // Update budget and financial info

  // ==================== MEMBER PERMISSIONS ====================
  MEMBERS_VIEW = 'members.view', // View team members
  MEMBERS_INVITE = 'members.invite', // Invite new members
  MEMBERS_REMOVE = 'members.remove', // Remove members from team
  MEMBERS_UPDATE_ROLE = 'members.update_role', // Assign/change member roles
  MEMBERS_VIEW_SALARY = 'members.view_salary', // View salary information
  MEMBERS_UPDATE_SALARY = 'members.update_salary', // Update member salaries

  // ==================== EXPENSE PERMISSIONS ====================
  EXPENSES_VIEW = 'expenses.view', // View project expenses
  EXPENSES_CREATE = 'expenses.create', // Add new expenses
  EXPENSES_UPDATE = 'expenses.update', // Edit existing expenses
  EXPENSES_DELETE = 'expenses.delete', // Delete expenses
  EXPENSES_APPROVE = 'expenses.approve', // Approve expense reports

  // ==================== WORK LOG PERMISSIONS ====================
  WORKLOGS_VIEW_ALL = 'worklogs.view_all', // View all work logs
  WORKLOGS_VIEW_OWN = 'worklogs.view_own', // View only own work logs
  WORKLOGS_CREATE = 'worklogs.create', // Create work log entries
  WORKLOGS_UPDATE_OWN = 'worklogs.update_own', // Update own work logs
  WORKLOGS_UPDATE_ALL = 'worklogs.update_all', // Update any work logs
  WORKLOGS_DELETE = 'worklogs.delete', // Delete work logs

  // ==================== PAYOUT PERMISSIONS ====================
  PAYOUTS_VIEW = 'payouts.view', // View payout information
  PAYOUTS_CALCULATE = 'payouts.calculate', // Calculate payouts
  PAYOUTS_APPROVE = 'payouts.approve', // Approve payout calculations
  PAYOUTS_MARK_PAID = 'payouts.mark_paid', // Mark payouts as paid
  PAYOUTS_EXPORT = 'payouts.export', // Export payout reports

  // ==================== TASK PERMISSIONS ====================
  TASKS_VIEW = 'tasks.view', // View tasks
  TASKS_CREATE = 'tasks.create', // Create new tasks
  TASKS_UPDATE = 'tasks.update', // Update task details
  TASKS_DELETE = 'tasks.delete', // Delete tasks
  TASKS_ASSIGN = 'tasks.assign', // Assign tasks to members
  TASKS_COMPLETE = 'tasks.complete', // Mark tasks as complete

  // ==================== PHOTO REPORT PERMISSIONS ====================
  REPORTS_VIEW = 'reports.view', // View photo reports
  REPORTS_CREATE = 'reports.create', // Create photo reports
  REPORTS_UPDATE = 'reports.update', // Update photo reports
  REPORTS_DELETE = 'reports.delete', // Delete photo reports
  REPORTS_PUBLISH = 'reports.publish', // Publish/unpublish reports

  // ==================== TEAM SETTINGS PERMISSIONS ====================
  TEAM_VIEW_SETTINGS = 'team.view_settings', // View team settings
  TEAM_UPDATE_SETTINGS = 'team.update_settings', // Update team settings
  TEAM_MANAGE_ROLES = 'team.manage_roles', // Create/edit custom roles
  TEAM_VIEW_ANALYTICS = 'team.view_analytics', // View team analytics
  TEAM_MANAGE_SUBSCRIPTION = 'team.manage_subscription', // Manage subscription
  TEAM_DELETE = 'team.delete', // Delete team

  // ==================== INVITE PERMISSIONS ====================
  INVITES_VIEW = 'invites.view', // View invite codes
  INVITES_CREATE = 'invites.create', // Create invite codes
  INVITES_DELETE = 'invites.delete', // Delete invite codes
}

/**
 * Permission Categories for UI grouping
 */
export const PERMISSION_CATEGORIES = {
  projects: {
    label: 'Проекты',
    description: 'Управление проектами и их настройками',
    icon: 'FolderKanban',
    permissions: [
      TeamPermissions.PROJECTS_VIEW,
      TeamPermissions.PROJECTS_CREATE,
      TeamPermissions.PROJECTS_UPDATE,
      TeamPermissions.PROJECTS_DELETE,
      TeamPermissions.PROJECTS_CLOSE,
      TeamPermissions.PROJECTS_MANAGE_BUDGET,
    ],
  },
  members: {
    label: 'Участники',
    description: 'Управление членами команды',
    icon: 'Users',
    permissions: [
      TeamPermissions.MEMBERS_VIEW,
      TeamPermissions.MEMBERS_INVITE,
      TeamPermissions.MEMBERS_REMOVE,
      TeamPermissions.MEMBERS_UPDATE_ROLE,
      TeamPermissions.MEMBERS_VIEW_SALARY,
      TeamPermissions.MEMBERS_UPDATE_SALARY,
    ],
  },
  expenses: {
    label: 'Расходы',
    description: 'Управление финансами и расходами',
    icon: 'DollarSign',
    permissions: [
      TeamPermissions.EXPENSES_VIEW,
      TeamPermissions.EXPENSES_CREATE,
      TeamPermissions.EXPENSES_UPDATE,
      TeamPermissions.EXPENSES_DELETE,
      TeamPermissions.EXPENSES_APPROVE,
    ],
  },
  worklogs: {
    label: 'Учёт времени',
    description: 'Учёт рабочего времени',
    icon: 'Clock',
    permissions: [
      TeamPermissions.WORKLOGS_VIEW_ALL,
      TeamPermissions.WORKLOGS_VIEW_OWN,
      TeamPermissions.WORKLOGS_CREATE,
      TeamPermissions.WORKLOGS_UPDATE_OWN,
      TeamPermissions.WORKLOGS_UPDATE_ALL,
      TeamPermissions.WORKLOGS_DELETE,
    ],
  },
  payouts: {
    label: 'Выплаты',
    description: 'Расчёт и управление выплатами',
    icon: 'Wallet',
    permissions: [
      TeamPermissions.PAYOUTS_VIEW,
      TeamPermissions.PAYOUTS_CALCULATE,
      TeamPermissions.PAYOUTS_APPROVE,
      TeamPermissions.PAYOUTS_MARK_PAID,
      TeamPermissions.PAYOUTS_EXPORT,
    ],
  },
  tasks: {
    label: 'Задачи',
    description: 'Управление задачами',
    icon: 'CheckSquare',
    permissions: [
      TeamPermissions.TASKS_VIEW,
      TeamPermissions.TASKS_CREATE,
      TeamPermissions.TASKS_UPDATE,
      TeamPermissions.TASKS_DELETE,
      TeamPermissions.TASKS_ASSIGN,
      TeamPermissions.TASKS_COMPLETE,
    ],
  },
  reports: {
    label: 'Фотоотчёты',
    description: 'Создание и публикация отчётов',
    icon: 'Camera',
    permissions: [
      TeamPermissions.REPORTS_VIEW,
      TeamPermissions.REPORTS_CREATE,
      TeamPermissions.REPORTS_UPDATE,
      TeamPermissions.REPORTS_DELETE,
      TeamPermissions.REPORTS_PUBLISH,
    ],
  },
  team: {
    label: 'Настройки команды',
    description: 'Управление командой и настройками',
    icon: 'Settings',
    permissions: [
      TeamPermissions.TEAM_VIEW_SETTINGS,
      TeamPermissions.TEAM_UPDATE_SETTINGS,
      TeamPermissions.TEAM_MANAGE_ROLES,
      TeamPermissions.TEAM_VIEW_ANALYTICS,
      TeamPermissions.TEAM_MANAGE_SUBSCRIPTION,
      TeamPermissions.TEAM_DELETE,
    ],
  },
  invites: {
    label: 'Приглашения',
    description: 'Управление приглашениями в команду',
    icon: 'Mail',
    permissions: [
      TeamPermissions.INVITES_VIEW,
      TeamPermissions.INVITES_CREATE,
      TeamPermissions.INVITES_DELETE,
    ],
  },
} as const

/**
 * Default permission sets for built-in roles
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: Object.values(TeamPermissions), // Full access
  MEMBER: [
    // Basic viewing permissions
    TeamPermissions.PROJECTS_VIEW,
    TeamPermissions.MEMBERS_VIEW,
    TeamPermissions.EXPENSES_VIEW,
    TeamPermissions.WORKLOGS_VIEW_OWN,
    TeamPermissions.WORKLOGS_CREATE,
    TeamPermissions.WORKLOGS_UPDATE_OWN,
    TeamPermissions.TASKS_VIEW,
    TeamPermissions.TASKS_UPDATE,
    TeamPermissions.TASKS_COMPLETE,
    TeamPermissions.REPORTS_VIEW,
    TeamPermissions.REPORTS_CREATE,
    TeamPermissions.TEAM_VIEW_SETTINGS,
  ],
} as const

/**
 * Permission descriptions for UI display
 */
export const PERMISSION_LABELS: Record<TeamPermissions, { name: string; description: string }> = {
  // Projects
  [TeamPermissions.PROJECTS_VIEW]: {
    name: 'Просмотр проектов',
    description: 'Просматривать все проекты команды',
  },
  [TeamPermissions.PROJECTS_CREATE]: {
    name: 'Создание проектов',
    description: 'Создавать новые проекты',
  },
  [TeamPermissions.PROJECTS_UPDATE]: {
    name: 'Редактирование проектов',
    description: 'Изменять детали проектов',
  },
  [TeamPermissions.PROJECTS_DELETE]: {
    name: 'Удаление проектов',
    description: 'Архивировать и удалять проекты',
  },
  [TeamPermissions.PROJECTS_CLOSE]: {
    name: 'Закрытие проектов',
    description: 'Завершать проекты и фиксировать прибыль',
  },
  [TeamPermissions.PROJECTS_MANAGE_BUDGET]: {
    name: 'Управление бюджетом',
    description: 'Изменять бюджет и финансовую информацию',
  },

  // Members
  [TeamPermissions.MEMBERS_VIEW]: {
    name: 'Просмотр участников',
    description: 'Просматривать список участников команды',
  },
  [TeamPermissions.MEMBERS_INVITE]: {
    name: 'Приглашение участников',
    description: 'Приглашать новых участников в команду',
  },
  [TeamPermissions.MEMBERS_REMOVE]: {
    name: 'Удаление участников',
    description: 'Удалять участников из команды',
  },
  [TeamPermissions.MEMBERS_UPDATE_ROLE]: {
    name: 'Изменение ролей',
    description: 'Назначать и изменять роли участников',
  },
  [TeamPermissions.MEMBERS_VIEW_SALARY]: {
    name: 'Просмотр зарплат',
    description: 'Просматривать информацию о зарплате участников',
  },
  [TeamPermissions.MEMBERS_UPDATE_SALARY]: {
    name: 'Изменение зарплат',
    description: 'Изменять зарплату участников',
  },

  // Expenses
  [TeamPermissions.EXPENSES_VIEW]: {
    name: 'Просмотр расходов',
    description: 'Просматривать расходы проектов',
  },
  [TeamPermissions.EXPENSES_CREATE]: {
    name: 'Добавление расходов',
    description: 'Создавать новые записи расходов',
  },
  [TeamPermissions.EXPENSES_UPDATE]: {
    name: 'Редактирование расходов',
    description: 'Изменять существующие расходы',
  },
  [TeamPermissions.EXPENSES_DELETE]: {
    name: 'Удаление расходов',
    description: 'Удалять записи расходов',
  },
  [TeamPermissions.EXPENSES_APPROVE]: {
    name: 'Утверждение расходов',
    description: 'Утверждать отчёты по расходам',
  },

  // Work Logs
  [TeamPermissions.WORKLOGS_VIEW_ALL]: {
    name: 'Просмотр всех рабочих часов',
    description: 'Просматривать рабочие часы всех участников',
  },
  [TeamPermissions.WORKLOGS_VIEW_OWN]: {
    name: 'Просмотр своих часов',
    description: 'Просматривать только свои рабочие часы',
  },
  [TeamPermissions.WORKLOGS_CREATE]: {
    name: 'Добавление часов',
    description: 'Создавать записи рабочего времени',
  },
  [TeamPermissions.WORKLOGS_UPDATE_OWN]: {
    name: 'Редактирование своих часов',
    description: 'Изменять только свои записи',
  },
  [TeamPermissions.WORKLOGS_UPDATE_ALL]: {
    name: 'Редактирование всех часов',
    description: 'Изменять записи всех участников',
  },
  [TeamPermissions.WORKLOGS_DELETE]: {
    name: 'Удаление часов',
    description: 'Удалять записи рабочего времени',
  },

  // Payouts
  [TeamPermissions.PAYOUTS_VIEW]: {
    name: 'Просмотр выплат',
    description: 'Просматривать информацию о выплатах',
  },
  [TeamPermissions.PAYOUTS_CALCULATE]: {
    name: 'Расчёт выплат',
    description: 'Рассчитывать выплаты участникам',
  },
  [TeamPermissions.PAYOUTS_APPROVE]: {
    name: 'Утверждение выплат',
    description: 'Утверждать рассчитанные выплаты',
  },
  [TeamPermissions.PAYOUTS_MARK_PAID]: {
    name: 'Отметка об оплате',
    description: 'Отмечать выплаты как выплаченные',
  },
  [TeamPermissions.PAYOUTS_EXPORT]: {
    name: 'Экспорт выплат',
    description: 'Экспортировать отчёты по выплатам',
  },

  // Tasks
  [TeamPermissions.TASKS_VIEW]: {
    name: 'Просмотр задач',
    description: 'Просматривать задачи проектов',
  },
  [TeamPermissions.TASKS_CREATE]: {
    name: 'Создание задач',
    description: 'Создавать новые задачи',
  },
  [TeamPermissions.TASKS_UPDATE]: {
    name: 'Редактирование задач',
    description: 'Изменять детали задач',
  },
  [TeamPermissions.TASKS_DELETE]: {
    name: 'Удаление задач',
    description: 'Удалять задачи',
  },
  [TeamPermissions.TASKS_ASSIGN]: {
    name: 'Назначение задач',
    description: 'Назначать задачи участникам',
  },
  [TeamPermissions.TASKS_COMPLETE]: {
    name: 'Завершение задач',
    description: 'Отмечать задачи как завершённые',
  },

  // Photo Reports
  [TeamPermissions.REPORTS_VIEW]: {
    name: 'Просмотр отчётов',
    description: 'Просматривать фотоотчёты',
  },
  [TeamPermissions.REPORTS_CREATE]: {
    name: 'Создание отчётов',
    description: 'Создавать новые фотоотчёты',
  },
  [TeamPermissions.REPORTS_UPDATE]: {
    name: 'Редактирование отчётов',
    description: 'Изменять фотоотчёты',
  },
  [TeamPermissions.REPORTS_DELETE]: {
    name: 'Удаление отчётов',
    description: 'Удалять фотоотчёты',
  },
  [TeamPermissions.REPORTS_PUBLISH]: {
    name: 'Публикация отчётов',
    description: 'Публиковать и снимать с публикации отчёты',
  },

  // Team
  [TeamPermissions.TEAM_VIEW_SETTINGS]: {
    name: 'Просмотр настроек',
    description: 'Просматривать настройки команды',
  },
  [TeamPermissions.TEAM_UPDATE_SETTINGS]: {
    name: 'Изменение настроек',
    description: 'Изменять настройки команды',
  },
  [TeamPermissions.TEAM_MANAGE_ROLES]: {
    name: 'Управление ролями',
    description: 'Создавать и редактировать пользовательские роли',
  },
  [TeamPermissions.TEAM_VIEW_ANALYTICS]: {
    name: 'Просмотр аналитики',
    description: 'Просматривать аналитику команды',
  },
  [TeamPermissions.TEAM_MANAGE_SUBSCRIPTION]: {
    name: 'Управление подпиской',
    description: 'Управлять подпиской команды',
  },
  [TeamPermissions.TEAM_DELETE]: {
    name: 'Удаление команды',
    description: 'Удалить команду полностью',
  },

  // Invites
  [TeamPermissions.INVITES_VIEW]: {
    name: 'Просмотр приглашений',
    description: 'Просматривать коды приглашений',
  },
  [TeamPermissions.INVITES_CREATE]: {
    name: 'Создание приглашений',
    description: 'Создавать новые коды приглашений',
  },
  [TeamPermissions.INVITES_DELETE]: {
    name: 'Удаление приглашений',
    description: 'Удалять коды приглашений',
  },
}

/**
 * Get all permissions as an array
 */
export const getAllPermissions = (): TeamPermissions[] => {
  return Object.values(TeamPermissions)
}

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = (category: keyof typeof PERMISSION_CATEGORIES): readonly TeamPermissions[] => {
  return PERMISSION_CATEGORIES[category].permissions
}

/**
 * Check if a permission set includes another permission set
 */
export const hasPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every((perm) => userPermissions.includes(perm))
}

/**
 * Merge permissions from parent role
 */
export const mergePermissions = (basePermissions: string[], parentPermissions: string[]): string[] => {
  const merged = new Set([...basePermissions, ...parentPermissions])
  return Array.from(merged)
}
