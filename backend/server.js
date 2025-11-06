import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken } from './middleware/auth.js';
import uploadRoutes from './routes/upload.js';
import quizRoutes from './routes/quizzes.js';
import submitRoutes from './routes/submit.js';
import courseMaterialRoutes from './routes/courseMaterials.js';

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

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submit', submitRoutes);
app.use('/api/course-materials', courseMaterialRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

