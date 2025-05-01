import React, { useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import queries from '../queries';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';
import Add from './Add';

function Book() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteChapter, setDeleteChapter] = useState(null);
    const { loading, error, data } = useQuery(queries.GET_BOOK_BY_ID, {
        variables: { _id: id },
        fetchPolicy: 'cache-and-network',
    });
    const {
        loading: chaptersLoading,
        error: chaptersError,
        data: chaptersData,
        refetch: refetchChapters
    } = useQuery(queries.GET_CHAPTERS_BY_BOOK_ID, {
        variables: { bookId: id },
        fetchPolicy: 'network-only',
    });

    const [deleteChapterMutation] = useMutation(queries.DELETE_CHAPTER);

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setDeleteChapter(null);
    };

    const closeAddFormState = () => {
        setShowAddForm(false);
    };

    const handleDeleteBook = () => {
        navigate('/books');
    };

    const handleOpenDeleteModal = (chapter) => {
        setShowDeleteModal(true);
        setDeleteChapter(chapter);
    };

    const handleDeleteChapter = async () => {
        if (deleteChapter) {
            try {
                await refetchChapters(); 
                setShowDeleteModal(false);
                setDeleteChapter(null);
            } catch (error) {
                console.error('Error deleting chapter:', error);
            }
        }
    };

    if (loading || chaptersLoading) {
        return <div>Loading...</div>;
    }
    if (error || chaptersError) {
        return <p>Error: {error?.message || chaptersError?.message}</p>;
    }

    const { getBookById } = data;
    const getChaptersByBookId = chaptersData.getChaptersByBookId;

    return (
        <div>
            <button className='button' onClick={() => setShowAddForm(!showAddForm)}>
                Create Chapter
            </button>
            {showAddForm && (
                <Add type='chapter' closeAddFormState={closeAddFormState} bookId={id} />
            )}
            <br />
            <br />
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title">Title: {getBookById.title}</h3>
                    <h5 className="card-title">Publication Date: {getBookById.publicationDate}</h5>
                    <h5 className="card-title">Genre: {getBookById.genre}</h5>
                    <NavLink className='card-title' to={`/authors/${getBookById.author._id}`}>
                        Author: {getBookById.author.name}
                    </NavLink>
                    <br />
                    <NavLink className='card-title' to={`/publishers/${getBookById.publisher._id}`}>
                        Publisher: {getBookById.publisher.name}
                    </NavLink>
                    {getChaptersByBookId.length > 0 && (
                        <>
                            <h5>Chapters:</h5>
                            <ol>
                                {getChaptersByBookId.map((chapter) => (
                                    <li key={chapter._id}>
                                        <NavLink className='card-title' to={`/chapters/${chapter._id}`}>
                                            {chapter.title}
                                        </NavLink>
                                        <button
                                            className="button"
                                            onClick={() => handleOpenDeleteModal(chapter)}
                                        >
                                            Delete
                                        </button>
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
                        Delete Book
                    </button>
                </div>

                {showEditModal && (
                    <EditModal
                        isOpen={showEditModal}
                        type="book"
                        data={getBookById}
                        handleClose={handleCloseModals}
                    />
                )}
                {showDeleteModal && (
                    <DeleteModal
                        isOpen={showDeleteModal}
                        entityType={deleteChapter ? 'chapter' : 'book'}
                        handleClose={handleCloseModals}
                        deleteEntity={deleteChapter || getBookById}
                        onDelete={deleteChapter ? handleDeleteChapter : handleDeleteBook}
                    />
                )}
            </div>
        </div>
    );
}
export default Book;