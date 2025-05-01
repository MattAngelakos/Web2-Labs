import React, { useState } from 'react';

function AddTodo({ addTodo }) {
    const date = new Date()
    const today = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [due, setDue] = useState(today);
    const [error, setError] = useState('');

    const validateForm = () => {
        let errors = [];
        if (title.trim().length < 5 || title.length > 100) {
            errors.push('Title must be between 5-100 characters long.');
        }
        if (description.trim().length < 25 || description.trim().length > 2000) {
            errors.push('Description must be between 25-2000 characters long.');
        }
        try {
            if (new Date(due).setHours(0, 0, 0, 0) < new Date(today).setHours(0, 0, 0, 0)) {
                errors.push('Due date cannot be in the past.');
            }
        } catch (e) {
            errors.push('Invalid Date.');
        }
        if (errors.length > 0) {
            setError(errors.join(' '));
            return false;
        }
        setError('');
        return true;
    };
    


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const [year, month, day] = due.split('-');
        const dueDate = `${month}/${day}/${year}`;
        addTodo({ title: title.trim(), description: description.trim(), due: dueDate });
        setTitle('');
        setDescription('');
        setDue(today);
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label tag="title">Title: </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label tag="description">Description: </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label tag="due">Due Date: </label>
                    <input
                        type="date"
                        id="due"
                        value={due}
                        min={today}
                        onChange={(e) => setDue(e.target.value)}
                    />
                </div>
                <button type="submit">Add Todo</button>
            </form>
        </div>
    );
}

export default AddTodo;