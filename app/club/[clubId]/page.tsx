'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Calendar,
  MessageCircle,
  Info,
  UserPlus,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/navbar';
import { ClubChat } from '@/components/club-chat';
import { hasClubChatAccess, getClubMembershipStatus } from '@/lib/access-control';

interface ClubInfo {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  college: string;
}

interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
}

export default function ClubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clubId = params.clubId as string;
  
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState({
    isMember: false,
    role: '',
    canAccess: false,
    canModerate: false,
    canSend: false
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Mock club data - replace with actual API call
    const mockClubInfo: ClubInfo = {
      id: clubId,
      name: 'Photography Club',
      description: 'Capture moments, create memories. Join us for photo walks, workshops, and exhibitions.',
      memberCount: 45,
      category: 'Arts & Culture',
      college: 'Tech University'
    };

    const mockEvents: ClubEvent[] = [
      {
        id: '1',
        title: 'Photography Workshop',
        description: 'Learn advanced photography techniques with professional equipment',
        date: '2024-01-25',
        time: '2:00 PM',
        location: 'Art Building Room 101',
        attendees: 25,
      },
      {
        id: '2',
        title: 'Photo Walk Downtown',
        description: 'Explore the city and capture urban photography',
        date: '2024-02-01',
        time: '10:00 AM',
        location: 'Downtown Square',
        attendees: 18,
      },
    ];

    setClubInfo(mockClubInfo);
    setEvents(mockEvents);
    
    // Check membership status
    const status = getClubMembershipStatus(user, clubId);
    setMembershipStatus(status);
    
    setIsLoading(false);
  }, [user, router, clubId]);

  const handleJoinClub = () => {
    // TODO: Implement join club functionality
    console.log('Joining club:', clubId);
  };

  if (isLoading || !clubInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-bold">
                  {clubInfo.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{clubInfo.name}</h1>
                <p className="text-gray-600">{clubInfo.college}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{clubInfo.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    {clubInfo.memberCount} members
                  </div>
                  {membershipStatus.role && (
                    <Badge variant="outline">{membershipStatus.role}</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!membershipStatus.isMember ? (
                <Button onClick={handleJoinClub}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Club
                </Button>
              ) : (
                membershipStatus.canModerate && (
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            {membershipStatus.canAccess && (
              <TabsTrigger value="chat">Chat</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About {clubInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{clubInfo.description}</p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{clubInfo.memberCount}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{events.length}</div>
                    <div className="text-sm text-gray-600">Upcoming Events</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">Active</div>
                    <div className="text-sm text-gray-600">Community</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {event.date} at {event.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{event.location}</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.attendees} attending
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      {membershipStatus.isMember ? 'RSVP' : 'Join Club to RSVP'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {membershipStatus.canAccess && (
            <TabsContent value="chat" className="space-y-6">
              <ClubChat 
                clubId={clubId} 
                clubName={`${clubInfo.name} Chat`}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
