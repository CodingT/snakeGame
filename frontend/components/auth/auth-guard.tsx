"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { useState } from "react"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(true)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        {showLogin ? (
          <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    )
  }

  return <>{children}</>
}
