# Skill Exchange Platform

A full-stack MERN application that allows users to offer and discover skills, arrange skill exchanges, message each other, and leave reviews.

## Features

- **Auth**: Register / Login with JWT (httpOnly cookie)
- **User Profiles**: Skills offered/wanted, bio, location, avatar
- **Discovery**: Browse and search users by skill, keyword, location
- **Exchange Requests**: Propose, accept, decline, cancel, complete
- **Messaging**: Per-request message threads
- **Reviews**: 1–5 star ratings after completed exchanges
- **Moderation**: Flag profiles/requests/messages; Admin review queue

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Express 4 + TypeScript |
| Database | MongoDB 7 + Mongoose |
| Auth | JWT in httpOnly cookie + bcrypt |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Docker + Docker Compose (for MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/rawatsaloni166-crypto/skill-exchange-platform.git
cd skill-exchange-platform
npm install
npm install --prefix server
npm install --prefix client
```

Or with the helper script:
```bash
npm run install:all
```

### 2. Start MongoDB

```bash
docker-compose up -d
```

This starts:
- MongoDB on port **27017**
- Mongo Express (DB UI) on port **8081** (login: admin / admin123)

### 3. Configure Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` (minimum required):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skill-exchange
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 4. Seed Sample Data (optional)

```bash
npm run seed
```

This creates:
- **Admin user**: `admin@example.com` / `Admin123!`
- 4 sample regular users with skills and exchange requests

### 5. Run Development Servers

```bash
npm run dev
```

This starts both:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

Open http://localhost:3000 in your browser.

## API Reference

All endpoints return `{ success: boolean, data?: any, error?: string }`.

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | ✓ | Logout (clear cookie) |

### Me (current user)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/me` | Get my profile |
| PUT | `/api/me/profile` | Update my profile |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | Search users (`?search=`, `?skillOffered=`, `?skillWanted=`, `?location=`) |
| GET | `/api/users/:id` | Get public profile |
| GET | `/api/users/:id/reviews` | Get user's reviews |

### Exchange Requests
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/requests` | Create exchange request |
| GET | `/api/requests` | My requests (`?type=incoming\|outgoing`) |
| GET | `/api/requests/:id` | Request detail |
| PATCH | `/api/requests/:id` | Update status |

### Messages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/requests/:id/messages` | List messages |
| POST | `/api/requests/:id/messages` | Post message |

### Reviews
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reviews` | Submit review (request must be completed) |

### Flags
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/flags` | Flag content for review |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/flags` | List all flags |
| PATCH | `/api/admin/flags/:id` | Resolve/update a flag |

## Project Structure

```
skill-exchange-platform/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── api/             # API client modules
│       ├── components/      # Reusable UI components
│       ├── context/         # React context (Auth)
│       ├── hooks/           # Custom hooks
│       ├── pages/           # Page components
│       └── styles/          # Global CSS
├── server/                  # Express backend
│   ├── src/
│   │   ├── middleware/      # Auth, error handler, validation
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Route handlers
│   │   └── schemas/         # Zod validation schemas
│   └── scripts/             # Seed script
├── docker-compose.yml       # MongoDB + Mongo Express
└── package.json             # Root workspace
```

## Environment Variables

### server/.env.example
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skill-exchange
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### client/.env.example
```env
VITE_API_URL=http://localhost:5000/api
```

## Production Build

```bash
npm run build
```

Then start the server:
```bash
npm start
```

Make sure to set `NODE_ENV=production` and point `CLIENT_URL` to your deployed frontend URL.

## License

MIT
