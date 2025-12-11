import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { CreateInviteLinkInput } from './dto/create-invite-link.input';
import { JoinTeamByInviteInput } from './dto/join-team-by-invite.input';
import { OnboardingResult } from './models/onboarding-result.model';
import { Team } from './models/team.model';
import { TeamMember } from './models/team-member.model';
import { InviteCode } from './models/invite-code.model';
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
}
