import React, { useState } from 'react';
import './App.css';

import { useQuery, useMutation } from '@apollo/client';
import queries from '../queries';
const genres = [
  'FICTION',
  'NON_FICTION',
  'MYSTERY',
  'FANTASY',
  'ROMANCE',
  'SCIENCE_FICTION',
  'HORROR',
  'BIOGRAPHY'
];
const nameRegex = /^([^0-9]*)$/
const regex = /^[A-Za-z\s]+,\s?[A-Za-z\s]+$/;
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
function Add(props) {
  const [errorMessages, setErrorMessages] = useState([]);
  const [addAuthor] = useMutation(queries.ADD_AUTHOR, {
    update(cache, { data: { addAuthor } }) {
      const { authors } = cache.readQuery({
        query: queries.GET_AUTHORS
      });
      cache.writeQuery({
        query: queries.GET_AUTHORS,
        data: { authors: [...authors, addAuthor] }
      });
    }
  });

  const [addPublisher] = useMutation(queries.ADD_PUBLISHER, {
    update(cache, { data: { addPublisher } }) {
      const { publishers } = cache.readQuery({
        query: queries.GET_PUBLISHERS
      });
      cache.writeQuery({
        query: queries.GET_PUBLISHERS,
        data: { publishers: [...publishers, addPublisher] }
      });
    }
  });

  const [addBook] = useMutation(queries.ADD_BOOK, {
    update(cache, { data: { addBook } }) {
      const { books } = cache.readQuery({
        query: queries.GET_BOOKS
      });
      cache.writeQuery({
        query: queries.GET_BOOKS,
        data: { books: [...books, addBook] }
      });
    }
  });

  const [addChapter] = useMutation(queries.ADD_CHAPTER, {
    update(cache, { data: { addChapter } }) {
      const { getChaptersByBookId: chaptersData } = cache.readQuery({
        query: queries.GET_CHAPTERS_BY_BOOK_ID,
        variables: { bookId: props.bookId },
      });

      cache.writeQuery({
        query: queries.GET_CHAPTERS_BY_BOOK_ID,
        variables: { bookId: props.bookId },
        data: { getChaptersByBookId: [...chaptersData, addChapter] },
      });
    },
  });


  const {
    loading: authorsLoading,
    error: authorsError,
    data: authorsData
  } = useQuery(queries.GET_AUTHORS);
  const {
    loading: publishersLoading,
    error: publishersError,
    data: publishersData
  } = useQuery(queries.GET_PUBLISHERS);
  const {
    loading: booksLoading,
    error: booksError,
    data: booksData
  } = useQuery(queries.GET_BOOKS);

  if (authorsLoading || publishersLoading || booksLoading) {
    return <p>Loading...</p>;
  }

  if (authorsError || publishersError || booksError) {
    return (
      <p>
        Error:{" "}
        {authorsError?.message || publishersError?.message || booksError?.message}
      </p>
    );
  }

  const authors = authorsData.authors;
  const publishers = publishersData.publishers;
  const books = booksData.books;

  const onSubmitAuthor = (e) => {
    e.preventDefault();
    const errors = [];
    setErrorMessages([]);

    let name = document.getElementById('name');
    let bio = document.getElementById('bio');
    let dateOfBirth = document.getElementById('dateOfBirth');

    name.value = name.value.trim();
    if (name.value.length < 2 || name.value.length > 50) {
      errors.push('Author name must be between 2 and 50 characters.');
    }
    if (!nameRegex.test(name.value)) {
      errors.push('Author name cannot contain numbers.');
    }
    if (bio.value) {
      bio.value = bio.value.trim();
      if (bio.value.length < 2 || bio.value.length > 1027) {
        errors.push('Bio length must be between 2 and 1027 characters.');
      }
    } else {
      bio.value = 'N/A';
    }
    if (isInvalidDate(dateOfBirth.value, true)) {
      errors.push('Please enter a valid date of birth.');
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }

    addAuthor({
      variables: {
        name: name.value,
        bio: bio.value,
        dateOfBirth: dateOfBirth.value,
      },
    })
      .then(() => {
        document.getElementById('add-author').reset();
        alert('Author Added');
        props.closeAddFormState();
      })
      .catch((error) => {
        console.error('Error adding author:', error);
        setErrorMessages([`Failed to add author. Please try again: ${error}`]);
      });
  };

  const onSubmitPublisher = (e) => {
    e.preventDefault();
    const errors = [];
    setErrorMessages([]);
    let name = document.getElementById('name');
    let establishedYear = document.getElementById('establishedYear');
    let location = document.getElementById('location');
    const currentYear = new Date().getFullYear();
    name.value = name.value.trim()
    if (name.value.length < 2 || name.value.length > 255) {
      errors.push('Publsiher name must be between 2 and 50 characters.');
    }
    location.value = location.value.trim()
    if (location.value.length < 4 || location.value.length > 255) {
      errors.push(`Invalid Location Length`);
    }
    if (!regex.test(location.value)) {
      errors.push(`Invalid Location Format: City, State`);
    }
    if (parseInt(establishedYear.value) < 1488 || currentYear < parseInt(establishedYear.value)) {
      errors.push(`Invalid year must be between 1488 and current year`);
    }
    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }
    addPublisher({
      variables: {
        name: name.value,
        establishedYear: parseInt(establishedYear.value),
        location: location.value
      }
    }).then(() => {
      document.getElementById('add-publisher').reset();
      alert('Publisher Added');
      props.closeAddFormState();
    })
      .catch((error) => {
        console.error('Error adding publisher:', error);
        setErrorMessages([`Failed to add publisher. Please try again: ${error}`]);
    });
  };

  const onSubmitBook = (e) => {
    e.preventDefault();
    const errors = [];
    setErrorMessages([]);
    let title = document.getElementById('title');
    let publicationDate = document.getElementById('publicationDate');
    let genre = document.getElementById('genre');
    let authorId = document.getElementById('authorId');
    let publisherId = document.getElementById('publisherId');
    publicationDate.value = publicationDate.value.trim()
    if (isInvalidDate(publicationDate.value)) {
      errors.push(`Could not Add Book: invalid date or format: mm/dd/yyyy`);
    }
    title.value = title.value.trim()
    if (title.value.length === 0 || title.value.length > 255) {
      errors.push(`Could not Add Book: invalid title length`);
    }
    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }
    addBook({
      variables: {
        title: title.value,
        publicationDate: publicationDate.value,
        genre: genre.value,
        authorId: authorId.value,
        publisherId: publisherId.value
      }
    }).then(() => {
      document.getElementById('add-book').reset();
      alert('Book Added');
      props.closeAddFormState();
    })
      .catch((error) => {
        console.error('Error adding book:', error);
        setErrorMessages([`Failed to add book. Please try again: ${error}`]);
    });
  };

  const onSubmitChapter = (e) => {
    e.preventDefault();
    const errors = [];
    setErrorMessages([]);
    const title = document.getElementById('title');
    const bookId = props.bookId;
    if (!title || !bookId) {
      alert('Please provide all required fields');
      return;
    }
    title.value = title.value.trim()
    if (title.value.length === 0 || title.value.length > 255) {
      errors.push(`Could not Add Chapter: invalid title length`);
    }
    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }
    addChapter({
      variables: {
        title: title.value,
        bookId: bookId,
      },
    })
      .then(() => {
        alert('Chapter Added');
        props.closeAddFormState();
        document.getElementById('add-chapter').reset();
      })
      .catch((error) => {
        console.error('Error adding chapter:', error);
        setErrorMessages([`Failed to add chapter. Please try again: ${error}`]);
      });
  };

  let body = null;
  if (props.type === 'author') {
    body = (
      <div className='card'>
        <form className='form' id='add-author' onSubmit={onSubmitAuthor}>
          <div className='form-group'>
            <label>
              Name:
              <br />
              <input id='name' required autoFocus={true} />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Bio:
              <br />
              <input id='bio' />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Date of Birth:
              <br />
              <input id='dateOfBirth' required />
            </label>
          </div>
          <br />
          {errorMessages.length > 0 && (
            <ul className="error-messages">
              {errorMessages.map((msg, index) => (
                <li key={index} className="error-message">
                  {msg}
                </li>
              ))}
            </ul>
          )}
          <button className='button add-button' type='submit'>
            Add Author
          </button>
          <button
            type='button'
            className='button cancel-button'
            onClick={() => {
              document.getElementById('add-author').reset();
              props.closeAddFormState();
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  } else if (props.type === 'publisher') {
    body = (
      <div className='card'>
        <form className='form' id='add-publisher' onSubmit={onSubmitPublisher}>
          <div className='form-group'>
            <label>
              Name:
              <br />
              <input id='name' required autoFocus={true} />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Established Year:
              <br />
              <input id='establishedYear' required />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Location:
              <br />
              <input id='location' required />
            </label>
          </div>
          <br />
          <br />
          {errorMessages.length > 0 && (
            <ul className="error-messages">
              {errorMessages.map((msg, index) => (
                <li key={index} className="error-message">
                  {msg}
                </li>
              ))}
            </ul>
          )}
          <button className='button add-button' type='submit'>
            Add Publisher
          </button>
          <button
            type='button'
            className='button cancel-button'
            onClick={() => {
              document.getElementById('add-publisher').reset();
              props.closeAddFormState();
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }
  else if (props.type === 'book') {
    body = (
      <div className='card'>
        <form className='form' id='add-book' onSubmit={onSubmitBook}>
          <div className='form-group'>
            <label>
              Title:
              <br />
              <input id='title' required autoFocus={true} />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Publication Date:
              <br />
              <input id='publicationDate' required />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Genre:
              <select className='form-control' id='genre'>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className='form-group'>
            <label>
              Author:
              <select className='form-control' id='authorId'>
                {authors &&
                  authors.map((author) => {
                    return (
                      <option key={author._id} value={author._id}>
                        {author.name}
                      </option>
                    );
                  })}
              </select>
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Publisher:
              <select className='form-control' id='publisherId'>
                {publishers &&
                  publishers.map((publisher) => {
                    return (
                      <option key={publisher._id} value={publisher._id}>
                        {publisher.name}
                      </option>
                    );
                  })}
              </select>
            </label>
          </div>
          <br />
          <br />
          {errorMessages.length > 0 && (
            <ul className="error-messages">
              {errorMessages.map((msg, index) => (
                <li key={index} className="error-message">
                  {msg}
                </li>
              ))}
            </ul>
          )}
          <button className='button add-button' type='submit'>
            Add Book
          </button>
          <button
            type='button'
            className='button cancel-button'
            onClick={() => {
              document.getElementById('add-book').reset();
              props.closeAddFormState();
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  } else if (props.type === 'chapter') {
    body = (
      <div className='card'>
        <form className='form' id='add-chapter' onSubmit={onSubmitChapter}>
          <div className='form-group'>
            <label>
              Title:
              <br />
              <input id='title' required autoFocus={true} />
            </label>
          </div>
          <br />
          <br />
          {errorMessages.length > 0 && (
            <ul className="error-messages">
              {errorMessages.map((msg, index) => (
                <li key={index} className="error-message">
                  {msg}
                </li>
              ))}
            </ul>
          )}
          <button className='button add-button' type='submit'>
            Add Chapter
          </button>
          <button
            type='button'
            className='button cancel-button'
            onClick={() => {
              document.getElementById('add-chapter').reset();
              props.closeAddFormState();
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }
  return <div>{body}</div>;
}

export default Add;
