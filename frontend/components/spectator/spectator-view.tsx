"use client"

import { useState } from "react"
import { SpectatorList } from "./spectator-list"
import { SpectatorGame } from "@/components/snake-game/spectator-game"
import type { GameSession } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function SpectatorView() {
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null)

  if (selectedSession) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedSession(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <SpectatorGame session={selectedSession} />
      </div>
    )
  }

  return <SpectatorList onSelectSession={setSelectedSession} />
}
