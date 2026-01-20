export interface Book {
  id: number;
  googleId: string;
  title: string;
  authors: string | string[]; // Can be JSON string or array
  description: string;
  coverUrl: string;
  language: string;
  pageCount: number;
  publishedDate: string;
  status: 'candidate' | 'current' | 'read';
  selectedDate?: string;
  suggesterId?: string;
  likesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Meeting {
  id: number;
  date: string;
  topic: string;
  location: string;
  host: string;
  description: string;
  publishedAt: string | null;
  Books?: Book[];
  Participants?: Participant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  meetingId: number;
}

export interface Comment {
  id: number;
  username: string;
  text: string;
  bookId: number;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
