// Real API implementation
// Replaces the mock API with actual backend calls

import type { User, LoginRequest, SignupRequest, AuthResponse, LeaderboardEntry, GameSession, Position } from "./types"
import { fetchApi } from "./config"

// Helper to save/load token
const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('snake_game_token', token)
  }
}

const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('snake_game_token')
  }
}

// Auth API
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    saveToken(response.token)
    return response
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    saveToken(response.token)
    return response
  },

  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', { method: 'POST' })
    } finally {
      clearToken()
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    // We expect the token to be passed, or we use the stored one via fetchApi config
    // The backend /auth/me expects the token in header.
    // fetchApi adds it automatically from localStorage if present.
    // If the caller passes a specific token that is NOT in localStorage, fetchApi might ignore it unless we override.
    // For this specific method signature which takes 'token', let's manually override headers if needed, 
    // or just assume fetchApi handles it. 
    // Given the signature `getCurrentUser(token: string)`, let's respect the passed token.

    return fetchApi<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },
}

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    // Helper to format query params
    const params = new URLSearchParams({ limit: limit.toString() })
    return fetchApi<LeaderboardEntry[]>(`/leaderboard?${params}`)
  },

  async submitScore(userId: string, username: string, score: number): Promise<LeaderboardEntry> {
    return fetchApi<LeaderboardEntry>('/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ userId, username, score }),
    })
  },
}

// Game Sessions API (for spectator mode)
export const gameSessionApi = {
  async getActiveSessions(): Promise<GameSession[]> {
    return fetchApi<GameSession[]>('/sessions')
  },

  async getSession(sessionId: string): Promise<GameSession> {
    return fetchApi<GameSession>(`/sessions/${sessionId}`)
  },

  async createSession(userId: string, username: string): Promise<GameSession> {
    return fetchApi<GameSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, username }),
    })
  },

  async updateSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession> {
    return fetchApi<GameSession>(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  async endSession(sessionId: string, finalScore: number): Promise<void> {
    await fetchApi(`/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ finalScore }),
    })
  },
}

// Initialize mock sessions is no longer needed but we keep the export to avoid breaking imports 
// if it's called somewhere (though it should ideally be removed).
// We'll make it a no-op.
export const initializeMockSessions = () => {
  console.log("Mock sessions initialization skipped (using real backend)")
}
