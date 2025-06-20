"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Calendar,
  MessageCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Crown,
  Star,
  Trophy,
  UserCheck,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface ClubMember {
  id: string
  name: string
  email: string
  role: "member" | "lead" | "president" | "vice_president"
  joinedAt: string
  isActive: boolean
}

interface ClubEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl?: string
  attendees: number
}

export default function ClubAdminDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<ClubMember[]>([])
  const [events, setEvents] = useState<ClubEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "club_admin") {
      router.push("/")
      return
    }

    // Mock data
    const mockMembers: ClubMember[] = [
      {
        id: "1",
        name: "Alice Johnson",
        email: "alice@student.techuni.edu",
        role: "president",
        joinedAt: "2024-01-10",
        isActive: true,
      },
      {
        id: "2",
        name: "Bob Smith",
        email: "bob@student.techuni.edu",
        role: "vice_president",
        joinedAt: "2024-01-12",
        isActive: true,
      },
      {
        id: "3",
        name: "Carol Davis",
        email: "carol@student.techuni.edu",
        role: "lead",
        joinedAt: "2024-01-15",
        isActive: true,
      },
      {
        id: "4",
        name: "David Wilson",
        email: "david@student.techuni.edu",
        role: "member",
        joinedAt: "2024-01-18",
        isActive: true,
      },
      {
        id: "5",
        name: "Emma Brown",
        email: "emma@student.techuni.edu",
        role: "member",
        joinedAt: "2024-01-20",
        isActive: false,
      },
    ]

    const mockEvents: ClubEvent[] = [
      {
        id: "1",
        title: "Photography Workshop",
        description: "Learn advanced photography techniques with professional equipment",
        date: "2024-01-25",
        time: "2:00 PM",
        location: "Art Building Room 101",
        attendees: 25,
      },
      {
        id: "2",
        title: "Photo Walk Downtown",
        description: "Explore the city and capture urban photography",
        date: "2024-02-01",
        time: "10:00 AM",
        location: "Downtown Square",
        attendees: 18,
      },
    ]

    setMembers(mockMembers)
    setEvents(mockEvents)
  }, [user, router])

  const handleRoleChange = (memberId: string, newRole: ClubMember["role"]) => {
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  const handleAddEvent = (eventData: any) => {
    const newEvent: ClubEvent = {
      id: "event-" + Date.now(),
      ...eventData,
      attendees: 0,
    }
    setEvents((prev) => [...prev, newEvent])
    setIsAddEventOpen(false)
  }

  const getRoleIcon = (role: ClubMember["role"]) => {
    switch (role) {
      case "president":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "vice_president":
        return <Star className="h-4 w-4 text-blue-600" />
      case "lead":
        return <Trophy className="h-4 w-4 text-green-600" />
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: ClubMember["role"]) => {
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

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Club Admin Dashboard</h1>
              <p className="text-gray-600">Photography Club • {user.collegeName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.filter((m) => m.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leadership Roles</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.filter((m) => m.role !== "member").length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members Management</TabsTrigger>
            <TabsTrigger value="events">Events Management</TabsTrigger>
            <TabsTrigger value="chat">Chat Moderation</TabsTrigger>
            <TabsTrigger value="profile">Club Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(member.role)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(member.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.joinedAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Select
                          value={member.role}
                          onValueChange={(value: ClubMember["role"]) => handleRoleChange(member.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="vice_president">Vice President</SelectItem>
                            <SelectItem value="president">President</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => handleRemoveMember(member.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Club Events</h3>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>Add a new event for your club members</DialogDescription>
                  </DialogHeader>
                  <AddEventForm onSubmit={handleAddEvent} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription>
                          {event.date} at {event.time}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{event.location}</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.attendees} attendees
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Club Chat Room
                </CardTitle>
                <CardDescription>Moderate and manage club communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Alice Johnson:</strong> Hey everyone! Don't forget about tomorrow's workshop!
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>2 hours ago</span>
                      <Button size="sm" variant="outline">
                        Pin Message
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Bob Smith:</strong> Looking forward to it! Should we bring our own cameras?
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>1 hour ago</span>
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Full Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Profile</CardTitle>
                <CardDescription>Manage your club information and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="club-name">Club Name</Label>
                  <Input id="club-name" value="Photography Club" />
                </div>
                <div>
                  <Label htmlFor="club-description">Description</Label>
                  <Textarea
                    id="club-description"
                    value="Capture moments, create memories. Join us for photo walks and workshops."
                  />
                </div>
                <div>
                  <Label htmlFor="club-college">College</Label>
                  <Input id="club-college" value={user.collegeName} readOnly />
                </div>
                <Button>Update Club Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AddEventForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="event-title">Event Title</Label>
        <Input
          id="event-title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-date">Date</Label>
          <Input
            id="event-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="event-time">Time</Label>
          <Input
            id="event-time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="event-location">Location</Label>
        <Input
          id="event-location"
          value={formData.location}
          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Create Event
      </Button>
    </form>
  )
}
