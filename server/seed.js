const { Sequelize, DataTypes } = require('sequelize');

// Setup (Same as server.js)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Book = sequelize.define('Book', {
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
  selectedDate: DataTypes.DATE
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

Book.hasMany(Comment);
Comment.belongsTo(Book);
Meeting.belongsToMany(Book, { through: 'MeetingBooks' });
Book.belongsToMany(Meeting, { through: 'MeetingBooks' });
Meeting.hasMany(Participant);
Participant.belongsTo(Meeting);

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset DB
    console.log('Database sync complete. Seeding...');

    // --- BOOKS ---
    const books = await Book.bulkCreate([
      {
        googleId: 'iO5pApw2J7EC', 
        title: 'The Great Gatsby',
        authors: '["F. Scott Fitzgerald"]',
        description: 'The Great Gatsby, F. Scott Fitzgerald\'s third book, stands as the supreme achievement of his career. First published in 1925, this quintessential novel of the Jazz Age has been acclaimed by generations of readers.',
        coverUrl: 'http://books.google.com/books/content?id=iO5pApw2J7EC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        language: 'en',
        pageCount: 180,
        publishedDate: '1925-04-10',
        status: 'current',
        selectedDate: new Date()
      },
      {
        googleId: 'A-hPCwAAQBAJ',
        title: 'Project Hail Mary',
        authors: '["Andy Weir"]',
        description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.',
        coverUrl: 'http://books.google.com/books/content?id=A-hPCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        language: 'en',
        pageCount: 476,
        publishedDate: '2021-05-04',
        status: 'candidate'
      },
      {
        googleId: 'B1hSG45JCX4C',
        title: 'Dune',
        authors: '["Frank Herbert"]',
        description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
        coverUrl: 'http://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        language: 'en',
        pageCount: 412,
        publishedDate: '1965-06-01',
        status: 'candidate'
      },
      {
        googleId: 'PGR2AwAAQBAJ',
        title: 'To Kill a Mockingbird',
        authors: '["Harper Lee"]',
        description: 'Voted America\'s Best-Loved Novel in PBS\'s The Great American Read. Harper Lee\'s Pulitzer Prize-winning masterwork of honor and injustice in the deep South.',
        coverUrl: 'http://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        language: 'en',
        pageCount: 281,
        publishedDate: '1960-07-11',
        status: 'read'
      }
    ]);

    // --- COMMENTS ---
    await Comment.bulkCreate([
      { BookId: books[0].id, username: 'Alice', text: 'The symbolism of the green light is just masterpiece work.' },
      { BookId: books[0].id, username: 'Bob', text: 'I actually found the characters quite unlikeable, but I think that was the point?' },
      { BookId: books[0].id, username: 'Charlie', text: 'Classic for a reason. Quick read but stays with you.' }
    ]);

    // --- MEETINGS ---
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(19, 0, 0);

    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 35);
    nextMonth.setHours(18, 30, 0);

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 14);

    const meetings = await Meeting.bulkCreate([
      {
        date: pastDate,
        topic: 'Kickoff',
        location: 'Community Center Hall B',
        host: 'Eleanor Vance',
        description: 'First gathering to meet everyone and decide on our first book.'
      },
      {
        date: nextWeek,
        topic: 'Chapters 1-5 Discussion',
        location: 'The Roasted Bean Coffee Shop',
        host: 'Theo Crain',
        description: 'Discussing the introduction of Gatsby and the party scenes. Coffee is on the house!'
      },
      {
        date: nextMonth,
        topic: 'Final Discussion',
        location: 'Zoom',
        host: 'Luke Sanderson',
        description: 'Wrapping up the book. Spoilers allowed!'
      }
    ]);

    await meetings[1].setBooks([books[0]]); // Gatsby
    await meetings[2].setBooks([books[0]]); // Gatsby

    // --- PARTICIPANTS ---
    await Participant.bulkCreate([
      { MeetingId: meetings[0].id, name: 'Alice' },
      { MeetingId: meetings[0].id, name: 'Bob' },
      { MeetingId: meetings[1].id, name: 'Alice' },
      { MeetingId: meetings[1].id, name: 'Charlie' }
    ]);

    // --- SUBSCRIBERS ---
    await Subscriber.bulkCreate([
      { email: 'demo@example.com' },
      { phoneNumber: '+15550199' }
    ]);

    console.log('Seeding successful!');
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  }
};

seed();