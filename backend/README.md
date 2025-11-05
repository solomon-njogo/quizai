# QuizAI Backend

Backend API server for QuizAI application built with Node.js and Express.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── server.js          # Main server file
├── routes/            # API routes
├── services/          # Business logic services
│   ├── fileParser.js  # Text extraction from files
│   ├── aiGenerator.js # OpenRouter API integration
│   └── quizStorage.js # Supabase database operations
├── middleware/        # Custom middleware
└── utils/            # Utility functions
```

## API Endpoints

- `GET /api/health` - Health check endpoint

## Environment Variables

See `.env.example` for required environment variables.

