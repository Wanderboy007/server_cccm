import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db';
import authRoutes from './routes/authRoute';  

const PORT = process.env.PORT || 5000;


dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
connectDB(); 

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 
export {app, server};