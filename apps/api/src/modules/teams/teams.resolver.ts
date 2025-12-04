import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import { OnboardingResult } from './models/onboarding-result.model';
import { Team } from './models/team.model';
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
    return this.teamsService.getMyTeams(user.id);
  }
}
