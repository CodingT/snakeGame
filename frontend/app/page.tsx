"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { SnakeGame } from "@/components/snake-game/snake-game"
import { Leaderboard } from "@/components/leaderboard/leaderboard"
import { SpectatorView } from "@/components/spectator/spectator-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gamepad2, Trophy, Eye } from "lucide-react"

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="play" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="play" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Play</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="watch" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Watch</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <SnakeGame />
                <Leaderboard />
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <div className="max-w-2xl mx-auto">
                <Leaderboard />
              </div>
            </TabsContent>

            <TabsContent value="watch">
              <div className="max-w-4xl mx-auto">
                <SpectatorView />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
