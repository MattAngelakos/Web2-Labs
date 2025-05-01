import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button } from '@mui/material'

function Venue() {
    const key = import.meta.env.VITE_TICKETMASTER_API_KEY;
    const { id } = useParams();
    const navigate = useNavigate();
    const [venue, setVenue] = useState(null);
    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/venues/${id}`, {
                    params: { apikey: key }
                });
                if (response.data) {
                    setVenue(response.data);
                } else {
                    navigate('/404');
                }
            } catch (error) {
                console.error(error);
                navigate('/404');
            }
        };

        fetchVenue();
    }, [id, navigate]);
    const goHome = () => {
        navigate(`/`);
    };
    const goBack = () => {
        navigate(`/venues/page/1`);
    };
    if (!venue) {
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
            <h2>{venue.name}</h2>
            {venue.images && venue.images.length > 0 && (
                <img
                    src={venue.images[0].url}
                    alt={venue.name}
                    style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                />
            )}
            {venue.country && (
                <p>Country: {venue.country.name}</p>
            )}
            {venue.state && (
                <p>State: {venue.state.name}</p>
            )}
            {venue.city && (
                <p>City: {venue.city.name}</p>
            )}
            {venue.address.line1 && (
                <p>Address: {venue.address.line1}</p>
            )}
            {venue.url && (
                <p>
                    <a href={venue.url} target="_blank" rel="noopener noreferrer">
                        More Details
                    </a>
                </p>
            )}
        </div>
    );
}

export default Venue;
