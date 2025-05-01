import React, { useState } from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import Add from './Add';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';
import PublisherList from './PublisherList';

function Publishers() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editPublisher, setEditPublisher] = useState(null);
    const [deletePublisher, setDeletePublisher] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const closeAddFormState = () => {
        setShowAddForm(false);
    };
    const { loading, error, data } = useQuery(
        queries.GET_PUBLISHERS,
        {
            fetchPolicy: 'cache-and-network'
        }
    );
    const handleOpenEditModal = (book) => {
        setShowEditModal(true);
        setEditPublisher(book);
    };

    const handleOpenDeleteModal = (book) => {
        setShowDeleteModal(true);
        setDeletePublisher(book);
    };


    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
    };

    if (data) {
        const { publishers } = data;

        return (
            <div>
                <button className='button' onClick={() => setShowAddForm(!showAddForm)}>
                    Create publisher
                </button>
                {showAddForm && (
                    <Add type='publisher' closeAddFormState={closeAddFormState} />
                )}
                <br />
                <br />
                <div>
                    <PublisherList
                        publishers={publishers}
                        handleOpenEditModal={handleOpenEditModal}
                        handleOpenDeleteModal={handleOpenDeleteModal}
                    />
                    {showEditModal && (
                        <EditModal
                            isOpen={showEditModal}
                            type={'publisher'}
                            data={editPublisher}
                            handleClose={handleCloseModals}
                        />
                    )}
                    {showDeleteModal && (
                        <DeleteModal
                            isOpen={showDeleteModal}
                            entityType="publisher"
                            handleClose={handleCloseModals}
                            deleteEntity={deletePublisher}
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

export default Publishers;
