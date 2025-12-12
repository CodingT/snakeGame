import { describe, it, expect } from "@jest/globals"
import {
  GRID_SIZE,
  initialGameState,
  positionsEqual,
  checkSelfCollision,
  generateFood,
  getNextHeadPosition,
  isValidDirectionChange,
  updateGameState,
  getAIDirection,
  type GameState,
} from "../game-engine"
import type { Position } from "@/lib/api/types"

describe("Game Engine", () => {
  describe("positionsEqual", () => {
    it("should return true for equal positions", () => {
      const pos1: Position = { x: 5, y: 10 }
      const pos2: Position = { x: 5, y: 10 }
      expect(positionsEqual(pos1, pos2)).toBe(true)
    })

    it("should return false for different positions", () => {
      const pos1: Position = { x: 5, y: 10 }
      const pos2: Position = { x: 5, y: 11 }
      expect(positionsEqual(pos1, pos2)).toBe(false)
    })
  })

  describe("checkSelfCollision", () => {
    it("should return false when snake does not collide with itself", () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ]
      expect(checkSelfCollision(snake)).toBe(false)
    })

    it("should return true when snake collides with itself", () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 }, // Duplicate position
      ]
      expect(checkSelfCollision(snake)).toBe(true)
    })

    it("should handle single segment snake", () => {
      const snake: Position[] = [{ x: 5, y: 5 }]
      expect(checkSelfCollision(snake)).toBe(false)
    })
  })

  describe("generateFood", () => {
    it("should generate food within grid bounds", () => {
      const snake: Position[] = [{ x: 10, y: 10 }]
      const food = generateFood(snake)

      expect(food.x).toBeGreaterThanOrEqual(0)
      expect(food.x).toBeLessThan(GRID_SIZE)
      expect(food.y).toBeGreaterThanOrEqual(0)
      expect(food.y).toBeLessThan(GRID_SIZE)
    })

    it("should not generate food on snake position", () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ]
      const food = generateFood(snake)

      const isOnSnake = snake.some((segment) => positionsEqual(segment, food))
      expect(isOnSnake).toBe(false)
    })
  })

  describe("getNextHeadPosition", () => {
    it("should move up correctly", () => {
      const head: Position = { x: 10, y: 10 }
      const next = getNextHeadPosition(head, "UP")
      expect(next).toEqual({ x: 10, y: 9 })
    })

    it("should move down correctly", () => {
      const head: Position = { x: 10, y: 10 }
      const next = getNextHeadPosition(head, "DOWN")
      expect(next).toEqual({ x: 10, y: 11 })
    })

    it("should move left correctly", () => {
      const head: Position = { x: 10, y: 10 }
      const next = getNextHeadPosition(head, "LEFT")
      expect(next).toEqual({ x: 9, y: 10 })
    })

    it("should move right correctly", () => {
      const head: Position = { x: 10, y: 10 }
      const next = getNextHeadPosition(head, "RIGHT")
      expect(next).toEqual({ x: 11, y: 10 })
    })

    it("should wrap around when moving left from edge", () => {
      const head: Position = { x: 0, y: 10 }
      const next = getNextHeadPosition(head, "LEFT")
      expect(next).toEqual({ x: GRID_SIZE - 1, y: 10 })
    })

    it("should wrap around when moving right from edge", () => {
      const head: Position = { x: GRID_SIZE - 1, y: 10 }
      const next = getNextHeadPosition(head, "RIGHT")
      expect(next).toEqual({ x: 0, y: 10 })
    })

    it("should wrap around when moving up from edge", () => {
      const head: Position = { x: 10, y: 0 }
      const next = getNextHeadPosition(head, "UP")
      expect(next).toEqual({ x: 10, y: GRID_SIZE - 1 })
    })

    it("should wrap around when moving down from edge", () => {
      const head: Position = { x: 10, y: GRID_SIZE - 1 }
      const next = getNextHeadPosition(head, "DOWN")
      expect(next).toEqual({ x: 10, y: 0 })
    })
  })

  describe("isValidDirectionChange", () => {
    it("should allow perpendicular direction changes", () => {
      expect(isValidDirectionChange("UP", "LEFT")).toBe(true)
      expect(isValidDirectionChange("UP", "RIGHT")).toBe(true)
      expect(isValidDirectionChange("DOWN", "LEFT")).toBe(true)
      expect(isValidDirectionChange("DOWN", "RIGHT")).toBe(true)
      expect(isValidDirectionChange("LEFT", "UP")).toBe(true)
      expect(isValidDirectionChange("LEFT", "DOWN")).toBe(true)
      expect(isValidDirectionChange("RIGHT", "UP")).toBe(true)
      expect(isValidDirectionChange("RIGHT", "DOWN")).toBe(true)
    })

    it("should not allow reverse direction changes", () => {
      expect(isValidDirectionChange("UP", "DOWN")).toBe(false)
      expect(isValidDirectionChange("DOWN", "UP")).toBe(false)
      expect(isValidDirectionChange("LEFT", "RIGHT")).toBe(false)
      expect(isValidDirectionChange("RIGHT", "LEFT")).toBe(false)
    })

    it("should allow same direction", () => {
      expect(isValidDirectionChange("UP", "UP")).toBe(true)
      expect(isValidDirectionChange("DOWN", "DOWN")).toBe(true)
      expect(isValidDirectionChange("LEFT", "LEFT")).toBe(true)
      expect(isValidDirectionChange("RIGHT", "RIGHT")).toBe(true)
    })
  })

  describe("updateGameState", () => {
    it("should not update when game is over", () => {
      const state: GameState = {
        ...initialGameState,
        isGameOver: true,
      }
      const newState = updateGameState(state)
      expect(newState).toEqual(state)
    })

    it("should not update when game is paused", () => {
      const state: GameState = {
        ...initialGameState,
        isPaused: true,
      }
      const newState = updateGameState(state)
      expect(newState).toEqual(state)
    })

    it("should move snake forward", () => {
      const state: GameState = {
        snake: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        food: { x: 15, y: 15 },
        direction: "RIGHT",
        nextDirection: "RIGHT",
        score: 0,
        isGameOver: false,
        isPaused: false,
      }

      const newState = updateGameState(state)

      expect(newState.snake[0]).toEqual({ x: 11, y: 10 })
      expect(newState.snake.length).toBe(3)
      expect(newState.isGameOver).toBe(false)
    })

    it("should grow snake when eating food", () => {
      const state: GameState = {
        snake: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        food: { x: 11, y: 10 }, // Food is directly ahead
        direction: "RIGHT",
        nextDirection: "RIGHT",
        score: 0,
        isGameOver: false,
        isPaused: false,
      }

      const newState = updateGameState(state)

      expect(newState.snake.length).toBe(4) // Snake grew
      expect(newState.score).toBe(10) // Score increased
      expect(newState.food).not.toEqual({ x: 11, y: 10 }) // New food generated
    })

    it("should detect self collision", () => {
      const state: GameState = {
        snake: [
          { x: 10, y: 10 },
          { x: 11, y: 10 }, // Next move will collide with this
          { x: 11, y: 11 },
        ],
        food: { x: 15, y: 15 },
        direction: "RIGHT",
        nextDirection: "RIGHT",
        score: 0,
        isGameOver: false,
        isPaused: false,
      }

      const newState = updateGameState(state)

      expect(newState.isGameOver).toBe(true)
    })
  })

  describe("getAIDirection", () => {
    it("should move towards food", () => {
      const snake: Position[] = [{ x: 10, y: 10 }]
      const food: Position = { x: 15, y: 10 }
      const direction = getAIDirection(snake, food, "RIGHT")

      expect(direction).toBe("RIGHT") // Should continue towards food
    })

    it("should avoid self collision", () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 11, y: 10 }, // Body segment to the right
      ]
      const food: Position = { x: 12, y: 10 }
      const direction = getAIDirection(snake, food, "UP")

      expect(direction).not.toBe("RIGHT") // Should not move into body
    })

    it("should not reverse direction", () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ]
      const food: Position = { x: 8, y: 10 }
      const direction = getAIDirection(snake, food, "RIGHT")

      expect(direction).not.toBe("LEFT") // Should not reverse
    })
  })
})
