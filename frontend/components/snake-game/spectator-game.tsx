"use client"

import { useState, useEffect, useRef } from "react"
import { GameBoard } from "./game-board"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GameSession } from "@/lib/api/types"
import { updateGameState, getAIDirection, type GameState } from "@/lib/game/game-engine"
import { Eye } from "lucide-react"

const SPECTATOR_SPEED = 150 // ms per tick

interface SpectatorGameProps {
  session: GameSession
}

export function SpectatorGame({ session }: SpectatorGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    snake: session.snake,
    food: session.food,
    direction: session.direction,
    nextDirection: session.direction,
    score: session.score,
    isGameOver: false,
    isPaused: false,
  })

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate AI playing
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.isGameOver) return prev

        // AI determines next direction
        const aiDirection = getAIDirection(prev.snake, prev.food, prev.direction)

        const stateWithAI = {
          ...prev,
          nextDirection: aiDirection,
        }

        return updateGameState(stateWithAI)
      })
    }, SPECTATOR_SPEED)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [])

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">{session.username}</h3>
            <Badge variant="secondary" className="text-xs">
              Spectating
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold">{gameState.score}</p>
        </div>
      </div>

      <GameBoard snake={gameState.snake} food={gameState.food} isGameOver={gameState.isGameOver} />

      {gameState.isGameOver && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-lg font-semibold">Game Ended</p>
          <p className="text-sm text-muted-foreground">Final Score: {gameState.score}</p>
        </div>
      )}
    </Card>
  )
}
