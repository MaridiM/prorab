"use client";

import { ApolloProvider } from "@apollo/client/react";
import type { PropsWithChildren } from "react";
import { apolloClient } from "./apollo-client.config";

export function ApolloClientProvider({ children }: PropsWithChildren<unknown>) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
