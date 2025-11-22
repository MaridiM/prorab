import { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001/graphql',
  documents: ['./src/modules/**/shared/api/graphql/**/*.{ts,tsx,graphql,gql}'],
  generates: {
    './src/packages/api/graphql/__generated__/output.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        avoidOptionals: true,
        useTypeImports: true,
        scalars: { DateTime: 'string', UUID: 'string' },
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
  ignoreNoDocuments: true,
};

export default config;
