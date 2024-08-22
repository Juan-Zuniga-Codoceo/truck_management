const express = require('express');
const bodyParser = require('body-parser');
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes'); // Importar las rutas de rutas
const app = express();

// Middleware
app.use(bodyParser.json()); // O usa express.json() si estás en Express 4.16+

// Rutas
app.use('/api/drivers', driverRoutes); // Rutas para los controladores de drivers
app.use('/api/routes', routeRoutes); // Rutas para los controladores de rutas

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
