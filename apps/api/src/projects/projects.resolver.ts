import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { Project } from './models/project.model';
import { CreateProjectInput } from './dto/create-project.input';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [Project], { name: 'projects' })
  getProjects() {
    return this.projectsService.findAll();
  }

  @Mutation(() => Project)
  createProject(@Args('input') input: CreateProjectInput) {
    return this.projectsService.create(input);
  }
}
