const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const moduleRoutes = require('./components/routes/moduleRoutes');
const complexityRoutes = require('./components/routes/complexityRoutes'); // Import the complexity routes
const testCoverageRoutes = require('./components/routes/testCoverageRoutes');

const app = express();
const PORT = 8000;

// MongoDB Connection
const mongoURI = 'mongodb+srv://linieesk:4yHz3XESKwYaH0do@inputdata.xo6zb0m.mongodb.net/?retryWrites=true&w=majority&appName=inputData';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors()); // This enables CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/modules', moduleRoutes);
app.use('/api/complexity', complexityRoutes); // complexity routes
app.use('/api/testCoverage', testCoverageRoutes);  

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
