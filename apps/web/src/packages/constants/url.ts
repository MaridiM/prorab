export const APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL as string | undefined) ??
  'http://localhost:3000';
export const SERVER_URL =
  (process.env.NEXT_PUBLIC_SERVER_URL as string | undefined) ??
  'http://localhost:8080/graphql';
export const WEBSOCKET_URL =
  (process.env.NEXT_PUBLIC_WEBSOCKET_URL as string | undefined) ??
  'ws://localhost:8080/graphql';
