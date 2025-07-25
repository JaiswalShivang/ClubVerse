"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// The User interface remains the same
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
  updateUserProfile: (data: { name?: string; avatarFile?: File | null }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to get our mock database from localStorage
const getMockDb = () => {
  const db = localStorage.getItem("clubverse_mock_db")
  return db ? JSON.parse(db) : { users: {} }
}

// Helper function to save to our mock database
const saveMockDb = (db: any) => {
  localStorage.setItem("clubverse_mock_db", JSON.stringify(db))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // This effect checks for a logged-in user on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUserId = localStorage.getItem("clubverse_current_user")
        if (currentUserId) {
          const db = getMockDb()
          const savedUser = db.users[currentUserId]
          if (savedUser) {
            setUser(savedUser)
          }
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
      const db = getMockDb()
      let userToLogin = db.users[email]

      // If user doesn't exist in our mock DB, create them for the first time
      if (!userToLogin) {
        if (email === "superadmin@clubverse.com") {
          userToLogin = { uid: "super-admin-1", email, name: "Super Admin", role: "super_admin" }
        } else if (role === "college_admin" || email.includes("college")) {
          userToLogin = { uid: "college-admin-1", email, name: "College Admin", role: "college_admin", collegeName: "Tech University" }
        } else if (role === "club_admin" || email.includes("club")) {
          userToLogin = { uid: "club-admin-1", email, name: "Club Admin", role: "club_admin", collegeName: "Tech University", clubId: "photography-club" }
        } else {
          userToLogin = { uid: "student-" + Date.now(), email, name: "Student User", role: "student", collegeName: "Tech University", enrolledClubs: [], clubRole: "member" }
        }
        db.users[email] = userToLogin
        saveMockDb(db)
      }

      // Set the current user in state and localStorage
      setUser(userToLogin)
      localStorage.setItem("clubverse_current_user", email)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true)
    try {
      const db = getMockDb()
      if (db.users[email]) {
        throw new Error("User already exists!")
      }

      const newUser: User = {
        uid: "user-" + Date.now(),
        email,
        name: userData.name || "New User",
        role: userData.role || "student",
        collegeName: userData.collegeName,
        enrolledClubs: [],
        clubRole: "member",
      }

      db.users[email] = newUser
      saveMockDb(db)

      setUser(newUser)
      localStorage.setItem("clubverse_current_user", email)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (data: { name?: string; avatarFile?: File | null }) => {
    if (!user) throw new Error("No user is signed in.")
    setLoading(true)
    try {
      const db = getMockDb()
      const userToUpdate = db.users[user.email]

      if (!userToUpdate) throw new Error("User not found in mock DB")

      if (data.name) {
        userToUpdate.name = data.name
      }
      if (data.avatarFile) {
        const reader = new FileReader()
        const promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(data.avatarFile!)
        })
        userToUpdate.profileImageUrl = await promise
      }

      // Update the user in the mock DB, save it, and update the live state
      db.users[user.email] = userToUpdate
      saveMockDb(db)
      setUser(userToUpdate)

    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("clubverse_current_user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
