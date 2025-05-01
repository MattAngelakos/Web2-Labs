import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button } from '@mui/material'

function Attraction() {
    const key = import.meta.env.VITE_TICKETMASTER_API_KEY;
    const { id } = useParams();
    const navigate = useNavigate();
    const [attraction, setAttraction] = useState(null);
    useEffect(() => {
        const fetchAttraction = async () => {
            try {
                const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/attractions/${id}`, {
                    params: { apikey: key }
                });
                console.log(response)
                if (response.data) {
                    setAttraction(response.data);
                } else {
                    navigate('/404');
                }
            } catch (error) {
                console.error(error);
                navigate('/404');
            }
        };

        fetchAttraction();
    }, [id, navigate]);
    const goHome = () => {
        navigate(`/`);
    };
    const goBack = () => {
        navigate(`/attractions/page/1`);
    };
    if (!attraction) {
        return <p>Loading...</p>;
    }
    return (
        <div>
            <Button onClick={goHome} variant="contained" color="primary">
                Go Home
            </Button>
            <Button onClick={goBack} variant="contained" color="secondary">
                Go Back
            </Button>
            <h2>{attraction.name}</h2>
            {attraction.images && attraction.images.length > 0 && (
                <img
                    src={attraction.images[0].url}
                    alt={attraction.name}
                    style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                />
            )}
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
        </div>
    );
}

export default Attraction;
