# SkillSwap Quest

**Peer-to-peer skill exchange platform** — Teach what you know. Learn what you want.

SkillSwap Quest connects people who want to exchange skills without money. You teach JavaScript, they teach Guitar. Everyone wins.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Zustand, React Router 6 |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| Real-time | Socket.IO (chat, notifications) |

---

## Features

- **Smart Matching** — AI-powered compatibility scoring based on complementary skills, availability, timezone, location, and trust score
- **Swap Request Flow** — Send, accept, reject, and cancel skill swap requests
- **Real-time Chat** — Socket.IO messaging with typing indicators and read receipts
- **Session Booking** — Schedule sessions with format (video/audio/text/in-person), duration, meeting links
- **Reviews & Ratings** — Multi-dimensional ratings (overall, communication, expertise, punctuality, helpfulness)
- **Notifications** — Real-time push notifications for all platform events
- **Admin Dashboard** — User management, report resolution, moderation tools
- **Badges & Reputation** — Automatic badge awards and reputation scoring
- **Profile Completion Meter** — Progress tracking to encourage complete profiles
- **Dark/Light Mode** — Full theme support
- **Mobile-first Responsive** — Works beautifully on all screen sizes

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and install

```bash
git clone <repo-url>
cd skillswap-quest

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates demo users:

| Email | Password | Role |
|-------|----------|------|
| alex@seed.skillswap.com | Password123! | User |
| sofia@seed.skillswap.com | Password123! | User |
| marcus@seed.skillswap.com | Password123! | User |
| yuki@seed.skillswap.com | Password123! | User |
| admin@skillswap.com | Admin123! | Admin |

### 4. Start the servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/change-password` | Change password (auth required) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search` | Search users with filters |
| GET | `/api/users/me/stats` | Get my stats and badges |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/me` | Update my profile |
| POST | `/api/users/me/onboarding` | Complete onboarding |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get personalized matches with scores |

### Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | List my requests |
| POST | `/api/requests` | Send swap request |
| PATCH | `/api/requests/:id/accept` | Accept request |
| PATCH | `/api/requests/:id/reject` | Reject request |
| PATCH | `/api/requests/:id/cancel` | Cancel request |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | List conversations |
| POST | `/api/messages/conversations` | Create conversation |
| GET | `/api/messages/conversations/:id` | Get messages |
| POST | `/api/messages/conversations/:id` | Send message |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List my sessions |
| POST | `/api/sessions` | Schedule a session |
| PATCH | `/api/sessions/:id/status` | Update session status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create a review |
| GET | `/api/reviews/user/:userId` | Get user's reviews |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | Manage users |
| PATCH | `/api/admin/users/:id/ban` | Ban user |
| PATCH | `/api/admin/users/:id/unban` | Unban user |
| GET | `/api/admin/reports` | View reports |
| PATCH | `/api/admin/reports/:id/resolve` | Resolve report |

---

## Deployment

### Frontend → Vercel / Netlify

```bash
cd frontend
npm run build
# Deploy the `dist` folder
```

Set environment variable: `VITE_API_URL=https://your-backend.render.com/api`

### Backend → Render / Railway

1. Connect your repo
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables from `.env.example`

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add your connection string as `MONGODB_URI`
3. Whitelist your server IP

---

## Project Structure

```
skillswap-quest/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic (matching, notifications, socket)
│   │   ├── utils/          # Logger, seed data
│   │   └── server.js       # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/     # Sidebar, TopNav, AppLayout
    │   │   └── ui/         # Button, Input, Avatar, Modal, etc.
    │   ├── hooks/          # Custom React hooks
    │   ├── pages/
    │   │   ├── auth/       # Login, Signup, Reset
    │   │   ├── dashboard/  # All app pages
    │   │   └── admin/      # Admin dashboard
    │   ├── services/       # API client, Socket.IO
    │   ├── store/          # Zustand stores
    │   ├── utils/          # Helpers, formatters
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## License

MIT — Built for learning, hacking, and showcasing.
