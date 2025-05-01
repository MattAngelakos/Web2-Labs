import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button } from '@mui/material'

function Event() {
    const key = import.meta.env.VITE_TICKETMASTER_API_KEY;
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${id}`, {
                    params: { apikey: key }
                });
                if (response.data) {
                    setEvent(response.data);
                } else {
                    navigate('/404'); 
                }
            } catch (error) {
                console.error(error);
                navigate('/404');
            }
        };

        fetchEvent();
    }, [id, navigate]);
    const goHome = () => {
        navigate(`/`);
    };
    const goBack = () => {
        navigate(`/events/page/1`);
    };
    if (!event) {
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
            <h2>{event.name}</h2>
            {event.images && event.images.length > 0 && (
                <img 
                    src={event.images[0].url} 
                    alt={event.name} 
                    style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                />
            )}
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
        </div>
    );
}

export default Event;
