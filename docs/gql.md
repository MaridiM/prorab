**GraphQL / Apollo Configuration**

Ниже собрана вся конфигурация и исходники, которые обеспечивают подключение и выполнение запросов к GraphQL-серверу в проекте.

- **Env vars**: `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_WEBSOCKET_URL`, `NEXT_PUBLIC_APP_URL`
- **Важно**: серверная схема/URL подтягиваются из `process.env.NEXT_PUBLIC_SERVER_URL`.

**Dependencies (важные для GraphQL/Apollo)**
- `@apollo/client`
- `apollo-upload-client`
- `graphql`
- `graphql-ws`
- `@graphql-codegen/*` (codegen)

**1) Codegen конфигурация** (`configs/graphql/graphql.config.ts`)

```ts
import { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'

const config: CodegenConfig = {
    schema: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:8000/graphql',
    // your documents
    documents: ['./src/modules/**/shared/api/graphql/**/*.{ts,tsx,graphql,gql}'],
    generates: {
        './src/packages/api/graphql/__generated__/output.ts': {
            // plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo']
            plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
            config: {
                avoidOptionals: true,
                useTypeImports: true,
                scalars: { DateTime: 'string', UUID: 'string' }
            }
        }
    },
    hooks: {
        afterAllFileWrite: ['prettier --write']
    },
    ignoreNoDocuments: true
}

export default config

```

Этот файл используется в `package.json` скрипте `codegen`:
```json
"codegen": "graphql-codegen --config ./configs/graphql/graphql.config.ts"
```

**2) Apollo CLI (Apollo client) конфигурация** (`configs/graphql/apollo.config.cjs`)

```js
require('dotenv/config');

const url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000/graphql';

module.exports = {
  client: {
    service: {
      name: 'doctro-lab-graphql',
      url,
      skipSSLValidation: true
    },
    includes: ['src/**/*.{ts,tsx,gql,graphql}'],
    excludes: [
      'node_modules/**',
      'src/packages/api/graphql/__generated__/**',
      'src/packages/api/graphql/_generated_/**'
    ]
  }
};
```

**3) Apollo клиент и ссылки** (`src/packages/libs/apollo/apollo-client.config.ts`)

```ts
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'
import { createClient as createWsClient } from 'graphql-ws'

import { SERVER_URL, WEBSOCKET_URL } from '@/packages/constants'

const isBrowser = typeof window !== 'undefined'

/** HTTP link with upload (multipart) support */
const httpUploadLink = new UploadHttpLink({
    uri: SERVER_URL,
    credentials: 'include',
    headers: {
        'apollo-require-preflight': 'true'
    },
    fetchOptions: {
        credentials: 'include'
    }
}) as unknown as ApolloLink

/** WS link (browser only). On the server — null. */
const wsLink = isBrowser
    ? new GraphQLWsLink(
          createWsClient({
              url: WEBSOCKET_URL,
              // pass token/cookies if needed:
              // connectionParams: async () => ({ authorization: `Bearer ${token}` }),
              lazy: true,
              retryAttempts: 10,
              shouldRetry: () => true
          })
      )
    : null

/** Use WS for subscriptions, otherwise rely on HTTP only */
const link: ApolloLink = wsLink
    ? ApolloLink.split(
          ({ query }) => {
              const def = getMainDefinition(query)
              return def.kind === 'OperationDefinition' && def.operation === 'subscription'
          },
          wsLink,
          httpUploadLink
      )
    : httpUploadLink

const errorLink = new ErrorLink(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
        error.errors.forEach(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        )
    } else if (CombinedProtocolErrors.is(error)) {
        error.errors.forEach(({ message, extensions }) =>
            console.log(`[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`)
        )
    } else {
        console.error(`[Network error]: ${error}`)
    }
})
export const client = new ApolloClient({
    ssrMode: !isBrowser, // important for Next
    link: ApolloLink.from([errorLink, link]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: { errorPolicy: 'all' },
        query: { errorPolicy: 'all' },
        mutate: { errorPolicy: 'all' } // do not throw; errors are returned in result.errors
    }
})
```

Ключевые моменты:
- `UploadHttpLink` — поддержка multipart загрузок (файлы).
- `GraphQLWsLink` — websocket для подписок (используется только в браузере).
- `ssrMode: !isBrowser` — отключает поведение клиента на сервере (Next.js).

**4) Apollo Provider** (`src/packages/libs/apollo/apollo-client.provider.tsx`)

```tsx
'use client'

import { ApolloProvider } from '@apollo/client/react'
import type { PropsWithChildren } from 'react'

import { client } from './apollo-client.config'

export function ApolloClientProvider({ children }: PropsWithChildren<unknown>) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>
}
```

`ApolloClientProvider` подключается в корневом layout: `src/app/layout.tsx`.

**5) Константы URL** (`src/packages/constants/url.constants.ts`)

```ts
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL as string
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL as string
```

**6) Типы/декларации модулей**

- `types/graphql.d.ts` — декларации для импорта `.graphql`/`.gql` файлов:

```ts
declare module '*.graphql' {
    import type { DocumentNode } from 'graphql'
    const document: DocumentNode
    export default document
}

declare module '*.gql' {
    import type { DocumentNode } from 'graphql'
    const document: DocumentNode
    export default document
}
```

- `types/apollo.d.ts` — декларация модуля для upload link:

```ts
declare module 'apollo-upload-client/UploadHttpLink.mjs'
```

**7) Сгенерированные типы GraphQL**

Codegen пишет результат в `./src/packages/api/graphql/__generated__/output.ts` (файл уже присутствует). Этот файл содержит полные типы операций и схемы (generated TypeScript + typed-document-node).

**8) Где используется провайдер**

`src/app/layout.tsx` оборачивает приложение в `ApolloClientProvider`:

```tsx
<ApolloClientProvider>
  <NextIntlClientProvider messages={messages}>
    <ThemeProvider ...>
      <main>{children}</main>
    </ThemeProvider>
  </NextIntlClientProvider>
</ApolloClientProvider>
```

**9) Советы по локальной разработке**
- Убедитесь, что в `.env` или окружении установлены `NEXT_PUBLIC_SERVER_URL` и `NEXT_PUBLIC_WEBSOCKET_URL`.
- Запуск генерации типов: `npm run codegen` (в `package.json` — `graphql-codegen --config ./configs/graphql/graphql.config.ts`).

---
Файлы взяты из репозитория и приведены максимально полно с сохранением исходного содержания конфигурации. Если хотите, могу вставить также сам сгенерированный `output.ts` или подготовить краткую справку по использованию запросов и codegen в CI.
