// File: server.js
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import moduleRoutes from './components/routes/moduleRoutes.js';
import complexityRoutes from './components/routes/complexityRoutes.js';
import testCoverageRoutes from './components/routes/testCoverageRoutes.js';

const app = express();
const PORT = 8000;

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api', testCoverageRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
