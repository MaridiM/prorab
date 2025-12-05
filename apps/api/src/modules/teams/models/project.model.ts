import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProjectStatus } from '../../projects/models/project-status.enum';

/**
 * GraphQL модель проекта
 */
@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { description: 'ID команды' })
  teamId: string;

  @Field(() => String, { description: 'Название проекта' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Адрес объекта' })
  address?: string;

  @Field(() => String, { nullable: true, description: 'Описание проекта' })
  description?: string;

  // Финансовые поля
  @Field(() => Float, { nullable: true, description: 'Бюджет проекта' })
  budget?: number;

  @Field(() => String, { nullable: true, description: 'Телефон клиента' })
  clientPhone?: string;

  // Даты
  @Field(() => Date, { nullable: true, description: 'Дата начала проекта' })
  startDate?: Date;

  @Field(() => Date, { nullable: true, description: 'Дата завершения проекта' })
  endDate?: Date;

  // Метаданные
  @Field(() => String, { nullable: true, description: 'URL фотографии проекта' })
  photoUrl?: string;

  @Field(() => Int, { description: 'Прогресс выполнения (0-100)' })
  progress: number;

  @Field(() => String, { nullable: true, description: 'Заметки о проекте' })
  notes?: string;

  @Field(() => ProjectStatus, { description: 'Статус проекта' })
  status: ProjectStatus;

  @Field(() => Date, { nullable: true, description: 'Дата архивации' })
  archivedAt?: Date;

  @Field(() => Date, { nullable: true, description: 'Дата завершения' })
  completedAt?: Date;

  @Field(() => ID, { description: 'ID создателя проекта' })
  createdById: string;

  @Field(() => Date, { description: 'Дата создания' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего обновления' })
  updatedAt: Date;
}
