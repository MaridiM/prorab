import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectInput } from './dto/create-project.input';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProjectInput) {
    return this.prisma.project.create({ data });
  }

  findAll() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
