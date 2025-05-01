import React, { useState } from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import Add from './Add';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';
import AuthorList from './AuthorList';

function Authors() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editAuthor, setEditAuthor] = useState(null);
    const [deleteAuthor, setDeleteAuthor] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const closeAddFormState = () => {
        setShowAddForm(false);
    };
    const { loading, error, data } = useQuery(
        queries.GET_AUTHORS,
        {
            fetchPolicy: 'cache-and-network'
        }
    );
    const handleOpenEditModal = (book) => {
        setShowEditModal(true);
        setEditAuthor(book);
    };

    const handleOpenDeleteModal = (book) => {
        setShowDeleteModal(true);
        setDeleteAuthor(book);
    };


    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
    };

    if (data) {
        const { authors } = data;

        return (
            <div>
                <button className='button' onClick={() => setShowAddForm(!showAddForm)}>
                    Create Author
                </button>
                {showAddForm && (
                    <Add type='author' closeAddFormState={closeAddFormState} />
                )}
                <br />
                <br />
                <div>
                <AuthorList
                    authors={authors}
                    handleOpenEditModal={handleOpenEditModal}
                    handleOpenDeleteModal={handleOpenDeleteModal}
                />
                    {showEditModal && (
                        <EditModal
                            isOpen={showEditModal}
                            type={'author'}
                            data={editAuthor}
                            handleClose={handleCloseModals}
                        />
                    )}

                    {showDeleteModal && (
                        <DeleteModal
                            isOpen={showDeleteModal}
                            entityType="author"
                            handleClose={handleCloseModals}
                            deleteEntity={deleteAuthor}
                        />
                    )}
                </div>
            </div>
        );
    } else if (loading) {
        return <div>Loading</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    }
}

export default Authors;
