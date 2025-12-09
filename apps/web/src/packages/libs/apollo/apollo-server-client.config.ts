import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { SERVER_URL } from '@/packages/constants/url';

/**
 * Server-side Apollo Client for public endpoints (SSR/SSG)
 * Does not use cookies or authentication
 * Use this client for public data fetching in Server Components
 */
export function getServerClient() {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: SERVER_URL,
      // No credentials for public endpoints
      fetchOptions: {
        cache: 'no-store', // Disable fetch cache for fresh data
      },
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'no-cache', // Always fetch fresh data
      },
    },
  });
}
