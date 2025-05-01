import React, { useState } from 'react';
import './App.css';
import ReactModal from 'react-modal';
import { useQuery, useMutation } from '@apollo/client';
//Import the file where my query constants are defined
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
ReactModal.setAppElement('#root');
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    border: '1px solid #28547a',
    borderRadius: '4px'
  }
};

function EditModal(props) {
  const [errorMessages, setErrorMessages] = useState([]);
  const [showEditModal, setShowEditModal] = useState(props.isOpen);
  const [item, setItem] = useState(props.data);
  const mutation = props.type === 'book' ? queries.EDIT_BOOK : props.type === 'author' ? queries.EDIT_AUTHOR : props.type === 'publisher' ? queries.EDIT_PUBLISHER : queries.EDIT_CHAPTER;
  const [editItem] = useMutation(mutation);
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setItem(null);
    props.handleClose();
  };

  let title
  let publicationDate
  let authorId
  let genre
  let publisherId
  let name
  let dateOfBirth
  let establishedYear
  let bio
  let location
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

  return (
    <div>
      <ReactModal
        name='editModal'
        isOpen={showEditModal}
        contentLabel='Edit Book'
        style={customStyles}
      >
        {props.type == 'author' && (
          <>
            <form
              className='form'
              id='add-author'
              onSubmit={(e) => {
                e.preventDefault();
                const errors = [];
                setErrorMessages([]);
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
                editItem({
                  variables: {
                    id: props.data._id,
                    name: name.value,
                    dateOfBirth: dateOfBirth.value,
                    bio: bio.value
                  }
                });
                bio.value = '';
                setShowEditModal(false);
                alert('Author Updated');
                props.handleClose();
              }}
            >
              <div className='form-group'>
                <label>
                  Name:
                  <br />
                  <input
                    ref={(node) => {
                      name = node;
                    }}
                    defaultValue={item.name}
                    autoFocus={true}
                  />
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Bio:
                  <br />
                  <input
                    ref={(node) => {
                      bio = node;
                    }}
                    defaultValue={item.bio}
                  />
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Date of Birth:
                  <br />
                  <input
                    ref={(node) => {
                      dateOfBirth = node;
                    }}
                    defaultValue={item.dateOfBirth}
                  />
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
                Update Author
              </button>
            </form>
          </>)}
        {props.type == 'publisher' && (
          <>
            <form
              className='form'
              id='add-publisher'
              onSubmit={(e) => {
                e.preventDefault();
                const errors = [];
                setErrorMessages([]);
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
                editItem({
                  variables: {
                    id: props.data._id,
                    name: name.value,
                    establishedYear: parseInt(establishedYear.value),
                    location: location.value
                  }
                });
                setShowEditModal(false);
                alert('Publisher Updated');
                props.handleClose();
              }}
            >
              <div className='form-group'>
                <label>
                  Name:
                  <br />
                  <input
                    ref={(node) => {
                      name = node;
                    }}
                    defaultValue={item.name}
                    autoFocus={true}
                  />
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Established Year:
                  <br />
                  <input
                    ref={(node) => {
                      establishedYear = node;
                    }}
                    defaultValue={item.establishedYear}
                  />
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Location:
                  <br />
                  <input
                    ref={(node) => {
                      location = node;
                    }}
                    defaultValue={item.location}
                  />
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
                Update Publisher
              </button>
            </form>
          </>)}
        {props.type == 'book' && (
          <>
            <form
              className='form'
              id='add-book'
              onSubmit={(e) => {
                e.preventDefault();
                const errors = [];
                setErrorMessages([]);
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
                editItem({
                  variables: {
                    id: props.data._id,
                    title: title.value,
                    publicationDate: publicationDate.value,
                    genre: genre.value,
                    authorId: authorId.value,
                    publisherId: publisherId.value
                  }
                }).then(() => {
                  setShowEditModal(false);
                  alert('Book Updated');
                  props.handleClose();
                })
                  .catch((error) => {
                    console.error('Error adding book:', error);
                    setErrorMessages([`Failed to add book. Please try again: ${error}`]);
                  });
              }}
            >
              <div className='form-group'>
                <label>
                  Title:
                  <br />
                  <input
                    ref={(node) => {
                      title = node;
                    }}
                    defaultValue={item.title}
                    autoFocus={true}
                  />
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Publication Date:
                  <br />
                  <input
                    ref={(node) => {
                      publicationDate = node;
                    }}
                    defaultValue={item.publicationDate}
                  />
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Genre:
                  <select defaultValue={item.genre} className='form-control' ref={(node) => {
                    genre = node;
                  }}>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <br />
              <div className='form-group'>
                <label>
                  Author:
                  <select
                    defaultValue={item.author._id}
                    className='form-control'
                    ref={(node) => {
                      authorId = node;
                    }}
                  >
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
                  <select
                    defaultValue={item.publisher._id}
                    className='form-control'
                    ref={(node) => {
                      publisherId = node;
                    }}
                  >
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
                Update Book
              </button>
            </form>
          </>)}
        {props.type == 'chapter' && (
          <>
            <form
              className='form'
              id='add-chapter'
              onSubmit={(e) => {
                e.preventDefault();
                const errors = [];
                setErrorMessages([]);
                title.value = title.value.trim()
                if (title.value.length === 0 || title.value.length > 255) {
                  errors.push(`Could not Add Chapter: invalid title length`);
                }
                if (errors.length > 0) {
                  setErrorMessages(errors);
                  return;
                }
                editItem({
                  variables: {
                    id: props.data._id,
                    title: title.value,
                    bookId: props.data.bookId
                  }
                })
                .then(() => {
                  setShowEditModal(false);
                  alert('Chapter Updated');
                  props.handleClose();
                })
                .catch((error) => {
                  console.error('Error adding chapter:', error);
                  setErrorMessages([`Failed to add chapter. Please try again: ${error}`]);
                });
              }}
            >
              <div className='form-group'>
                <label>
                  Title:
                  <br />
                  <input
                    ref={(node) => {
                      title = node;
                    }}
                    defaultValue={item.title}
                    autoFocus={true}
                  />
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
                Update Chapter
              </button>
            </form>
          </>)}
        <button className='button cancel-button' onClick={handleCloseEditModal}>
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default EditModal;
