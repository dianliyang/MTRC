import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  googleId: text('google_id').unique(),
  title: text('title'),
  authors: text('authors'), // Stored as JSON string
  description: text('description'),
  coverUrl: text('cover_url'),
  language: text('language'),
  pageCount: integer('page_count'),
  publishedDate: text('published_date'),
  status: text('status').default('candidate'), // 'candidate', 'current', 'read'
  selectedDate: integer('selected_date', { mode: 'timestamp' }),
  suggesterId: text('suggester_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username'),
  text: text('text'),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const subscribers = sqliteTable('subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email'),
  phoneNumber: text('phone_number'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const meetings = sqliteTable('meetings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  topic: text('topic').notNull(),
  location: text('location').default('Online'),
  host: text('host').default('Group Curator'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const meetingBooks = sqliteTable('meeting_books', {
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
});
