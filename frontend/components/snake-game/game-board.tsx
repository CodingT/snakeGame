"use client"

import { useEffect, useRef } from "react"
import type { Position } from "@/lib/api/types"
import { GRID_SIZE, CELL_SIZE } from "@/lib/game/game-engine"

interface GameBoardProps {
  snake: Position[]
  food: Position
  isGameOver?: boolean
}

export function GameBoard({ snake, food, isGameOver = false }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "oklch(0.97 0 0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "oklch(0.922 0 0)"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw food
    ctx.fillStyle = "oklch(0.646 0.222 41.116)" // Orange/red for food
    ctx.beginPath()
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, 2 * Math.PI)
    ctx.fill()

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head - slightly different color
        ctx.fillStyle = isGameOver ? "oklch(0.577 0.245 27.325)" : "oklch(0.488 0.243 264.376)"
      } else {
        // Snake body
        ctx.fillStyle = isGameOver ? "oklch(0.396 0.141 25.723)" : "oklch(0.6 0.118 184.704)"
      }

      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })
  }, [snake, food, isGameOver])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-2 border-border rounded-lg bg-muted"
      />
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">Game Over!</p>
          </div>
        </div>
      )}
    </div>
  )
}
