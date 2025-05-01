
import React from 'react';
import { TextField, Button } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();
    const goHome = () => {
        navigate(`/`);
    };
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Button onClick={goHome} variant="contained" color="primary">
                Go Home
            </Button>
        </div>
    );
}

export default NotFound;
