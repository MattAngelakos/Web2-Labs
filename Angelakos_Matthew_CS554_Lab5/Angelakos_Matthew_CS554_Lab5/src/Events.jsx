import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { TextField, Button } from '@mui/material'

function Events() {
    const key = import.meta.env.VITE_TICKETMASTER_API_KEY
    const { page } = useParams()
    const navigate = useNavigate()
    const [events, setEvents] = useState([])
    const [hasNextPage, setHasNextPage] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [inputText, setInputText] = useState("")
    const [inputValue, setInputValue] = useState("")

    let onSubmit = (e) => {
        let lowerCase = inputValue.toLowerCase()
        lowerCase = lowerCase.trim()
        setInputText(lowerCase)
        navigate(`/events/page/1`)
    }
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/events`, {
                    params: {
                        page: page - 1,
                        countryCode: 'US',
                        apikey: key,
                        keyword: inputText
                    }
                })

                if (response.data._embedded) {
                    setEvents(response.data._embedded.events)
                    setHasNextPage(response.data.page.number < response.data.page.totalPages - 1)
                } else {
                    setEvents([])
                }
            } catch (error) {
                console.error(error)
                setError("Failed to fetch events.")
                navigate('/404');
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [page, navigate, inputText])

    const nextPage = () => navigate(`/events/page/${parseInt(page) + 1}`)
    const prevPage = () => navigate(`/events/page/${parseInt(page) - 1}`)
    const handleClick = (event) => {
        navigate(`/events/${event.id}`)
    }
    const goBack = () => {
        navigate(-1);
    };
    const goHome = () => {
        navigate(`/`);
    };
    return (
        <div>
            <Button onClick={goHome} variant="contained" color="primary">
                Go Home
            </Button>
            <h2>Events - Page {page}</h2>
            <h3>Events Search</h3>
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
            {loading && <p>Loading events...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    {events.length > 0 ? (
                        <ul>
                            {events.map(event => (
                                <li key={event.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                                    {event.images && event.images.length > 0 && (
                                        <img
                                            src={event.images[0].url}
                                            alt={event.name}
                                            style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <h3 onClick={() => handleClick(event)} style={{ cursor: "pointer" }}>{event.name}</h3>
                                    {event.dates && event.dates.start && event.dates.start.localDate && (
                                        <p>Start Date: {event.dates.start.localDate}</p>
                                    )}
                                    {event.priceRanges && event.priceRanges.length > 0 && (
                                        <p>
                                            Price Range: ${event.priceRanges[0].min} - ${event.priceRanges[0].max}
                                        </p>
                                    )}
                                    {event.url && (
                                        <p>
                                            <a href={event.url} target="_blank" rel="noopener noreferrer">
                                                More Details
                                            </a>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No events found for this page.</p>
                    )}
                    <div>
                        {parseInt(page) > 1 && events.length > 0 && (
                            <button onClick={prevPage}>Previous</button>
                        )}
                        {hasNextPage && events.length > 0 && (
                            <button onClick={nextPage}>Next</button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Events
