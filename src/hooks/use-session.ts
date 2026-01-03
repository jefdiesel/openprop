'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Session {
  user: User
  expires: string
}

export function useSession() {
  const { data: session, status, update } = useNextAuthSession()

  return {
    session: session as Session | null,
    user: session?.user as User | null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    update,
  }
}
