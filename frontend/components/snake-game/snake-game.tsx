"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GameBoard } from "./game-board"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Direction } from "@/lib/api/types"
import { initialGameState, updateGameState, isValidDirectionChange, type GameState } from "@/lib/game/game-engine"
import { useAuth } from "@/lib/hooks/use-auth"
import { leaderboardApi, gameSessionApi } from "@/lib/api/mock-api"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, RotateCcw } from "lucide-react"

const GAME_SPEED = 150 // ms per tick

export function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [isPlaying, setIsPlaying] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState.isGameOver) return

      let newDirection: Direction | null = null

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newDirection = "UP"
          break
        case "ArrowDown":
        case "s":
        case "S":
          newDirection = "DOWN"
          break
        case "ArrowLeft":
        case "a":
        case "A":
          newDirection = "LEFT"
          break
        case "ArrowRight":
        case "d":
        case "D":
          newDirection = "RIGHT"
          break
        case " ":
          event.preventDefault()
          togglePause()
          return
      }

      if (newDirection && isValidDirectionChange(gameState.direction, newDirection)) {
        setGameState((prev) => ({ ...prev, nextDirection: newDirection! }))
      }
    },
    [gameState.direction, gameState.isGameOver],
  )

  useEffect(() => {
    if (isPlaying) {
      window.addEventListener("keydown", handleKeyPress)
      return () => window.removeEventListener("keydown", handleKeyPress)
    }
  }, [isPlaying, handleKeyPress])

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameState.isGameOver && !gameState.isPaused) {
      gameLoopRef.current = setInterval(() => {
        setGameState((prev) => {
          const newState = updateGameState(prev)

          // If game just ended, submit score
          if (newState.isGameOver && !prev.isGameOver && user && sessionIdRef.current) {
            handleGameOver(newState.score)
          }

          return newState
        })
      }, GAME_SPEED)

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current)
        }
      }
    }
  }, [isPlaying, gameState.isGameOver, gameState.isPaused, user])

  const handleGameOver = async (finalScore: number) => {
    if (!user || !sessionIdRef.current) return

    try {
      await gameSessionApi.endSession(sessionIdRef.current, finalScore)
      await leaderboardApi.submitScore(user.id, user.username, finalScore)

      toast({
        title: "Score Submitted!",
        description: `Your final score: ${finalScore}`,
      })
    } catch (error) {
      console.error("[v0] Failed to submit score:", error)
    }
  }

  const startGame = async () => {
    if (user) {
      try {
        const session = await gameSessionApi.createSession(user.id, user.username)
        sessionIdRef.current = session.id
      } catch (error) {
        console.error("[v0] Failed to create session:", error)
      }
    }

    setGameState(initialGameState)
    setIsPlaying(true)
  }

  const togglePause = () => {
    if (!gameState.isGameOver) {
      setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
    }
  }

  const resetGame = () => {
    if (sessionIdRef.current) {
      gameSessionApi.endSession(sessionIdRef.current, gameState.score).catch(console.error)
      sessionIdRef.current = null
    }
    setGameState(initialGameState)
    setIsPlaying(false)
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Snake Game</h2>
          <p className="text-sm text-muted-foreground">Use arrow keys or WASD to control</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold">{gameState.score}</p>
        </div>
      </div>

      <GameBoard snake={gameState.snake} food={gameState.food} isGameOver={gameState.isGameOver} />

      <div className="flex gap-2">
        {!isPlaying ? (
          <Button onClick={startGame} className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Start Game
          </Button>
        ) : (
          <>
            <Button onClick={togglePause} variant="outline" className="flex-1 bg-transparent">
              {gameState.isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button onClick={resetGame} variant="outline" className="flex-1 bg-transparent">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </>
        )}
      </div>

      {gameState.isGameOver && (
        <div className="text-center p-4 bg-destructive/10 rounded-lg">
          <p className="text-lg font-semibold text-destructive">Game Over!</p>
          <p className="text-sm text-muted-foreground">Final Score: {gameState.score}</p>
          <Button onClick={resetGame} className="mt-2">
            Play Again
          </Button>
        </div>
      )}
    </Card>
  )
}
