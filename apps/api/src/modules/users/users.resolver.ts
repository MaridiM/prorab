import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'

import { CurrentUser, CurrentUserData } from '../../shared/decorators/current-user.decorator'
import { AuthGuard } from '../../shared/guards/auth.guard'

import { User } from './models/user.model'
import { UsersService } from './users.service'
import { UpdateProfileInput } from './dto/update-profile.input'

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Query(() => User, { nullable: true })
	async me(@CurrentUser() currentUser: CurrentUserData): Promise<User | null> {
		const user = await this.usersService.findById(currentUser.id)
		return user as unknown as User | null
	}

	@Mutation(() => User, {
		description: 'Обновление профиля пользователя',
	})
	@UseGuards(AuthGuard)
	async updateProfile(
		@CurrentUser() currentUser: CurrentUserData,
		@Args('input') input: UpdateProfileInput,
	): Promise<User> {
		const user = await this.usersService.updateProfile(currentUser.id, input)
		return user as unknown as User
	}
}

