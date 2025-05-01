import React from 'react';

function TodoList({ todos, deleteTodo, toggleCompleted }) {
    const isPastDue = (due) => {
        const today = new Date().toLocaleDateString('en-CA');
        const dueDate = new Date(due).toLocaleDateString('en-CA');
        return dueDate < today;
    };

    return (
        <div>
            {todos.map(todo => (
                <div key={todo.id}>
                    <h1 className={isPastDue(todo.due) ? 'past-due' : ''}>{todo.title}</h1>
                    <p>{todo.description}</p>
                    <p className={isPastDue(todo.due) ? 'past-due' : ''}>Due Date: {todo.due}</p>
                    <p>Completed: No</p>
                    <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    <button onClick={() => toggleCompleted(todo)}>Complete</button>
                </div>
            ))}
        </div>
    );
}

export default TodoList;
