import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password'), // Nullable initially for invited users
  name: text('name').notNull(),
  role: text('role').notNull().default('member'),
  invitationToken: text('invitation_token').unique(),
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
  likesCount: integer('likes_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
}, (table) => ({
  statusIdx: index('status_idx').on(table.status),
}));

export const likes = sqliteTable('likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
}, (table) => ({
  userBookIdx: index('user_book_idx').on(table.userId, table.bookId),
}));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username'),
  text: text('text'),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
}, (table) => ({
  bookIdIdx: index('book_idx').on(table.bookId),
}));

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
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
}, (table) => ({
  publishedAtIdx: index('published_at_idx').on(table.publishedAt),
  dateIdx: index('date_idx').on(table.date),
}));

export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed'
  confirmationToken: text('confirmation_token').unique(),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
}, (table) => ({
  meetingIdx: index('meeting_idx').on(table.meetingId),
}));

export const meetingBooks = sqliteTable('meeting_books', {
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: index('meeting_book_idx').on(table.meetingId, table.bookId),
}));
