import React from 'react';
import { NavLink } from 'react-router-dom';

const BookList = ({ books, handleOpenEditModal, handleOpenDeleteModal }) => {
  return (
    <div>
      {books.map((book) => (
        <div className="card" key={book._id}>
          <div className="card-body">
            <NavLink className="card-title" to={`/books/${book._id}`}>
              Title: {book.title}
            </NavLink>
            <h5 className="card-title">Publication Date: {book.publicationDate}</h5>
            <h5 className="card-title">Genre: {book.genre}</h5>
            <NavLink className='card-title' to={`/authors/${book.author._id}`}>
              Author: {book.author.name}
            </NavLink>
            <br />
            <NavLink className='card-title' to={`/publishers/${book.publisher._id}`}>
              Publisher: {book.publisher.name}
            </NavLink>
            <br />
            <br />
            <span>Chapters:</span>
            <br />
            <ol>
              {book.chapters.map((chapter) => (
                <li key={chapter._id}>
                  <NavLink className='card-title' to={`/chapters/${chapter._id}`}>
                    {chapter.title}
                  </NavLink>
                </li>

              ))}
            </ol>
            {handleOpenEditModal &&
              <button
                className="button"
                onClick={() => handleOpenEditModal(book)}
              >
                Edit
              </button>}
            {handleOpenDeleteModal &&
              <button
                className="button"
                onClick={() => handleOpenDeleteModal(book)}
              >
                Delete
              </button>}
            <br />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
