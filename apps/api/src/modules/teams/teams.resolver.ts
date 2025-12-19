import { Args, ID, Int, Mutation, Query, Resolver, ResolveField } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { CreateInviteLinkInput } from './dto/create-invite-link.input';
import { JoinTeamByInviteInput } from './dto/join-team-by-invite.input';
import { UpdateMemberPositionInput } from './dto/update-member-position.input';
import { OnboardingResult } from './models/onboarding-result.model';
import { Team } from './models/team.model';
import { TeamMember } from './models/team-member.model';
import { InviteCode } from './models/invite-code.model';
import { PersonnelAnalytics } from './models/personnel-analytics.model';
import { TeamMemberSalaryHistory } from './models/salary-history.model';
import { TeamStats } from './models/team-stats.model';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

/**
 * GraphQL Resolver для работы с командами
 */
@Resolver(() => Team)
export class TeamsResolver {
  constructor(private teamsService: TeamsService) {}

  /**
   * Мутация: завершение онбординга
   * Создаёт команду, добавляет пользователя как владельца, создаёт первый проект
   */
  @Mutation(() => OnboardingResult, {
    description: 'Завершение онбординга: создание команды и первого проекта',
  })
  @UseGuards(AuthGuard)
  async completeOnboarding(
    @CurrentUser() user: { id: string },
    @Args('input') input: CompleteOnboardingInput,
  ): Promise<OnboardingResult> {
    return this.teamsService.completeOnboarding(user.id, input);
  }

  /**
   * Query: получение команд пользователя
   */
  @Query(() => [Team], {
    description: 'Получение всех команд, в которых состоит пользователь',
  })
  @UseGuards(AuthGuard)
  async myTeams(@CurrentUser() user: { id: string }): Promise<Team[]> {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.teamsService.getMyTeams(user.id);
  }

  /**
   * Query: получение команды по ID
   */
  @Query(() => Team, {
    description: 'Получение команды по ID',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async team(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Team | null> {
    return this.teamsService.getTeamById(id);
  }

  /**
   * Query: получение участников команды
   */
  @Query(() => [TeamMember], {
    description: 'Получение участников команды',
  })
  @UseGuards(AuthGuard)
  async teamMembers(
    @Args('teamId', { type: () => ID }) teamId: string,
    @CurrentUser() user: { id: string },
  ): Promise<TeamMember[]> {
    return this.teamsService.getTeamMembers(teamId, user.id);
  }

  /**
   * Query: получение агрегированной статистики команды
   */
  @Query(() => TeamStats, {
    description: 'Получение агрегированной статистики команды (расходы, бюджет, участники)',
  })
  @UseGuards(AuthGuard)
  async teamStats(
    @Args('teamId', { type: () => ID }) teamId: string,
    @CurrentUser() user: { id: string },
  ): Promise<TeamStats> {
    return this.teamsService.getTeamStats(teamId, user.id);
  }

  /**
   * Мутация: обновление команды (только для владельца)
   */
  @Mutation(() => Team, {
    description: 'Обновление настроек команды (только для владельца)',
  })
  @UseGuards(AuthGuard)
  async updateTeam(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateTeamInput,
  ): Promise<Team> {
    return this.teamsService.updateTeam(user.id, input);
  }

  /**
   * Мутация: удаление участника из команды (только для владельца)
   */
  @Mutation(() => Boolean, {
    description: 'Удаление участника из команды (только для владельца)',
  })
  @UseGuards(AuthGuard)
  async removeTeamMember(
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
    @CurrentUser() user: { id: string },
  ): Promise<boolean> {
    return this.teamsService.removeTeamMember(teamId, memberId, user.id);
  }

  /**
   * Мутация: создание ссылки-приглашения в команду
   */
  @Mutation(() => InviteCode, {
    description: 'Создание ссылки-приглашения в команду (только для владельца)',
  })
  @UseGuards(AuthGuard)
  async createInviteLink(
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('expiresInDays', { type: () => Int, nullable: true, defaultValue: 7 }) expiresInDays: number,
    @CurrentUser() user: { id: string },
  ): Promise<InviteCode> {
    return this.teamsService.createInviteLink(user.id, teamId, expiresInDays);
  }

  /**
   * Мутация: присоединение к команде по коду приглашения
   */
  @Mutation(() => TeamMember, {
    description: 'Присоединение к команде по коду приглашения',
  })
  @UseGuards(AuthGuard)
  async joinTeamByInvite(
    @Args('code') code: string,
    @CurrentUser() user: { id: string },
  ): Promise<TeamMember> {
    return this.teamsService.joinTeamByInvite(user.id, code);
  }

  /**
   * Query: получение кодов приглашения команды
   */
  @Query(() => [InviteCode], {
    description: 'Получение кодов приглашения команды (только для владельца)',
  })
  @UseGuards(AuthGuard)
  async teamInvites(
    @Args('teamId', { type: () => ID }) teamId: string,
    @CurrentUser() user: { id: string },
  ): Promise<InviteCode[]> {
    return this.teamsService.getTeamInvites(teamId, user.id);
  }

  /**
   * Мутация: удаление кода приглашения
   */
  @Mutation(() => Boolean, {
    description: 'Удаление кода приглашения (только для владельца)',
  })
  @UseGuards(AuthGuard)
  async deleteInviteCode(
    @Args('codeId', { type: () => ID }) codeId: string,
    @CurrentUser() user: { id: string },
  ): Promise<boolean> {
    return this.teamsService.deleteInviteCode(user.id, codeId);
  }

  // ==================== ANALYTICS ====================

  /**
   * Query: получить аналитику по персоналу команды
   * Только для владельца команды
   */
  @Query(() => PersonnelAnalytics, {
    description: 'Get personnel analytics for a team (owner only)',
  })
  @UseGuards(AuthGuard)
  async personnelAnalytics(
    @Args('teamId', { type: () => ID }) teamId: string,
    @CurrentUser() user: any,
  ): Promise<PersonnelAnalytics> {
    return this.teamsService.getPersonnelAnalytics(teamId, user.id);
  }

  @Query(() => [TeamMemberSalaryHistory], {
    description: 'Get salary change history for a team member (owner only)',
  })
  @UseGuards(AuthGuard)
  async memberSalaryHistory(
    @Args('memberId', { type: () => ID }) memberId: string,
    @CurrentUser() user: any,
  ): Promise<TeamMemberSalaryHistory[]> {
    return this.teamsService.getMemberSalaryHistory(memberId, user.id);
  }

  @Mutation(() => TeamMember, {
    description: 'Update team member position/specialization (owner only)',
  })
  @UseGuards(AuthGuard)
  async updateMemberPosition(
    @Args('input') input: UpdateMemberPositionInput,
    @CurrentUser() user: any,
  ): Promise<TeamMember> {
    return this.teamsService.updateMemberPosition(input.memberId, input.position, user.id);
  }

  // ==================== EXPORT ====================

  @Query(() => String, {
    description: 'Export personnel analytics to CSV (owner only)',
  })
  @UseGuards(AuthGuard)
  async exportPersonnelAnalytics(
    @Args('teamId', { type: () => ID }) teamId: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    return this.teamsService.exportPersonnelAnalyticsToCsv(teamId, user.id);
  }
}

/**
 * GraphQL Resolver для InviteCode (вычисляемые поля)
 */
@Resolver(() => InviteCode)
export class InviteCodeResolver {
  /**
   * Resolve поле isActive: проверяет, активен ли код (не использован и не истёк)
   */
  @ResolveField(() => Boolean)
  isActive(inviteCode: InviteCode): boolean {
    const now = new Date();
    // expiresAt может быть Date или строкой из Prisma
    const expiresAt = inviteCode.expiresAt instanceof Date 
      ? inviteCode.expiresAt 
      : new Date(inviteCode.expiresAt);
    return !inviteCode.usedBy && expiresAt > now;
  }

  /**
   * Resolve поле inviteUrl: возвращает полную ссылку приглашения
   */
  @ResolveField(() => String)
  inviteUrl(inviteCode: InviteCode): string {
    // URL будет формироваться на фронтенде с правильным хостом
    return `/invite/${inviteCode.code}`;
  }
}
