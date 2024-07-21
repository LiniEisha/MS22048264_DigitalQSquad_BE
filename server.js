// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const moduleRoutes = require('./components/routes/moduleRoutes');
const complexityRoutes = require('./components/routes/complexityRoutes');
const testCoverageRoutes = require('./components/routes/testCoverageRoutes');

const app = express();
const PORT = 8000;

// Placeholder for MongoDB URI
const mongoURI = 'mongodb+srv://linieesk:4yHz3XESKwYaH0do@inputdata.xo6zb0m.mongodb.net/?retryWrites=true&w=majority&appName=inputData';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Apply CORS middleware before any other middleware or routes
app.use(cors({
  origin: 'http://localhost:4000', // Update with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  // credentials: true
}));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/modules', moduleRoutes);
app.use('/api/complexity', complexityRoutes); 
app.use('/api/testCoverage', testCoverageRoutes);
app.use('/api', moduleRoutes);
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
