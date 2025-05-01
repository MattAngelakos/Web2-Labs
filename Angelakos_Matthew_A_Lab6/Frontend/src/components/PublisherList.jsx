import React from 'react';
import { NavLink } from 'react-router-dom';

const PublisherList = ({ publishers, handleOpenEditModal, handleOpenDeleteModal }) => {
    return (
        <div>
            {publishers.map((publisher) => {
                return (
                    <div className='card' key={publisher._id}>
                        <div className='card-body'>
                            <NavLink className='card-title' to={`/publishers/${publisher._id}`}>
                                Name: {publisher.name}
                            </NavLink>
                            <h5 className="card-title">Established Year: {publisher.establishedYear}</h5>
                            <h5 className='card-title'>Location: {publisher.location}</h5>
                            <span>Number of Books:</span> {publisher.numOfBooks}
                            <br />
                            {publisher.numOfBooks > 0 && (
                                <>
                                    <br />
                                    <span>Books:</span>
                                    <br />
                                    <ol>
                                        {publisher.books.map(book => ( 
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
                                    handleOpenEditModal(publisher);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className='button'
                                onClick={() => {
                                    handleOpenDeleteModal(publisher);
                                }}
                            >
                                Delete
                            </button>
                            <br />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PublisherList;
