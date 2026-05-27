# 🌍 AI Trip Planner

> A full-stack AI-powered travel planning application built with Next.js, Node.js, MongoDB, and Google Gemini AI.

![AI Trip Planner](https://img.shields.io/badge/Built%20With-Next.js%2014-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge&logo=google)

---

## ✨ Live Demo

- **Frontend:** [your-app.vercel.app](#)
- **Backend API:** [your-api.railway.app](#)

---

## 🎯 Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure register/login with JWT tokens. Strict per-user data isolation. |
| 🤖 **AI Itinerary Generation** | Gemini AI builds a personalized day-by-day travel plan |
| 💰 **Smart Budget Estimates** | Realistic cost breakdown for flights, hotels, food & activities |
| 🏨 **Hotel Suggestions** | Budget, mid-range & luxury hotel picks per destination |
| 🎒 **Smart Packing List** | AI packing list tailored to destination, season & activities |
| ✏️ **Edit Itinerary** | Remove activities, regenerate any day with custom instructions |
| 📓 **Travel Journal** | Add personal notes to each trip |
| ❤️ **Favorites** | Mark and save favorite trips |

---

## 🏗️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Express Rate Limiting
- Express Validator

**AI**
- Google Gemini AI (gemini-2.5-flash-lite)

---

## 📁 Project Structure

```
ai-trip-planner/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with bcrypt password hashing
│   │   └── Trip.js          # Trip schema (itinerary, budget, hotels)
│   ├── routes/
│   │   ├── auth.js          # Register, Login, Get Me endpoints
│   │   ├── trips.js         # Full CRUD for trips
│   │   └── ai.js            # AI generation endpoints
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   └── server.js            # Express app entry point
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx              # Landing page
        │   ├── login/page.tsx        # Login page
        │   ├── register/page.tsx     # Register page
        │   ├── dashboard/page.tsx    # All trips dashboard
        │   └── trips/
        │       ├── new/page.tsx      # Create new trip form
        │       └── [id]/page.tsx     # Trip detail with tabs
        ├── components/
        │   └── layout/Navbar.tsx     # Navigation bar
        ├── lib/
        │   ├── api.ts               # Axios client + API helpers
        │   └── auth-context.tsx     # Global auth state
        └── types/index.ts           # TypeScript interfaces
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Google AI Studio account (free)

### 1. Clone the repository
```bash
git clone https://github.com/Sourav93-subh/AI-Trip-Planner.git
cd AI-Trip-Planner
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

```bash
npm run dev
```

### 4. Open the app
Go to **http://localhost:3000** 🎉

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Trips (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | Get all user trips |
| POST | `/api/trips` | Create new trip |
| GET | `/api/trips/:id` | Get single trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| PATCH | `/api/trips/:id/activity` | Add/remove activity |
| PATCH | `/api/trips/:id/favorite` | Toggle favorite |

### AI (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/generate` | Generate full itinerary + budget |
| POST | `/api/ai/regenerate-day` | Regenerate one specific day |
| POST | `/api/ai/hotels` | Get hotel suggestions |
| POST | `/api/ai/packing-list` | Get smart packing list |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT tokens** expire after 7 days
- Every trip route verifies `trip.userId === req.user._id` (strict data isolation)
- **Rate limiting:** 100 requests per 15 minutes per IP
- Input validation on all routes with `express-validator`

---

## 🎨 Custom Creative Feature

**Smart AI Packing List** — goes beyond the assessment requirements:
- Generates a packing list tailored to destination, travel month, duration, and chosen activities
- Separated into 6 categories: Essentials, Clothing, Toiletries, Electronics, Activity Gear, Packing Tips
- Context-aware items (hiking boots for adventure trips, sunscreen for beach destinations, warm layers for winter travel)

---

## 📦 Deployment

### Backend → Railway
1. Connect GitHub repo on [railway.app](https://railway.app)
2. Set root directory to `backend`
3. Add all environment variables
4. Deploy

### Frontend → Vercel
1. Connect GitHub repo on [vercel.app](https://vercel.com)
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` pointing to Railway URL
4. Deploy

---

## 👤 Author

**Sourav Subham**
- GitHub: [@Sourav93-subh](https://github.com/Sourav93-subh)

---

## 📄 License

This project was built as a Full-Stack Engineering Assessment.
