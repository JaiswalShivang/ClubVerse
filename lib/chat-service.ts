import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

// Message interface matching the Firestore data structure
export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp | null;
  createdAt?: Date;
}

// User info interface for sending messages
export interface MessageSender {
  uid: string;
  name: string;
  email?: string;
  role?: string;
}

/**
 * Subscribe to real-time messages for a specific club
 * Collection path: clubs/{clubId}/messages
 * @param clubId - The ID of the club
 * @param callback - Function to call when messages update
 * @returns Unsubscribe function
 */
export const subscribeToClubMessages = (
  clubId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const messagesRef = collection(db, 'clubs', clubId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: ChatMessage[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        senderName: data.senderName,
        text: data.text,
        timestamp: data.timestamp,
        createdAt: data.timestamp?.toDate() || new Date()
      };
    });
    callback(messages);
  });
};

/**
 * Send a new message to a club chat
 * @param clubId - The ID of the club
 * @param sender - Information about the message sender
 * @param text - The message text
 * @returns Promise that resolves when message is sent
 */
export const sendMessage = async (
  clubId: string,
  sender: MessageSender,
  text: string
): Promise<void> => {
  if (!text.trim()) {
    throw new Error('Message text cannot be empty');
  }

  const messagesRef = collection(db, 'clubs', clubId, 'messages');
  
  const messageData = {
    senderId: sender.uid,
    senderName: sender.name,
    text: text.trim(),
    timestamp: serverTimestamp()
  };

  await addDoc(messagesRef, messageData);
};

/**
 * Check if a user is a member of a club (placeholder for now)
 * This should be implemented based on your club membership logic
 * @param clubId - The ID of the club
 * @param userId - The ID of the user
 * @returns Promise<boolean> indicating if user is a member
 */
export const isClubMember = async (clubId: string, userId: string): Promise<boolean> => {
  // TODO: Implement actual membership check
  // This could check a clubs/{clubId}/members collection
  // or a users/{userId} document with enrolledClubs array
  return true; // For now, allow all users
};

/**
 * Get club information (placeholder for now)
 * @param clubId - The ID of the club
 * @returns Promise with club information
 */
export const getClubInfo = async (clubId: string) => {
  // TODO: Implement actual club info retrieval
  return {
    id: clubId,
    name: 'Photography Club',
    description: 'Capture moments, create memories'
  };
};
