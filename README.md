# QuizAI

**APP4080 Group Project**

A full-stack web application designed to aid educational activities by automating the creation of multiple-choice quizzes. Users upload study materials (PDF, TXT, DOCX), and the application uses AI to analyze the content, generate structured questions, and provide an interactive quiz-taking and review experience.

## Project Overview

QuizAI automates quiz creation by leveraging AI to extract key concepts from uploaded study materials and generate structured multiple-choice questions with explanations. The application provides a complete workflow from file upload to quiz generation, taking, and review.

## Key Features

| Feature                               | Description                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Upload Files**                | Users upload source documents (PDF, TXT, DOCX) containing study materials.                                               |
| **AI-Powered Quiz Generation**  | AI extracts key concepts and generates structured multiple-choice questions, options, correct answers, and explanations. |
| **Quiz Creation/Customization** | Basic options for customizing the quiz, such as the number of questions or difficulty level.                             |
| **Take Quizzes**                | Interactive quiz-taking interface with real-time feedback.                                                               |
| **Results and Review**          | Displays scores, highlights correct/incorrect answers, and provides explanations.                                        |
| **User Management**             | Basic authentication (login/signup) for persistence, allowing users to save quizzes and progress.                        |

## Tech Stack

| Component                | Technology                                        | Purpose                                                    |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------------------- |
| **Frontend**       | React.js (Hooks, Redux/Context API, React Router) | User Interface and application logic                       |
| **Backend**        | Node.js with Express.js                           | Handling file uploads, API endpoints, and AI orchestration |
| **Database**       | Supabase                                          | Persistence for user data and saved quiz structures        |
| **Authentication** | Supabase Auth                                     | User authentication and authorization                      |
| **AI Integration** | OpenRouter API                                    | Core text analysis and question generation                 |
| **File Handling**  | Multer (Node.js), pdf-parse                       | Managing file uploads and extracting text content          |
| **Styling**        | Material-UI or Bootstrap                          | Ensuring a responsive and modern design                    |

### Assumptions

- The application is a full-stack implementation due to the necessity of server-side file handling and AI API calls.
- AI generation focuses specifically on multiple-choice questions (e.g., 4 options per question).

## Requirements

### Functional Requirements

#### User Authentication (Auth)

- Implement user registration, login, and logout functionality.
- Securely store user data and link saved quizzes to the user ID.

#### File Upload

- Accept and validate the following formats: PDF, TXT, DOCX.
- Enforce constraints (e.g., maximum file size of 10MB).
- Extract and normalize text content from uploaded files.

#### Quiz Generation

- Call the AI API with the extracted text, using a specific prompt to ensure structured output.
- Prompt Example: `"Generate [NUM] multiple-choice questions from this text. Format as a JSON array: [{question: string, options: [string, string, string, string], correct: number (0-3), explanation: string}]"`
- Parse the AI's response into the required structured quiz data format.

#### Quiz Management

- Save newly generated quizzes to the database, linked to the generating user.
- Allow basic editing of questions and options before a quiz is finalized.

#### Quiz Taking

- Display questions interactively (one-by-one or all-at-once view).
- Track user answers and optionally implement a timer.

#### Results Display

- Calculate and display the final score and percentage.
- Provide a review interface highlighting correct/incorrect choices and displaying the AI-provided explanation for each question.

### Non-Functional Requirements

- **Performance**: Quiz generation time must be under 10 seconds.
- **Security**: Ensure secure file uploads, use authenticated API routes, and protect against injection vulnerabilities.
- **Usability**: The design must be fully responsive for optimal use on mobile, tablet, and desktop devices.
- **Scalability**: Architecture should handle multiple concurrent users and manage AI API rate limits efficiently.
- **Error Handling**: Implement graceful error messages for issues like invalid files or AI generation failure.

## System Architecture

The application follows a standard three-tier architecture: **Presentation (React)**, **Application (Node/Express)**, and **Data (Database/AI Service)**.

### Frontend Structure (React)

**Pages:**

- Home
- Upload
- Generate Quiz
- Take Quiz
- Results
- Profile

**Components:**

- FileUploader
- QuizForm
- QuestionCard
- Scoreboard

### Backend Structure (Node.js/Express)

**Routes:**

- `/auth`: Supabase Auth integration (login/register/logout handled by Supabase)
- `/upload`: Handle file reception and text extraction
- `/generate`: Call OpenRouter API and return quiz JSON
- `/quizzes`: CRUD operations for saved quizzes (using Supabase)
- `/submit`: Calculate and process quiz scores

**Services:**

- FileParser (text extraction)
- AiGenerator (OpenRouter API orchestration)
- QuizStorage (Supabase DB interactions)

### Data Flow

1. **Upload**: User uploads file → Frontend → Backend (`/upload`)
2. **Generate**: Backend extracts text → Calls OpenRouter API → Receives Quiz JSON → Stores in Supabase
3. **Take Quiz**: Frontend displays quiz → User submits answers → Backend (`/submit`)
4. **Review**: Backend validates answers → Returns results → Frontend displays score and explanations

## Development Phases

| Phase                              | Duration | Focus Area                                                                           |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| **1. Setup and Planning**    | 1-2 weeks | Initialize React and Express projects, establish environment configuration           |
| **2. Backend Development**   | 3-5 weeks | Implement Auth, File Handling, Database (CRUD for users/quizzes)                     |
| **3. Frontend Development**  | 4-6 weeks | Build all core UI components, implement routing and state management for quiz-taking |
| **4. Integration**           | 2-3 weeks | Connect Frontend to all Backend APIs, implement comprehensive error handling         |
| **5. Testing and Polish** | 1-2 weeks | Final styling (responsiveness), testing, and refinement                        |

## Team Assignment

The team distribution is split: **3 Members on Backend** and **3 Members on Frontend** based on feature complexity.

| Member             | Area of Focus                  | Key Deliverables                                                                                                                         |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Member 1** | Backend (Auth & Setup)         | Express setup, Supabase Auth integration, Supabase database setup, User CRUD operations                                                  |
| **Member 2** | Backend (Files & Mgmt)         | File Upload endpoint, Text Extraction logic, Quiz CRUD routes, Score Calculation endpoint                                                |
| **Member 3** | Backend (AI Integration)       | OpenRouter API research/setup, Quiz Generation endpoint, Prompt Engineering, AI Response Parsing                                         |
| **Member 4** | Frontend (UI & Components)     | React setup, Routing, Build Upload/Generate/Results pages, Styling/Responsiveness                                                        |
| **Member 5** | Frontend (Logic & Integration) | Quiz-taking logic (state tracking), Supabase Auth UI integration, Integration of all Frontend components with Backend APIs (using Axios) |
| **Member 6** | Frontend (State & Pages)       | State management (Redux/Context API), Home page, Profile page, Quiz review interface, Error handling UI                                  |

## Potential Challenges

- **AI Consistency**: The need for robust parsing logic to handle potentially malformed JSON from the AI service.
- **File/Token Limits**: Managing large files by chunking text to prevent exceeding AI API token limits.
- **Cost Management**: Implementing caching or limits to manage API consumption costs.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quizai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create `.env` files in both `backend` and `frontend` directories with the necessary configuration:

**Backend `.env`:**

- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)
- `SUPABASE_ANON_KEY`: Your Supabase anon/public key (for token verification - recommended)

**Frontend `.env`:**

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### Project Structure

```
quizai/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js/Express backend API
│   ├── routes/       # API routes
│   ├── services/     # Business logic services
│   ├── middleware/   # Custom middleware
│   ├── utils/        # Utility functions
│   └── package.json  # Backend dependencies
└── README.md         # Project documentation
```

### Running the Application

```bash
# Start backend server (in one terminal)
cd backend
npm install
npm run dev

# Start frontend development server (in another terminal)
cd frontend
npm install
npm run dev
```
