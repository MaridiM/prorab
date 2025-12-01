import { Query, Resolver } from '@nestjs/graphql'

import { Public } from './shared/decorators/public.decorator'

@Resolver()
export class AppResolver {
	@Public()
	@Query(() => String, { description: 'Simple health check' })
	health(): string {
		return 'ok'
	}
}
