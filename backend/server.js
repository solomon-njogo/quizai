import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuizAI Backend is running' });
});

// Protected Routes (require authentication)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at
    }
  });
});

// Placeholder routes
// TODO: Implement file upload routes
// TODO: Implement quiz generation routes (OpenRouter API)
// TODO: Implement quiz CRUD routes
// TODO: Implement quiz submission routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

