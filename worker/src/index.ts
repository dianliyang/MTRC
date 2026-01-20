import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, or, and } from 'drizzle-orm';
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

// Auth Middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET || 'fallback_secret',
    alg: 'HS256',
  });
  return jwtMiddleware(c, next);
};

// Protect specific routes
app.use('/api/books', async (c, next) => {
  if (c.req.method === 'POST') return authMiddleware(c, next);
  await next();
});
app.use('/api/books/*', async (c, next) => {
  if (c.req.method === 'DELETE' || c.req.path.includes('/select')) return authMiddleware(c, next);
  await next();
});
app.use('/api/meetings', async (c, next) => {
  if (c.req.method === 'POST') return authMiddleware(c, next);
  await next();
});
app.use('/api/meetings/*', async (c, next) => {
  if (c.req.method === 'DELETE') return authMiddleware(c, next);
  await next();
});

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
  const db = getDB(c);
  const result = await db.query.books.findMany({
    orderBy: [desc(schema.books.createdAt)],
  });
  return c.json(result);
});

// Add a book
app.post('/api/books', async (c) => {
  const db = getDB(c);
  const body = await c.req.json();
  const payload = c.get('jwtPayload'); // From middleware
  const userId = payload ? String(payload.id) : body.suggesterId;
  
  // Check if exists
  const existing = await db.query.books.findFirst({
    where: eq(schema.books.googleId, body.googleId),
  });

  if (existing) return c.json(existing);

  const newItem = await db.insert(schema.books).values({
    googleId: body.googleId,
    title: body.title,
    authors: JSON.stringify(body.authors),
    description: body.description,
    coverUrl: body.coverUrl,
    language: body.language,
    pageCount: body.pageCount,
    publishedDate: body.publishedDate,
    suggesterId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();

  return c.json(newItem);
});

// Delete book
app.delete('/api/books/:id', async (c) => {
  const db = getDB(c);
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.books).where(eq(schema.books.id, id));
  return c.json({ success: true });
});

// Select Current Book
app.post('/api/books/select', async (c) => {
  const db = getDB(c);
  const body = await c.req.json();
  const id = body.id;

  // Archive current
  await db.update(schema.books)
    .set({ status: 'read' })
    .where(eq(schema.books.status, 'current'));

  // Set new current
  const updated = await db.update(schema.books)
    .set({ status: 'current', selectedDate: new Date() })
    .where(eq(schema.books.id, id))
    .returning().get();

  if (!updated) return c.json({ error: 'Book not found' }, 404);

  // Notify
  const subs = await db.query.subscribers.findMany();
  const emails = subs.filter(s => s.email).map(s => s.email);
  const phones = subs.filter(s => s.phoneNumber).map(s => s.phoneNumber);

  // Email Stub
  if (emails.length > 0) {
    // Basic formatting
    const validEmails = emails.filter((e): e is string => !!e);
    await sendEmail(validEmails.join(','), `New Book: ${updated.title}`, `We are reading ${updated.title}`);
  }

  // Signal
  if (phones.length > 0) {
    const msg = `📚 New Book of the Month: "${updated.title}"! Join us: https://read.oili.dev`;
    c.executionCtx.waitUntil(Promise.all(phones.map(p => p ? sendSignalMessage(c.env, p, msg) : Promise.resolve())));
  }

  return c.json({ book: updated });
});

// Subscribe
app.post('/api/subscribe', async (c) => {
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
});

// Comments
app.get('/api/books/:id/comments', async (c) => {
  const db = getDB(c);
  const id = parseInt(c.req.param('id'));
  const results = await db.query.comments.findMany({
    where: eq(schema.comments.bookId, id),
    orderBy: [desc(schema.comments.createdAt)]
  });
  return c.json(results);
});

app.post('/api/books/:id/comments', async (c) => {
  const db = getDB(c);
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  
  const result = await db.insert(schema.comments).values({
    bookId: id,
    username: body.username || 'Anonymous',
    text: body.text,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning().get();

  return c.json(result);
});

// Meetings
app.get('/api/meetings', async (c) => {
  const db = getDB(c);
  
  // Drizzle relationship fetching
  const results = await db.query.meetings.findMany({
    orderBy: [desc(schema.meetings.date)],
    with: {
      // Manual relation fetching logic needed often with D1 if not strictly defined
      // But we can fetch raw
    }
  });

  // For complex relations like Many-to-Many in Drizzle/D1, manual queries are often safer or more explicit
  // fetching books for each meeting
  const meetingsWithDetails = await Promise.all(results.map(async (m) => {
    // Get books
    const mb = await db.select().from(schema.meetingBooks).where(eq(schema.meetingBooks.meetingId, m.id));
    const bookIds = mb.map(r => r.bookId);
    let books: any[] = [];
    if (bookIds.length > 0) {
       // 'inArray' should be used, implementing manually for brevity or importing
       // fetching individually for simplicity in this stub
       books = await Promise.all(bookIds.map(bid => db.query.books.findFirst({ where: eq(schema.books.id, bid!) })));
    }
    
    // Get participants
    const parts = await db.query.participants.findMany({ where: eq(schema.participants.meetingId, m.id) });
    
    return {
      ...m,
      Books: books.filter(Boolean),
      Participants: parts
    };
  }));

  return c.json(meetingsWithDetails);
});

app.get('/api/meetings/:id', async (c) => {
  const db = getDB(c);
  const id = parseInt(c.req.param('id'));
  const meeting = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, id) });
  
  if (!meeting) return c.json({ error: 'Not found' }, 404);

  // Fetch relations (similar logic as above)
  const mb = await db.select().from(schema.meetingBooks).where(eq(schema.meetingBooks.meetingId, id));
  const bookIds = mb.map(r => r.bookId);
  let books: any[] = [];
  if (bookIds.length > 0) {
     books = await Promise.all(bookIds.map(bid => db.query.books.findFirst({ where: eq(schema.books.id, bid!) })));
  }
  const parts = await db.query.participants.findMany({ where: eq(schema.participants.meetingId, id) });

  return c.json({
    ...meeting,
    Books: books.filter(Boolean),
    Participants: parts
  });
});

app.post('/api/meetings', async (c) => {
  const db = getDB(c);
  const body = await c.req.json();
  
  const newMeeting = await db.insert(schema.meetings).values({
    date: new Date(body.date),
    topic: body.topic,
    location: body.location,
    host: body.host,
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

  // Refetch to return full object logic skipped for brevity, returning basic
  return c.json(newMeeting);
});

app.delete('/api/meetings/:id', async (c) => {
  const db = getDB(c);
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.meetings).where(eq(schema.meetings.id, id));
  return c.json({ success: true });
});

app.post('/api/meetings/:id/join', async (c) => {
  const db = getDB(c);
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  
  const part = await db.insert(schema.participants).values({
    meetingId: id,
    name: body.name,
    email: body.email,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning().get();

  return c.json(part);
});

// Auth
app.post('/api/register', async (c) => {
  const db = getDB(c);
  const body = await c.req.json();
  const { email, password, name } = body;

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
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();

    // Generate JWT
    const secret = c.env.JWT_SECRET || 'fallback_secret';
    const token = await sign({ id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, secret);

    return c.json({ id: user.id, name: user.name, email: user.email, token });
  } catch (e) {
    return c.json({ error: 'Registration failed' }, 400);
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
    where: and(eq(schema.users.email, email), eq(schema.users.password, hashHex))
  });

  if (!user) return c.json({ error: 'Invalid credentials' }, 401);

  // Generate JWT
  const secret = c.env.JWT_SECRET || 'fallback_secret';
  const token = await sign({ id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, secret);

  return c.json({ id: user.id, name: user.name, email: user.email, token });
});


export default app;
