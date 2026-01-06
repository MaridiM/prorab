'use client'

// TODO: Temporarily disabled - GraphQL schema needs to be regenerated
// API tokens resolver exists in backend but not in schema.gql
// To fix: Restart backend server to regenerate schema.gql, then run: pnpm codegen

export function ApiTokensSettings() {
    return (
        <div className="p-6 text-center">
            <p className="text-muted-foreground">
                API Tokens feature is temporarily unavailable.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
                Please restart the backend server to regenerate GraphQL schema.
            </p>
        </div>
    )
}
