"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Calendar, MessageCircle, Heart, Crown, Star, Trophy } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface Club {
  id: string
  name: string
  description: string
  collegeName: string
  memberCount: number
  profileImageUrl?: string
  isJoined?: boolean
  userRole?: "member" | "lead" | "president" | "vice_president"
}

interface Event {
  id: string
  title: string
  clubName: string
  date: string
  time: string
  location: string
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollege, setSelectedCollege] = useState("all")
  const [clubs, setClubs] = useState<Club[]>([])
  const [myClubs, setMyClubs] = useState<Club[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
      return
    }

    // Mock data - clubs from different colleges
    const mockClubs: Club[] = [
      {
        id: "1",
        name: "Photography Club",
        description: "Capture moments, create memories. Join us for photo walks and workshops.",
        collegeName: "Tech University",
        memberCount: 45,
        isJoined: user.collegeName === "Tech University",
        userRole: "member",
      },
      {
        id: "2",
        name: "Debate Society",
        description: "Sharpen your arguments and public speaking skills.",
        collegeName: "Tech University",
        memberCount: 32,
        isJoined: user.collegeName === "Tech University",
        userRole: "lead",
      },
      {
        id: "3",
        name: "Coding Club",
        description: "Learn, code, and build amazing projects together.",
        collegeName: "State College",
        memberCount: 78,
        isJoined: false,
      },
      {
        id: "4",
        name: "Music Society",
        description: "Express yourself through music and performances.",
        collegeName: "Arts College",
        memberCount: 56,
        isJoined: false,
      },
    ]

    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Photography Workshop",
        clubName: "Photography Club",
        date: "2024-01-15",
        time: "2:00 PM",
        location: "Art Building Room 101",
      },
      {
        id: "2",
        title: "Debate Competition",
        clubName: "Debate Society",
        date: "2024-01-20",
        time: "6:00 PM",
        location: "Main Auditorium",
      },
    ]

    setClubs(mockClubs)
    setMyClubs(mockClubs.filter((club) => club.isJoined))
    setEvents(mockEvents)
  }, [user, router])

  const handleJoinClub = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId)
    if (!club) return

    // Only allow joining clubs from same college
    if (club.collegeName !== user?.collegeName && !club.isJoined) {
      alert("You can only join clubs from your college!")
      return
    }

    setClubs((prev) =>
      prev.map((club) =>
        club.id === clubId
          ? { ...club, isJoined: !club.isJoined, userRole: club.isJoined ? undefined : "member" }
          : club,
      ),
    )

    setMyClubs((prev) => {
      const updatedClub = clubs.find((c) => c.id === clubId)
      if (updatedClub && !updatedClub.isJoined) {
        return [...prev, { ...updatedClub, isJoined: true, userRole: "member" }]
      }
      return prev.filter((c) => c.id !== clubId)
    })
  }

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "president":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "vice_president":
        return <Star className="h-4 w-4 text-blue-600" />
      case "lead":
        return <Trophy className="h-4 w-4 text-green-600" />
      default:
        return null
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "president":
        return <Badge className="bg-yellow-100 text-yellow-800">President</Badge>
      case "vice_president":
        return <Badge className="bg-blue-100 text-blue-800">Vice President</Badge>
      case "lead":
        return <Badge className="bg-green-100 text-green-800">Lead</Badge>
      default:
        return <Badge variant="secondary">Member</Badge>
    }
  }

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCollege = selectedCollege === "all" || club.collegeName === selectedCollege
    return matchesSearch && matchesCollege
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
              <p className="text-gray-600">{user.collegeName} • Discover and engage with clubs</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Clubs</TabsTrigger>
            <TabsTrigger value="my-clubs">My Clubs ({myClubs.length})</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Colleges</option>
                <option value="Tech University">Tech University</option>
                <option value="State College">State College</option>
                <option value="Arts College">Arts College</option>
              </select>
            </div>

            {/* Clubs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onJoin={() => handleJoinClub(club.id)}
                  canJoin={club.collegeName === user.collegeName}
                  userCollege={user.collegeName}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-clubs" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <Card key={club.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {club.name}
                          {getRoleIcon(club.userRole)}
                        </CardTitle>
                        <CardDescription>{club.collegeName}</CardDescription>
                      </div>
                      {getRoleBadge(club.userRole)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{club.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {club.memberCount} members
                      </div>
                      <Button size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="text-gray-600 mb-2">{event.clubName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {event.date} at {event.time}
                          </div>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Button variant="outline">RSVP</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input value={user.name} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input value={user.email} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">College</label>
                  <Input value={user.collegeName || ""} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Input value="Student" readOnly />
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ClubCard({
  club,
  onJoin,
  canJoin,
  userCollege,
}: {
  club: Club
  onJoin: () => void
  canJoin: boolean
  userCollege?: string
}) {
  const getJoinButtonText = () => {
    if (club.isJoined) return "Leave"
    if (canJoin) return "Join"
    return `Different College`
  }

  const getJoinButtonVariant = () => {
    if (club.isJoined) return "outline"
    if (canJoin) return "default"
    return "secondary"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{club.name}</CardTitle>
            <CardDescription>{club.collegeName}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {club.isJoined && <Badge variant="secondary">Joined</Badge>}
            {club.collegeName === userCollege && (
              <Badge variant="outline" className="text-xs">
                Your College
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{club.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {club.memberCount} members
          </div>
          <Button size="sm" variant={getJoinButtonVariant()} onClick={onJoin} disabled={!canJoin && !club.isJoined}>
            {club.isJoined ? (
              <>
                <Heart className="h-4 w-4 mr-2 fill-current" />
                Leave
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                {getJoinButtonText()}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
