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

export type AuthPayload = {
  __typename?: 'AuthPayload';
  message: Maybe<Scalars['String']['output']>;
  user: User;
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ChangePlanInput = {
  immediate: Scalars['Boolean']['input'];
  newPlan: Scalars['String']['input'];
  subscriptionId: Scalars['String']['input'];
};

export type CheckTelegramAuthInput = {
  token: Scalars['String']['input'];
};

export type CompleteOnboardingInput = {
  /** ID выбранного цвета (orange, blue, etc) */
  colorId: InputMaybe<Scalars['String']['input']>;
  /** ID выбранной иконки (hammer, wrench, etc) */
  iconId: InputMaybe<Scalars['String']['input']>;
  /** Загруженный файл логотипа */
  logoFile: InputMaybe<Scalars['Upload']['input']>;
  /** Адрес проекта (необязательно) */
  projectAddress: InputMaybe<Scalars['String']['input']>;
  /** Описание проекта (необязательно) */
  projectDescription: InputMaybe<Scalars['String']['input']>;
  /** Название первого проекта */
  projectName: Scalars['String']['input'];
  /** Название бригады */
  teamName: Scalars['String']['input'];
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

export type CreateSubscriptionInput = {
  plan: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
  useEarlyBird: InputMaybe<Scalars['Boolean']['input']>;
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
  projectsCount: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  salaryAmount: Maybe<Scalars['Float']['output']>;
  salaryType: Scalars['String']['output'];
  totalHoursWorked: Scalars['Float']['output'];
  totalPayouts: Scalars['Float']['output'];
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
  /** Архивировать проект */
  archiveProject: Project;
  cancelSubscription: Subscription;
  changePassword: Scalars['Boolean']['output'];
  changePlan: Subscription;
  checkTelegramAuth: TelegramAuthStatusPayload;
  /** Close project with final calculations (owner only) */
  closeProject: Project;
  /** Завершение онбординга: создание команды и первого проекта */
  completeOnboarding: OnboardingResult;
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
  /** Удалить задачу */
  deleteTask: Task;
  /** Delete a work log entry (owner or creator) */
  deleteWorkLog: Scalars['Boolean']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  initTelegramAuth: TelegramAuthPayload;
  initializePayment: PaymentUrl;
  /** Присоединение к команде по коду приглашения */
  joinTeamByInvite: TeamMember;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  /** Переместить задачу (drag & drop) */
  moveTask: Task;
  reactivateSubscription: Subscription;
  refreshSession: Maybe<AuthPayload>;
  register: AuthPayload;
  /** Удаление участника из команды (только для владельца) */
  removeTeamMember: Scalars['Boolean']['output'];
  /** Изменить порядок фотографий */
  reorderReportPhotos: Scalars['Boolean']['output'];
  resendVerificationEmail: Scalars['Boolean']['output'];
  resetPassword: Scalars['Boolean']['output'];
  /** Восстановить проект */
  restoreProject: Project;
  revokeAllSessions: Scalars['Boolean']['output'];
  revokeAllSessionsIncludingCurrent: Scalars['Boolean']['output'];
  revokeSession: Scalars['Boolean']['output'];
  /** Обновить расход */
  updateExpense: Expense;
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
  /** Обновить задачу */
  updateTask: Task;
  /** Обновление настроек команды (только для владельца) */
  updateTeam: Team;
  /** Update a work log entry (owner or creator) */
  updateWorkLog: WorkLog;
  /** Загрузка аватара пользователя */
  uploadAvatar: User;
  /** Загрузить фото в фотоотчёт (с обработкой) */
  uploadPhotoToReport: ReportPhoto;
  verifyEmail: Scalars['Boolean']['output'];
};


export type MutationAddPhotoToReportArgs = {
  input: AddPhotoInput;
};


export type MutationArchiveProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelSubscriptionArgs = {
  subscriptionId: Scalars['String']['input'];
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


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationCreateWorkLogArgs = {
  input: CreateWorkLogInput;
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


export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationInitializePaymentArgs = {
  subscriptionId: Scalars['String']['input'];
};


export type MutationJoinTeamByInviteArgs = {
  code: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMoveTaskArgs = {
  input: MoveTaskInput;
};


export type MutationReactivateSubscriptionArgs = {
  subscriptionId: Scalars['String']['input'];
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


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationRestoreProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRevokeSessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationUpdateExpenseArgs = {
  input: UpdateExpenseInput;
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


export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
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

export type NotificationSettings = {
  __typename?: 'NotificationSettings';
  appEmail: Scalars['Boolean']['output'];
  appPush: Scalars['Boolean']['output'];
  appSms: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  marketingEmail: Scalars['Boolean']['output'];
  marketingPush: Scalars['Boolean']['output'];
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
  maxActiveProjects: Maybe<Scalars['Float']['output']>;
  maxMembers: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  storageGB: Scalars['Float']['output'];
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
  availablePlans: Array<PlanLimits>;
  canAddProject: Scalars['Boolean']['output'];
  currentPlanLimits: PlanLimits;
  /** Получить расход по ID */
  expense: Expense;
  /** Получить расходы по категории */
  expensesByCategory: Array<Expense>;
  /** Получить все расходы проекта */
  expensesByProject: Array<Expense>;
  /** Simple health check */
  health: Scalars['String']['output'];
  me: Maybe<User>;
  /** Get all payouts for a team member (owner or member themselves) */
  memberPayouts: Array<ProjectPayout>;
  /** Получить задачи, назначенные участнику */
  memberTasks: Array<Task>;
  /** Get all work logs for a team member (owner or self) */
  memberWorkLogs: Array<WorkLog>;
  mySubscription: Maybe<Subscription>;
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
  sessions: Array<Session>;
  subscription: Subscription;
  /** Получить задачу по ID */
  task: Task;
  /** Получение команды по ID */
  team: Maybe<Team>;
  /** Получение кодов приглашения команды (только для владельца) */
  teamInvites: Array<InviteCode>;
  /** Получение участников команды */
  teamMembers: Array<TeamMember>;
  usageStats: UsageStats;
  /** Get work logs for a date range */
  workLogsByDateRange: Array<WorkLog>;
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


export type QueryMemberPayoutsArgs = {
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


export type QuerySubscriptionArgs = {
  id: Scalars['String']['input'];
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


export type QueryUsageStatsArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryWorkLogsByDateRangeArgs = {
  endDate: Scalars['DateTime']['input'];
  projectId: Scalars['ID']['input'];
  startDate: Scalars['DateTime']['input'];
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

export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type Session = {
  __typename?: 'Session';
  createdAt: Scalars['DateTime']['output'];
  current: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  ip: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
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
  status: SubscriptionStatus;
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

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  PastDue = 'PAST_DUE',
  Trialing = 'TRIALING'
}

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
  /** ID владельца команды */
  ownerId: Scalars['ID']['output'];
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
};

export type TeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['ID']['output'];
  /** Дата присоединения к команде */
  joinedAt: Scalars['DateTime']['output'];
  /** Роль в команде (owner/member) */
  role: Scalars['String']['output'];
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

export type UpdateMemberSalaryInput = {
  /** Team member ID */
  memberId: Scalars['ID']['input'];
  /** Salary amount (for fixed) or percentage (0-100) */
  salaryAmount: InputMaybe<Scalars['Float']['input']>;
  /** Salary type: fixed, percentage, none */
  salaryType: Scalars['String']['input'];
};

export type UpdateNotificationSettingsInput = {
  appEmail: InputMaybe<Scalars['Boolean']['input']>;
  appPush: InputMaybe<Scalars['Boolean']['input']>;
  appSms: InputMaybe<Scalars['Boolean']['input']>;
  marketingEmail: InputMaybe<Scalars['Boolean']['input']>;
  marketingPush: InputMaybe<Scalars['Boolean']['input']>;
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
  /** URL аватарки пользователя */
  avatarUrl: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  fullName: Scalars['String']['output'];
  hasCompletedOnboarding: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  notificationSettings: Maybe<NotificationSettings>;
  phone: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
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
  memberId: Scalars['ID']['output'];
  project: Maybe<Project>;
  projectId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MemberAnalyticsFieldsFragment = { __typename?: 'MemberAnalytics', memberId: string, memberName: string, memberEmail: string, avatarUrl: string | null, role: string, salaryType: string, salaryAmount: number | null, projectsCount: number, totalHoursWorked: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number, joinedAt: string };

export type ProjectAnalyticsFieldsFragment = { __typename?: 'ProjectAnalytics', projectId: string, projectName: string, budget: number | null, totalHoursWorked: number, totalPayouts: number, membersCount: number, status: string, startDate: string | null, endDate: string | null };

export type PersonnelAnalyticsFieldsFragment = { __typename?: 'PersonnelAnalytics', teamId: string, teamName: string, totalMembers: number, totalHoursWorked: number, totalPayouts: number, averageHoursPerMember: number, averagePayoutPerMember: number, generatedAt: string, members: Array<{ __typename?: 'MemberAnalytics', memberId: string, memberName: string, memberEmail: string, avatarUrl: string | null, role: string, salaryType: string, salaryAmount: number | null, projectsCount: number, totalHoursWorked: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number, joinedAt: string }>, projects: Array<{ __typename?: 'ProjectAnalytics', projectId: string, projectName: string, budget: number | null, totalHoursWorked: number, totalPayouts: number, membersCount: number, status: string, startDate: string | null, endDate: string | null }> };

export type PersonnelAnalyticsQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type PersonnelAnalyticsQuery = { __typename?: 'Query', personnelAnalytics: { __typename?: 'PersonnelAnalytics', teamId: string, teamName: string, totalMembers: number, totalHoursWorked: number, totalPayouts: number, averageHoursPerMember: number, averagePayoutPerMember: number, generatedAt: string, members: Array<{ __typename?: 'MemberAnalytics', memberId: string, memberName: string, memberEmail: string, avatarUrl: string | null, role: string, salaryType: string, salaryAmount: number | null, projectsCount: number, totalHoursWorked: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number, joinedAt: string }>, projects: Array<{ __typename?: 'ProjectAnalytics', projectId: string, projectName: string, budget: number | null, totalHoursWorked: number, totalPayouts: number, membersCount: number, status: string, startDate: string | null, endDate: string | null }> } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', message: string | null, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshSessionMutation = { __typename?: 'Mutation', refreshSession: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } } | null };

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

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null } };

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


export type CheckTelegramAuthMutation = { __typename?: 'Mutation', checkTelegramAuth: { __typename?: 'TelegramAuthStatusPayload', completed: boolean, sessionToken: string | null, refreshToken: string | null, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, avatarUrl: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, createdAt: string } | null };

export type SessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type SessionsQuery = { __typename?: 'Query', sessions: Array<{ __typename?: 'Session', id: string, userAgent: string | null, ip: string | null, createdAt: string, current: boolean }> };

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

export type ProjectPayoutFieldsFragment = { __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } };

export type MemberPayoutDetailFieldsFragment = { __typename?: 'MemberPayoutDetail', memberId: string, memberName: string, salaryType: string, salaryAmount: number | null, calculatedPayout: number, status: string };

export type PayoutSummaryFieldsFragment = { __typename?: 'PayoutSummary', projectId: string, projectName: string, budget: number, totalExpenses: number, netProfit: number, totalPayouts: number, ownerProfit: number, members: Array<{ __typename?: 'MemberPayoutDetail', memberId: string, memberName: string, salaryType: string, salaryAmount: number | null, calculatedPayout: number, status: string }> };

export type PayoutSummaryQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type PayoutSummaryQuery = { __typename?: 'Query', payoutSummary: { __typename?: 'PayoutSummary', projectId: string, projectName: string, budget: number, totalExpenses: number, netProfit: number, totalPayouts: number, ownerProfit: number, members: Array<{ __typename?: 'MemberPayoutDetail', memberId: string, memberName: string, salaryType: string, salaryAmount: number | null, calculatedPayout: number, status: string }> } };

export type ProjectPayoutsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectPayoutsQuery = { __typename?: 'Query', projectPayouts: Array<{ __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } }> };

export type MemberPayoutsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type MemberPayoutsQuery = { __typename?: 'Query', memberPayouts: Array<{ __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } }> };

export type UpdateMemberSalaryMutationVariables = Exact<{
  input: UpdateMemberSalaryInput;
}>;


export type UpdateMemberSalaryMutation = { __typename?: 'Mutation', updateMemberSalary: { __typename?: 'TeamMember', id: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } };

export type CreatePayoutMutationVariables = Exact<{
  input: CreatePayoutInput;
}>;


export type CreatePayoutMutation = { __typename?: 'Mutation', createPayout: { __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } } };

export type CloseProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type CloseProjectMutation = { __typename?: 'Mutation', closeProject: { __typename?: 'Project', id: string, status: ProjectStatus, closedAt: string | null, finalProfit: number | null } };

export type UpdatePayoutPaymentMutationVariables = Exact<{
  input: UpdatePayoutPaymentInput;
}>;


export type UpdatePayoutPaymentMutation = { __typename?: 'Mutation', updatePayoutPayment: { __typename?: 'ProjectPayout', id: string, projectId: string, memberId: string, calculatedAmount: number, actualAmount: number | null, status: string, paidAt: string | null, notes: string | null, paymentMethod: PaymentMethod | null, receiptUrl: string | null, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string }, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string } | null } } };

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

export type SubscriptionFieldsFragment = { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } };

export type PlanLimitsFieldsFragment = { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> };

export type PaymentFieldsFragment = { __typename?: 'Payment', id: string, subscriptionId: string, teamId: string, amount: number, currency: string, status: PaymentStatus, yookassaPaymentId: string, paymentMethod: string | null, description: string | null, failureReason: string | null, paidAt: string | null, refundedAt: string | null, createdAt: string, updatedAt: string };

export type MySubscriptionQueryVariables = Exact<{ [key: string]: never; }>;


export type MySubscriptionQuery = { __typename?: 'Query', mySubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } | null };

export type GetSubscriptionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetSubscriptionQuery = { __typename?: 'Query', subscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type AvailablePlansQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailablePlansQuery = { __typename?: 'Query', availablePlans: Array<{ __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> }> };

export type CurrentPlanLimitsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type CurrentPlanLimitsQuery = { __typename?: 'Query', currentPlanLimits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } };

export type UsageStatsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type UsageStatsQuery = { __typename?: 'Query', usageStats: { __typename?: 'UsageStats', activeProjects: number, totalMembers: number, storageUsedGB: number, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type CanAddProjectQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type CanAddProjectQuery = { __typename?: 'Query', canAddProject: boolean };

export type PaymentsBySubscriptionQueryVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type PaymentsBySubscriptionQuery = { __typename?: 'Query', paymentsBySubscription: Array<{ __typename?: 'Payment', id: string, subscriptionId: string, teamId: string, amount: number, currency: string, status: PaymentStatus, yookassaPaymentId: string, paymentMethod: string | null, description: string | null, failureReason: string | null, paidAt: string | null, refundedAt: string | null, createdAt: string, updatedAt: string }> };

export type CreateSubscriptionMutationVariables = Exact<{
  input: CreateSubscriptionInput;
}>;


export type CreateSubscriptionMutation = { __typename?: 'Mutation', createSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type ChangePlanMutationVariables = Exact<{
  input: ChangePlanInput;
}>;


export type ChangePlanMutation = { __typename?: 'Mutation', changePlan: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type CancelSubscriptionMutationVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type CancelSubscriptionMutation = { __typename?: 'Mutation', cancelSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type ReactivateSubscriptionMutationVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type ReactivateSubscriptionMutation = { __typename?: 'Mutation', reactivateSubscription: { __typename?: 'Subscription', id: string, teamId: string, plan: SubscriptionPlan, status: SubscriptionStatus, currentPeriodStart: string, currentPeriodEnd: string, trialEndsAt: string | null, cancelAtPeriodEnd: boolean, cancelledAt: string | null, isEarlyBird: boolean, createdAt: string, updatedAt: string, limits: { __typename?: 'PlanLimits', name: string, price: number, maxActiveProjects: number | null, maxMembers: number, storageGB: number, features: Array<string> } } };

export type InitializePaymentMutationVariables = Exact<{
  subscriptionId: Scalars['String']['input'];
}>;


export type InitializePaymentMutation = { __typename?: 'Mutation', initializePayment: { __typename?: 'PaymentUrl', url: string, paymentId: string } };

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


export type MyTeamsQuery = { __typename?: 'Query', myTeams: Array<{ __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, ownerId: string, createdAt: string, updatedAt: string }> };

export type TeamQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TeamQuery = { __typename?: 'Query', team: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, ownerId: string, createdAt: string, updatedAt: string } | null };

export type TeamMembersQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type TeamMembersQuery = { __typename?: 'Query', teamMembers: Array<{ __typename?: 'TeamMember', id: string, teamId: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, joinedAt: string, user: { __typename?: 'User', id: string, email: string, fullName: string, phone: string | null, avatarUrl: string | null } | null, stats: { __typename?: 'TeamMemberStats', projectCount: number, totalPayouts: number, averagePayoutPerProject: number, completedPayoutsCount: number, pendingPayoutsCount: number } | null }> };

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

export type JoinTeamByInviteMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type JoinTeamByInviteMutation = { __typename?: 'Mutation', joinTeamByInvite: { __typename?: 'TeamMember', id: string, teamId: string, userId: string, role: string, joinedAt: string, team: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null } | null } };

export type TeamInvitesQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
}>;


export type TeamInvitesQuery = { __typename?: 'Query', teamInvites: Array<{ __typename?: 'InviteCode', id: string, teamId: string, code: string, expiresAt: string, usedBy: string | null, usedAt: string | null, createdAt: string, isActive: boolean, inviteUrl: string }> };

export type DeleteInviteCodeMutationVariables = Exact<{
  codeId: Scalars['ID']['input'];
}>;


export type DeleteInviteCodeMutation = { __typename?: 'Mutation', deleteInviteCode: boolean };

export type WorkLogFieldsFragment = { __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null };

export type ProjectWorkLogsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectWorkLogsQuery = { __typename?: 'Query', projectWorkLogs: Array<{ __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null }> };

export type MemberWorkLogsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type MemberWorkLogsQuery = { __typename?: 'Query', memberWorkLogs: Array<{ __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null }> };

export type WorkLogsByDateRangeQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
}>;


export type WorkLogsByDateRangeQuery = { __typename?: 'Query', workLogsByDateRange: Array<{ __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null }> };

export type CreateWorkLogMutationVariables = Exact<{
  input: CreateWorkLogInput;
}>;


export type CreateWorkLogMutation = { __typename?: 'Mutation', createWorkLog: { __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null } };

export type UpdateWorkLogMutationVariables = Exact<{
  input: UpdateWorkLogInput;
}>;


export type UpdateWorkLogMutation = { __typename?: 'Mutation', updateWorkLog: { __typename?: 'WorkLog', id: string, projectId: string, memberId: string, date: string, hours: number, description: string | null, createdById: string, createdAt: string, updatedAt: string, project: { __typename?: 'Project', id: string, name: string } | null, member: { __typename?: 'TeamMember', id: string, userId: string, role: string, salaryType: string, salaryAmount: number | null, user: { __typename?: 'User', id: string, fullName: string, email: string, avatarUrl: string | null } | null } | null } };

export type DeleteWorkLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWorkLogMutation = { __typename?: 'Mutation', deleteWorkLog: boolean };

export const MemberAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}}]} as unknown as DocumentNode<MemberAnalyticsFieldsFragment, unknown>;
export const ProjectAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}}]} as unknown as DocumentNode<ProjectAnalyticsFieldsFragment, unknown>;
export const PersonnelAnalyticsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonnelAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PersonnelAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averageHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberAnalyticsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectAnalyticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}}]} as unknown as DocumentNode<PersonnelAnalyticsFieldsFragment, unknown>;
export const ProjectPayoutFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectPayoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectPayout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"receiptUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectPayoutFieldsFragment, unknown>;
export const MemberPayoutDetailFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberPayoutDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberPayoutDetail"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedPayout"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<MemberPayoutDetailFieldsFragment, unknown>;
export const PayoutSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PayoutSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayoutSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpenses"}},{"kind":"Field","name":{"kind":"Name","value":"netProfit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"ownerProfit"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberPayoutDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberPayoutDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberPayoutDetail"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"calculatedPayout"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<PayoutSummaryFieldsFragment, unknown>;
export const PhotoReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]} as unknown as DocumentNode<PhotoReportFieldsFragment, unknown>;
export const PublicPhotoReportFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PublicPhotoReportFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicPhotoReport"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coverPhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<PublicPhotoReportFieldsFragment, unknown>;
export const ReportPhotoFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReportPhotoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReportPhoto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ReportPhotoFieldsFragment, unknown>;
export const SubscriptionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SubscriptionFieldsFragment, unknown>;
export const PlanLimitsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<PlanLimitsFieldsFragment, unknown>;
export const PaymentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"failureReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"refundedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PaymentFieldsFragment, unknown>;
export const TaskFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<TaskFieldsFragment, unknown>;
export const WorkLogFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<WorkLogFieldsFragment, unknown>;
export const PersonnelAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PersonnelAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personnelAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonnelAnalyticsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"memberName"}},{"kind":"Field","name":{"kind":"Name","value":"memberEmail"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"projectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"membersCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonnelAnalyticsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PersonnelAnalytics"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalHoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averageHoursPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerMember"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberAnalyticsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectAnalyticsFields"}}]}}]}}]} as unknown as DocumentNode<PersonnelAnalyticsQuery, PersonnelAnalyticsQueryVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}}]}}]}}]} as unknown as DocumentNode<RefreshSessionMutation, RefreshSessionMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"}}]}}]} as unknown as DocumentNode<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const RevokeSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}]}]}}]} as unknown as DocumentNode<RevokeSessionMutation, RevokeSessionMutationVariables>;
export const RevokeAllSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAllSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAllSessions"}}]}}]} as unknown as DocumentNode<RevokeAllSessionsMutation, RevokeAllSessionsMutationVariables>;
export const RevokeAllSessionsIncludingCurrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAllSessionsIncludingCurrent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAllSessionsIncludingCurrent"}}]}}]} as unknown as DocumentNode<RevokeAllSessionsIncludingCurrentMutation, RevokeAllSessionsIncludingCurrentMutationVariables>;
export const InitTelegramAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitTelegramAuth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initTelegramAuth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"deepLink"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}}]}}]} as unknown as DocumentNode<InitTelegramAuthMutation, InitTelegramAuthMutationVariables>;
export const CheckTelegramAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckTelegramAuth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckTelegramAuthInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkTelegramAuth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sessionToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<CheckTelegramAuthMutation, CheckTelegramAuthMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const SessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"ip"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"current"}}]}}]}}]} as unknown as DocumentNode<SessionsQuery, SessionsQueryVariables>;
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
export const MySubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MySubscriptionQuery, MySubscriptionQueryVariables>;
export const GetSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetSubscriptionQuery, GetSubscriptionQueryVariables>;
export const AvailablePlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailablePlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availablePlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanLimitsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<AvailablePlansQuery, AvailablePlansQueryVariables>;
export const CurrentPlanLimitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentPlanLimits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPlanLimits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanLimitsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<CurrentPlanLimitsQuery, CurrentPlanLimitsQueryVariables>;
export const UsageStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsageStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usageStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageUsedGB"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanLimitsFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanLimitsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlanLimits"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}}]} as unknown as DocumentNode<UsageStatsQuery, UsageStatsQueryVariables>;
export const CanAddProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanAddProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canAddProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}]}]}}]} as unknown as DocumentNode<CanAddProjectQuery, CanAddProjectQueryVariables>;
export const PaymentsBySubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaymentsBySubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentsBySubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"yookassaPaymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"failureReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"refundedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PaymentsBySubscriptionQuery, PaymentsBySubscriptionQueryVariables>;
export const CreateSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateSubscriptionMutation, CreateSubscriptionMutationVariables>;
export const ChangePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ChangePlanMutation, ChangePlanMutationVariables>;
export const CancelSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CancelSubscriptionMutation, CancelSubscriptionMutationVariables>;
export const ReactivateSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReactivateSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reactivateSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Subscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyBird"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"maxActiveProjects"}},{"kind":"Field","name":{"kind":"Name","value":"maxMembers"}},{"kind":"Field","name":{"kind":"Name","value":"storageGB"}},{"kind":"Field","name":{"kind":"Name","value":"features"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ReactivateSubscriptionMutation, ReactivateSubscriptionMutationVariables>;
export const InitializePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitializePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initializePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}}]}}]}}]} as unknown as DocumentNode<InitializePaymentMutation, InitializePaymentMutationVariables>;
export const TaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Task"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"task"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<TaskQuery, TaskQueryVariables>;
export const ProjectTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"todo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"done"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<ProjectTasksQuery, ProjectTasksQueryVariables>;
export const MemberTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assigneeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assigneeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assigneeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MemberTasksQuery, MemberTasksQueryVariables>;
export const MyTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MyTasksQuery, MyTasksQueryVariables>;
export const CreateTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export const UpdateTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<UpdateTaskMutation, UpdateTaskMutationVariables>;
export const MoveTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MoveTaskMutation, MoveTaskMutationVariables>;
export const DeleteTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeId"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"checklist"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<DeleteTaskMutation, DeleteTaskMutationVariables>;
export const MyTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyTeamsQuery, MyTeamsQueryVariables>;
export const TeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Team"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<TeamQuery, TeamQueryVariables>;
export const TeamMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPayouts"}},{"kind":"Field","name":{"kind":"Name","value":"averagePayoutPerProject"}},{"kind":"Field","name":{"kind":"Name","value":"completedPayoutsCount"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPayoutsCount"}}]}}]}}]}}]} as unknown as DocumentNode<TeamMembersQuery, TeamMembersQueryVariables>;
export const CompleteOnboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOnboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOnboardingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOnboarding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>;
export const UpdateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const RemoveTeamMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTeamMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTeamMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}]}]}}]} as unknown as DocumentNode<RemoveTeamMemberMutation, RemoveTeamMemberMutationVariables>;
export const CreateInviteLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInviteLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInviteLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expiresInDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expiresInDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"inviteUrl"}}]}}]}}]} as unknown as DocumentNode<CreateInviteLinkMutation, CreateInviteLinkMutationVariables>;
export const JoinTeamByInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinTeamByInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinTeamByInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}}]}}]}}]}}]} as unknown as DocumentNode<JoinTeamByInviteMutation, JoinTeamByInviteMutationVariables>;
export const TeamInvitesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamInvites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamInvites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"}},{"kind":"Field","name":{"kind":"Name","value":"usedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"inviteUrl"}}]}}]}}]} as unknown as DocumentNode<TeamInvitesQuery, TeamInvitesQueryVariables>;
export const DeleteInviteCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteInviteCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"codeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInviteCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"codeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"codeId"}}}]}]}}]} as unknown as DocumentNode<DeleteInviteCodeMutation, DeleteInviteCodeMutationVariables>;
export const ProjectWorkLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectWorkLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectWorkLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectWorkLogsQuery, ProjectWorkLogsQueryVariables>;
export const MemberWorkLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberWorkLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memberWorkLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<MemberWorkLogsQuery, MemberWorkLogsQueryVariables>;
export const WorkLogsByDateRangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkLogsByDateRange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workLogsByDateRange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<WorkLogsByDateRangeQuery, WorkLogsByDateRangeQueryVariables>;
export const CreateWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<CreateWorkLogMutation, CreateWorkLogMutationVariables>;
export const UpdateWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWorkLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkLogFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkLogFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"salaryType"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateWorkLogMutation, UpdateWorkLogMutationVariables>;
export const DeleteWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkLogMutation, DeleteWorkLogMutationVariables>;