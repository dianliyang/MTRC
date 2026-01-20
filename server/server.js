const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const nodemailer = require('nodemailer');
const axios = require('axios');

const crypto = require('crypto');

const app = express();
const PORT = 3000;

// ... (existing config) ...

// Database Setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }, // Hashed
  name: { type: DataTypes.STRING, allowNull: false }
});

const Book = sequelize.define('Book', {
// ... (rest of Book model) ...
// ... (rest of models) ...

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
    
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = await User.create({ email, password: hashedPassword, name });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed (Email might be taken)' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = await User.findOne({ where: { email, password: hashedPassword } });
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... (rest of existing routes) ...
  googleId: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  authors: DataTypes.STRING, 
  description: DataTypes.TEXT,
  coverUrl: DataTypes.STRING,
  language: DataTypes.STRING,
  pageCount: DataTypes.INTEGER,
  publishedDate: DataTypes.STRING,
  status: { 
    type: DataTypes.ENUM('candidate', 'current', 'read'),
    defaultValue: 'candidate' 
  },
  selectedDate: DataTypes.DATE,
  suggesterId: DataTypes.STRING
});

const Comment = sequelize.define('Comment', {
  username: DataTypes.STRING,
  text: DataTypes.TEXT
});

const Subscriber = sequelize.define('Subscriber', {
  email: { type: DataTypes.STRING, allowNull: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true }
});

const Meeting = sequelize.define('Meeting', {
  date: { type: DataTypes.DATE, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, defaultValue: 'Online' },
  host: { type: DataTypes.STRING, defaultValue: 'Group Curator' },
  description: DataTypes.TEXT
});

const Participant = sequelize.define('Participant', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true }
});

// Relationships
Book.hasMany(Comment);
Comment.belongsTo(Book);

Meeting.belongsToMany(Book, { through: 'MeetingBooks' });
Book.belongsToMany(Meeting, { through: 'MeetingBooks' });

Meeting.hasMany(Participant);
Participant.belongsTo(Meeting);

// Email Setup (Ethereal)
let transporter;
async function createTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('Ethereal Email initialized');
  } catch (e) {
    console.error('Failed to create Ethereal account:', e.message);
  }
}
createTransporter();

// Signal Helper
async function sendSignalMessage(recipientNumber, message, attachment = null) {
  try {
    // This payload structure depends on the specific Signal REST API wrapper used (e.g., bbernhard/signal-cli-rest-api)
    const payload = {
      message: message,
      number: SIGNAL_SENDER_NUMBER,
      recipients: [recipientNumber],
    };
    if (attachment) {
      payload.base64_attachments = [attachment]; // Simplified: requires handling image fetching/conversion usually
    }

    await axios.post(`${SIGNAL_API_URL}/v2/send`, payload);
    console.log(`Signal message sent to ${recipientNumber}`);
  } catch (error) {
    console.error(`Failed to send Signal message to ${recipientNumber}. Ensure Signal REST API is running.`, error.message);
  }
}

// Routes

// Get all books
app.get('/api/books', async (req, res) => {
  const books = await Book.findAll({ order: [['createdAt', 'DESC']] });
  res.json(books);
});

// Add a book (Candidate)
app.post('/api/books', async (req, res) => {
  try {
    const { googleId, title, authors, description, coverUrl, language, pageCount, publishedDate, suggesterId } = req.body;
    const [book, created] = await Book.findOrCreate({
      where: { googleId },
      defaults: { 
        title, 
        authors: JSON.stringify(authors), 
        description, 
        coverUrl,
        language,
        pageCount,
        publishedDate,
        suggesterId
      }
    });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    await book.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Select Current Book & Notify
app.post('/api/books/select', async (req, res) => {
  try {
    const { id } = req.body;
    
    // Archive current book if exists
    await Book.update({ status: 'read' }, { where: { status: 'current' } });
    
    // Set new current book
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    book.status = 'current';
    book.selectedDate = new Date();
    await book.save();

    const subscribers = await Subscriber.findAll();
    const emailRecipients = subscribers.filter(s => s.email).map(s => s.email);
    const signalRecipients = subscribers.filter(s => s.phoneNumber).map(s => s.phoneNumber);

    let emailPreviewUrl = null;

    // Send Emails
    if (transporter && emailRecipients.length > 0) {
      const info = await transporter.sendMail({
        from: '"MoreThan Reading Group" <noreply@morethan.com>',
        to: emailRecipients.join(', '),
        subject: `New Book Selected: ${book.title}`,
        text: `We are reading ${book.title} this month! Join the discussion on our app: https://read.oili.dev`,
        html: `<h1>New Book Selected!</h1><p>We are reading <b>${book.title}</b> this month.</p><img src="${book.coverUrl}" alt="Cover" width="150" /><p><a href="https://read.oili.dev" style="background: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join the discussion</a></p>`
      });
      console.log('Email sent: %s', info.messageId);
      emailPreviewUrl = nodemailer.getTestMessageUrl(info);
    }

    // Send Signal Messages
    if (signalRecipients.length > 0) {
      console.log(`Attempting to send Signal notifications to ${signalRecipients.length} subscribers...`);
      const message = `📚 New Book of the Month: "${book.title}"! Join us: https://read.oili.dev`;
      // Send in parallel (or use a group ID in a real app)
      signalRecipients.forEach(number => sendSignalMessage(number, message));
    }

    res.json({ book, emailPreview: emailPreviewUrl, signalCount: signalRecipients.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Provide email or phone number' });
    }

    // Check if exists
    const existing = await Subscriber.findOne({
      where: Sequelize.or(
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null
      )
    });

    if (existing) {
      // Update missing fields if needed
      if (email && !existing.email) existing.email = email;
      if (phoneNumber && !existing.phoneNumber) existing.phoneNumber = phoneNumber;
      await existing.save();
      return res.json({ message: 'Subscription updated' });
    }

    await Subscriber.create({ email, phoneNumber });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Subscription failed' });
  }
});

// Comments
app.get('/api/books/:id/comments', async (req, res) => {
  const comments = await Comment.findAll({ 
    where: { BookId: req.params.id },
    order: [['createdAt', 'DESC']]
  });
  res.json(comments);
});

app.post('/api/books/:id/comments', async (req, res) => {
  const { username, text } = req.body;
  const comment = await Comment.create({ 
    BookId: req.params.id, 
    username: username || 'Anonymous', 
    text 
  });
  res.json(comment);
});

// Meetings
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.findAll({ 
      order: [['date', 'DESC']],
      include: [Book, Participant]
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meetings/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [Book, Participant]
    });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { date, topic, location, description, bookIds, host } = req.body;
    const meeting = await Meeting.create({ date, topic, location, description, host });
    
    if (bookIds && bookIds.length > 0) {
      await meeting.addBooks(bookIds);
    }
    
    // Reload to include books in response
    const meetingWithBooks = await Meeting.findByPk(meeting.id, { include: Book });
    res.json(meetingWithBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/:id/join', async (req, res) => {
  try {
    const { name, email } = req.body;
    const participant = await Participant.create({ 
      MeetingId: req.params.id, 
      name, 
      email 
    });
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/meetings/:id', async (req, res) => {
  try {
    await Meeting.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync and Start
// alter: true adjusts tables to match models without dropping data
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
