"use client"

import { describe, it, expect, beforeEach } from "@jest/globals"
import { renderHook, act } from "@testing-library/react"
import { useAuth } from "../use-auth"

describe("useAuth Hook", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should handle successful login", async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login("snake@master.com", "password123")
    })

    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe("snake@master.com")
    expect(result.current.token).not.toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it("should handle failed login", async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try {
        await result.current.login("snake@master.com", "wrongpassword")
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).not.toBeNull()
  })

  it("should handle successful signup", async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signup("NewUser", "new@user.com", "password123")
    })

    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.username).toBe("NewUser")
    expect(result.current.user?.email).toBe("new@user.com")
    expect(result.current.isAuthenticated).toBe(true)
  })

  it("should handle logout", async () => {
    const { result } = renderHook(() => useAuth())

    // First login
    await act(async () => {
      await result.current.login("snake@master.com", "password123")
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it("should clear error", async () => {
    const { result } = renderHook(() => useAuth())

    // Trigger an error
    await act(async () => {
      try {
        await result.current.login("invalid", "invalid")
      } catch (error) {
        // Expected
      }
    })

    expect(result.current.error).not.toBeNull()

    // Clear error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it("should persist auth state", async () => {
    const { result, unmount } = renderHook(() => useAuth())

    // Login
    await act(async () => {
      await result.current.login("snake@master.com", "password123")
    })

    const userId = result.current.user?.id

    unmount()

    // Create new hook instance
    const { result: newResult } = renderHook(() => useAuth())

    // Should restore state from localStorage
    expect(newResult.current.isAuthenticated).toBe(true)
    expect(newResult.current.user?.id).toBe(userId)
  })
})
