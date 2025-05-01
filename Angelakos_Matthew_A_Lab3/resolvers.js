import { GraphQLError } from 'graphql';
import redis from 'redis';
const client = redis.createClient();
import { ObjectId } from 'mongodb'
client.connect().then(() => { });
const regex = /^[A-Za-z\s]+,\s?[A-Za-z\s]+$/;
const nameRegex = /^([^0-9]*)$/
import {
  authors as authorCollection,
  books as bookCollection,
  publishers as publisherCollection,
  chapters as chapterCollection
} from './config/mongoCollections.js';


async function removeSearch(collection, year) {//this is from multiple documentations + stackoverflow this was insanely complicated I know rare comment
  let cursor = 0
  if (year) {
    do {
      const result = await client.scan(cursor, {
        MATCH: `foundedYear:*:*`,
        COUNT: 10
      });
      cursor = result.cursor;
      const keys = result.keys;
      if (keys.length > 0) {
        //console.log(`${keys.length} keys`); 
        for (const key of keys) {
          client.del(key)
          //console.log(`${key}: ${value}`);
        }
      }
    } while (cursor !== 0);
  }
  else {
    do {
      const result = await client.scan(cursor, {
        MATCH: `search:${collection}:*`,
        COUNT: 10
      });
      cursor = result.cursor;
      const keys = result.keys;
      if (keys.length > 0) {
        //console.log(`${keys.length} keys`); 
        for (const key of keys) {
          client.del(key)
          //console.log(`${key}: ${value}`);
        }
      }
    } while (cursor !== 0);
  }
}

function isInvalidDate(dateString, author) {
  const [month, day, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateString)) {
    return true
  }
  if (date.getMonth() !== month - 1 || date.getDate() !== day) {
    return true;
  }
  const currentYear = new Date().getFullYear();
  const currentDate = new Date()
  if (author) {
    if (currentDate < date) {
      return true
    }
  }
  else {
    if (year > currentYear + 5) {
      return true;
    }
  }
  if (year < 1) {
    return true
  }
  return false;
}

async function removeBookFunc(id, type) {
  id = id.trim()
  if (!ObjectId.isValid(id)) {
    throw new GraphQLError('Invalid Id', {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
  let books = await bookCollection();
  let authors = await authorCollection();
  let publishers = await publisherCollection();
  const bookCount = await books.count({ _id: new ObjectId(id) });
  if (bookCount === 0) {
    throw new GraphQLError(
      `Could not delete author with _id of ${id}`,
      {
        extensions: { code: 'NOT_FOUND' }
      }
    );
  }
  const deletedBook = await books.findOneAndDelete({ _id: new ObjectId(id) });
  if (!deletedBook) {
    throw new GraphQLError(
      `Could not delete book with _id of ${id}`,
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      }
    );
  }
  if(type !== "author"){
    const updatedAuthor = await authors.updateOne(
      { _id: new ObjectId(deletedBook.authorId) },
      { $pull: { books: new ObjectId(id) } }
    );
    if (updatedAuthor.modifiedCount === 0) {
      throw new GraphQLError(`Could not update author with _id of ${deletedBook.authorId}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  }
  if(type !== "publisher"){
    const updatedPublisher = await publishers.updateOne(
      { _id: new ObjectId(deletedBook.publisherId) },
      { $pull: { books: new ObjectId(id) } }
    );
    if (updatedPublisher.modifiedCount === 0) {
      throw new GraphQLError(`Could not update publisher with _id of ${deletedBook.publisherId}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  }
  let genreExists = await client.exists(`genre:${deletedBook.genre}`)
  if (genreExists) {
    console.log(`Remove book ${deletedBook.genre} Genre from Cache`);
    await client.del(`genre:${deletedBook.genre}`);
  }
  let chapters = await chapterCollection();
  const chaptersToDelete = await chapters.find({ bookId: new ObjectId(id) }).toArray();
  if (!chaptersToDelete) {
    throw new GraphQLError('bookChapters Not Found', {
      extensions: { code: 'NOT_FOUND' }
    });
  }
  const deletedChapters = await chapters.deleteMany({ bookId: new ObjectId(id) })
  if (!deletedChapters.acknowledged) {
    throw new GraphQLError(`Could not remove chapters`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
  let exists = await client.exists(`books`);
  if (exists) {
    console.log('Update books Cache');
    const allBooks = await books.find({}).toArray();
    await client.set('books', JSON.stringify(allBooks), {
      EX: 3600
    });
  }
  let exists2 = await client.exists(`book:${id}`);
  if (exists2) {
    console.log(`Update book ${id} Cache`);
    await client.del(`book:${id}`);
  }
  let exists3 = await client.exists(`book:chapters:${id}`);
  if (exists3) {
    console.log(`Remove book ${id} Chapters Cache`);
    await client.del(`book:chapters:${id}`);
  }
  Promise.all(chaptersToDelete.map(async chapter => {
    let exists = await client.exists(`chapter:${chapter._id}`);
    if (exists) {
      console.log(`Remove chapter ${chapter._id} Cache`);
      await client.del(`chapter:${chapter._id}`);
    }
    return
  }))
  console.log('Removing book title search caches')
  await removeSearch('book')
  console.log('Removing chapter title search caches')
  await removeSearch('chapter')
  return deletedBook;
}

/* parentValue - References the type def that called it
    so for example when we execute numOfEmployees we can reference
    the parent's properties with the parentValue Paramater
*/

/* args - Used for passing any arguments in from the client
    for example, when we call 
    addEmployee(firstName: String!, lastName: String!, employerId: Int!): Employee
  	
*/

export const resolvers = {
  Query: {
    getAuthorById: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let exists = await client.exists(`author:${args._id}`);
      if (exists) {
        console.log('Show author from cache');
        let author = await client.get(`author:${args._id}`);
        author = JSON.parse(author)
        author._id = new ObjectId(author._id)
        return author
      }
      const authors = await authorCollection();
      const author = await authors.findOne({ _id: new ObjectId(args._id) });
      if (!author) {
        //can't find the employer
        throw new GraphQLError('Author Not Found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      await client.set(`author:${args._id}`, JSON.stringify(author));
      return author;
    },
    getBookById: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let exists = await client.exists(`book:${args._id}`);
      if (exists) {
        console.log('Show book from cache');
        let book = await client.get(`book:${args._id}`);
        book = JSON.parse(book)
        book._id = new ObjectId(book._id)
        book.publisherId = new ObjectId(book.publisherId)
        book.authorId = new ObjectId(book.authorId)
        return book
      }
      const books = await bookCollection();
      const book = await books.findOne({ _id: new ObjectId(args._id) });
      if (!book) {
        //can't find the employee
        throw new GraphQLError('Book Not Found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      await client.set(`book:${args._id}`, JSON.stringify(book));
      return book;
    },
    getPublisherById: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let exists = await client.exists(`publisher:${args._id}`);
      if (exists) {
        console.log('Show publisher from cache');
        let publisher = await client.get(`publisher:${args._id}`);
        publisher = JSON.parse(publisher)
        publisher._id = new ObjectId(publisher._id)
        return publisher
      }
      const publishers = await publisherCollection();
      const publisher = await publishers.findOne({ _id: new ObjectId(args._id) });
      if (!publisher) {
        //can't find the employee
        throw new GraphQLError('Publisher Not Found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      await client.set(`publisher:${args._id}`, JSON.stringify(publisher));
      return publisher;
    },
    authors: async () => {
      let exists = await client.exists('authors');
      if (exists) {
        console.log('Show authors from cache');
        let authors = await client.get('authors');
        authors = JSON.parse(authors)
        authors = authors.map(author => {
          author._id = new ObjectId(author._id)
          return author
        })
        return authors
      }
      const authors = await authorCollection();
      const allAuthors = await authors.find({}).toArray();
      if (!allAuthors) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
      await client.set('authors', JSON.stringify(allAuthors), {
        EX: 3600
      });
      return allAuthors;
    },
    books: async () => {
      let exists = await client.exists('books');
      if (exists) {
        console.log('Show books from cache');
        let books = await client.get('books');
        books = JSON.parse(books)
        books = books.map(book => {
          book._id = new ObjectId(book._id)
          book.authorId = new ObjectId(book.authorId)
          book.publisherId = new ObjectId(book.publisherId)
          return book
        })
        return books
      }
      const books = await bookCollection();
      const allBooks = await books.find({}).toArray();
      if (!allBooks) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
      await client.set('books', JSON.stringify(allBooks), {
        EX: 3600
      });;
      return allBooks;
    },
    publishers: async () => {
      let exists = await client.exists('publishers');
      if (exists) {
        console.log('Show publishers from cache');
        let publishers = await client.get('publishers');
        publishers = JSON.parse(publishers)
        publishers = publishers.map(publisher => {
          publisher._id = new ObjectId(publisher._id)
          return publisher
        })
        return publishers
      }
      const publishers = await publisherCollection();
      const allPublishers = await publishers.find({}).toArray();
      if (!allPublishers) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
      await client.set('publishers', JSON.stringify(allPublishers), {
        EX: 3600
      });
      return allPublishers;
    },
    getChaptersByBookId: async (_, args) => {
      args.bookId = args.bookId.trim()
      if (!ObjectId.isValid(args.bookId)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let exists = await client.exists(`book:chapters:${args.bookId}`);
      if (exists) {
        console.log('Show book chapters from cache');
        let bookChapters = await client.get(`book:chapters:${args.bookId}`);
        bookChapters = JSON.parse(bookChapters)
        bookChapters = bookChapters.map(chapter => {
          chapter.bookId = new ObjectId(chapter.bookId)
          return chapter
        })
        return bookChapters
      }
      const chapters = await chapterCollection();
      const books = await bookCollection();
      const book = await books.findOne({ _id: new ObjectId(args.bookId) });
      if (!book) {
        throw new GraphQLError('Book Not Found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      const bookChapters = await chapters.find({ bookId: new ObjectId(args.bookId) }).toArray();
      if (!bookChapters) {
        throw new GraphQLError('bookChapters Not Found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      await client.set(`book:chapters:${args.bookId}`, JSON.stringify(bookChapters), {
        EX: 3600
      });
      return bookChapters;
    },
    booksByGenre: async (_, args) => {
      let exists = await client.exists(`genre:${args.genre}`);
      if (exists) {
        console.log('Show book from genre cache');
        let booksByGenre = await client.get(`genre:${args.genre}`);
        booksByGenre = JSON.parse(booksByGenre)
        booksByGenre = booksByGenre.map(book => {
          book._id = new ObjectId(book._id)
          book.authorId = new ObjectId(book.authorId)
          book.publisherId = new ObjectId(book.publisherId)
          return book
        })
        return booksByGenre
      }
      const books = await bookCollection();
      const booksByGenre = await books.find({ genre: args.genre }).toArray();
      if (!booksByGenre || booksByGenre.length === 0) {
        throw new GraphQLError('Books Not Found for this Genre', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      client.set(`genre:${args.genre}`, JSON.stringify(booksByGenre), {
        EX: 3600
      });
      return booksByGenre;
    },
    publishersByEstablishedYear: async (_, args) => {
      let exists = await client.exists(`foundedYear:${args.min}:${args.max}`);
      if (exists) {
        console.log('Show publishers by year');
        let publishersByYear = await client.get(`foundedYear:${args.min}:${args.max}`);
        publishersByYear = JSON.parse(publishersByYear)
        publishersByYear = publishersByYear.map(publisher => {
          publisher._id = new ObjectId(publisher._id)
          return publisher
        })
        return publishersByYear
      }
      if (args.min > args.max) {
        throw new GraphQLError('Min larger than max', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      if (args.min < 1488) {
        throw new GraphQLError('Under min year 1488', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const currentYear = new Date().getFullYear();
      if (args.max > currentYear) {
        throw new GraphQLError('Over max of current year', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const publishers = await publisherCollection();
      const publishersByYear = await publishers
        .find({
          establishedYear: { $gte: args.min, $lte: args.max },
        })
        .toArray();
      if (!publishersByYear || publishersByYear.length === 0) {
        throw new GraphQLError('No Publishers Found in the Year Range', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      client.set(`foundedYear:${args.min}:${args.max}`, JSON.stringify(publishersByYear), {
        EX: 3600
      });
      return publishersByYear;
    },
    searchAuthorByName: async (_, args) => {
      args.searchTerm = args.searchTerm.trim()
      if (args.searchTerm.length === 0 || args.searchTerm.length > 255) {
        throw new GraphQLError('Invalid length of search term', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      let exists = await client.exists(`search:author:${args.searchTerm.toLowerCase()}`);
      if (exists) {
        console.log('Show authors by term');
        let authorsByName = await client.get(`search:author:${args.searchTerm.toLowerCase()}`);
        authorsByName = JSON.parse(authorsByName)
        authorsByName = authorsByName.map(author => {
          author._id = new ObjectId(author._id)
          return author
        })
        return authorsByName
      }
      const authors = await authorCollection();
      const searchRegex = new RegExp(args.searchTerm, 'i');
      const authorsByName = await authors.find({ name: { $regex: searchRegex } }).toArray();
      if (!authorsByName || authorsByName.length === 0) {
        throw new GraphQLError('No Authors Found with that string', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      client.set(`search:author:${args.searchTerm.toLowerCase()}`, JSON.stringify(authorsByName), {
        EX: 3600
      });
      return authorsByName;
    },
    searchBookByTitle: async (_, args) => {
      args.searchTerm = args.searchTerm.trim()
      if (args.searchTerm.length === 0 || args.searchTerm.length > 255) {
        throw new GraphQLError('Invalid length of search term', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      let exists = await client.exists(`search:book:${args.searchTerm.toLowerCase()}`);
      if (exists) {
        console.log('Show books by title');
        let booksByTitle = await client.get(`search:book:${args.searchTerm.toLowerCase()}`);
        booksByTitle = JSON.parse(booksByTitle)
        booksByTitle = booksByTitle.map(book => {
          book._id = new ObjectId(book._id)
          book.authorId = new ObjectId(book.authorId)
          book.publisherId = new ObjectId(book.publisherId)
          return book
        })
        return booksByTitle
      }
      const books = await bookCollection();
      const searchRegex = new RegExp(args.searchTerm, 'i');
      const booksByTitle = await books.find({ title: { $regex: searchRegex } }).toArray();
      if (!booksByTitle || booksByTitle.length === 0) {
        throw new GraphQLError('No Authors Found with that string', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      client.set(`search:book:${args.searchTerm.toLowerCase()}`, JSON.stringify(booksByTitle), {
        EX: 3600
      });
      return booksByTitle;
    },
    getChapterById: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let exists = await client.exists(`chapter:${args._id}`);
      if (exists) {
        console.log('Show chapter from cache');
        let chapter = await client.get(`chapter:${args._id}`);
        chapter = JSON.parse(chapter)
        chapter.bookId = new ObjectId(chapter.bookId)
        return chapter
      }
      const chapters = await chapterCollection();
      const chapter = await chapters.findOne({ _id: new ObjectId(args._id) });
      if (!chapter) {
        //can't find the employee
        throw new GraphQLError('chapter Not Found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      await client.set(`chapter:${args._id}`, JSON.stringify(chapter), {
        EX: 3600
      });
      return chapter;
    },
    searchChapterByTitle: async (_, args) => {
      args.searchTitleTerm = args.searchTitleTerm.trim()
      if (args.searchTitleTerm.length === 0 || args.searchTitleTerm.length > 255) {
        throw new GraphQLError('Invalid length of search term', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      let exists = await client.exists(`search:chapter:${args.searchTitleTerm.toLowerCase()}`);
      if (exists) {
        console.log('Show chapters by title');
        let chaptersByTitle = await client.get(`search:chapter:${args.searchTitleTerm.toLowerCase()}`);
        chaptersByTitle = JSON.parse(chaptersByTitle)
        chaptersByTitle = chaptersByTitle.map(chapter => {
          chapter.bookId = new ObjectId(chapter.bookId)
          return chapter
        })
        return chaptersByTitle
      }
      const chapters = await chapterCollection();
      const searchRegex = new RegExp(args.searchTitleTerm, 'i');
      const chaptersByTitle = await chapters.find({ title: { $regex: searchRegex } }).toArray();
      if (!chaptersByTitle || chaptersByTitle.length === 0) {
        throw new GraphQLError('No Chapters Found with that string', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      client.set(`search:chapter:${args.searchTitleTerm.toLowerCase()}`, JSON.stringify(chaptersByTitle), {
        EX: 3600
      });
      return chaptersByTitle;
    },
  },

  Author: {
    numOfBooks: async (parentValue) => {
      try {
        const books = await bookCollection();
        const numOfAuthors = await books.count({
          authorId: parentValue._id
        });
        return numOfAuthors;
      } catch (error) {
        throw new GraphQLError('Could not retrieve number of books', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },
    books: async (parentValue) => {
      try {
        const books = await bookCollection();
        const wroteIt = await books
          .find({ authorId: parentValue._id })
          .toArray();
        return wroteIt;
      } catch (error) {
        throw new GraphQLError('Could not retrieve books for author', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },
  Publisher: {
    numOfBooks: async (parentValue) => {
      try {
        const books = await bookCollection();
        const numOfBooks = await books.count({
          publisherId: parentValue._id
        });
        return numOfBooks;
      } catch (error) {
        throw new GraphQLError('Could not retrieve number of books', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },
    books: async (parentValue) => {
      try {
        const books = await bookCollection();
        const hasBooks = await books
          .find({ publisherId: parentValue._id })
          .toArray();
        return hasBooks;
      } catch (error) {
        throw new GraphQLError('Could not retrieve books for publisher', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },
  Book: {
    author: async (parentValue) => {
      try {
        const authors = await authorCollection();
        const author = await authors.findOne({ _id: parentValue.authorId });
        if (!author) {
          throw new GraphQLError('Author not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        return author;
      } catch (error) {
        throw new GraphQLError('Could not retrieve author', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },
    publisher: async (parentValue) => {
      try {
        const publishers = await publisherCollection();
        const publisher = await publishers.findOne({ _id: parentValue.publisherId });
        if (!publisher) {
          throw new GraphQLError('Publisher not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        return publisher;
      } catch (error) {
        throw new GraphQLError('Could not retrieve publisher', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },
    chapters: async (parentValue) => {
      try {
        const chapters = await chapterCollection();
        const hasChapters = await chapters
          .find({ bookId: parentValue._id })
          .toArray();
        return hasChapters;
      } catch (error) {
        throw new GraphQLError('Could not retrieve chapters for book', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },
  Chapter: {
    book: async (parentValue) => {
      try {
        const books = await bookCollection();
        const book = await books.findOne({ _id: parentValue.bookId });
        if (!book) {
          throw new GraphQLError('Book not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        return book;
      } catch (error) {
        throw new GraphQLError('Could not retrieve book', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },

  Mutation: {
    addAuthor: async (_, args) => {
      let authors = await authorCollection();
      if (args.bio === null) {
        throw new GraphQLError(`Invalid bio: NULL`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      args.name = args.name.trim()
      if (args.name.length < 2 || args.name.length > 50) {
        throw new GraphQLError(`Invalid author name`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      if (!nameRegex.test(args.name)) {
        throw new GraphQLError(`Invalid author name`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      args.dateOfBirth = args.dateOfBirth.trim()
      if (args.bio) {
        args.bio = args.bio.trim()
        if (args.bio.length < 2 || args.bio.length > 1027) {
          throw new GraphQLError(`Invalid bio length`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
      }
      else {
        args.bio = "N/A"
      }
      const newAuthor = {
        _id: new ObjectId(),
        name: args.name,
        bio: args.bio,
        dateOfBirth: args.dateOfBirth,
        books: []
      };
      if (isInvalidDate(args.dateOfBirth, true)) {
        throw new GraphQLError(`Invalid Date`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let insertedAuthor = await authors.insertOne(newAuthor);
      if (!insertedAuthor.acknowledged || !insertedAuthor.insertedId) {
        throw new GraphQLError(`Could not Add Author`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      } else {
        let exists = await client.exists(`authors`);
        if (exists) {
          console.log('Update authors Cache');
          const allAuthors = await authors.find({}).toArray();
          await client.set('authors', JSON.stringify(allAuthors), {
            EX: 3600
          });
        }
        console.log('Removing author name search caches')
        await removeSearch('author')
      }
      return newAuthor;
    },
    removeAuthor: async (_, args) => {
      let authors = await authorCollection();
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      const authorCount = await authors.count({ _id: new ObjectId(args._id) });
      if (authorCount === 0) {
        throw new GraphQLError(
          `Could not delete author with _id of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      const deletedAuthor = await authors.findOneAndDelete({ _id: new ObjectId(args._id) });
      if (!deletedAuthor) {
        throw new GraphQLError(
          `Could not delete author with _id of ${args._id}`,
          {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        );
      }
      const books = await bookCollection();
      const authorBooks = await books.find({ authorId: new ObjectId(args._id) }).toArray();
      Promise.all(authorBooks.map(async book => {
        const bookId = (book._id).toString()
        return await removeBookFunc(bookId, "author")
      }))
      let exists = await client.exists(`authors`);
      if (exists) {
        console.log('Update authors Cache');
        const allAuthors = await authors.find({}).toArray();
        await client.set('authors', JSON.stringify(allAuthors), {
          EX: 3600
        });
      }
      let exists2 = await client.exists(`author:${args._id}`);
      if (exists2) {
        console.log(`Update author ${args._id} Cache`);
        await client.del(`author:${args._id}`);
      }
      console.log('Removing author name search caches')
      await removeSearch('author')
      return deletedAuthor;
    },
    editAuthor: async (_, args) => {
      let authors = await authorCollection();
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let newAuthor = await authors.findOne({ _id: new ObjectId(args._id) });
      let field = false
      let newName = false
      if (newAuthor) {
        if (args.bio === null) {
          throw new GraphQLError(`Could not edit Author: null bio`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.name === null) {
          throw new GraphQLError(`Could not edit Author: null name`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.dateOfBirth === null) {
          throw new GraphQLError(`Could not edit Author: null dob`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.name) {
          field = true
          args.name = args.name.trim()
          if (args.name.length < 2 || args.name.length > 50) {
            throw new GraphQLError(`Could not edit Author: invalid name length`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          if (!nameRegex.test(args.name)) {
            throw new GraphQLError(`Invalid author name`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          newAuthor.name = args.name;
          newName = true
        }
        if (args.bio) {
          field = true
          args.bio = args.bio.trim()
          if (args.bio.length < 2 || args.bio.length > 1027) {
            throw new GraphQLError(`Could not edit Author: invalid bio length`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          newAuthor.bio = args.bio;
        }
        if (args.dateOfBirth) {
          field = true
          args.dateOfBirth = args.dateOfBirth.trim()
          newAuthor.dateOfBirth = args.dateOfBirth;
          if (isInvalidDate(args.dateOfBirth, true)) {
            throw new GraphQLError(`Could not Add Author: invalid DOB format mm/dd/yyy`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
        }
        if (!field) {
          throw new GraphQLError(`Could not Add Author no fields provided`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        let editedAuthor = await authors.updateOne({ _id: new ObjectId(args._id) }, { $set: newAuthor });
        if (!editedAuthor.acknowledged) {
          throw new GraphQLError(`Could not edit Author`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
        let exists = await client.exists(`author:${args._id}`);
        if (exists) {
          console.log('Update authorId Cache');
          await client.set(`author:${args._id}`, JSON.stringify(newAuthor), {
            EX: 3600
          });
        }
        let exists2 = await client.exists(`authors`);
        if (exists2) {
          console.log('Update authors Cache');
          const allAuthors = await authors.find({}).toArray();
          await client.set('authors', JSON.stringify(allAuthors), {
            EX: 3600
          });
        }
        if (newName) {
          console.log('Removing author name search caches')
          await removeSearch('author')
        }
      } else {
        throw new GraphQLError(
          `Could not update author with _id of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      return newAuthor;
    },
    addPublisher: async (_, args) => {
      let publishers = await publisherCollection();
      args.name = args.name.trim()
      if (args.name.length < 2 || args.name.length > 255) {
        throw new GraphQLError(`Invalid name length`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      args.location = args.location.trim()
      if (args.location.length < 4 || args.location.length > 255) {
        throw new GraphQLError(`Invalid Location Length`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      if (!regex.test(args.location)) {
        throw new GraphQLError(`Invalid Location Format: City, State`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      const newPublisher = {
        _id: new ObjectId(),
        name: args.name,
        establishedYear: args.establishedYear,
        location: args.location,
        books: []
      };
      const currentYear = new Date().getFullYear();
      if (args.establishedYear < 1488 || currentYear < args.establishedYear) {
        throw new GraphQLError(`Invalid year`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let insertedPublisher = await publishers.insertOne(newPublisher);
      if (!insertedPublisher.acknowledged || !insertedPublisher.insertedId) {
        throw new GraphQLError(`Could not Add Publisher`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      } else {
        let exists = await client.exists(`publishers`);
        if (exists) {
          console.log('Update publishers Cache');
          const allPublishers = await publishers.find({}).toArray();
          await client.set('publishers', JSON.stringify(allPublishers), {
            EX: 3600
          });
        }
        await removeSearch("", true)
      }
      return newPublisher;
    },
    removePublisher: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let publishers = await publisherCollection();
      const deletePublisher = await publishers.findOneAndDelete({ _id: new ObjectId(args._id) });
      if (!deletePublisher) {
        throw new GraphQLError(
          `Could not delete publisher with _id of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      await removeSearch("", true)
      const books = await bookCollection();
      const publisherBooks = await books.find({ publisherId: new ObjectId(args._id) }).toArray();
      Promise.all(publisherBooks.map(async book => {
        const bookId = (book._id).toString()
        return await removeBookFunc(bookId, "publisher")
      }))
      let exists = await client.exists(`publishers`);
      if (exists) {
        console.log('Update publishers Cache');
        const allPublishers = await publishers.find({}).toArray();
        await client.set('publishers', JSON.stringify(allPublishers), {
          EX: 3600
        });
      }
      let exists2 = await client.exists(`publisher:${args._id}`);
      if (exists2) {
        console.log(`Update publisher ${args._id} Cache`);
        await client.del(`publisher:${args._id}`);
      }
      return deletePublisher;
    },
    editPublishers: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let publishers = await publisherCollection();
      let newPublisher = await publishers.findOne({ _id: new ObjectId(args._id) });
      let empty = true
      let year = false
      if (newPublisher) {
        if (args.name === null) {
          throw new GraphQLError(`Could not Edit Publisher: null name`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.establishedYear === null) {
          throw new GraphQLError(`Could not Edit Publisher: null established year`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.location === null) {
          throw new GraphQLError(`Could not Edit Publisher: null location`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.name) {
          empty = false
          args.name = args.name.trim()
          if (args.name.length < 2 || args.name.length > 255) {
            throw new GraphQLError(`Could not edit Publisher: invalid name length`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          newPublisher.name = args.name;
        }
        if (args.establishedYear) {
          empty = false
          year = true
          newPublisher.establishedYear = args.establishedYear;
          const currentYear = new Date().getFullYear();
          if (args.establishedYear < 1488 || currentYear < args.establishedYear) {
            throw new GraphQLError(`Could not edit Publisher: Invalid established year`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
        }
        if (args.location) {
          empty = false
          args.location = args.location.trim()
          if (args.location.length < 4 || args.location.length > 255) {
            throw new GraphQLError(`Could not edit Publisher: Invalid Publisher location length`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          if (!regex.test(args.location)) {
            throw new GraphQLError(`Invalid Location Format: City, State`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          newPublisher.location = args.location;
        }
        if (empty) {
          throw new GraphQLError(`Could not Edit Publisher Empty Obkect`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        let editedPublisher = await publishers.updateOne({ _id: new ObjectId(args._id) }, { $set: newPublisher });
        if (!editedPublisher.acknowledged) {
          throw new GraphQLError(`Could not edit Publisher`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
        let exists = await client.exists(`publisher:${args._id}`);
        if (exists) {
          console.log('Update publisherId Cache');
          await client.set(`publisher:${args._id}`, JSON.stringify(newPublisher), {
            EX: 3600
          });
        }
        let exists2 = await client.exists(`publishers`);
        if (exists2) {
          console.log('Update publishers Cache');
          const allPublishers = await publishers.find({}).toArray();
          await client.set('publishers', JSON.stringify(allPublishers), {
            EX: 3600
          });
        }
        if (year) {
          await removeSearch("", true)
        }
      } else {
        throw new GraphQLError(
          `Could not update author with _id of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      return newPublisher;
    },
    addBook: async (_, args) => {
      let books = await bookCollection();
      const authors = await authorCollection();
      const publishers = await publisherCollection();
      args.authorId = args.authorId.trim()
      if (!ObjectId.isValid(args.authorId)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let author = await authors.findOne({ _id: new ObjectId(args.authorId) });
      if (!author) {
        throw new GraphQLError(
          `Could not Find Author with an ID of ${args.authorId}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      args.publisherId = args.publisherId.trim()
      if (!ObjectId.isValid(args.publisherId)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let publisher = await publishers.findOne({ _id: new ObjectId(args.publisherId) });
      if (!publisher) {
        throw new GraphQLError(
          `Could not Find Publisher with an ID of ${args.publisherId}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      args.publicationDate = args.publicationDate.trim()
      if (isInvalidDate(args.publicationDate)) {
        throw new GraphQLError(`Could not Add Book: invalid date or format: mm/dd/yyyy`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      const date1 = new Date(args.publicationDate)
      const date2 = new Date(author.dateOfBirth)
      if(date1 < date2){
        throw new GraphQLError(`Could not Add Book: book published before author's birth`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });   
      }
      const yearFromDate1 = date1.getFullYear()
      if(yearFromDate1 < publisher.establishedYear){
        throw new GraphQLError(`Could not Add Book: book published before publisher's creation`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      args.title = args.title.trim()
      if (args.title.length === 0 || args.title.length > 255) {
        throw new GraphQLError(`Could not Add Book: invalid title length`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      const newBook = {
        _id: new ObjectId(),
        title: args.title,
        publicationDate: args.publicationDate,
        genre: args.genre,
        authorId: new ObjectId(args.authorId),
        publisherId: new ObjectId(args.publisherId),
        chapters: []
      };
      let insertedBook = await books.insertOne(newBook);
      if (!insertedBook.acknowledged || !insertedBook.insertedId) {
        throw new GraphQLError(`Could not Add Book`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      } else {
        const updatedAuthor = await authors.updateOne(
          { _id: new ObjectId(args.authorId) },
          { $push: { books: insertedBook.insertedId } }
        );
        if (updatedAuthor.modifiedCount === 0) {
          throw new GraphQLError(`Could not update Author with the new book`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
        const updatedPublisher = await publishers.updateOne(
          { _id: new ObjectId(args.publisherId) },
          { $push: { books: insertedBook.insertedId } }
        );
        if (updatedPublisher.modifiedCount === 0) {
          throw new GraphQLError(`Could not update Publisher with the new book`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
        let exists = await client.exists(`books`);
        if (exists) {
          console.log('Update books Cache');
          const allBooks = await books.find({}).toArray();
          await client.set('books', JSON.stringify(allBooks), {
            EX: 3600
          });
        }
        console.log('Removing book title search caches')
        await removeSearch('book')
        let genreExists = await client.exists(`genre:${newBook.genre}`)
        if (genreExists) {
          console.log(`Remove book ${newBook.genre} Genre from Cache`);
          await client.del(`genre:${newBook.genre}`);
        }
      }
      return newBook;
    },
    removeBook: async (_, args) => {
      return removeBookFunc(args._id, "book")
    },
    editBook: async (_, args) => {
      let books = await bookCollection();
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let newBook = await books.findOne({ _id: new ObjectId(args._id) });
      let empty = true
      let newTitle = false
      let newGenre = false
      let oldGenre
      let authorChanged = false;
      let publisherChanged = false;
      let oldBook = {}
      const authors = await authorCollection();
      const publishers = await publisherCollection();
      if (newBook) {
        if (args.title === null) {
          throw new GraphQLError(`Could not Edit Book: null title`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.publicationDate === null) {
          throw new GraphQLError(`Could not Edit Book: null publication date`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.genre === null) {
          throw new GraphQLError(`Could not Edit Book: null genre`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.authorId === null) {
          throw new GraphQLError(`Could not Edit Book: null authorid`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.publisherId === null) {
          throw new GraphQLError(`Could not Edit Book: null publisherid`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.title) {
          empty = false
          newTitle = true
          newBook.title = args.title;
          newBook.title = newBook.title.trim()
          if (newBook.title.length === 0 || newBook.title.length > 255) {
            throw new GraphQLError(`Could not Edit Book: invalid title length`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
        }
        if (args.publicationDate) {
          empty = false
          newBook.publicationDate = args.publicationDate;
          newBook.publicationDate = newBook.publicationDate.trim()
          if (isInvalidDate(newBook.publicationDate)) {
            throw new GraphQLError(`Could not Add Book: Invalid Publication Date Format: mm/dd/yyy`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
        }
        if (args.genre) {
          empty = false
          newGenre = true
          oldGenre = newBook.genre
          newBook.genre = args.genre;
        }
        if (args.authorId) {
          empty = false
          args.authorId = args.authorId.trim()
          if (!ObjectId.isValid(args.authorId)) {
            throw new GraphQLError('Invalid Id', {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          const authorCount = await authors.count({ _id: new ObjectId(args.authorId) });
          if (authorCount === 1) {
            oldBook.authorId = newBook.authorId
            newBook.authorId = new ObjectId(args.authorId);
            authorChanged = true;
          } else {
            throw new GraphQLError(
              `Could not Find Author with an ID of ${args.authorId}`,
              {
                extensions: { code: 'NOT_FOUND' }
              }
            );
          }
        }
        if (args.publisherId) {
          empty = false
          args.publisherId = args.publisherId.trim()
          if (!ObjectId.isValid(args.publisherId)) {
            throw new GraphQLError('Invalid Id', {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          const publisherCount = await publishers.count({ _id: new ObjectId(args.publisherId) });
          if (publisherCount === 1) {
            oldBook.publisherId = newBook.publisherId
            newBook.publisherId = new ObjectId(args.publisherId);
            publisherChanged = true;
          } else {
            throw new GraphQLError(
              `Could not Find publisher with an ID of ${args.publisherId}`,
              {
                extensions: { code: 'NOT_FOUND' }
              }
            );
          }
        }
        if (empty) {
          throw new GraphQLError(`Could not Add Book: empty book`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        let author = await authors.findOne({ _id: new ObjectId(newBook.authorId) });
        let publisher = await publishers.findOne({ _id: new ObjectId(newBook.publisherId) });
        const date1 = new Date(newBook.publicationDate)
        const date2 = new Date(author.dateOfBirth)
        if(date1 < date2){
          throw new GraphQLError(`Could not Add Book: book published before author's birth`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });   
        }
        const yearFromDate1 = date1.getFullYear()
        if(yearFromDate1 < publisher.establishedYear){
          throw new GraphQLError(`Could not Add Book: book published before publisher's creation`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        let editedBook = await books.updateOne({ _id: new ObjectId(args._id) }, { $set: newBook });
        if (!editedBook.acknowledged) {
          throw new GraphQLError(`Could not edit Book`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
        if (authorChanged) {
          const authors = await authorCollection();
          let removeFromOldAuthor = await authors.updateOne(
            { _id: oldBook.authorId },
            { $pull: { books: new ObjectId(args._id) } }
          );
          if (!removeFromOldAuthor.acknowledged) {
            throw new GraphQLError('Internal Server Error: Failed to update old author', {
              extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
          }
          let addToNewAuthor = await authors.updateOne(
            { _id: new ObjectId(args.authorId) },
            { $push: { books: new ObjectId(args._id) } }
          );
          if (!addToNewAuthor.acknowledged) {
            throw new GraphQLError('Internal Server Error: Failed to update new author', {
              extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
          }
        }
        if (publisherChanged) {
          const publishers = await publisherCollection();
          let removeFromOldPublisher = await publishers.updateOne(
            { _id: oldBook.publisherId },
            { $pull: { books: new ObjectId(args._id) } }
          );
          if (!removeFromOldPublisher.acknowledged) {
            throw new GraphQLError('Internal Server Error: Failed to update old publisher', {
              extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
          }

          let addToNewPublisher = await publishers.updateOne(
            { _id: new ObjectId(args.publisherId) },
            { $push: { books: new ObjectId(args._id) } }
          );
          if (!addToNewPublisher.acknowledged) {
            throw new GraphQLError('Internal Server Error: Failed to update new publisher', {
              extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
          }
        }
        let exists = await client.exists(`book:${args._id}`);
        if (exists) {
          console.log('Update bookId Cache');
          await client.set(`book:${args._id}`, JSON.stringify(newBook), {
            EX: 3600
          });
        }
        let exists2 = await client.exists(`books`);
        if (exists2) {
          console.log('Update books Cache');
          const allBooks = await books.find({}).toArray();
          await client.set('books', JSON.stringify(allBooks), {
            EX: 3600
          });
        }
        if (newTitle) {
          console.log('Removing book title search caches')
          await removeSearch('book')
        }
        if (newGenre) {
          let genreExists = await client.exists(`genre:${oldGenre}`)
          if (genreExists) {
            console.log(`Remove book ${oldGenre} Genre from Cache`);
            await client.del(`genre:${oldGenre}`);
          }
          genreExists = await client.exists(`genre:${newBook.genre}`)
          if (genreExists) {
            console.log(`Remove book ${newBook.genre} Genre from Cache`);
            await client.del(`genre:${newBook.genre}`);
          }
        }
      } else {
        throw new GraphQLError(
          `Could not update Book with _id of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      return newBook;
    },
    addChapter: async (_, args) => {
      let books = await bookCollection();
      let chapters = await chapterCollection()
      args.bookId = args.bookId.trim()
      if (!ObjectId.isValid(args.bookId)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let book = await books.findOne({ _id: new ObjectId(args.bookId) });
      if (!book) {
        throw new GraphQLError(
          `Could not Find book with an ID of ${args.bookId}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      args.title = args.title.trim()
      if (args.title.length === 0 || args.title.length > 255) {
        throw new GraphQLError(`Could not Add Chapter: invalid title length`, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let chapter = await chapters.findOne({ bookId: new ObjectId(args.bookId), title: args.title });
      if (chapter) {
        throw new GraphQLError(
          `Found chapter of same name in ${args.bookId}`,
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        );
      }
      const newChapter = {
        _id: new ObjectId(),
        title: args.title,
        bookId: new ObjectId(args.bookId)
      };
      let insertedChapter = await chapters.insertOne(newChapter);
      if (!insertedChapter.acknowledged || !insertedChapter.insertedId) {
        throw new GraphQLError(`Could not Add Chapter`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
      let updatedBook = await books.updateOne(
        { _id: new ObjectId(args.bookId) },
        { $push: { chapters: newChapter._id } }
      );
      if (!updatedBook.acknowledged) {
        throw new GraphQLError('Internal Server Error: Could not update book with new chapter ID', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
      let exists = await client.exists(`book:chapters:${args.bookId}`);
      if (exists) {
        console.log('Update chapters Cache');
        const allChapters = await chapters.find({ bookId: new ObjectId(args.bookId) }).toArray();
        await client.set(`book:chapters:${args.bookId}`, JSON.stringify(allChapters), {
          EX: 3600
        });
      }
      console.log('Removing chapter title search caches')
      await removeSearch('chapter')
      return newChapter;
    },
    removeChapter: async (_, args) => {
      args._id = args._id.trim()
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let chapters = await chapterCollection();
      const chapterCount = await chapters.count({ _id: new ObjectId(args._id) });
      if (chapterCount === 0) {
        throw new GraphQLError(
          `Could not Find Chapter with an ID of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      const deletedChapter = await chapters.findOneAndDelete({ _id: new ObjectId(args._id) });
      if (!deletedChapter) {
        throw new GraphQLError(
          `Could not delete chapter with _id of ${args._id}`,
          {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        );
      }
      let books = await bookCollection();
      let updatedBook = await books.updateOne(
        { _id: new ObjectId(deletedChapter.bookId) },
        { $pull: { chapters: new ObjectId(args._id) } }
      );
      if (!updatedBook.acknowledged) {
        throw new GraphQLError('Internal Server Error: Could not update book by removing chapter ID', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
      let exists = await client.exists(`book:chapters:${deletedChapter.bookId}`);
      if (exists) {
        console.log('Update chapters Cache');
        const allChapters = await chapters.find({ bookId: new ObjectId(deletedChapter.bookId) }).toArray();
        await client.set(`book:chapters:${deletedChapter.bookId}`, JSON.stringify(allChapters), {
          EX: 3600
        });
      }
      let exists2 = await client.exists(`chapter:${args._id}`);
      if (exists2) {
        console.log(`Update chapter ${args._id} Cache`);
        await client.del(`chapter:${args._id}`);
      }
      console.log('Removing chapter title search caches')
      await removeSearch('chapter')
      return deletedChapter;
    },
    editChapter: async (_, args) => {
      let chapters = await chapterCollection()
      const books = await bookCollection();
      args._id = args._id.trim()
      let newTitle = false
      let newBook = false
      let oldBookId
      if (!ObjectId.isValid(args._id)) {
        throw new GraphQLError('Invalid Id', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      let newChapter = await chapters.findOne({ _id: new ObjectId(args._id) });
      let empty = true
      if (newChapter) {
        if (args.title === null) {
          throw new GraphQLError(`Could not Edit Chapter: null title`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.bookId === null) {
          throw new GraphQLError(`Could not Edit Chapter: null bookid`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (args.bookId) {
          empty = false
          args.bookId = args.bookId.trim()
          if (!ObjectId.isValid(args.bookId)) {
            throw new GraphQLError('Invalid Id', {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          const bookCount = await books.count({ _id: new ObjectId(args.bookId) });
          if (bookCount === 1) {
            oldBookId = newChapter.bookId
            newChapter.bookId = new ObjectId(args.bookId);
          } else {
            throw new GraphQLError(
              `Could not Find Book with an ID of ${args.bookId}`,
              {
                extensions: { code: 'NOT_FOUND' }
              }
            );
          }
          newBook = true
        }
        if (args.title) {
          empty = false
          newChapter.title = args.title;
          newChapter.title = newChapter.title.trim()
          if (newChapter.title.length === 0 || newChapter.title.length > 255) {
            throw new GraphQLError(`Could not Edit Book: Invalid title length`, {
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }
          const bookCount = await books.count({ _id: new ObjectId(args.bookId), title: newChapter.title });
          if (bookCount === 1) {
            throw new GraphQLError(
              `Could Find Book with identical title ${args.bookId}`,
              {
                extensions: { code: 'BAD_USER_INPUT' }
              }
            );
          }
          newTitle = true
        }
        if (empty) {
          throw new GraphQLError(`Could not Edit Chapter`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        let editedChapter = await chapters.updateOne({ _id: new ObjectId(args._id) }, { $set: newChapter });
        if (!editedChapter.acknowledged) {
          throw new GraphQLError(`Could not edit Book`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
        if (newBook) {
          let updateOldBook = await books.updateOne(
            { _id: new ObjectId(oldBookId) },
            { $pull: { chapters: new ObjectId(args._id) } }
          );
          if (!updateOldBook.acknowledged) {
            throw new GraphQLError(`Could not remove chapter from old book`, {
              extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
          }
          let updateNewBook = await books.updateOne(
            { _id: new ObjectId(newChapter.bookId) },
            { $addToSet: { chapters: new ObjectId(args._id) } }
          );
          if (!updateNewBook.acknowledged) {
            throw new GraphQLError(`Could not add chapter to new book`, {
              extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
          }
          let exists = await client.exists(`book:chapters:${oldBookId}`);
          if (exists) {
            console.log('Update chapters Cache');
            const allChapters = await chapters.find({ bookId: new ObjectId(oldBookId) }).toArray();
            await client.set(`book:chapters:${oldBookId}`, JSON.stringify(allChapters), {
              EX: 3600
            });
          }
          let exists2 = await client.exists(`book:chapters:${newChapter.bookId}`);
          if (exists2) {
            console.log('Update chapters Cache');
            const allChapters = await chapters.find({ bookId: new ObjectId(newChapter.bookId) }).toArray();
            await client.set(`book:chapters:${newChapter.bookId}`, JSON.stringify(allChapters), {
              EX: 3600
            });
          }
        }
        if (newTitle) {
          console.log('Removing chapter title search caches')
          await removeSearch('chapter')
        }
      } else {
        throw new GraphQLError(
          `Could not update Chapter with _id of ${args._id}`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        );
      }
      return newChapter;
    },
  }
};