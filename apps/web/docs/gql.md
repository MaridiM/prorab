**GraphQL / Apollo Configuration (web)**

- **Env vars**: `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_WEBSOCKET_URL`, `NEXT_PUBLIC_APP_URL`
- **Default dev endpoints**: `http://localhost:3001/graphql` (HTTP) and `ws://localhost:3001/graphql` (WS).

**Dependencies**
- `@apollo/client`
- `apollo-upload-client`
- `graphql`
- `graphql-ws`
- `@graphql-typed-document-node/core` (for typed DocumentNode)

**1) Apollo CLI config** (`configs/graphql/apollo.config.cjs`)
```js
require('dotenv/config');

const url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001/graphql';

module.exports = {
  client: {
    service: { name: 'prorab-graphql', url, skipSSLValidation: true },
    includes: ['src/**/*.{ts,tsx,gql,graphql}'],
    excludes: ['node_modules/**', 'src/**/__generated__/**'],
  },
};
```

**2) Apollo client config** (`src/lib/apollo/apollo-client.config.ts`)
- HTTP link with uploads via `UploadHttpLink`.
- Optional `GraphQLWsLink` for subscriptions in browser.
- ErrorLink logs GraphQL/network errors.
- `ssrMode: !isBrowser` for Next.js.

**3) Provider** (`src/lib/apollo/apollo-client.provider.tsx`)
```tsx
<ApolloProvider client={apolloClient}>{children}</ApolloProvider>
```

**4) Constants** (`src/constants/url.ts`)
```ts
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001/graphql';
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:3001/graphql';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
```

**5) Type declarations**
- `types/graphql.d.ts` for `.gql/.graphql` imports.
- `types/apollo.d.ts` for upload link module.

**6) Usage**
- `src/app/layout.tsx` wraps children with `ApolloClientProvider`.
- Ensure env vars are set when targeting non-local GraphQL endpoints.
