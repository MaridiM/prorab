import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ChangeEmailResult {
	@Field(() => Boolean, { description: 'Успешно ли инициировано изменение email' })
	success: boolean

	@Field(() => Boolean, {
		description: 'Требуется ли подтверждение нового email (письмо отправлено)',
	})
	pendingVerification: boolean

	@Field(() => String, { description: 'Сообщение о результате операции' })
	message: string
}












