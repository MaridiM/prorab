import { Query, Resolver } from '@nestjs/graphql'

import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator'

import { User } from './models/user.model'
import { UsersService } from './users.service'

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Query(() => User, { nullable: true })
	async me(@CurrentUser() currentUser: CurrentUserData): Promise<User | null> {
		return this.usersService.findById(currentUser.id)
	}
}

