import React from 'react';
import { NavLink } from 'react-router-dom';

const AuthorList = ({ authors, handleOpenEditModal, handleOpenDeleteModal }) => {
    return (
        <div>
            {authors.map((author) => {
                return (
                    <div className='card' key={author._id}>
                        <div className='card-body'>
                            <NavLink className='card-title' to={`/authors/${author._id}`}>
                                Name: {author.name}
                            </NavLink>
                            {author.bio && author.bio !== "N/A" && (
                                <h5 className="card-title">Bio: {author.bio}</h5>
                            )}
                            <h5 className='card-title'>dateOfBirth: {author.dateOfBirth}</h5>
                            <span>Number of Books:</span> {author.numOfBooks}
                            <br />
                            {author.numOfBooks > 0 && (
                                <>
                                    <br />
                                    <span>Books:</span>
                                    <br />
                                    <ol>
                                        {author.books.map(book => (
                                            <li key={book._id}>
                                                <NavLink className='card-title' to={`/books/${book._id}`}>
                                                    {book.title}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ol>
                                </>
                            )}
                            <button
                                className='button'
                                onClick={() => {
                                    handleOpenEditModal(author);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className='button'
                                onClick={() => {
                                    handleOpenDeleteModal(author);
                                }}
                            >
                                Delete
                            </button>
                            <br />
                        </div>
                    </div>
                );
            })}
    </div>)
}

export default AuthorList;