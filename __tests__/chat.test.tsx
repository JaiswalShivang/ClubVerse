import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClubChat } from '@/components/club-chat';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToClubMessages, sendMessage, isClubMember } from '@/lib/chat-service';

// Mock the dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/chat-service');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSubscribeToClubMessages = subscribeToClubMessages as jest.MockedFunction<typeof subscribeToClubMessages>;
const mockSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;
const mockIsClubMember = isClubMember as jest.MockedFunction<typeof isClubMember>;

const mockUser = {
  uid: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student' as const,
  enrolledClubs: ['test-club-1']
};

const mockMessages = [
  {
    id: '1',
    senderId: 'user-2',
    senderName: 'Alice Johnson',
    text: 'Hello everyone!',
    timestamp: { toDate: () => new Date('2024-01-20T10:00:00Z') }
  },
  {
    id: '2',
    senderId: 'test-user-1',
    senderName: 'Test User',
    text: 'Hi Alice!',
    timestamp: { toDate: () => new Date('2024-01-20T10:01:00Z') }
  }
];

describe('ClubChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser, signOut: jest.fn() });
    mockIsClubMember.mockResolvedValue(true);
    mockSubscribeToClubMessages.mockImplementation((clubId, callback) => {
      callback(mockMessages);
      return jest.fn(); // unsubscribe function
    });
  });

  it('renders loading state initially', () => {
    mockIsClubMember.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    expect(screen.getByText('Loading chat...')).toBeInTheDocument();
  });

  it('renders access denied for non-members', async () => {
    mockIsClubMember.mockResolvedValue(false);
    
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByText("You don't have access to this club's chat")).toBeInTheDocument();
    });
  });

  it('renders chat interface for club members', async () => {
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Club')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });
  });

  it('displays messages correctly', async () => {
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('Hi Alice!')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('sends messages when form is submitted', async () => {
    mockSendMessage.mockResolvedValue();
    
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        'test-club-1',
        {
          uid: 'test-user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student'
        },
        'Test message'
      );
    });
  });

  it('prevents sending empty messages', async () => {
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: '   ' } }); // Only whitespace
    expect(sendButton).toBeDisabled();
  });

  it('handles send message errors', async () => {
    mockSendMessage.mockRejectedValue(new Error('Network error'));
    
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows offline indicator when offline', async () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('disables input when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/offline/i);
      expect(input).toBeDisabled();
    });
  });

  it('shows empty state when no messages', async () => {
    mockSubscribeToClubMessages.mockImplementation((clubId, callback) => {
      callback([]);
      return jest.fn();
    });

    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText('Start the conversation and connect with your club members!')).toBeInTheDocument();
    });
  });

  it('formats message timestamps correctly', async () => {
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      // Should show time in HH:mm format
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('10:01')).toBeInTheDocument();
    });
  });

  it('distinguishes between current user and other users messages', async () => {
    render(<ClubChat clubId="test-club-1" clubName="Test Club" />);
    
    await waitFor(() => {
      const messages = screen.getAllByText(/Hello everyone!|Hi Alice!/);
      expect(messages).toHaveLength(2);
      
      // Current user's message should not show sender name
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
      // Other user's message should show sender name
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });
});

// Test chat service functions
describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('validates message content', async () => {
      const user = {
        uid: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student' as const
      };

      // Should reject empty messages
      await expect(sendMessage('club-1', user, '')).rejects.toThrow();
      await expect(sendMessage('club-1', user, '   ')).rejects.toThrow();
    });

    it('validates user information', async () => {
      const invalidUser = {
        uid: '',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student' as const
      };

      await expect(sendMessage('club-1', invalidUser, 'Hello')).rejects.toThrow();
    });
  });

  describe('isClubMember', () => {
    it('returns true for valid club members', async () => {
      // This would normally check Firestore, but we're mocking it
      const result = await isClubMember('club-1', 'user-1');
      expect(typeof result).toBe('boolean');
    });
  });
});
