// Centralized Mock API - All backend calls go through here
// Will be replaced with FastAPI backend later

import type { User, LoginRequest, SignupRequest, AuthResponse, LeaderboardEntry, GameSession, Position } from "./types"

// Mock data storage
const mockUsers: User[] = [
  {
    id: "1",
    username: "SnakeMaster",
    email: "snake@master.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "GamePro",
    email: "game@pro.com",
    createdAt: new Date().toISOString(),
  },
]

const mockLeaderboard: Omit<LeaderboardEntry, "rank">[] = [
  { id: "1", userId: "1", username: "SnakeMaster", score: 450, createdAt: new Date().toISOString() },
  { id: "2", userId: "2", username: "GamePro", score: 380, createdAt: new Date().toISOString() },
  { id: "3", userId: "3", username: "PyPlayer", score: 320, createdAt: new Date().toISOString() },
  { id: "4", userId: "4", username: "CodeNinja", score: 290, createdAt: new Date().toISOString() },
  { id: "5", userId: "5", username: "PixelWarrior", score: 250, createdAt: new Date().toISOString() },
]

let mockActiveSessions: GameSession[] = []

// Helper to simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Auth API
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay()

    const user = mockUsers.find((u) => u.email === data.email)

    if (!user || data.password !== "password123") {
      throw new Error("Invalid credentials")
    }

    return {
      user,
      token: `mock-token-${user.id}`,
    }
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    await delay()

    if (mockUsers.some((u) => u.email === data.email)) {
      throw new Error("Email already exists")
    }

    if (mockUsers.some((u) => u.username === data.username)) {
      throw new Error("Username already exists")
    }

    const newUser: User = {
      id: `${Date.now()}`,
      username: data.username,
      email: data.email,
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return {
      user: newUser,
      token: `mock-token-${newUser.id}`,
    }
  },

  async logout(): Promise<void> {
    await delay(100)
    // In real implementation, invalidate token
  },

  async getCurrentUser(token: string): Promise<User> {
    await delay()

    const userId = token.replace("mock-token-", "")
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      throw new Error("Invalid token")
    }

    return user
  },
}

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    await delay()

    const sorted = [...mockLeaderboard].sort((a, b) => b.score - a.score)
    const limited = sorted.slice(0, limit)

    return limited.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
  },

  async submitScore(userId: string, username: string, score: number): Promise<LeaderboardEntry> {
    await delay()

    const newEntry: Omit<LeaderboardEntry, "rank"> = {
      id: `score-${Date.now()}`,
      userId,
      username,
      score,
      createdAt: new Date().toISOString(),
    }

    mockLeaderboard.push(newEntry)

    // Return with rank
    const sorted = [...mockLeaderboard].sort((a, b) => b.score - a.score)
    const rank = sorted.findIndex((e) => e.id === newEntry.id) + 1

    return { ...newEntry, rank }
  },
}

// Game Sessions API (for spectator mode)
export const gameSessionApi = {
  async getActiveSessions(): Promise<GameSession[]> {
    await delay()

    // Update mock sessions with simulated movement
    mockActiveSessions = mockActiveSessions.filter((s) => s.isActive)

    return mockActiveSessions
  },

  async getSession(sessionId: string): Promise<GameSession> {
    await delay()

    const session = mockActiveSessions.find((s) => s.id === sessionId)

    if (!session) {
      throw new Error("Session not found")
    }

    return session
  },

  async createSession(userId: string, username: string): Promise<GameSession> {
    await delay()

    // Initialize snake in center of 20x20 grid
    const initialSnake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]

    const session: GameSession = {
      id: `session-${Date.now()}`,
      userId,
      username,
      score: 0,
      isActive: true,
      snake: initialSnake,
      food: { x: 15, y: 15 },
      direction: "RIGHT",
      startedAt: new Date().toISOString(),
    }

    mockActiveSessions.push(session)

    return session
  },

  async updateSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession> {
    await delay(50)

    const index = mockActiveSessions.findIndex((s) => s.id === sessionId)

    if (index === -1) {
      throw new Error("Session not found")
    }

    mockActiveSessions[index] = { ...mockActiveSessions[index], ...updates }

    return mockActiveSessions[index]
  },

  async endSession(sessionId: string, finalScore: number): Promise<void> {
    await delay()

    const index = mockActiveSessions.findIndex((s) => s.id === sessionId)

    if (index !== -1) {
      mockActiveSessions[index].isActive = false
      mockActiveSessions.splice(index, 1)
    }
  },
}

// Create some mock active sessions for spectator mode
export const initializeMockSessions = () => {
  const mockSession1: GameSession = {
    id: "mock-session-1",
    userId: "2",
    username: "GamePro",
    score: 85,
    isActive: true,
    snake: [
      { x: 12, y: 8 },
      { x: 11, y: 8 },
      { x: 10, y: 8 },
      { x: 9, y: 8 },
    ],
    food: { x: 15, y: 12 },
    direction: "RIGHT",
    startedAt: new Date().toISOString(),
  }

  const mockSession2: GameSession = {
    id: "mock-session-2",
    userId: "3",
    username: "PyPlayer",
    score: 120,
    isActive: true,
    snake: [
      { x: 5, y: 15 },
      { x: 5, y: 14 },
      { x: 5, y: 13 },
      { x: 4, y: 13 },
      { x: 3, y: 13 },
    ],
    food: { x: 8, y: 10 },
    direction: "DOWN",
    startedAt: new Date().toISOString(),
  }

  mockActiveSessions = [mockSession1, mockSession2]
}
