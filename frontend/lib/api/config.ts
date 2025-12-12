// Use /api prefix in production (proxied by Nginx), localhost:8000 in development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.origin.includes('localhost:3000')
        ? "http://localhost:8000"
        : "/api")

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    }

    // Add auth token if available (simple check for now)
    // In a real app we might use a robust auth hook or context access
    // But since we are inside non-hook functions often, we rely on local storage or passed tokens
    // For this refactor, we usually pass tokens explicitly in arguments where needed, or we can fallback to localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('snake_game_token') : null
    if (token) {
        // @ts-ignore
        headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        cache: 'no-store',
        headers,
    })
    console.log(`[API] ${response.status} ${path}`)

    // Handle errors
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `API Error: ${response.statusText}`)
    }

    // Handle empty responses (like 204)
    if (response.status === 204) {
        return {} as T
    }

    return response.json()
}
