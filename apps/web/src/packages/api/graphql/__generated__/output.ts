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
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
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

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: Scalars['Boolean']['output'];
  /** Завершение онбординга: создание команды и первого проекта */
  completeOnboarding: OnboardingResult;
  forgotPassword: Scalars['Boolean']['output'];
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  refreshSession: Maybe<AuthPayload>;
  register: AuthPayload;
  resendVerificationEmail: Scalars['Boolean']['output'];
  resetPassword: Scalars['Boolean']['output'];
  revokeAllSessions: Scalars['Boolean']['output'];
  revokeAllSessionsIncludingCurrent: Scalars['Boolean']['output'];
  revokeSession: Scalars['Boolean']['output'];
  verifyEmail: Scalars['Boolean']['output'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCompleteOnboardingArgs = {
  input: CompleteOnboardingInput;
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationRevokeSessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
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

export type Project = {
  __typename?: 'Project';
  /** Адрес объекта */
  address: Maybe<Scalars['String']['output']>;
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** ID создателя проекта */
  createdById: Scalars['ID']['output'];
  /** Описание проекта */
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Активен ли проект */
  isActive: Scalars['Boolean']['output'];
  /** Название проекта */
  name: Scalars['String']['output'];
  /** ID команды */
  teamId: Scalars['ID']['output'];
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Simple health check */
  health: Scalars['String']['output'];
  me: Maybe<User>;
  /** Получение всех команд, в которых состоит пользователь */
  myTeams: Array<Team>;
  sessions: Array<Session>;
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone: InputMaybe<Scalars['String']['input']>;
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

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  hasCompletedOnboarding: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', message: string | null, user: { __typename?: 'User', id: string, email: string, name: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, email: string, name: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshSessionMutation = { __typename?: 'Mutation', refreshSession: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: string, email: string, name: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean } } | null };

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

export type RevokeSessionMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;


export type RevokeSessionMutation = { __typename?: 'Mutation', revokeSession: boolean };

export type RevokeAllSessionsMutationVariables = Exact<{ [key: string]: never; }>;


export type RevokeAllSessionsMutation = { __typename?: 'Mutation', revokeAllSessions: boolean };

export type RevokeAllSessionsIncludingCurrentMutationVariables = Exact<{ [key: string]: never; }>;


export type RevokeAllSessionsIncludingCurrentMutation = { __typename?: 'Mutation', revokeAllSessionsIncludingCurrent: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, name: string | null, phone: string | null, emailVerified: boolean, hasCompletedOnboarding: boolean, createdAt: string } | null };

export type SessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type SessionsQuery = { __typename?: 'Query', sessions: Array<{ __typename?: 'Session', id: string, userAgent: string | null, ip: string | null, createdAt: string, current: boolean }> };

export type MyTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyTeamsQuery = { __typename?: 'Query', myTeams: Array<{ __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, ownerId: string, createdAt: string, updatedAt: string }> };

export type CompleteOnboardingMutationVariables = Exact<{
  input: CompleteOnboardingInput;
}>;


export type CompleteOnboardingMutation = { __typename?: 'Mutation', completeOnboarding: { __typename?: 'OnboardingResult', success: boolean, message: string, team: { __typename?: 'Team', id: string, name: string, logoType: LogoType, logoUrl: string | null, iconId: string | null, colorId: string | null, createdAt: string }, project: { __typename?: 'Project', id: string, name: string, address: string | null, description: string | null, isActive: boolean, createdAt: string } } };


export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}}]}}]}}]}}]} as unknown as DocumentNode<RefreshSessionMutation, RefreshSessionMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"}}]}}]} as unknown as DocumentNode<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const RevokeSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}]}]}}]} as unknown as DocumentNode<RevokeSessionMutation, RevokeSessionMutationVariables>;
export const RevokeAllSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAllSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAllSessions"}}]}}]} as unknown as DocumentNode<RevokeAllSessionsMutation, RevokeAllSessionsMutationVariables>;
export const RevokeAllSessionsIncludingCurrentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeAllSessionsIncludingCurrent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeAllSessionsIncludingCurrent"}}]}}]} as unknown as DocumentNode<RevokeAllSessionsIncludingCurrentMutation, RevokeAllSessionsIncludingCurrentMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"hasCompletedOnboarding"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const SessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}},{"kind":"Field","name":{"kind":"Name","value":"ip"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"current"}}]}}]}}]} as unknown as DocumentNode<SessionsQuery, SessionsQueryVariables>;
export const MyTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTeams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyTeamsQuery, MyTeamsQueryVariables>;
export const CompleteOnboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOnboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOnboardingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOnboarding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoType"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"iconId"}},{"kind":"Field","name":{"kind":"Name","value":"colorId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>;