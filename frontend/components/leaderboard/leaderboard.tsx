"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { leaderboardApi } from "@/lib/api/mock-api"
import type { LeaderboardEntry } from "@/lib/api/types"
import { Trophy, Medal, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardApi.getLeaderboard(10)
        setEntries(data)
      } catch (error) {
        console.error("[v0] Failed to fetch leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()

    // Refresh leaderboard every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000)

    return () => clearInterval(interval)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-semibold text-muted-foreground w-5 text-center">{rank}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top players by score</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scores yet. Be the first to play!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  entry.rank <= 3 ? "bg-accent" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <p className="font-semibold">{entry.username}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                  {entry.score}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
