import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();
dotenv.config({ path: '.env.example' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (Skip on Vercel if no valid cloud URI to prevent hanging)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fakenews';
const isVercelLocalhost = process.env.VERCEL && MONGODB_URI.includes('localhost');

if (!isVercelLocalhost) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('Running on Vercel without Cloud DB: Skipping MongoDB connection to prevent timeout.');
}

// Routes
app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
