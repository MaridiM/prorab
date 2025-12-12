import { Args, Mutation, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { UseGuards, UnauthorizedException } from '@nestjs/common'

import { CurrentUser, CurrentUserData } from '../../shared/decorators/current-user.decorator'
import { AuthGuard } from '../../shared/guards/auth.guard'

import { User } from './models/user.model'
import { NotificationSettings } from './models/notification-settings.model'
import { UsersService } from './users.service'
import { UpdateProfileInput } from './dto/update-profile.input'
import { UpdateNotificationSettingsInput } from './dto/update-notification-settings.input'

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Query(() => User, { nullable: true })
	@UseGuards(AuthGuard)
	async me(@CurrentUser() currentUser: CurrentUserData): Promise<User | null> {
		if (!currentUser?.id) {
			return null
		}
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
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		const user = await this.usersService.updateProfile(currentUser.id, input)
		return user as unknown as User
	}

	@Mutation(() => Boolean, {
		description: 'Удаление аккаунта пользователя',
	})
	@UseGuards(AuthGuard)
	async deleteAccount(@CurrentUser() currentUser: CurrentUserData): Promise<boolean> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		await this.usersService.deleteAccount(currentUser.id)
		return true
	}

	@Mutation(() => NotificationSettings)
	@UseGuards(AuthGuard)
	async updateNotificationSettings(
		@CurrentUser() currentUser: CurrentUserData,
		@Args('input') input: UpdateNotificationSettingsInput,
	) {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		return this.usersService.updateNotificationSettings(currentUser.id, input)
	}

	@ResolveField(() => NotificationSettings, { nullable: true })
	async notificationSettings(@Parent() user: User) {
		return this.usersService.getNotificationSettings(user.id)
	}
}

