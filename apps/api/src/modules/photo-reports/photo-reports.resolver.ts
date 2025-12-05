import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PhotoReportsService } from './photo-reports.service';
import { PhotoReport } from './models/photo-report.model';
import { ReportPhoto } from './models/report-photo.model';
import { CreatePhotoReportInput } from './dto/create-photo-report.input';
import { UpdatePhotoReportInput } from './dto/update-photo-report.input';
import { AddPhotoInput } from './dto/add-photo.input';
import { UploadPhotoInput } from './dto/upload-photo.input';

@Resolver(() => PhotoReport)
export class PhotoReportsResolver {
  constructor(private readonly photoReportsService: PhotoReportsService) {}

  @Mutation(() => PhotoReport, { description: 'Создать новый фотоотчёт' })
  @UseGuards(AuthGuard)
  async createPhotoReport(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreatePhotoReportInput,
  ) {
    return this.photoReportsService.createPhotoReport(user.id, input);
  }

  @Mutation(() => PhotoReport, { description: 'Обновить фотоотчёт' })
  @UseGuards(AuthGuard)
  async updatePhotoReport(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdatePhotoReportInput,
  ) {
    return this.photoReportsService.updatePhotoReport(user.id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить фотоотчёт' })
  @UseGuards(AuthGuard)
  async deletePhotoReport(
    @CurrentUser() user: { id: string },
    @Args('id') id: string,
  ) {
    return this.photoReportsService.deletePhotoReport(user.id, id);
  }

  @Query(() => [PhotoReport], { description: 'Получить все фотоотчёты проекта' })
  @UseGuards(AuthGuard)
  async projectPhotoReports(
    @CurrentUser() user: { id: string },
    @Args('projectId') projectId: string,
  ) {
    return this.photoReportsService.getProjectPhotoReports(user.id, projectId);
  }

  @Query(() => PhotoReport, { description: 'Получить фотоотчёт по ID' })
  @UseGuards(AuthGuard)
  async photoReport(
    @CurrentUser() user: { id: string },
    @Args('id') id: string,
  ) {
    return this.photoReportsService.getPhotoReportById(user.id, id);
  }

  @Mutation(() => ReportPhoto, { description: 'Добавить фото к фотоотчёту' })
  @UseGuards(AuthGuard)
  async addPhotoToReport(
    @CurrentUser() user: { id: string },
    @Args('input') input: AddPhotoInput,
  ) {
    return this.photoReportsService.addPhoto(user.id, input);
  }

  @Mutation(() => ReportPhoto, { description: 'Загрузить фото в фотоотчёт (с обработкой)' })
  @UseGuards(AuthGuard)
  async uploadPhotoToReport(
    @CurrentUser() user: { id: string },
    @Args('input') input: UploadPhotoInput,
  ) {
    return this.photoReportsService.uploadPhotoToReport(user.id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить фото из фотоотчёта' })
  @UseGuards(AuthGuard)
  async deletePhotoFromReport(
    @CurrentUser() user: { id: string },
    @Args('photoId') photoId: string,
  ) {
    return this.photoReportsService.deletePhoto(user.id, photoId);
  }
}
