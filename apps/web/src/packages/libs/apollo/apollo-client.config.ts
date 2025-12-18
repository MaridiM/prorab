import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { createClient as createWsClient } from 'graphql-ws';

import { SERVER_URL, WEBSOCKET_URL } from '@/packages/constants/url';

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

const errorLink = onError((errorResponse) => {
    const { graphQLErrors, networkError, operation, forward } = errorResponse as any;
    // Skip logging for cancelled/aborted requests
    if (networkError?.name === 'AbortError' || networkError?.message?.includes('aborted')) {
        // Request was cancelled - this is expected behavior, don't log
        return;
    }

    const isDevelopment = process.env.NODE_ENV === 'development' || (!process.env.NODE_ENV && isBrowser);

    // Check for authentication errors and redirect to login
    // Only redirect for actual authentication failures, not for permission/access errors
    const isAuthError = (message: string, extensions?: any): boolean => {
        // Check for explicit authentication error codes (most reliable)
        if (extensions?.code === 'UNAUTHENTICATED' || extensions?.statusCode === 401) {
            return true;
        }
        
        // Check for specific authentication-related messages
        const authMessages = [
            'User not authenticated',
            'Требуется авторизация',
            'Сессия истекла или недействительна',
        ];
        
        // Exclude permission/access errors that might contain "unauthorized" but aren't auth errors
        const permissionErrors = [
            'not authorized',
            'доступ запрещен',
            'permission denied',
            'forbidden',
            'access denied',
        ];
        
        const lowerMessage = message.toLowerCase();
        const isPermissionError = permissionErrors.some(msg => lowerMessage.includes(msg));
        
        if (isPermissionError) {
            return false; // Don't redirect for permission errors
        }
        
        // Only check for exact auth messages, not generic "Unauthorized"
        return authMessages.some(msg => lowerMessage.includes(msg.toLowerCase()));
    };

    // Handle GraphQL errors
    if (graphQLErrors && graphQLErrors.length > 0) {
        let shouldRedirect = false;
        const operationName = operation?.operationName || '';

        graphQLErrors.forEach(({ message, locations, path, extensions }: any) => {
            // For project-related queries, don't redirect - these might be permission errors
            // Only redirect for queries that require global authentication (like 'me', 'myTeams')
            if (operationName.includes('project') || operationName.includes('Project')) {
                // Don't redirect for project queries - let the component handle the error
                if (isDevelopment) {
                    console.log(`[GraphQL error] Project query error (not redirecting): Operation: ${operationName}, Message: ${message}`)
                }
                return; // Skip redirect for project queries
            }
            
            // Check if it's an authentication error (not a permission error)
            const isAuth = isAuthError(message, extensions);
            
            // Only redirect for queries that require authentication (like 'me', 'myTeams')
            // These queries failing means the session is invalid
            const requiresAuth = ['me', 'MyTeams', 'myTeams', 'Me'].some(name => operationName.includes(name));
            
            if (requiresAuth && isAuth) {
                shouldRedirect = true;
            }
            
            if (isDevelopment) {
                console.log(`[GraphQL error]: Operation: ${operationName}, Message: ${message}, Location: ${locations}, Path: ${path}, Extensions:`, extensions)
            }
        });
        
        // Redirect to login if authentication error (but not for project queries)
        if (shouldRedirect && isBrowser) {
            // Don't redirect if already on login page to avoid loops
            if (window.location.pathname.startsWith('/auth/login')) {
                return;
            }
            
            if (isDevelopment) {
                console.log(`[Apollo Client] Redirecting to login due to authentication error in operation: ${operationName}`)
            }
            // Clear any auth-related data
            document.cookie.split(";").forEach((c) => {
                if (c.trim().startsWith('session_token=')) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                }
            });
            window.location.href = '/auth/login';
            return;
        }
    }

    // Handle network/protocol errors
    if (networkError) {
        const operationName = operation?.operationName || '';

        // Don't redirect for project queries
        if (operationName.includes('project') || operationName.includes('Project')) {
            if (isDevelopment) {
                console.log(`[Protocol error] Project query error (not redirecting): Operation: ${operationName}`)
            }
            // Let the component handle the error
        } else {
            let shouldRedirect = false;
            const netErr = networkError as any;
            if (netErr.result?.errors) {
                netErr.result.errors.forEach(({ message, extensions }: any) => {
                    // Only redirect for queries that require global authentication
                    const requiresAuth = ['me', 'MyTeams', 'myTeams', 'Me'].some(name => operationName.includes(name));
                    if (requiresAuth && isAuthError(message, extensions)) {
                        shouldRedirect = true;
                    }
                    if (isDevelopment) {
                        console.log(`[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`)
                    }
                });

                if (shouldRedirect && isBrowser) {
                    // Don't redirect if already on login page to avoid loops
                    if (window.location.pathname.startsWith('/auth/login')) {
                        return;
                    }

                    document.cookie.split(";").forEach((c) => {
                        if (c.trim().startsWith('session_token=')) {
                            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                        }
                    });
                    window.location.href = '/auth/login';
                    return;
                }
            } else {
                // Network error without protocol errors - provide more details
                const errorMessage = networkError.message || String(networkError);
                const statusCode = networkError.statusCode || (networkError.result as any)?.statusCode;
                const operationName = operation?.operationName || '';

                // Don't redirect for project queries - these might be permission/access errors
                const isProjectQuery = ['project', 'Project'].some(name => operationName.includes(name));

                // Check for 401 Unauthorized - this is a clear auth error
                // But only redirect if it's not a project query
                if (statusCode === 401 && !isProjectQuery) {
                    // Only redirect for queries that require global authentication
                    const requiresAuth = ['me', 'MyTeams', 'myTeams', 'Me'].some(name => operationName.includes(name));

                    if (isBrowser && requiresAuth) {
                        // Don't redirect if already on login page to avoid loops
                        if (window.location.pathname.startsWith('/auth/login')) {
                            return;
                        }

                        // Clear session token
                        document.cookie.split(";").forEach((c) => {
                            if (c.trim().startsWith('session_token=')) {
                                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                            }
                        });
                        window.location.href = '/auth/login';
                        return;
                    }
                } else if (!isProjectQuery && isAuthError(errorMessage)) {
                    // Check for auth error messages in network errors (but not for project queries)
                    const requiresAuth = ['me', 'MyTeams', 'myTeams', 'Me'].some(name => operationName.includes(name));
                    if (isBrowser && requiresAuth) {
                        // Don't redirect if already on login page to avoid loops
                        if (window.location.pathname.startsWith('/auth/login')) {
                            return;
                        }

                        document.cookie.split(";").forEach((c) => {
                            if (c.trim().startsWith('session_token=')) {
                                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                            }
                        });
                        window.location.href = '/auth/login';
                        return;
                    }
                }

                // Handle "Failed to fetch" errors more gracefully
                if (errorMessage === 'Failed to fetch' || errorMessage.includes('Failed to fetch')) {
                    // This is usually a CORS issue or server unavailable - log as warning, not error
                    if (isDevelopment) {
                        // Only log once per operation to avoid spam
                        const operationName = operation?.operationName || 'unknown';
                        console.warn(`[Apollo Client] Network request failed for "${operationName}"`);
                        console.warn(`[Apollo Client] Server: ${SERVER_URL}`);
                        console.warn(`[Apollo Client] This might be due to:`);
                        console.warn(`  - API server not running (check port 8080)`);
                        console.warn(`  - CORS configuration issue`);
                        console.warn(`  - Network connectivity problem`);
                    }
                    // Don't log in production - these are handled by error boundaries
                    return;
                }

                // Log other network errors with details
                if (isDevelopment) {
                    console.error(`[Network error]:`, {
                        message: errorMessage,
                        statusCode: networkError.statusCode,
                        response: networkError.result,
                        operation: operation?.operationName,
                        variables: operation?.variables,
                        serverUrl: SERVER_URL,
                    })
                } else if (networkError.statusCode && networkError.statusCode >= 500) {
                    // In production, only log critical server errors (5xx)
                    console.error(`[Network error]: ${errorMessage} (${operation?.operationName || 'unknown'})`)
                }
            }
        }
    }
});

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
