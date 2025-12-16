import { Args, Mutation, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { UseGuards, UnauthorizedException } from '@nestjs/common'
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal'

import { CurrentUser, CurrentUserData } from '../../shared/decorators/current-user.decorator'
import { AuthGuard } from '../../shared/guards/auth.guard'

import { User } from './models/user.model'
import { NotificationSettings } from './models/notification-settings.model'
import { UserStoragePreference, StorageProviderOption } from './models/user-storage.model'
import { UsersService } from './users.service'
import { UpdateProfileInput } from './dto/update-profile.input'
import { UpdateNotificationSettingsInput } from './dto/update-notification-settings.input'
import { DeleteAccountInput } from './dto/delete-account.input'
import { UpdateStoragePreferenceInput } from './dto/update-storage-preference.input'

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
	async deleteAccount(
		@CurrentUser() currentUser: CurrentUserData,
		@Args('input') input: DeleteAccountInput,
	): Promise<boolean> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		await this.usersService.deleteAccount(currentUser.id, input.password)
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

	@Mutation(() => User, {
		description: 'Загрузка аватара пользователя',
	})
	@UseGuards(AuthGuard)
	async uploadAvatar(
		@CurrentUser() currentUser: CurrentUserData,
		@Args({ name: 'file', type: () => GraphQLUpload }) file: Promise<FileUpload>,
	): Promise<User> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		const user = await this.usersService.uploadAvatar(currentUser.id, file)
		return user as unknown as User
	}

	@Mutation(() => User, {
		description: 'Удаление аватара пользователя',
	})
	@UseGuards(AuthGuard)
	async deleteAvatar(@CurrentUser() currentUser: CurrentUserData): Promise<User> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		const user = await this.usersService.deleteAvatar(currentUser.id)
		return user as unknown as User
	}

	@Mutation(() => User, {
		description: 'Отключение Telegram от аккаунта',
	})
	@UseGuards(AuthGuard)
	async disconnectTelegram(@CurrentUser() currentUser: CurrentUserData): Promise<User> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		const user = await this.usersService.disconnectTelegram(currentUser.id)
		return user as unknown as User
	}

	/**
	 * Get user's storage preference and available options
	 */
	@Query(() => UserStoragePreference, {
		description: 'Получить настройки хранилища пользователя',
	})
	@UseGuards(AuthGuard)
	async myStoragePreference(@CurrentUser() currentUser: CurrentUserData): Promise<UserStoragePreference> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		return this.usersService.getStoragePreference(currentUser.id)
	}

	/**
	 * Get available storage provider options for user
	 */
	@Query(() => [StorageProviderOption], {
		description: 'Получить доступные варианты хранилища',
	})
	@UseGuards(AuthGuard)
	async availableStorageProviders(@CurrentUser() currentUser: CurrentUserData): Promise<StorageProviderOption[]> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		return this.usersService.getAvailableStorageProviders(currentUser.id)
	}

	/**
	 * Update user's storage preference
	 */
	@Mutation(() => UserStoragePreference, {
		description: 'Обновить предпочтение хранилища пользователя',
	})
	@UseGuards(AuthGuard)
	async updateStoragePreference(
		@CurrentUser() currentUser: CurrentUserData,
		@Args('input') input: UpdateStoragePreferenceInput,
	): Promise<UserStoragePreference> {
		if (!currentUser?.id) {
			throw new UnauthorizedException('User not authenticated');
		}
		return this.usersService.updateStoragePreference(currentUser.id, input.provider)
	}
}

