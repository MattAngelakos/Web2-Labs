import React from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';

const genres = [
    'booksByGenre',
    'publishersByEstablished',
    'searchAuthorByName',
    'searchBookByTitle',
    'searchChapterByTitle'
  ];

function Author() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const { loading, error, data } = useQuery(queries.GET_AUTHOR_BY_ID, {
        variables: { _id: id },
        fetchPolicy: 'cache-and-network',
    });

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
    };

    const handleDelete = () => {
        navigate('/authors');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const { getAuthorById } = data;

    return (
        <div className="card">
            <div className="card-body">
                <h3 className="card-title">Name: {getAuthorById.name}</h3>
                {getAuthorById.bio && getAuthorById.bio !== "N/A" && (
                    <h5 className="card-title">Bio: {getAuthorById.bio}</h5>
                )}
                <h5 className="card-title">Date of Birth: {getAuthorById.dateOfBirth}</h5>
                <p>Number of Books: {getAuthorById.numOfBooks}</p>
                {getAuthorById.numOfBooks > 0 && (
                    <>
                        <h5>Books:</h5>
                        <ol>
                            {getAuthorById.books.map((book) => (
                                <li key={book._id}><NavLink className='card-title' to={`/books/${book._id}`}>
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
                    type="author"
                    data={getAuthorById}
                    handleClose={handleCloseModals}
                />
            )}
            {showDeleteModal && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    entityType="author"
                    handleClose={handleCloseModals}
                    deleteEntity={getAuthorById}
                    onDelete={handleDelete} 
                />
            )}
        </div>
    );
}

export default Author;
