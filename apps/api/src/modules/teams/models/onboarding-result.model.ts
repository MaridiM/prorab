import { Field, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';
import { Project } from './project.model';
import { SubscriptionModel } from '../../subscriptions/models/subscription.model';

/**
 * Результат завершения онбординга
 */
@ObjectType()
export class OnboardingResult {
  @Field(() => Boolean, { description: 'Успешность операции' })
  success: boolean;

  @Field(() => Team, { description: 'Созданная команда' })
  team: Team;

  @Field(() => Project, { description: 'Созданный первый проект' })
  project: Project;

  @Field(() => SubscriptionModel, { nullable: true, description: 'Созданная подписка' })
  subscription?: SubscriptionModel;

  @Field(() => String, { description: 'Сообщение для пользователя' })
  message: string;

  @Field(() => String, { nullable: true, description: 'Ссылка на оплату (если требуется)' })
  paymentUrl?: string;
}
