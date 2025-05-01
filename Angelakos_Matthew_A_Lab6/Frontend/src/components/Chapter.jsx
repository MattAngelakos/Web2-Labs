import React, { useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';
import Add from './Add';

function Chapter() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const { loading, error, data } = useQuery(queries.GET_CHAPTER_BY_ID, {
        variables: { _id: id },
        fetchPolicy: 'cache-and-network',
    });
    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
    };
    const handleDelete = (bookId) => {
        navigate(`/books/${bookId}`);
    };
    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return (
            <p>
                Error:{" "}
                {error?.message || error2?.message}
            </p>
        );
    }
    const { getChapterById } = data;
    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title">Title: {getChapterById.title}</h3>
                    <NavLink className='card-title' to={`/books/${getChapterById.book._id}`}>
                        Book: {getChapterById.book.title}
                    </NavLink>
                    <br></br>
                    <button
                        className="button"
                        onClick={() => setShowEditModal(true)}
                    >
                        Edit
                    </button>
                    <button
                        className="button"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Delete
                    </button>
                </div>

                {showEditModal && (
                    <EditModal
                        isOpen={showEditModal}
                        type="chapter"
                        data={getChapterById}
                        handleClose={handleCloseModals}
                    />
                )}
                {showDeleteModal && (
                    <DeleteModal
                        isOpen={showDeleteModal}
                        entityType="chapter"
                        handleClose={handleCloseModals}
                        deleteEntity={getChapterById}
                        onDelete={() => handleDelete(getChapterById.book._id)}
                    />
                )}
            </div>
        </div>
    );
}

export default Chapter;
