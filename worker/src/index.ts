import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, or, and, isNull, inArray } from 'drizzle-orm';
import * as schema from './schema';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  SIGNAL_API_URL?: string;
  SIGNAL_SENDER_NUMBER?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Suppress Permissions-Policy warnings
app.use('*', async (c, next) => {
  await next();
  c.header('Permissions-Policy', 'picture-in-picture=(), geolocation=(), camera=(), microphone=()');
});

// Auth Middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return c.json({ error: 'Server configuration error' }, 500);
  }
  const jwtMiddleware = jwt({
    secret: secret,
    alg: 'HS256',
  });
  return jwtMiddleware(c, next);
};

// Admin Middleware (Assumes authMiddleware has already run)
const adminMiddleware = async (c: any, next: any) => {
  const payload = c.get('jwtPayload');
  if (payload?.role !== 'admin') {
    return c.json({ error: 'Unauthorized: Admin access required' }, 403);
  }
  await next();
};

// Global API Protection
app.use('/api/*', async (c, next) => {
  // Allow login to be public
  if (c.req.path === '/api/login') return next();
  return authMiddleware(c, next);
});

// Protect specific admin routes
app.use('/api/admin/*', adminMiddleware);

// Helper: Get DB instance
const getDB = (c: any) => drizzle(c.env.DB, { schema });

// ... (Rest of Helpers: sendSignalMessage, sendEmail) ...
// Helper: Send Signal Message
async function sendSignalMessage(env: Bindings, recipientNumber: string, message: string) {
  const url = env.SIGNAL_API_URL || 'http://localhost:8080';
  const sender = env.SIGNAL_SENDER_NUMBER || '+1234567890';
  
  try {
    await fetch(`${url}/v2/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        number: sender,
        recipients: [recipientNumber],
      }),
    });
  } catch (e) {
    console.error(`Signal error for ${recipientNumber}:`, e);
  }
}

// Helper: Send Email (Stub - requires HTTP email provider like Resend/Mailchannels)
async function sendEmail(to: string, subject: string, text: string) {
  console.log(`[Email Stub] To: ${to}, Subject: ${subject}, Body: ${text}`);
  // Implement Fetch to SendGrid/Resend API here
}


// --- Routes ---

// Get all books
app.get('/api/books', async (c) => {
  try {
    const db = getDB(c);
    const result = await db.query.books.findMany({
      orderBy: [desc(schema.books.createdAt)],
    });
    return c.json(result);
  } catch (e) {
    return c.json({ error: 'Failed to fetch books' }, 500);
  }
});

// Get single book
app.get('/api/books/:id', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    
    const result = await db.query.books.findFirst({
      where: eq(schema.books.id, id),
    });
    if (!result) return c.json({ error: 'Book not found' }, 404);
    return c.json(result);
  } catch (e) {
    return c.json({ error: 'Failed to fetch book' }, 500);
  }
});

// Add a book
app.post('/api/books', async (c) => {
  try {
    const db = getDB(c);
    const body = await c.req.json();
    const payload = c.get('jwtPayload'); // From middleware
    const userId = payload ? String(payload.id) : body.suggesterId;
    
    if (!body.googleId || !body.title) return c.json({ error: 'Missing required fields' }, 400);
    
    // Check if exists
    const existing = await db.query.books.findFirst({
      where: eq(schema.books.googleId, body.googleId),
    });

    if (existing) return c.json(existing);

    const newItem = await db.insert(schema.books).values({
      googleId: body.googleId,
      title: body.title,
      authors: JSON.stringify(body.authors || []),
      description: body.description || '',
      coverUrl: body.coverUrl || '',
      language: body.language || '',
      pageCount: body.pageCount || 0,
      publishedDate: body.publishedDate || '',
      suggesterId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().get();

    return c.json(newItem);
  } catch (e) {
    return c.json({ error: 'Failed to add book' }, 500);
  }
});

// Delete book
app.delete('/api/books/:id', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    await db.delete(schema.books).where(eq(schema.books.id, id));
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: 'Failed to delete book' }, 500);
  }
});

// Select Current Book
app.post('/api/books/select', async (c) => {
  try {
    const db = getDB(c);
    const body = await c.req.json();
    const id = body.id;
    if (!id) return c.json({ error: 'Missing book ID' }, 400);

    // Archive current
    await db.update(schema.books)
      .set({ status: 'read' })
      .where(eq(schema.books.status, 'current'));

    // Set new current
    const updated = await db.update(schema.books)
      .set({ status: 'current', selectedDate: new Date(), updatedAt: new Date() })
      .where(eq(schema.books.id, id))
      .returning().get();

    if (!updated) return c.json({ error: 'Book not found' }, 404);

    // Notify
    const subs = await db.query.subscribers.findMany();
    const emails = subs.filter(s => s.email).map(s => s.email as string);
    const phones = subs.filter(s => s.phoneNumber).map(s => s.phoneNumber as string);

    // Email Stub
    if (emails.length > 0) {
      await sendEmail(emails.join(','), `New Book: ${updated.title}`, `We are reading ${updated.title}`);
    }

    // Signal
    if (phones.length > 0) {
      const msg = `📚 New Book of the Month: "${updated.title}"! Join us: https://read.oili.dev`;
      c.executionCtx.waitUntil(Promise.all(phones.map(p => sendSignalMessage(c.env, p, msg))));
    }

    return c.json({ book: updated });
  } catch (e) {
    return c.json({ error: 'Failed to select book' }, 500);
  }
});

// Subscribe
app.post('/api/subscribe', async (c) => {
  try {
    const db = getDB(c);
    const body = await c.req.json();
    const { email, phoneNumber } = body;

    if (!email && !phoneNumber) return c.json({ error: 'Provide email or phone' }, 400);

    const existing = await db.query.subscribers.findFirst({
      where: or(
        email ? eq(schema.subscribers.email, email) : undefined,
        phoneNumber ? eq(schema.subscribers.phoneNumber, phoneNumber) : undefined
      )
    });

    if (existing) {
      await db.update(schema.subscribers)
        .set({ 
          email: email || existing.email,
          phoneNumber: phoneNumber || existing.phoneNumber,
          updatedAt: new Date()
        })
        .where(eq(schema.subscribers.id, existing.id));
      return c.json({ message: 'Updated' });
    }

    await db.insert(schema.subscribers).values({
      email,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: 'Failed to subscribe' }, 500);
  }
});

// Comments
app.get('/api/books/:id/comments', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    const results = await db.query.comments.findMany({
      where: eq(schema.comments.bookId, id),
      orderBy: [desc(schema.comments.createdAt)]
    });
    return c.json(results);
  } catch (e) {
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

app.post('/api/books/:id/comments', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    const body = await c.req.json();
    
    if (!body.text) return c.json({ error: 'Comment text is required' }, 400);

    const result = await db.insert(schema.comments).values({
      bookId: id,
      username: body.username || 'Anonymous',
      text: body.text,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();

    return c.json(result);
  } catch (e) {
    return c.json({ error: 'Failed to post comment' }, 500);
  }
});

// Likes
app.get('/api/books/:id/like-status', async (c) => {
  try {
    const db = getDB(c);
    const bookId = parseInt(c.req.param('id'));
    if (isNaN(bookId)) return c.json({ error: 'Invalid ID' }, 400);
    const payload = c.get('jwtPayload');
    
    const existing = await db.query.likes.findFirst({
      where: and(eq(schema.likes.userId, parseInt(payload.id)), eq(schema.likes.bookId, bookId))
    });

    return c.json({ liked: !!existing });
  } catch (e) {
    return c.json({ error: 'Failed to fetch like status' }, 500);
  }
});

app.post('/api/books/:id/toggle-like', async (c) => {
  try {
    const db = getDB(c);
    const bookId = parseInt(c.req.param('id'));
    if (isNaN(bookId)) return c.json({ error: 'Invalid ID' }, 400);
    const payload = c.get('jwtPayload');
    const userId = parseInt(payload.id);

    const existing = await db.query.likes.findFirst({
      where: and(eq(schema.likes.userId, userId), eq(schema.likes.bookId, bookId))
    });

    if (existing) {
      // Unlike
      await db.delete(schema.likes).where(eq(schema.likes.id, existing.id));
      const book = await db.query.books.findFirst({ where: eq(schema.books.id, bookId) });
      await db.update(schema.books)
        .set({ likesCount: Math.max(0, (book?.likesCount || 0) - 1), updatedAt: new Date() })
        .where(eq(schema.books.id, bookId));
      return c.json({ liked: false });
    } else {
      // Like
      await db.insert(schema.likes).values({ userId, bookId, createdAt: new Date() });
      const book = await db.query.books.findFirst({ where: eq(schema.books.id, bookId) });
      await db.update(schema.books)
        .set({ likesCount: (book?.likesCount || 0) + 1, updatedAt: new Date() })
        .where(eq(schema.books.id, bookId));
      return c.json({ liked: true });
    }
  } catch (e) {
    return c.json({ error: 'Failed to toggle like' }, 500);
  }
});

// Meetings
app.get('/api/meetings', async (c) => {
  try {
    const db = getDB(c);
    
    // Drizzle relationship fetching
    const results = await db.query.meetings.findMany({
      orderBy: [desc(schema.meetings.date)],
    });

    // For complex relations like Many-to-Many in Drizzle/D1, manual queries are often safer or more explicit
    // fetching books for each meeting
    const meetingsWithDetails = await Promise.all(results.map(async (m) => {
      // Get books
      const mb = await db.select({ bookId: schema.meetingBooks.bookId })
        .from(schema.meetingBooks)
        .where(eq(schema.meetingBooks.meetingId, m.id));
      
      const bookIds = mb.map(r => r.bookId).filter((id): id is number => id !== null);
      
      let books: any[] = [];
      if (bookIds.length > 0) {
        books = await db.query.books.findMany({
          where: inArray(schema.books.id, bookIds)
        });
      }
      
      // Get participants
      const parts = await db.query.participants.findMany({ where: eq(schema.participants.meetingId, m.id) });
      
      return {
        ...m,
        Books: books,
        Participants: parts
      };
    }));

    return c.json(meetingsWithDetails);
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Failed to fetch meetings' }, 500);
  }
});

app.get('/api/meetings/:id', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    const meeting = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, id) });
    
    if (!meeting) return c.json({ error: 'Not found' }, 404);

    // Fetch relations
    const mb = await db.select({ bookId: schema.meetingBooks.bookId })
      .from(schema.meetingBooks)
      .where(eq(schema.meetingBooks.meetingId, id));
    
    const bookIds = mb.map(r => r.bookId).filter((id): id is number => id !== null);
    
    let books: any[] = [];
    if (bookIds.length > 0) {
       books = await db.query.books.findMany({ where: inArray(schema.books.id, bookIds) });
    }
    const parts = await db.query.participants.findMany({ where: eq(schema.participants.meetingId, id) });

    return c.json({
      ...meeting,
      Books: books,
      Participants: parts
    });
  } catch (e) {
    return c.json({ error: 'Failed to fetch meeting' }, 500);
  }
});

app.post('/api/meetings', async (c) => {
  try {
    const db = getDB(c);
    const body = await c.req.json();
    
    const newMeeting = await db.insert(schema.meetings).values({
      date: new Date(body.date),
      topic: body.topic,
      location: body.location || 'Online',
      host: body.host || 'Group Curator',
      description: body.description,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();

    if (body.bookIds && body.bookIds.length > 0) {
      for (const bid of body.bookIds) {
        await db.insert(schema.meetingBooks).values({
          meetingId: newMeeting.id,
          bookId: bid
        });
      }
    }

    return c.json(newMeeting);
  } catch (e) {
    return c.json({ error: 'Failed to create meeting' }, 500);
  }
});

app.delete('/api/meetings/:id', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    await db.delete(schema.meetings).where(eq(schema.meetings.id, id));
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: 'Failed to delete meeting' }, 500);
  }
});

app.post('/api/meetings/:id/join', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    const body = await c.req.json();
    
    if (!body.name) return c.json({ error: 'Name is required' }, 400);

    const part = await db.insert(schema.participants).values({
      meetingId: id,
      name: body.name,
      email: body.email,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();

    return c.json(part);
  } catch (e) {
    return c.json({ error: 'Failed to join meeting' }, 500);
  }
});

// Auth
app.post('/api/admin/invite', async (c) => {
  const db = getDB(c);
  const body = await c.req.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name) return c.json({ error: 'Missing fields' }, 400);

  // Hash password using Web Crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  try {
    const user = await db.insert(schema.users).values({
      email,
      password: hashHex,
      name,
      role: role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();

    // In a real app, send invitation email here
    await sendEmail(email, 'Invitation to MoreThan Reading Group', `Hello ${name}, you have been invited. Use your email and the provided password to login.`);

    return c.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    return c.json({ error: 'Invitation failed' }, 400);
  }
});

app.post('/api/login', async (c) => {
  const db = getDB(c);
  const body = await c.req.json();
  const { email, password } = body;

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const user = await db.query.users.findFirst({
    where: and(
      eq(schema.users.email, email), 
      eq(schema.users.password, hashHex),
      // Prevent login if account is marked as deleted
      isNull(schema.users.deletedAt)
    )
  });

  if (!user || user.deletedAt) return c.json({ error: 'Invalid credentials or account deleted' }, 401);

  // Generate JWT
  const secret = c.env.JWT_SECRET || 'fallback_secret';
  const token = await sign({ 
    id: user.id, 
    email: user.email, 
    role: user.role, // Added role to payload
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 
  }, secret, 'HS256'); // Added algorithm explicitly for clarity

  return c.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
});

// Profile Management
app.delete('/api/profile', async (c) => {
  try {
    const db = getDB(c);
    const payload = c.get('jwtPayload');
    
    if (!payload?.id) return c.json({ error: 'Unauthorized' }, 401);

    const userId = parseInt(payload.id);
    const timestamp = Date.now();
    
    // Soft delete: update data to mark as deleted instead of removing
    await db.update(schema.users)
      .set({
        email: `deleted_${userId}_${timestamp}@mtrc.internal`,
        name: 'Deleted Curator',
        password: `DELETED_${timestamp}_${Math.random().toString(36).substring(7)}`,
        role: 'user', // Reset role
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));

    return c.json({ success: true, message: 'Account has been deactivated' });
  } catch (e) {
    return c.json({ error: 'Failed to deactivate account' }, 500);
  }
});


export default app;
