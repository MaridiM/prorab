import type { Request, Response } from 'express';
import { join } from 'path';

import { ApolloDriverConfig } from '@nestjs/apollo';
import { GqlModuleOptions } from '@nestjs/graphql';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export const graphqlConfig: ApolloDriverConfig | GqlModuleOptions = {
  autoSchemaFile: join(process.cwd(), 'schema.gql'),
  sortSchema: true,
  playground: false,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
};
