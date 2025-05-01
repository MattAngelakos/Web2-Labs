import React from 'react';
import './App.css';
import {NavLink, Route, Routes} from 'react-router-dom';
import Home from './Home';
import Authors from './Authors';
import Books from './Books';
import Publishers from './Publishers';
import Publisher from './Publisher';
import Author from './Author';
import Book from './Book';
import Chapter from './Chapter';
import Search from './search';

function App() {
  return (
    <div>
      <header className='App-header'>
        <h1 className='App-title center'>
          GraphQL With Apollo Client/Server Lab 6
        </h1>
        <nav className='center'>
          <NavLink className='navlink' to='/'>
            Home
          </NavLink>
          <NavLink className='navlink' to='/authors'>
            Authors
          </NavLink>
          <NavLink className='navlink' to='/publishers'>
            Publishers
          </NavLink>
          <NavLink className='navlink' to='/books'>
            Books
          </NavLink>
          <NavLink className='navlink' to='/search'>
            Search
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/authors/' element={<Authors />} />
        <Route path='/publishers/' element={<Publishers />} />
        <Route path='/books/' element={<Books />} />
        <Route path='/search' element={<Search />} />
        <Route path='/authors/:id' element={<Author />} />
        <Route path='/publishers/:id' element={<Publisher />} />
        <Route path='/books/:id' element={<Book />} />
        <Route path='/chapters/:id' element={<Chapter />} />
      </Routes>
    </div>
  );
}

export default App;
