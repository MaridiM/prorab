/**
 * Utility to check API server connection
 * Useful for debugging "Failed to fetch" errors
 */
export async function checkApiConnection(serverUrl: string): Promise<{
  connected: boolean
  error?: string
  details?: {
    status?: number
    statusText?: string
    url: string
  }
}> {
  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'query { __typename }',
      }),
      credentials: 'include',
    })

    return {
      connected: response.ok,
      details: {
        status: response.status,
        statusText: response.statusText,
        url: serverUrl,
      },
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || String(error),
      details: {
        url: serverUrl,
      },
    }
  }
}
