'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Calendar, Trophy, Star, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/navbar';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'super_admin':
          router.push('/super-admin');
          break;
        case 'college_admin':
          router.push('/college-admin');
          break;
        case 'club_admin':
          router.push('/club-admin');
          break;
        case 'student':
          router.push('/dashboard');
          break;
        default:
          break;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your College's Universe of Clubs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with like-minded students, discover amazing clubs, participate in events, and
            build lasting relationships in your college community.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Join Clubs</CardTitle>
              <CardDescription>
                Discover and join clubs that match your interests from your college
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Real-time Chat</CardTitle>
              <CardDescription>
                Connect with club members through dedicated chat rooms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Events & Activities</CardTitle>
              <CardDescription>
                Stay updated with club events and participate in activities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>Leadership Roles</CardTitle>
              <CardDescription>
                Take on leadership roles like President, Vice President, or Lead
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Role-based Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Browse clubs from your college</li>
                <li>• Join clubs and participate in activities</li>
                <li>• Chat with club members in real-time</li>
                <li>• Get leadership roles in clubs</li>
                <li>• Stay updated with events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Star className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>For Club Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Manage club members and activities</li>
                <li>• Assign leadership roles to members</li>
                <li>• Create and manage events</li>
                <li>• Moderate club chat rooms</li>
                <li>• Track member engagement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Crown className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>For College Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Manage all college clubs</li>
                <li>• Oversee student registrations</li>
                <li>• Create new clubs and assign admins</li>
                <li>• Monitor college-wide activities</li>
                <li>• Generate reports and analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
