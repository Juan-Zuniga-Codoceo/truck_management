const express = require('express');
const bodyParser = require('body-parser');
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes');
const app = express();

// Middleware
app.use(bodyParser.json()); // O usa express.json() si estás en Express 4.16+

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de gestión de camiones');
});

// Rutas
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);

// Manejador de 404 para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).send('Lo siento, no se pudo encontrar esa ruta');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});