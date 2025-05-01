import { gql } from '@apollo/client';

const GET_AUTHORS = gql`
  query {
    authors {
      _id
      name
      bio
      dateOfBirth
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const GET_AUTHOR_BY_ID = gql`
  query GetAuthorById($_id: String!) {
    getAuthorById(_id: $_id) {
      _id
      name
      bio
      dateOfBirth
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const GET_PUBLISHERS = gql`
  query {
    publishers {
      _id
      name
      establishedYear
      location
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const GET_PUBLISHER_BY_ID = gql`
  query GetPublisherById($_id: String!) {
    getPublisherById(_id: $_id) {
      _id
      name
      establishedYear
      location
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const GET_BOOKS = gql`
  query {
    books {
      _id
      title
      publicationDate
      genre
      author{
        _id
        name
      }
      publisher{
        _id
        name
      }
      chapters {
        title
        _id
      }
    }
  }
`;

const GET_BOOK_BY_ID = gql`
  query GetBookById($_id: String!) {
    getBookById(_id: $_id) {
      _id
      title
      publicationDate
      genre
      author{
        _id
        name
      }
      publisher{
        _id
        name
      }
      chapters {
        title
        _id
      }
    }
  }
`;

const GET_CHAPTERS_BY_BOOK_ID = gql`
  query GetChaptersByBookId($bookId: String!) {
    getChaptersByBookId(bookId: $bookId) {
        _id
        title
  }
}
`;

const GET_CHAPTER_BY_ID = gql`
  query GetChapterById($_id: String!) {
    getChapterById(_id: $_id) {
      _id
      title
      book{
        _id
        title
      }
    }
  }
`;

const GET_BOOKS_BY_GENRE = gql`
query BooksByGenre($genre: Genre!) {
  booksByGenre(genre: $genre) {
    _id
    title
    publicationDate
    genre
    author {
      _id
      name
    }
    publisher {
      _id
      name
    }
    chapters {
      _id
      title
    }
  }
}
`;

const GET_AUTHOR_BY_NAME = gql`
query SearchAuthorByName($searchTerm: String!) {
  searchAuthorByName(searchTerm: $searchTerm) {
    _id
    name
    bio
    dateOfBirth
    books {
      title
      _id
    }
    numOfBooks
  }
}
`;

const GET_BOOKS_BY_TITLE = gql`
query SearchBookByTitle($searchTerm: String!) {
  searchBookByTitle(searchTerm: $searchTerm) {
    _id
    title
    publicationDate
    genre
    author {
      _id
      name
    }
    publisher {
      _id
      name
    }
    chapters {
      _id
      title
    }
  }
}
`;

const GET_CHAPTERS_BY_TITLE = gql`
query SearchChapterByTitle($searchTitleTerm: String!) {
  searchChapterByTitle(searchTitleTerm: $searchTitleTerm) {
    _id
    title
    book {
      _id
      title
    }
  }
}
`;

const GET_PUBLISHERS_BY_YEAR = gql`
  query PublishersByEstablishedYear($min: Int!, $max: Int!) {
    publishersByEstablishedYear(min: $min, max: $max) {
      _id
      name
      establishedYear
      location
      numOfBooks
      books {
        _id
        title
      }
    }
  }
`;


const ADD_AUTHOR = gql`
  mutation createAuthor(
    $name: String!
    $bio: String
    $dateOfBirth: String!
  ) {
    addAuthor(
      name: $name
      bio: $bio
      dateOfBirth: $dateOfBirth
    ) {
      _id
      name
      bio
      dateOfBirth
    }
  }
`;

const DELETE_AUTHOR = gql`
  mutation deleteAuthor($id: String!) {
    removeAuthor(_id: $id) {
      _id
      name
      bio
      dateOfBirth
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const EDIT_AUTHOR = gql`
  mutation changeAuthor(
    $id: String!
    $name: String
    $bio: String
    $dateOfBirth: String
  ) {
    editAuthor(
      _id: $id
      name: $name
      bio: $bio
      dateOfBirth: $dateOfBirth
    ) {
      _id
      name
      bio
      dateOfBirth
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const ADD_PUBLISHER = gql`
  mutation createPublisher(
    $name: String!
    $establishedYear: Int!
    $location: String!
  ) {
    addPublisher(
      name: $name
      establishedYear: $establishedYear
      location: $location
    ) {
      _id
      name
      establishedYear
      location
    }
  }
`;

const DELETE_PUBLISHER = gql`
  mutation deletePublisher($id: String!) {
    removePublisher(_id: $id) {
      _id
      name
      establishedYear
      location
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const EDIT_PUBLISHER = gql`
  mutation changePublisher(
    $id: String!
    $name: String
    $establishedYear: Int
    $location: String
  ) {
    editPublisher(
      _id: $id
      name: $name
      establishedYear: $establishedYear
      location: $location
    ) {
      _id
      name
      establishedYear
      location
      numOfBooks
      books {
        title
        _id
      }
    }
  }
`;

const ADD_BOOK = gql`
  mutation createBook(
    $title: String!
    $publicationDate: String!
    $genre: Genre!
    $authorId: String!
    $publisherId: String!
  ) {
    addBook(
      title: $title
      publicationDate: $publicationDate
      genre: $genre
      authorId: $authorId
      publisherId: $publisherId
    ) {
      _id
      title
      publicationDate
      genre
      author{
        _id
        name
      }
      publisher{
        _id
        name
      }
    }
  }
`;

const DELETE_BOOK = gql`
  mutation deleteBook($id: String!) {
    removeBook(_id: $id) {
      _id
      title
      publicationDate
      genre
      author{
        _id
        name
      }
      publisher{
        _id
        name
      }
      chapters {
        title
        _id
      }
    }
  }
`;

const EDIT_BOOK = gql`
  mutation changeBook(
    $id: String!
    $title: String
    $publicationDate: String
    $genre: Genre
    $authorId: String
    $publisherId: String
  ) {
    editBook(
      _id: $id
      title: $title
      publicationDate: $publicationDate
      genre: $genre
      authorId: $authorId
      publisherId: $publisherId
    ) {
      _id
      title
      publicationDate
      genre
      author{
        _id
        name
      }
      publisher{
        _id
        name
      }
      chapters {
        title
        _id
      }
    }
  }
`;

const ADD_CHAPTER = gql`
  mutation createChapter(
    $title: String!
    $bookId: String!
  ) {
    addChapter(
      title: $title
      bookId: $bookId
    ) {
      _id
      title
      book {
        title
        _id
      }
    }
  }
`;

const DELETE_CHAPTER = gql`
  mutation deleteChapter($id: String!) {
    removeChapter(_id: $id) {
      _id
      title
      book {
        title
        _id
      }
    }
  }
`;

const EDIT_CHAPTER = gql`
  mutation changeChapter(
    $id: String!
    $title: String
    $bookId: String
  ) {
    editChapter(
      _id: $id
      title: $title
      bookId: $bookId
    ) {
      _id
      title
      book {
        title
        _id
      }
    }
  }
`;

let exported = {
  ADD_AUTHOR,
  ADD_BOOK,
  ADD_PUBLISHER,
  ADD_CHAPTER,
  GET_AUTHORS,
  GET_BOOKS,
  GET_PUBLISHERS,
  GET_AUTHOR_BY_ID,
  GET_BOOK_BY_ID,
  GET_PUBLISHER_BY_ID,
  GET_CHAPTERS_BY_BOOK_ID,
  GET_CHAPTER_BY_ID,
  EDIT_AUTHOR,
  EDIT_BOOK,
  EDIT_PUBLISHER,
  EDIT_CHAPTER,
  DELETE_AUTHOR,
  DELETE_BOOK,
  DELETE_PUBLISHER,
  DELETE_CHAPTER,
  GET_BOOKS_BY_GENRE,
  GET_AUTHOR_BY_NAME,
  GET_BOOKS_BY_TITLE,
  GET_CHAPTERS_BY_TITLE,
  GET_PUBLISHERS_BY_YEAR
};

export default exported;
