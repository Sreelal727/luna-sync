# Luna Sync - Phase 1 MVP

**AI-powered menstrual cycle tracking app with Partner Mode**

## Project Structure

```
luna-sync/
├── backend/              # Node.js/Express API
├── mobile/              # React Native app
├── database/            # SQL migrations and seeds
└── README.md           # This file
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- React Native development environment (for mobile)
- iOS Simulator (Mac) or Android Emulator

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb lunasync_dev

# Run migrations
cd database
psql lunasync_dev < schema.sql
psql lunasync_dev < seeds.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Mobile App Setup

```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Features Implemented (Phase 1 - MVP)

✅ User registration and authentication (JWT)
✅ Period tracking (start/end, flow intensity)
✅ Cycle prediction algorithm
✅ Mood & symptom logging (20 symptoms)
✅ Calendar view with 3-month history
✅ Home Dashboard with cycle status
✅ Onboarding flow (6 screens)
✅ Secure API with authentication middleware

## API Documentation

See `backend/API.md` for complete endpoint documentation.

**Base URL:** `http://localhost:3000/api/v1`

**Key Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /cycles/period` - Log period
- `POST /logs/mood` - Log mood/symptoms
- `GET /cycles/predictions` - Get cycle predictions
- `GET /calendar` - Get calendar data

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL with pg driver
- JWT authentication
- bcrypt for password hashing
- Joi for validation

**Mobile:**
- React Native 0.72
- React Navigation 6
- AsyncStorage for persistence
- Axios for API calls
- React Hook Form for forms
- date-fns for date handling

## Development

**Backend:**
```bash
npm run dev      # Start with nodemon
npm run start    # Production start
npm test         # Run tests
```

**Mobile:**
```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run lint     # ESLint
```

## Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/lunasync_dev
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

**Mobile (.env):**
```
API_URL=http://localhost:3000/api/v1
```

## Next Steps (Phase 2)

- [ ] AI insights generation
- [ ] Push notifications
- [ ] Partner Mode
- [ ] Premium features & subscriptions
- [ ] Advanced analytics

## License

Proprietary - Luna Sync Team
