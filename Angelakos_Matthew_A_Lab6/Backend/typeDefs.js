//Create the type definitions for the query and our data
export const typeDefs = `#graphql
  enum Genre {
    FICTION
    NON_FICTION
    MYSTERY
    FANTASY
    ROMANCE
    SCIENCE_FICTION
    HORROR
    BIOGRAPHY
  }

  type Query {
    authors: [Author]
    books: [Book]
    publishers: [Publisher]
    getAuthorById(_id: String!): Author
    getBookById(_id: String!): Book
    getPublisherById(_id: String!): Publisher
    getChaptersByBookId(bookId: String!): [Chapter]
    booksByGenre(genre: Genre!): [Book]
    publishersByEstablishedYear(min: Int!, max: Int!): [Publisher]
    searchAuthorByName(searchTerm: String!): [Author]
    searchBookByTitle(searchTerm: String!): [Book]
    getChapterById(_id: String!): Chapter
    searchChapterByTitle(searchTitleTerm: String!): [Chapter]
  }
  
  type Author {
    _id: String!
    name: String!
    bio: String
    dateOfBirth: String!
    books: [Book!]!
    numOfBooks: Int
  }

  type Publisher {
    _id: String!
    name: String!
    establishedYear: Int!
    location: String
    books: [Book!]!
    numOfBooks: Int
  }

  type Book {
    _id: String!
    title: String!
    publicationDate: String!
    genre: Genre!
    author: Author!
    publisher: Publisher!
    chapters: [Chapter!]!
  }

  type Chapter {
    _id: String!
    title: String!
    book: Book!
  }

  type Mutation {
    addAuthor(name: String!, bio: String, dateOfBirth: String!): Author
    removeAuthor(_id: String!): Author
    editAuthor(_id: String!, name: String, bio: String, dateOfBirth: String): Author
    addPublisher(name: String!, establishedYear: Int!, location: String!): Publisher
    removePublisher(_id: String!): Publisher
    editPublisher(_id: String!, name: String, establishedYear: Int, location: String): Publisher
    addBook(title: String!, publicationDate: String!, genre: Genre!, authorId: String!, publisherId: String!): Book
    removeBook(_id: String!): Book
    editBook(_id: String!, title: String, publicationDate: String, genre: Genre, authorId: String, publisherId: String): Book
    addChapter(title: String!, bookId: String!): Chapter
    editChapter(_id: String!, title: String, bookId: String): Chapter
    removeChapter(_id: String!): Chapter
  }
`;
