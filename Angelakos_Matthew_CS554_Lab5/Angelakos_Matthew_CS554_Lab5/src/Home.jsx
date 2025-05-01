import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <h1>Welcome to the Ticketmaster API Lab 5</h1>
            <p>
                This lab is using the Ticketmaster API to get info on events, attractions, and venues.
            </p>
            <p>
                About Me: So I've actually never been to a concert in the traditional sense. I've been to orchestras for The Legend of Zelda when I was younger though.
            </p>
            <h2>Explore:</h2>
            <div>
                <Link to="/events/page/1">Browse Events</Link>
                <br />
                <Link to="/attractions/page/1">Browse Attractions</Link>
                <br />
                <Link to="/venues/page/1">Browse Venues</Link>
            </div>
        </div>
    );
}

export default Home;