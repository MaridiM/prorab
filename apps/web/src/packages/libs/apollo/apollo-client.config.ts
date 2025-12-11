import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { createClient as createWsClient } from 'graphql-ws';

import { SERVER_URL, WEBSOCKET_URL } from '@/packages/constants/url';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client';

const isBrowser = typeof window !== 'undefined';

// Log GraphQL endpoint URLs in development
if (isBrowser && process.env.NODE_ENV === 'development') {
  console.log('[Apollo Client] GraphQL Server URL:', SERVER_URL);
  if (WEBSOCKET_URL) {
    console.log('[Apollo Client] WebSocket URL:', WEBSOCKET_URL);
  }
}

/** HTTP link with upload (multipart) support */
const httpUploadLink = new UploadHttpLink({
  uri: SERVER_URL,
  credentials: 'include',
  headers: {
    'apollo-require-preflight': 'true',
  },
  fetchOptions: {
    credentials: 'include',
  },
}) as unknown as ApolloLink;

/** WS link (browser only). On the server — null. */
const wsLink = isBrowser && WEBSOCKET_URL
  ? new GraphQLWsLink(
      createWsClient({
        url: WEBSOCKET_URL,
        // pass token/cookies if needed:
        // connectionParams: async () => ({ authorization: `Bearer ${token}` }),
        lazy: true,
        retryAttempts: 10,
        shouldRetry: () => true,
        onNonLazyError: (error) => {
          console.warn('[Apollo WS] WebSocket connection error:', error);
        },
      }),
    )
  : null;

/** Use WS for subscriptions, otherwise rely on HTTP only */
const transport: ApolloLink = wsLink
  ? ApolloLink.split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === 'OperationDefinition' && def.operation === 'subscription';
      },
      wsLink,
      httpUploadLink,
    )
  : httpUploadLink;

const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
        error.errors.forEach(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        )
    } else if (CombinedProtocolErrors.is(error)) {
        error.errors.forEach(({ message, extensions }) =>
            console.log(`[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`)
        )
    } else {
        // Network error - provide more details
        const networkError = error.networkError
        if (networkError) {
            console.error(`[Network error]:`, {
                message: networkError.message,
                statusCode: (networkError as any).statusCode,
                response: (networkError as any).result,
                operation: operation?.operationName,
                variables: operation?.variables,
                serverUrl: SERVER_URL,
            })
            
            // Check if server is reachable
            if (networkError.message.includes('Failed to fetch') || networkError.message.includes('NetworkError')) {
                console.warn(`[Apollo Client] Cannot reach GraphQL server at ${SERVER_URL}`)
                console.warn(`[Apollo Client] Make sure the API server is running on port 8080`)
            }
        } else {
            console.error(`[Network error]: ${error}`)
        }
    }
})

export const apolloClient = new ApolloClient({
  ssrMode: !isBrowser, // important for Next
  link: ApolloLink.from([errorLink, transport]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});

/**
 * Get Apollo Client instance for Server Components
 * Use this in Server Components for SSR/SSG data fetching
 */
export function getClient() {
  return apolloClient;
}
