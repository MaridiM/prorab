import type { Request, Response } from 'express'
import { join } from 'path'

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloDriverConfig } from '@nestjs/apollo'
import { GqlModuleOptions } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'

export const graphqlConfig: ApolloDriverConfig | GqlModuleOptions = {
	autoSchemaFile: join(process.cwd(), 'schema.gql'),
	sortSchema: true,
	playground: false,
	plugins: [ApolloServerPluginLandingPageLocalDefault()],
	context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
	csrfPrevention: false, // 👈 Required for graphql-upload to work without header issues
	resolvers: {
		JSON: GraphQLJSON,
	},
}
