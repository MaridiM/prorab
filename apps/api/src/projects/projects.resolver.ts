import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CreateProjectInput } from './dto/create-project.input'
import { Project } from './models/project.model'
import { ProjectsService } from './projects.service'

@Resolver(() => Project)
export class ProjectsResolver {
	constructor(private readonly projectsService: ProjectsService) {}

	@Query(() => [Project], { name: 'projects' })
	getProjects() {
		return this.projectsService.findAll()
	}

	@Mutation(() => Project)
	createProject(@Args('input') input: CreateProjectInput) {
		return this.projectsService.create(input)
	}
}
