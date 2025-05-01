import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button } from '@mui/material'

function Attractions() {
    const key = import.meta.env.VITE_TICKETMASTER_API_KEY;
    const { page } = useParams();
    const navigate = useNavigate();
    const [attractions, setAttractions] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inputText, setInputText] = useState("")
    const [inputValue, setInputValue] = useState("")

    let onSubmit = (e) => {
        let lowerCase = inputValue.toLowerCase()
        lowerCase = lowerCase.trim()
        setInputText(lowerCase)
        navigate(`/attractions/page/1`)
    }

    useEffect(() => {
        const fetchAttractions = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/attractions`, {
                    params: {
                        page: page - 1,
                        countryCode: 'US',
                        apikey: key,
                        keyword: inputText
                    }
                });
                if (response.data._embedded) {
                    setAttractions(response.data._embedded.attractions);
                    setHasNextPage(response.data.page.number < response.data.page.totalPages - 1);
                } else {
                    setAttractions([]);
                }
            } catch (error) {
                console.error(error);
                setError("Failed to fetch attractions.");
                navigate('/404');
            } finally {
                setLoading(false);
            }
        };

        fetchAttractions();
    }, [page, navigate, inputText]);

    const nextPage = () => navigate(`/attractions/page/${parseInt(page) + 1}`);
    const prevPage = () => navigate(`/attractions/page/${parseInt(page) - 1}`);
    const handleClick = (attraction) => {
        navigate(`/attractions/${attraction.id}`)
    }
    const goHome = () => {
        navigate(`/`);
    };
    return (
        <div>
            <Button onClick={goHome} variant="contained" color="primary">
                Go Home
            </Button>
            <h2>Attractions - Page {page}</h2>
            <h3>Attractions Search</h3>
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

            {loading && <p>Loading attractions...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    {attractions.length > 0 ? (
                        <ul>
                            {attractions.map(attraction => (
                                <li key={attraction.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                                    {attraction.images && attraction.images.length > 0 && (
                                        <img
                                            src={attraction.images[0].url}
                                            alt={attraction.name}
                                            style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <h3 onClick={() => handleClick(attraction)} style={{ cursor: "pointer" }}>{attraction.name}</h3>
                                    {attraction.classifications[0]?.segment?.name && attraction.classifications[0].segment.name.toLowerCase() !== "undefined" && (
                                        <p>
                                            Segment: {attraction.classifications[0].segment.name}
                                        </p>
                                    )}
                                    {attraction.classifications[0]?.genre?.name && attraction.classifications[0].genre.name.toLowerCase() !== "undefined" && (
                                        <p>
                                            Genre: {attraction.classifications[0].genre.name}
                                        </p>
                                    )}
                                    {attraction.classifications[0]?.subGenre?.name && attraction.classifications[0].subGenre.name.toLowerCase() !== "undefined" && (
                                        <p>
                                            SubGenre: {attraction.classifications[0].subGenre.name}
                                        </p>
                                    )}
                                    {attraction.classifications[0]?.type?.name && attraction.classifications[0].type.name.toLowerCase() !== "undefined" && (
                                        <p>
                                            Type: {attraction.classifications[0].type.name}
                                        </p>
                                    )}
                                    {attraction.classifications[0]?.subType?.name && attraction.classifications[0].subType.name.toLowerCase() !== "undefined" && (
                                        <p>
                                            SubType: {attraction.classifications[0].subType.name}
                                        </p>
                                    )}
                                    {attraction.dates && attraction.dates.start && attraction.dates.start.localDate && (
                                        <p>Start Date: {attraction.dates.start.localDate}</p>
                                    )}
                                    {attraction.priceRanges && attraction.priceRanges.length > 0 && (
                                        <p>
                                            Price Range: ${attraction.priceRanges[0].min} - ${attraction.priceRanges[0].max}
                                        </p>
                                    )}
                                    {attraction.url && (
                                        <p>
                                            <a href={attraction.url} target="_blank" rel="noopener noreferrer">
                                                More Details
                                            </a>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No attractions found for this page.</p>
                    )}
                    <div>
                        {parseInt(page) > 1 && attractions.length > 0 && (
                            <button onClick={prevPage}>Previous</button>
                        )}
                        {hasNextPage && attractions.length > 0 && (
                            <button onClick={nextPage}>Next</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Attractions;
