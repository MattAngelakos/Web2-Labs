import React from 'react';

function CompletedTodos({ todos, toggleCompleted }) {
    return (
        <div>
            {todos.map(todo => (
                <div key={todo.id}>
                    <h1>{todo.title}</h1>
                    <p>{todo.description}</p>
                    <p>Due Date: {todo.due}</p>
                    <p>Completed: Yes</p>
                    <button onClick={() => toggleCompleted(todo)}>Mark Incomplete</button>
                </div>
            ))}
        </div>
    );
}

export default CompletedTodos;
