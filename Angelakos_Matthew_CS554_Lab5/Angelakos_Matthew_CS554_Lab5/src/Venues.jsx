import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button } from '@mui/material'

function Venues() {
    const key = import.meta.env.VITE_TICKETMASTER_API_KEY;
    const { page } = useParams();
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inputText, setInputText] = useState("")
    const [inputValue, setInputValue] = useState("")

    let onSubmit = (e) => {
        let lowerCase = inputValue.toLowerCase()
        lowerCase = lowerCase.trim()
        setInputText(lowerCase)
        navigate(`/venues/page/1`)
    }

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/venues`, {
                    params: {
                        page: page - 1,
                        countryCode: 'US',
                        apikey: key,
                        keyword: inputText
                    }
                });

                if (response.data._embedded) {
                    console.log(response.size)
                    setVenues(response.data._embedded.venues);
                    setHasNextPage(response.data.page.number < response.data.page.totalPages - 1);
                } else {
                    setVenues([]);
                }
            } catch (error) {
                console.error(error);
                setError("Failed to fetch venues.");
                navigate('/404');
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, [page, navigate, inputText]);

    const nextPage = () => navigate(`/venues/page/${parseInt(page) + 1}`);
    const prevPage = () => navigate(`/venues/page/${parseInt(page) - 1}`);
    const handleClick = (venue) => {
        navigate(`/venues/${venue.id}`);
    };
    const goHome = () => {
        navigate(`/`);
    };
    return (
        <div>
            <Button onClick={goHome} variant="contained" color="primary">
                Go Home
            </Button>
            <h2>Venues - Page {page}</h2>
            <h3>Venues Search</h3>
            <div className="search" style={{ backgroundColor: "white", display: "flex", gap: "8px" }}>
                <TextField
                    id="outlined-basic"
                    name="searchInput"
                    variant="outlined"
                    fullWidth
                    label="Search"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <Button onClick={onSubmit} variant="contained" color="primary">
                    Submit
                </Button>
            </div>

            {loading && <p>Loading venues...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    {venues.length > 0 ? (
                        <ul>
                            {venues.map(venue => (
                                <li key={venue.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                                    {venue.images && venue.images.length > 0 && (
                                        <img
                                            src={venue.images[0].url}
                                            alt={venue.name}
                                            style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <h3 onClick={() => handleClick(venue)} style={{ cursor: "pointer" }}>{venue.name}</h3>
                                    {venue.country && (
                                        <p>Country: {venue.country.name}</p>
                                    )}
                                    {venue.state && (
                                        <p>State: {venue.state.name}</p>
                                    )}
                                    {venue.city && (
                                        <p>City: {venue.city.name}</p>
                                    )}
                                    {venue.address && (
                                        <p>Address: {venue.address.line1}</p>
                                    )}
                                    {venue.url && (
                                        <p>
                                            <a href={venue.url} target="_blank" rel="noopener noreferrer">
                                                More Details
                                            </a>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No venues found for this page.</p>
                    )}
                    <div>
                        {parseInt(page) > 1 && venues.length > 0 && (
                            <button onClick={prevPage}>Previous</button>
                        )}
                        {hasNextPage && venues.length > 0 && (
                            <button onClick={nextPage}>Next</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Venues;
