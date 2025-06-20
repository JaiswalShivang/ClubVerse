"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  uid: string
  email: string
  name: string
  role: "super_admin" | "college_admin" | "club_admin" | "student"
  collegeName?: string
  clubId?: string
  profileImageUrl?: string
  backgroundImageUrl?: string
  enrolledClubs?: string[]
  clubRole?: "member" | "lead" | "president" | "vice_president"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, role?: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("clubverse_user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string, role?: string) => {
    setLoading(true)
    try {
      // Mock authentication with different user types
      let mockUser: User

      if (email === "superadmin@clubverse.com") {
        mockUser = {
          uid: "super-admin-1",
          email,
          name: "Super Admin",
          role: "super_admin",
        }
      } else if (role === "college_admin" || email.includes("college")) {
        mockUser = {
          uid: "college-admin-1",
          email,
          name: "College Admin",
          role: "college_admin",
          collegeName: "Tech University",
        }
      } else if (role === "club_admin" || email.includes("club")) {
        mockUser = {
          uid: "club-admin-1",
          email,
          name: "Club Admin",
          role: "club_admin",
          collegeName: "Tech University",
          clubId: "photography-club",
        }
      } else {
        mockUser = {
          uid: "student-" + Date.now(),
          email,
          name: "Student User",
          role: "student",
          collegeName: "Tech University",
          enrolledClubs: [],
          clubRole: "member",
        }
      }

      setUser(mockUser)
      localStorage.setItem("clubverse_user", JSON.stringify(mockUser))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true)
    try {
      const newUser: User = {
        uid: "user-" + Date.now(),
        email,
        name: userData.name || "New User",
        role: userData.role || "student",
        collegeName: userData.collegeName,
        enrolledClubs: [],
        clubRole: "member",
      }

      setUser(newUser)
      localStorage.setItem("clubverse_user", JSON.stringify(newUser))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("clubverse_user")
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
