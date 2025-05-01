import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import BookList from './BookList';
import queries from '../queries';
import AuthorList from './AuthorList';
import PublisherList from './PublisherList';
import { NavLink } from 'react-router-dom';

const genres = [
    'FICTION',
    'NON_FICTION',
    'MYSTERY',
    'FANTASY',
    'ROMANCE',
    'SCIENCE_FICTION',
    'HORROR',
    'BIOGRAPHY',
];

function Search() {
    const [searchType, setSearchType] = useState('GET_BOOKS_BY_GENRE');
    const [tempSearchType, setTempSearchType] = useState('GET_BOOKS_BY_GENRE');
    const [searchInput, setSearchInput] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('FICTION');
    const [minYear, setMinYear] = useState('');
    const [maxYear, setMaxYear] = useState('');
    const [error, setError] = useState(null);
    const [searchVariables, setSearchVariables] = useState({ genre: 'FICTION' });
    const [pendingFetch, setPendingFetch] = useState(false);
    useEffect(() => {
        setPendingFetch(true);
    }, [searchType]);

    const { loading, error: queryError, data } = useQuery(
        queries[searchType],
        {
            variables: searchVariables,
            skip: !pendingFetch,
            fetchPolicy: 'cache-and-network',
        }
    );

    const handleSearch = (e) => {
        e.preventDefault();
        setPendingFetch(false);
        if (tempSearchType === 'GET_PUBLISHERS_BY_YEAR') {
            const min = parseInt(minYear, 10);
            const max = parseInt(maxYear, 10);
            if (isNaN(min) || isNaN(max) || min > max) {
                setError('Min year must be less than or equal to Max year');
                return;
            }
        }

        setError(null);

        const variables =
            tempSearchType === 'GET_PUBLISHERS_BY_YEAR'
                ? { min: parseInt(minYear, 10), max: parseInt(maxYear, 10) } :
                tempSearchType === 'GET_CHAPTERS_BY_TITLE'
                    ? { searchTitleTerm: searchInput }
                    : tempSearchType === 'GET_BOOKS_BY_GENRE'
                        ? { genre: selectedGenre }
                        : { searchTerm: searchInput };
        console.log(variables)
        setSearchType(tempSearchType)
        setSearchVariables(variables);
        setPendingFetch(true);
    };

    const handleSearchTypeChange = (e) => {
        setTempSearchType(e.target.value)
        setSearchInput('');
        setSelectedGenre('FICTION');
        setMinYear('');
        setMaxYear('');
        setError(null);
    };

    const results =
        searchType === 'GET_BOOKS_BY_GENRE'
            ? data?.booksByGenre || []
            : searchType === 'GET_BOOKS_BY_TITLE'
            ? data?.searchBookByTitle || []
            : searchType === 'GET_PUBLISHERS_BY_YEAR'
            ? data?.publishersByEstablishedYear || []
            : searchType === 'GET_AUTHOR_BY_NAME'
            ? data?.searchAuthorByName || []
            : searchType === 'GET_CHAPTERS_BY_TITLE'
            ? data?.searchChapterByTitle || []: [];
    return (
        <div>
            <h1>Search</h1>
            <form onSubmit={handleSearch}>
                <div>
                    <label htmlFor="search-type">Select Search Type:</label>
                    <select
                        id="search-type"
                        value={tempSearchType}
                        onChange={handleSearchTypeChange}
                    >
                        <option value="GET_BOOKS_BY_GENRE">Books by Genre</option>
                        <option value="GET_PUBLISHERS_BY_YEAR">Publishers by Established Year</option>
                        <option value="GET_AUTHOR_BY_NAME">Search Author by Name</option>
                        <option value="GET_BOOKS_BY_TITLE">Search Book by Title</option>
                        <option value="GET_CHAPTERS_BY_TITLE">Search Chapters by Title</option>
                    </select>
                </div>

                {tempSearchType === 'GET_BOOKS_BY_GENRE' && (
                    <div>
                        <label htmlFor="genre-select">Select Genre:</label>
                        <select
                            id="genre-select"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            required
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {tempSearchType === 'GET_PUBLISHERS_BY_YEAR' && (
                    <>
                        <div>
                            <label htmlFor="min-year">Min Year:</label>
                            <input
                                type="number"
                                id="min-year"
                                value={minYear}
                                onChange={(e) => setMinYear(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="max-year">Max Year:</label>
                            <input
                                type="number"
                                id="max-year"
                                value={maxYear}
                                onChange={(e) => setMaxYear(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                {tempSearchType !== 'GET_BOOKS_BY_GENRE' &&
                    tempSearchType !== 'GET_PUBLISHERS_BY_YEAR' && (
                        <div>
                            <label htmlFor="search-input">Search Term:</label>
                            <input
                                type="text"
                                id="search-input"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                required
                            />
                        </div>
                    )}

                <button type="submit">Search</button>
            </form>

            {loading && <p>Loading...</p>}

            <div>
                <h2>Results:</h2>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {queryError && <p style={{ color: 'red' }}>Error: {queryError.message}</p>}
                {results.length === 0 && !loading ? (
                    <p>No results found</p>
                ) : (
                    <ul>
                        {searchType === 'GET_BOOKS_BY_GENRE' || searchType === 'GET_BOOKS_BY_TITLE' ? (
                            <BookList books={results} />
                        ) : searchType === 'GET_AUTHOR_BY_NAME' ? (
                            <AuthorList authors={results} />
                        ) : searchType === 'GET_PUBLISHERS_BY_YEAR' ? (
                            <PublisherList publishers={results} />
                        ) : (
                            results.map((result, index) => (
                                <div className="card" key={index}>
                                    <div className="card-body">
                                        <NavLink className='card-title' to={`/chapters/${result._id}`}>
                                            Title: {result.title}
                                        </NavLink>
                                        <br></br>
                                        <NavLink className='card-title' to={`/books/${result.book._id}`}>
                                            Book: {result.book.title}
                                        </NavLink>
                                    </div>
                                </div>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Search;
