const pokeRoutes = require('./pokeRoutes');

const constructorMethod = (app) => {
  app.use('/api', pokeRoutes);
  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

module.exports = constructorMethod;
