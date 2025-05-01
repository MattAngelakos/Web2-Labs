// Setup server, session and middleware here.
import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import { totalRequestsLog, requestBodyLog, urlRequestLog } from "./middleware.js";
//const staticDir = express.static('public');

//app.use('/api/movies', staticDir);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    name: 'AuthenticationState',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: false
}))

app.use(totalRequestsLog);
app.use(requestBodyLog);
app.use(urlRequestLog);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});