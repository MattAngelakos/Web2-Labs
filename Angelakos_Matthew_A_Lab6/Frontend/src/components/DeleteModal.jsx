import React, { useState } from 'react';
import './App.css';
import { useMutation } from '@apollo/client';
import ReactModal from 'react-modal';
import queries from '../queries';
ReactModal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    border: '1px solid #28547a',
    borderRadius: '4px',
  },
};

function DeleteModal(props) {
  const [showDeleteModal, setShowDeleteModal] = useState(props.isOpen);
  const [entity, setEntity] = useState(props.deleteEntity);
  const [errorMessage, setErrorMessage] = useState(null);

  const [removeBook] = useMutation(queries.DELETE_BOOK, {
    update(cache) {
      cache.modify({
        fields: {
          books(existingBooks, { readField }) {
            return existingBooks.filter(
              (bookRef) => entity._id !== readField('_id', bookRef)
            );
          },
        },
      });
    },
  });

  const [removeAuthor] = useMutation(queries.DELETE_AUTHOR, {
    update(cache) {
      cache.modify({
        fields: {
          authors(existingAuthors, { readField }) {
            return existingAuthors.filter(
              (authorRef) => entity._id !== readField('_id', authorRef)
            );
          },
        },
      });
    },
  });

  const [removePublisher] = useMutation(queries.DELETE_PUBLISHER, {
    update(cache) {
      cache.modify({
        fields: {
          publishers(existingPublishers, { readField }) {
            return existingPublishers.filter(
              (publisherRef) => entity._id !== readField('_id', publisherRef)
            );
          },
        },
      });
    },
  });

  const [removeChapter] = useMutation(queries.DELETE_CHAPTER, {
    update(cache) {
      cache.modify({
        fields: {
          chapters(existingChapters, { readField }) {
            return existingChapters.filter(
              (chapterRef) => entity._id !== readField('_id', chapterRef)
            );
          },
        },
      });
    },
  });

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEntity(null);
    props.handleClose();
  };

  const handleDelete = () => {
    setErrorMessage(null); 
    let mutation;
    switch (props.entityType) {
      case 'book':
        mutation = removeBook;
        break;
      case 'author':
        mutation = removeAuthor;
        break;
      case 'publisher':
        mutation = removePublisher;
        break;
      case 'chapter':
        mutation = removeChapter;
        break;
      default:
        setErrorMessage('Invalid entity type.');
        return;
    }

    mutation({
      variables: { id: entity._id },
    })
      .then(() => {
        setShowDeleteModal(false);
        alert(`${props.entityType.charAt(0).toUpperCase() + props.entityType.slice(1)} deleted successfully.`);
        props.onDelete();
        props.handleClose();
      })
      .catch((error) => {
        console.error('Deletion error:', error);
        setErrorMessage('Failed to delete the entity. Please try again.');
      });
  };

  return (
    <div>
      {/* Delete Entity Modal */}
      <ReactModal
        name='deleteModal'
        isOpen={showDeleteModal}
        contentLabel='Delete Entity'
        style={customStyles}
      >
        <div>
          <p>
            Are you sure you want to delete {entity.name || entity.title}?
          </p>
          {errorMessage && (
            <p className="error-message" style={{ color: 'red' }}>
              {errorMessage}
            </p>
          )}
          <form
            className='form'
            id='delete-entity'
            onSubmit={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <button className='button add-button' type='submit'>
              Delete {props.entityType.charAt(0).toUpperCase() + props.entityType.slice(1)}
            </button>
          </form>
        </div>
        <br />
        <button className='button cancel-button' onClick={handleCloseDeleteModal}>
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default DeleteModal;
