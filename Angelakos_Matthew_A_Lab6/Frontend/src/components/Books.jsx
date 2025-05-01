import React, { useState } from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import Add from './Add';
import DeleteModal from './DeleteModal';
import EditModal from './EditModal';
import BookList from './BookList';

function Books() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [deleteBook, setDeleteBook] = useState(null);

    const { loading, error, data } = useQuery(queries.GET_BOOKS, {
        fetchPolicy: 'cache-and-network'
    });
    const handleOpenEditModal = (book) => {
        setShowEditModal(true);
        setEditBook(book);
    };

    const handleOpenDeleteModal = (book) => {
        setShowDeleteModal(true);
        setDeleteBook(book);
    };
    const closeAddFormState = () => {
        setShowAddForm(false);
    };

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
    };

    if (data) {
        const { books } = data;
        return (
            <div>
                <button className='button' onClick={() => setShowAddForm(!showAddForm)}>
                    Create Book
                </button>
                {showAddForm && (
                    <Add type='book' closeAddFormState={closeAddFormState} />
                )}
                <br />
                <br />
                <BookList
                    books={books}
                    handleOpenEditModal={handleOpenEditModal}
                    handleOpenDeleteModal={handleOpenDeleteModal}
                />
                {showEditModal && (
                    <EditModal
                        isOpen={showEditModal}
                        type={'book'}
                        data={editBook}
                        handleClose={handleCloseModals}
                    />
                )}

                {showDeleteModal && (
                    <DeleteModal
                        isOpen={showDeleteModal}
                        entityType="book"
                        handleClose={handleCloseModals}
                        deleteEntity={deleteBook}
                    />
                )}
            </div>
        );
    } else if (loading) {
        return <div>Loading</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    }
}

export default Books;
