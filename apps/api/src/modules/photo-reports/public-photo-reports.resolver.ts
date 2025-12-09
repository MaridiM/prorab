import { Args, Query, Resolver } from '@nestjs/graphql';
import { PhotoReportsService } from './photo-reports.service';
import { PublicPhotoReport } from './models/photo-report.model';
import { Public } from '../../shared/decorators/public.decorator';

@Resolver(() => PublicPhotoReport)
export class PublicPhotoReportsResolver {
  constructor(private readonly photoReportsService: PhotoReportsService) {}

  @Public()
  @Query(() => PublicPhotoReport, {
    description: 'Публичный эндпоинт: получить фотоотчёт по slug (без аутентификации)'
  })
  async publicPhotoReport(@Args('slug') slug: string) {
    return this.photoReportsService.getPublicPhotoReportBySlug(slug);
  }
}
