import { User } from '@/hooks/useAuth';

/**
 * Check if a user has access to a club's chat
 * @param user - The current user
 * @param clubId - The ID of the club
 * @returns boolean indicating if user has access
 */
export const hasClubChatAccess = (user: User | null, clubId: string): boolean => {
  if (!user) return false;

  // Super admin has access to all chats
  if (user.role === 'super_admin') return true;

  // College admin has access to all clubs in their college
  if (user.role === 'college_admin') return true;

  // Club admin has access if it's their club
  if (user.role === 'club_admin' && user.clubId === clubId) return true;

  // Students have access if they're enrolled in the club
  if (user.role === 'student' && user.enrolledClubs?.includes(clubId)) return true;

  return false;
};

/**
 * Check if a user can moderate messages in a club chat
 * @param user - The current user
 * @param clubId - The ID of the club
 * @returns boolean indicating if user can moderate
 */
export const canModerateChat = (user: User | null, clubId: string): boolean => {
  if (!user) return false;

  // Super admin can moderate all chats
  if (user.role === 'super_admin') return true;

  // College admin can moderate all clubs in their college
  if (user.role === 'college_admin') return true;

  // Club admin can moderate their club's chat
  if (user.role === 'club_admin' && user.clubId === clubId) return true;

  // Club leaders can moderate (president, vice_president, lead)
  if (
    user.role === 'student' && 
    user.enrolledClubs?.includes(clubId) &&
    user.clubRole && 
    ['president', 'vice_president', 'lead'].includes(user.clubRole)
  ) {
    return true;
  }

  return false;
};

/**
 * Check if a user can send messages in a club chat
 * @param user - The current user
 * @param clubId - The ID of the club
 * @returns boolean indicating if user can send messages
 */
export const canSendMessages = (user: User | null, clubId: string): boolean => {
  // Same as chat access for now
  return hasClubChatAccess(user, clubId);
};

/**
 * Get user's role display name for chat
 * @param user - The current user
 * @param clubId - The ID of the club
 * @returns string representing the user's role in the club
 */
export const getUserRoleInClub = (user: User | null, clubId: string): string => {
  if (!user) return '';

  if (user.role === 'super_admin') return 'Super Admin';
  if (user.role === 'college_admin') return 'College Admin';
  if (user.role === 'club_admin' && user.clubId === clubId) return 'Club Admin';

  if (user.role === 'student' && user.enrolledClubs?.includes(clubId)) {
    switch (user.clubRole) {
      case 'president': return 'President';
      case 'vice_president': return 'Vice President';
      case 'lead': return 'Lead';
      default: return 'Member';
    }
  }

  return '';
};

/**
 * Get club membership status for a user
 * @param user - The current user
 * @param clubId - The ID of the club
 * @returns object with membership details
 */
export const getClubMembershipStatus = (user: User | null, clubId: string) => {
  if (!user) {
    return {
      isMember: false,
      role: '',
      canAccess: false,
      canModerate: false,
      canSend: false
    };
  }

  const isMember = hasClubChatAccess(user, clubId);
  const role = getUserRoleInClub(user, clubId);
  const canAccess = hasClubChatAccess(user, clubId);
  const canModerate = canModerateChat(user, clubId);
  const canSend = canSendMessages(user, clubId);

  return {
    isMember,
    role,
    canAccess,
    canModerate,
    canSend
  };
};

/**
 * Mock function to get club members (for development)
 * In production, this would fetch from Firestore
 * @param clubId - The ID of the club
 * @returns Promise with array of club members
 */
export const getClubMembers = async (clubId: string) => {
  // Mock data - replace with actual Firestore query
  return [
    {
      uid: 'club-admin-1',
      name: 'Club Admin',
      role: 'club_admin',
      clubRole: 'admin'
    },
    {
      uid: 'student-1',
      name: 'Alice Johnson',
      role: 'student',
      clubRole: 'president'
    },
    {
      uid: 'student-2',
      name: 'Bob Smith',
      role: 'student',
      clubRole: 'vice_president'
    }
  ];
};
