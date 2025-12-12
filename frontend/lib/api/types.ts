// API Types for Snake Game
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LeaderboardEntry {
  id: string
  userId: string
  username: string
  score: number
  createdAt: string
  rank: number
}

export interface GameSession {
  id: string
  userId: string
  username: string
  score: number
  isActive: boolean
  snake: Position[]
  food: Position
  direction: Direction
  startedAt: string
}

export interface Position {
  x: number
  y: number
}

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

export interface ApiError {
  message: string
  code: string
}
