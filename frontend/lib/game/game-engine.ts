import type { Position, Direction } from "@/lib/api/types"

export const GRID_SIZE = 20
export const CELL_SIZE = 20

export interface GameState {
  snake: Position[]
  food: Position
  direction: Direction
  nextDirection: Direction
  score: number
  isGameOver: boolean
  isPaused: boolean
}

export const initialGameState: GameState = {
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

// Check if positions are equal
export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

// Check if snake collides with itself
export const checkSelfCollision = (snake: Position[]): boolean => {
  const head = snake[0]
  return snake.slice(1).some((segment) => positionsEqual(head, segment))
}

// Generate random food position that doesn't overlap with snake
export const generateFood = (snake: Position[]): Position => {
  let food: Position
  let attempts = 0
  const maxAttempts = 100

  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
    attempts++
  } while (snake.some((segment) => positionsEqual(segment, food)) && attempts < maxAttempts)

  return food
}

// Get next head position based on direction (with wall wrapping)
export const getNextHeadPosition = (head: Position, direction: Direction): Position => {
  let nextX = head.x
  let nextY = head.y

  switch (direction) {
    case "UP":
      nextY = head.y - 1
      break
    case "DOWN":
      nextY = head.y + 1
      break
    case "LEFT":
      nextX = head.x - 1
      break
    case "RIGHT":
      nextX = head.x + 1
      break
  }

  // Wrap around walls
  if (nextX < 0) nextX = GRID_SIZE - 1
  if (nextX >= GRID_SIZE) nextX = 0
  if (nextY < 0) nextY = GRID_SIZE - 1
  if (nextY >= GRID_SIZE) nextY = 0

  return { x: nextX, y: nextY }
}

// Check if direction change is valid (can't reverse)
export const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
  if (current === "UP" && next === "DOWN") return false
  if (current === "DOWN" && next === "UP") return false
  if (current === "LEFT" && next === "RIGHT") return false
  if (current === "RIGHT" && next === "LEFT") return false
  return true
}

// Update game state for one tick
export const updateGameState = (state: GameState): GameState => {
  if (state.isGameOver || state.isPaused) {
    return state
  }

  const direction = state.nextDirection
  const head = state.snake[0]
  const newHead = getNextHeadPosition(head, direction)

  // Check self collision
  if (checkSelfCollision([newHead, ...state.snake])) {
    return { ...state, isGameOver: true }
  }

  // Check if snake eats food
  const ateFood = positionsEqual(newHead, state.food)

  let newSnake: Position[]
  let newFood = state.food
  let newScore = state.score

  if (ateFood) {
    // Grow snake (don't remove tail)
    newSnake = [newHead, ...state.snake]
    newFood = generateFood(newSnake)
    newScore = state.score + 10
  } else {
    // Move snake (remove tail)
    newSnake = [newHead, ...state.snake.slice(0, -1)]
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction,
    score: newScore,
  }
}

// AI logic for spectator mode - simple pathfinding towards food
export const getAIDirection = (snake: Position[], food: Position, currentDirection: Direction): Direction => {
  const head = snake[0]
  const possibleDirections: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"]

  // Filter out reverse direction
  const validDirections = possibleDirections.filter((dir) => isValidDirectionChange(currentDirection, dir))

  // Calculate distance for each direction
  const directionScores = validDirections.map((dir) => {
    const nextHead = getNextHeadPosition(head, dir)

    // Check if this would cause collision
    const wouldCollide = snake.some((segment) => positionsEqual(segment, nextHead))

    if (wouldCollide) {
      return { direction: dir, score: -1000 }
    }

    // Calculate Manhattan distance to food
    const distance = Math.abs(nextHead.x - food.x) + Math.abs(nextHead.y - food.y)

    return { direction: dir, score: -distance }
  })

  // Sort by score (highest first)
  directionScores.sort((a, b) => b.score - a.score)

  // Return best direction, or current direction if all lead to collision
  return directionScores[0]?.score > -1000 ? directionScores[0].direction : currentDirection
}
