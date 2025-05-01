const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => { });

function getIdFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 2];
}

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main'
  // Specify helpers which are only registered on this instance.
});

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('etag');

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutes(app);
app.listen(3000, async () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
