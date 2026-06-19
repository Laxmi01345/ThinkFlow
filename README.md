# ThinkFlow

An AI-powered voice-to-task productivity assistant. Speak naturally, and ThinkFlow automatically converts your voice into actionable tasks, manages your to-do list, and answers questions — all hands-free.

## Live Demo

- **Frontend:** https://thinkflow-frontend.onrender.com
- **Backend API:** https://thinkflow-lw81.onrender.com

## Features

- **Voice-to-Task Pipeline** — Record your voice and the AI transcribes, understands intent, and executes the right action
- **Smart Intent Classification** — Powered by Cerebras LLM (gpt-oss-120b) to distinguish between task commands and conversational queries
- **Speech-to-Text** — SarvamAI (saaras:v3) for accurate multilingual transcription
- **User Authentication** — Secure signup/login with Supabase Auth (JWT-based)
- **User-Scoped Tasks** — Each user sees only their own tasks
- **CRUD Operations** — Add, view, complete, and delete tasks via voice or UI
- **Assistant Feedback** — AI replies displayed in real-time after voice processing
- **Responsive Design** — Desktop sidebar + mobile floating mic button
- **Empty State UI** — Helpful prompts when no tasks exist
- **Time-Aware Greetings** — Good Morning/Afternoon/Evening personalized messages

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| React Router 7 | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Python / FastAPI | REST API framework |
| Cerebras Cloud SDK | LLM inference (gpt-oss-120b) |
| SarvamAI SDK | Speech-to-text (saaras:v3) |
| Supabase Auth | User authentication |
| Supabase PostgreSQL | Database (via psycopg2) |
| FastMCP | MCP server for external tool integration |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | Auth + PostgreSQL database |
| Render | Backend hosting |

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- [Cerebras](https://cerebras.ai) API key
- [SarvamAI](https://sarvam.ai) API key

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
CEREBRAS_API_KEY="your-cerebras-key"
SARVAM_API_KEY="your-sarvam-key"
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
```

Run the server:

```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Run the dev server:

```bash
npm run dev
```

### Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  created_at DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/tasks` | Fetch user's tasks | Yes |
| POST | `/upload-audio` | Voice processing pipeline | Yes |
| PATCH | `/tasks/{id}/done` | Toggle task completion | Yes |
| DELETE | `/tasks/{id}` | Delete a task | Yes |

## How It Works

```
User speaks → Audio recorded (WebM) → Uploaded to backend
    → SarvamAI transcribes to text
    → Cerebras LLM classifies intent (task vs chat)
    → Task action executed (add/delete/complete/view)
    → AI reply returned to frontend
```

## Project Structure

```
ThinkFlow/
├── backend/
│   ├── main.py              # FastAPI routes & LLM logic
│   ├── requirements.txt     # Python dependencies
│   └── app/
│       ├── auth.py          # JWT verification & auth dependency
│       ├── config.py        # Environment variables
│       ├── db.py            # PostgreSQL connection pool
│       ├── models.py        # Task CRUD queries
│       ├── stt.py           # Speech-to-text via SarvamAI
│       ├── cleaner.py       # Transcript filler-word removal
│       └── mcp_server.py    # MCP tool server
└── frontend/
    ├── src/
    │   ├── main.jsx         # Entry point
    │   ├── App.jsx          # Root component & routing
    │   ├── context/
    │   │   └── AuthContext.jsx  # Authentication state
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Main dashboard
    │   │   ├── Login.jsx        # Login page
    │   │   └── Signup.jsx       # Signup page
    │   └── components/
    │       ├── TaskList.jsx         # Task list with empty state
    │       ├── VoiceInput.jsx       # Desktop voice input
    │       ├── FloatingMic.jsx      # Mobile floating mic
    │       ├── AssitantFeedback.jsx # AI reply display
    │       ├── Greeting.jsx         # Time-aware greeting
    │       ├── Sidebar.jsx          # Desktop navigation
    │       └── MobileBottomNav.jsx  # Mobile navigation
    └── package.json
```

## License

MIT
