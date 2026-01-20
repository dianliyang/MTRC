import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, or, and, isNull, inArray } from 'drizzle-orm';
import * as schema from './schema';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
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
  // Allow login and join confirmation to be public
  if (c.req.path === '/api/login' || c.req.path === '/api/confirm-join') return next();
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

// Helper: Send Email via Resend API
async function sendEmail(env: Bindings, to: string, subject: string, text: string, html?: string) {
  if (!env.RESEND_API_KEY) {
    console.log(`[Email Stub] To: ${to}, Subject: ${subject}, Body: ${text}`);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || 'MoreThan Reading Club <onboarding@resend.dev>',
        to: to.split(','),
        subject: subject,
        text: text,
        html: html || undefined,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend API Error:', error);
      console.error('Note: Ensure your FROM_EMAIL domain is verified in Resend dashboard.');
    }
  } catch (e) {
    console.error('Failed to send email:', e);
  }
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
      await sendEmail(c.env, emails.join(','), `New Book: ${updated.title}`, `We are reading ${updated.title}`);
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
    const payload = c.get('jwtPayload');
    const isAdmin = payload?.role === 'admin';
    
    // Drizzle relationship fetching
    const results = await db.query.meetings.findMany({
      where: isAdmin ? undefined : isNotNull(schema.meetings.publishedAt),
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
      const parts = await db.query.participants.findMany({ 
        where: and(
          eq(schema.participants.meetingId, m.id),
          eq(schema.participants.status, 'confirmed')
        )
      });
      
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

    const payload = c.get('jwtPayload');
    if (!meeting.publishedAt && payload?.role !== 'admin') {
      return c.json({ error: 'Meeting is not yet published' }, 403);
    }

    // Fetch relations
    const mb = await db.select({ bookId: schema.meetingBooks.bookId })
      .from(schema.meetingBooks)
      .where(eq(schema.meetingBooks.meetingId, id));
    
    const bookIds = mb.map(r => r.bookId).filter((id): id is number => id !== null);
    
    let books: any[] = [];
    if (bookIds.length > 0) {
       books = await db.query.books.findMany({ where: inArray(schema.books.id, bookIds) });
    }
    const parts = await db.query.participants.findMany({ 
      where: and(
        eq(schema.participants.meetingId, id),
        eq(schema.participants.status, 'confirmed')
      )
    });

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
    console.error(e);
    return c.json({ error: 'Failed to create meeting draft' }, 500);
  }
});

app.post('/api/meetings/:id/publish', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const meeting = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, id) });
    if (!meeting) return c.json({ error: 'Meeting not found' }, 404);
    if (meeting.publishedAt) return c.json({ error: 'Already published' }, 400);

    const mb = await db.select({ bookId: schema.meetingBooks.bookId })
      .from(schema.meetingBooks)
      .where(eq(schema.meetingBooks.meetingId, id));
    
    const bookIds = mb.map(r => r.bookId).filter((bid): bid is number => bid !== null);
    
    let relatedBooks: any[] = [];
    if (bookIds.length > 0) {
      relatedBooks = await db.query.books.findMany({
        where: inArray(schema.books.id, bookIds)
      });
    }

    // Set publishedAt
    await db.update(schema.meetings)
      .set({ publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.meetings.id, id));

    // Send Invitations
    c.executionCtx.waitUntil((async () => {
      const subs = await db.query.subscribers.findMany();
      for (const sub of subs) {
        if (!sub.email) continue;
        const token = crypto.randomUUID();
        await db.insert(schema.participants).values({
          meetingId: id,
          name: sub.email.split('@')[0],
          email: sub.email,
          status: 'pending',
          confirmationToken: token,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        const html = generateConfirmationEmail(sub.email.split('@')[0], meeting, token, relatedBooks);
        await sendEmail(c.env, sub.email, `Invitation: ${meeting.topic}`, `You are invited to our next gathering`, html);
      }
    })());

    return c.json({ success: true, message: 'Meeting published' });
  } catch (e) {
    return c.json({ error: 'Failed to publish' }, 500);
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

// Helper: Generate Confirmation Email HTML (Invitation with Magic Link)
function generateConfirmationEmail(name: string, meeting: any, token: string, books: any[] = []) {
  const confirmUrl = `https://read.oili.dev/confirm-join?token=${token}`;
  const dateStr = new Date(meeting.date).toLocaleString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const booksHtml = books.length > 0 
    ? `
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f8f5f2;">
        <div style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; font-weight: bold; color: rgba(44,44,44,0.4); margin-bottom: 16px;">The Subject Matter</div>
        ${books.map(b => `
          <div style="margin-bottom: 16px;">
            <div style="font-family: Georgia, serif; font-size: 18px; color: #2c2c2c;">${b.title}</div>
            <div style="font-size: 14px; color: rgba(44,44,44,0.6);">by ${JSON.parse(b.authors || '[]').join(', ')}</div>
          </div>
        `).join('')}
      </div>
    ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f5f2; color: #2c2c2c; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 48px; border-radius: 24px; border: 1px solid rgba(44,44,44,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .brand { text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; font-weight: 800; color: #d97706; margin-bottom: 32px; }
        h1 { font-family: Georgia, serif; font-size: 36px; margin-bottom: 24px; line-height: 1.1; font-weight: normal; }
        p { font-size: 18px; line-height: 1.6; margin-bottom: 24px; color: #4a4a4a; }
        .meta { color: #2c2c2c; font-size: 16px; margin-bottom: 40px; background: #fcfaf8; padding: 24px; border-radius: 16px; }
        .meta-item { margin-bottom: 8px; }
        .meta-label { text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; font-weight: 800; color: rgba(44,44,44,0.4); display: block; margin-bottom: 2px; }
        .button-container { text-align: center; margin: 48px 0; }
        .button { display: inline-block; padding: 20px 40px; background: #2c2c2c; color: #f8f5f2 !important; text-decoration: none; border-radius: 100px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; }
        .footer { margin-top: 48px; font-size: 13px; color: rgba(44,44,44,0.4); text-align: center; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">MoreThan Reading Club</div>
        <h1>You're Invited</h1>
        <p>Hello ${name}, we are gathering to discuss <strong>${meeting.topic}</strong>. We would be honored to have your perspective at the table.</p>
        
        <div class="meta">
          <div class="meta-item">
            <span class="meta-label">When</span>
            ${dateStr}
          </div>
          <div class="meta-item">
            <span class="meta-label">Where</span>
            ${meeting.location}
          </div>
          <div class="meta-item">
            <span class="meta-label">Curator</span>
            ${meeting.host}
          </div>
        </div>

        ${booksHtml}

        <div class="button-container">
          <a href="${confirmUrl}" class="button">Confirm My Attendance</a>
        </div>

        <div class="footer">
          One click will instantly add you to the participant list.<br>
          We look forward to the conversation.
        </div>
      </div>
    </body>
    </html>
  `;
}

app.post('/api/confirm-join', async (c) => {
  try {
    const db = getDB(c);
    const { token } = await c.req.json();
    if (!token) return c.json({ error: 'Token is required' }, 400);

    const participant = await db.query.participants.findFirst({
      where: eq(schema.participants.confirmationToken, token)
    });

    if (!participant) return c.json({ error: 'Invalid or expired token' }, 404);

    await db.update(schema.participants)
      .set({ 
        status: 'confirmed', 
        confirmationToken: null, // One-time use
        updatedAt: new Date() 
      })
      .where(eq(schema.participants.id, participant.id));

    return c.json({ success: true, message: 'Attendance confirmed' });
  } catch (e) {
    return c.json({ error: 'Confirmation failed' }, 500);
  }
});

app.post('/api/meetings/:id/join', async (c) => {
  try {
    const db = getDB(c);
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    const body = await c.req.json();
    
    if (!body.name || !body.email) return c.json({ error: 'Name and Email are required' }, 400);

    const meeting = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, id) });
    if (!meeting) return c.json({ error: 'Meeting not found' }, 404);

    const token = crypto.randomUUID();

    const part = await db.insert(schema.participants).values({
      meetingId: id,
      name: body.name,
      email: body.email,
      status: 'pending',
      confirmationToken: token,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();

    // Send Magic Link
    c.executionCtx.waitUntil((async () => {
      const html = generateConfirmationEmail(body.name, meeting, token);
      await sendEmail(c.env, body.email, `Confirm Join: ${meeting.topic}`, `Please confirm your spot for ${meeting.topic}`, html);
    })());

    return c.json({ success: true, message: 'Confirmation email sent' });
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
    await sendEmail(c.env, email, 'Invitation to MoreThan Reading Group', `Hello ${name}, you have been invited. Use your email and the provided password to login.`);

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
