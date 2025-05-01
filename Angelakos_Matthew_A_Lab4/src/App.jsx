import React, { useState } from 'react';
import TodoList from './TodoList';
import CompletedTodos from './CompletedTodos';
import AddTodo from './AddTodo';
import './App.css'; 


function App() {
  const [todos, setTodos] = useState([
    { id: 1, title: 'Walk dog', description: 'Walk my dog', due: '10/1/2024', completed: false },
    { id: 2, title: 'Walk cat', description: 'Walk my cat', due: '10/2/2024', completed: false },
    { id: 3, title: 'Walk fish', description: 'Walk my fish', due: '10/3/2024', completed: false },
    { id: 4, title: 'Walk bird', description: 'Walk my bird', due: '10/4/2024', completed: false },
    { id: 5, title: 'Walk younger brother', description: 'Walk my younger brother', due: '10/5/2024', completed: false },
    { id: 6, title: 'Walk myself', description: 'Walk myself please i need it', due: '10/6/2024', completed: false },
    { id: 7, title: 'Go to Mitsuwa', description: 'I wanna buy soju', due: '10/7/2023', completed: false },
    { id: 8, title: 'Watch Yankees', description: 'If we lose to the guardians im gonna be mad', due: '10/18/2024', completed: false },
    { id: 9, title: 'Play Sparking Zero', description: 'I love that game I wanna play', due: '10/20/2024', completed: false },
    { id: 10, title: 'Practice walking', description: 'I have trouble walking need to practice', due: '12/25/2024', completed: false },
  ]);

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleCompleted = (todo) => {
    setTodos(todos.map(item => item.id === todo.id ? { ...item, completed: !item.completed } : item));
  };

  const addTodo = ({ title, description, due }) => {
    const newTodo = {
      id: todos.length + 1,
      title,
      description,
      due,
      completed: false  
    };
    setTodos([...todos, newTodo]);
  };

  return (
    <div>
      <h1>Todo List</h1>
      <TodoList todos={todos.filter(todo => !todo.completed)} deleteTodo={deleteTodo} toggleCompleted={toggleCompleted} />
      <h1>Completed Todos</h1>
      <CompletedTodos todos={todos.filter(todo => todo.completed)} toggleCompleted={toggleCompleted} />
      <h1>Add More Todos</h1>
      <AddTodo addTodo={addTodo} />
    </div>
  );
}

export default App;