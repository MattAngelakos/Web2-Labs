import React from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';

function Publisher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const { loading, error, data } = useQuery(queries.GET_PUBLISHER_BY_ID, {
        variables: { _id: id },
        fetchPolicy: 'cache-and-network',
    });

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
    };
    const handleDelete = () => {
        navigate('/publishers');
    };
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (data.getPublisherById) {
        const { getPublisherById } = data;
        return (
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title">Name: {getPublisherById.name}</h3>
                    <h5 className="card-title">Established Year: {getPublisherById.establishedYear}</h5>
                    <h5 className="card-title">Location: {getPublisherById.location}</h5>
                    <p>Number of Books: {getPublisherById.numOfBooks}</p>
                    {getPublisherById.numOfBooks > 0 && (
                        <>
                            <h5>Books:</h5>
                            <ol>
                                {getPublisherById.books.map(book => (
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
                        type="publisher"
                        data={getPublisherById}
                        handleClose={handleCloseModals}
                    />
                )}
                {showDeleteModal && (
                    <DeleteModal
                        isOpen={showDeleteModal}
                        entityType="publisher"
                        handleClose={handleCloseModals}
                        deleteEntity={getPublisherById}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        )
    }
};

export default Publisher;
