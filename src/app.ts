import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import authRoutes from './routes/auth.route.js'; 
import eventRoute from './routes/event.route.js'
import cookieParser from 'cookie-parser';


import cors from 'cors';

// const PORT = process.env.TEST_PORT || 5000;


dotenv.config();

const app = express();

app.use(cookieParser());
// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CROS || 'https://server-cccm.onrender.com', // your frontend domain
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/event',eventRoute)

// Connect to MongoDB
// connectDB(); 

export {app};

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.TEST_PORT || 6000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}

