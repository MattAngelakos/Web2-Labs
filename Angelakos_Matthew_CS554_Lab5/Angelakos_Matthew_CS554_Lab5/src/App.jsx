import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
import Events from './Events.jsx';
import Event from './Event.jsx';
import Attractions from './Attractions.jsx';
import Attraction from './Attraction.jsx';
import Venues from './Venues.jsx';
import Venue from './Venue.jsx';
import NotFound from './NotFound.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/page/:page" element={<Events />} />
        <Route path="/events/:id" element={<Event />} />
        <Route path="/attractions/page/:page" element={<Attractions />} />
        <Route path="/attractions/:id" element={<Attraction />} />
        <Route path="/venues/page/:page" element={<Venues />} />
        <Route path="/venues/:id" element={<Venue />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
