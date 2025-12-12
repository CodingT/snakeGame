import { describe, it, expect } from "@jest/globals"
import { authApi, leaderboardApi, gameSessionApi } from "../mock-api"
import type { LoginRequest, SignupRequest } from "../types"

describe("Mock API", () => {
  describe("authApi", () => {
    describe("login", () => {
      it("should login successfully with valid credentials", async () => {
        const loginData: LoginRequest = {
          email: "snake@master.com",
          password: "password123",
        }

        const response = await authApi.login(loginData)

        expect(response.user).toBeDefined()
        expect(response.user.email).toBe("snake@master.com")
        expect(response.token).toBeDefined()
        expect(response.token).toContain("mock-token-")
      })

      it("should fail with invalid credentials", async () => {
        const loginData: LoginRequest = {
          email: "snake@master.com",
          password: "wrongpassword",
        }

        await expect(authApi.login(loginData)).rejects.toThrow("Invalid credentials")
      })

      it("should fail with non-existent user", async () => {
        const loginData: LoginRequest = {
          email: "nonexistent@user.com",
          password: "password123",
        }

        await expect(authApi.login(loginData)).rejects.toThrow("Invalid credentials")
      })
    })

    describe("signup", () => {
      it("should create new user successfully", async () => {
        const signupData: SignupRequest = {
          username: "NewPlayer",
          email: "new@player.com",
          password: "password123",
        }

        const response = await authApi.signup(signupData)

        expect(response.user).toBeDefined()
        expect(response.user.username).toBe("NewPlayer")
        expect(response.user.email).toBe("new@player.com")
        expect(response.token).toBeDefined()
      })

      it("should fail with duplicate email", async () => {
        const signupData: SignupRequest = {
          username: "AnotherPlayer",
          email: "snake@master.com", // Existing email
          password: "password123",
        }

        await expect(authApi.signup(signupData)).rejects.toThrow("Email already exists")
      })
    })

    describe("getCurrentUser", () => {
      it("should return user for valid token", async () => {
        const user = await authApi.getCurrentUser("mock-token-1")

        expect(user).toBeDefined()
        expect(user.id).toBe("1")
        expect(user.username).toBe("SnakeMaster")
      })

      it("should fail with invalid token", async () => {
        await expect(authApi.getCurrentUser("invalid-token")).rejects.toThrow("Invalid token")
      })
    })
  })

  describe("leaderboardApi", () => {
    describe("getLeaderboard", () => {
      it("should return sorted leaderboard", async () => {
        const leaderboard = await leaderboardApi.getLeaderboard()

        expect(leaderboard).toBeDefined()
        expect(leaderboard.length).toBeGreaterThan(0)

        // Check if sorted by score (descending)
        for (let i = 0; i < leaderboard.length - 1; i++) {
          expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score)
        }

        // Check ranks are correct
        leaderboard.forEach((entry, index) => {
          expect(entry.rank).toBe(index + 1)
        })
      })

      it("should limit results", async () => {
        const leaderboard = await leaderboardApi.getLeaderboard(3)

        expect(leaderboard.length).toBeLessThanOrEqual(3)
      })
    })

    describe("submitScore", () => {
      it("should submit score and return with rank", async () => {
        const entry = await leaderboardApi.submitScore("test-user", "TestPlayer", 500)

        expect(entry).toBeDefined()
        expect(entry.userId).toBe("test-user")
        expect(entry.username).toBe("TestPlayer")
        expect(entry.score).toBe(500)
        expect(entry.rank).toBeDefined()
        expect(entry.rank).toBeGreaterThan(0)
      })
    })
  })

  describe("gameSessionApi", () => {
    describe("createSession", () => {
      it("should create new game session", async () => {
        const session = await gameSessionApi.createSession("user-1", "TestPlayer")

        expect(session).toBeDefined()
        expect(session.userId).toBe("user-1")
        expect(session.username).toBe("TestPlayer")
        expect(session.isActive).toBe(true)
        expect(session.score).toBe(0)
        expect(session.snake.length).toBeGreaterThan(0)
        expect(session.food).toBeDefined()
      })
    })

    describe("getActiveSessions", () => {
      it("should return active sessions", async () => {
        const sessions = await gameSessionApi.getActiveSessions()

        expect(sessions).toBeDefined()
        expect(Array.isArray(sessions)).toBe(true)
      })
    })

    describe("updateSession", () => {
      it("should update session successfully", async () => {
        const session = await gameSessionApi.createSession("user-1", "TestPlayer")
        const updated = await gameSessionApi.updateSession(session.id, { score: 100 })

        expect(updated.score).toBe(100)
      })

      it("should fail with non-existent session", async () => {
        await expect(gameSessionApi.updateSession("non-existent", { score: 100 })).rejects.toThrow("Session not found")
      })
    })

    describe("endSession", () => {
      it("should end session successfully", async () => {
        const session = await gameSessionApi.createSession("user-1", "TestPlayer")
        await expect(gameSessionApi.endSession(session.id, 100)).resolves.not.toThrow()

        // Verify session is no longer active
        const sessions = await gameSessionApi.getActiveSessions()
        const found = sessions.find((s) => s.id === session.id)
        expect(found).toBeUndefined()
      })
    })
  })
})
