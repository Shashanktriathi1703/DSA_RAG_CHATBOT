// server.js
import dotenv from 'dotenv';
dotenv.config();

// Verify ALL environment variables are loaded
console.log('🔍 Environment Variables Check:');
console.log('- GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('- PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME ? '✓ Set' : '✗ Missing');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('');

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contact.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DSA RAG Backend is running!' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});