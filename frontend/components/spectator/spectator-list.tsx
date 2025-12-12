"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { gameSessionApi, initializeMockSessions } from "@/lib/api/mock-api"
import type { GameSession } from "@/lib/api/types"
import { Eye, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SpectatorListProps {
  onSelectSession: (session: GameSession) => void
}

export function SpectatorList({ onSelectSession }: SpectatorListProps) {
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize mock sessions on component mount
    initializeMockSessions()
    fetchSessions()

    // Refresh sessions every 5 seconds
    const interval = setInterval(fetchSessions, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      const data = await gameSessionApi.getActiveSessions()
      setSessions(data)
    } catch (error) {
      console.error("[v0] Failed to fetch sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Games
            </CardTitle>
            <CardDescription>Watch other players in action</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchSessions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active games at the moment</p>
            <p className="text-sm">Start playing to appear here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{session.username}</p>
                    <Badge variant="outline" className="text-xs">
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Score: {session.score}</span>
                    <span>Length: {session.snake.length}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onSelectSession(session)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Watch
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
