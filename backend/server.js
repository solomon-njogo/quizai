import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuizAI Backend is running' });
});

// Placeholder routes
// TODO: Implement auth routes (Supabase Auth integration)
// TODO: Implement file upload routes
// TODO: Implement quiz generation routes (OpenRouter API)
// TODO: Implement quiz CRUD routes
// TODO: Implement quiz submission routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

