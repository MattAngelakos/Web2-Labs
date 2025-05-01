import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { authors, books, chapters, publishers } from '../config/mongoCollections.js';
import { v4 as uuid } from 'uuid';
import { ObjectId } from 'mongodb';

const main = async () => {
  const db = await dbConnection();
  await db.dropDatabase();
  const bookCollection = await books();
  const authorCollection = await authors();
  const publisherCollection = await publishers();
  const chapterCollection = await chapters();

  const insertedAuthors = await authorCollection.insertMany([
    {
      _id: new ObjectId(),
      name: 'George Orwell',
      bio: 'English novelist and essayist, famous for his works on social injustice.',
      dateOfBirth: '06/25/1903',
      books: [], 
    },
    {
      _id: new ObjectId(),
      name: 'Mary Shelley',
      bio: 'English novelist, famous for writing Frankenstein.',
      dateOfBirth: '08/30/1797',
      books: [],
    },
    {
      _id: new ObjectId(),
      name: 'Ray Bradbury',
      bio: 'American author, known for his dystopian novels and short stories.',
      dateOfBirth: '08/22/1920',
      books: [],
    }
  ]);

  const insertedPublishers = await publisherCollection.insertMany([
    {
      _id: new ObjectId(),
      name: 'Penguin Random House',
      establishedYear: 1927,
      location: 'New York, NY',
      books: [], 
    },
    {
      _id: new ObjectId(),
      name: 'HarperCollins',
      establishedYear: 1817,
      location: 'New York, NY',
      books: [],
    },
    {
      _id: new ObjectId(),
      name: 'Simon & Schuster',
      establishedYear: 1924,
      location: 'New York, NY',
      books: [],
    },
  ]);

  const insertedBooks = await bookCollection.insertMany([
    {
      _id: new ObjectId(),
      title: '1984',
      publicationDate: '06/08/1949',
      genre: 'FICTION',
      authorId: insertedAuthors.insertedIds[0],
      publisherId: insertedPublishers.insertedIds[0],
      chapters: [], 
    },
    {
      _id: new ObjectId(),
      title: 'Frankenstein',
      publicationDate: '01/01/1818',
      genre: 'HORROR',
      authorId: insertedAuthors.insertedIds[1],
      publisherId: insertedPublishers.insertedIds[1],
      chapters: [],
    },
    {
      _id: new ObjectId(),
      title: 'Fahrenheit 451',
      publicationDate: '10/19/1953',
      genre: 'SCIENCE_FICTION',
      authorId: insertedAuthors.insertedIds[2],
      publisherId: insertedPublishers.insertedIds[2],
      chapters: [],
    }
  ]);

  const insertedChapters = await chapterCollection.insertMany([
    {
      _id: new ObjectId(),
      title: 'The Modern Prometheus',
      bookId: insertedBooks.insertedIds[1],
    },
    {
      _id: new ObjectId(),
      title: 'The Creation of the Monster',
      bookId: insertedBooks.insertedIds[1],
    },
    {
      _id: new ObjectId(),
      title: 'The Monster\'s Revenge',
      bookId: insertedBooks.insertedIds[1],
    },
    {
      _id: new ObjectId(),
      title: 'The Principles of Newspeak',
      bookId: insertedBooks.insertedIds[0],
    },
    {
      _id: new ObjectId(),
      title: 'War is Peace',
      bookId: insertedBooks.insertedIds[0],
    },
    {
      _id: new ObjectId(),
      title: 'Ignorance is Strength',
      bookId: insertedBooks.insertedIds[0],
    },
    {
      _id: new ObjectId(),
      title: 'Burning Bright',
      bookId: insertedBooks.insertedIds[2],
    },
    {
      _id: new ObjectId(),
      title: 'The Sieve and the Sand',
      bookId: insertedBooks.insertedIds[2],
    },
    {
      _id: new ObjectId(),
      title: 'The Hearth and the Salamander',
      bookId: insertedBooks.insertedIds[2],
    }
  ]);

  for (const book of Object.values(insertedBooks.insertedIds)) {
    const bookInfo = await bookCollection.findOne({ _id: book });
    await authorCollection.updateOne(
      { _id: bookInfo.authorId },
      { $push: { books: bookInfo._id } }
    );
  }

  for (const book of Object.values(insertedBooks.insertedIds)) {
    const bookInfo = await bookCollection.findOne({ _id: book });
    await publisherCollection.updateOne(
      { _id: bookInfo.publisherId },
      { $push: { books: bookInfo._id } }
    );
  }

  for (const chapter of Object.values(insertedChapters.insertedIds)) {
    const chapterInfo = await chapterCollection.findOne({ _id: chapter });
    await bookCollection.updateOne(
      { _id: chapterInfo.bookId },
      { $push: { chapters: chapterInfo._id } }
    );
  }

  console.log('Done seeding database');
  await closeConnection();
};

main().catch(console.log);
