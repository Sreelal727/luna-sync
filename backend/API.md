# Luna Sync API Documentation

**Base URL:** `http://localhost:3000/api/v1` (Development)

**Version:** 1.0.0 (Phase 1 MVP)

---

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token.

**Header Format:**
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "Jane",
  "date_of_birth": "1995-06-15",
  "avg_cycle_length": 28
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "first_name": "Jane",
      "onboarding_completed": false,
      "subscription_tier": "free"
    },
    "access_token": "jwt_token",
    "refresh_token": "jwt_refresh_token"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "access_token": "jwt_token",
    "refresh_token": "jwt_refresh_token"
  }
}
```

#### Complete Onboarding
```http
POST /auth/onboarding/complete
```
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "avg_cycle_length": 28,
  "last_period_date": "2025-11-01"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "onboarding_completed": true
  }
}
```

#### Get Current User
```http
GET /auth/me
```
🔒 **Requires Authentication**

---

### Cycles

#### Log Period
```http
POST /cycles/period
```
🔒 **Requires Authentication + Onboarding**

**Request Body:**
```json
{
  "period_start_date": "2025-11-20",
  "period_end_date": "2025-11-25",
  "flow_intensity": "medium",
  "notes": "Started in the evening"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Period logged successfully",
  "data": {
    "record": { ... },
    "predictions": {
      "next_period_date": "2025-12-18",
      "ovulation_date": "2025-12-04",
      "avg_cycle_length": 28,
      "confidence": "high"
    }
  }
}
```

#### Update Period
```http
PATCH /cycles/period/:recordId
```
🔒 **Requires Authentication + Onboarding**

**Request Body:**
```json
{
  "period_end_date": "2025-11-25",
  "flow_intensity": "light"
}
```

#### Get Predictions
```http
GET /cycles/predictions
```
🔒 **Requires Authentication + Onboarding**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "has_data": true,
    "current_cycle": {
      "day": 15,
      "phase": "ovulation",
      "started_on": "2025-11-04"
    },
    "predictions": {
      "next_period_date": "2025-12-02",
      "ovulation_date": "2025-11-18",
      "fertile_window": {
        "start": "2025-11-13",
        "end": "2025-11-18"
      },
      "avg_cycle_length": 28,
      "confidence": "high"
    }
  }
}
```

#### Get Cycle History
```http
GET /cycles/history?limit=12
```
🔒 **Requires Authentication + Onboarding**

---

### Mood Logs

#### Log Mood
```http
POST /logs/mood
```
🔒 **Requires Authentication + Onboarding**

**Request Body:**
```json
{
  "log_date": "2025-11-20",
  "mood": "happy",
  "energy_level": 8,
  "symptoms": ["cramps", "bloating"],
  "flow_intensity": "medium",
  "notes": "Feeling great after yoga",
  "is_private": true
}
```

**Valid Moods:** `happy`, `calm`, `sad`, `anxious`, `irritable`, `energetic`

**Valid Symptoms:** `cramps`, `bloating`, `headache`, `fatigue`, `breast_tenderness`, `acne`, `backache`, `nausea`, `insomnia`, `cravings`, `irritability`, `anxiety`, `sadness`, `mood_swings`, `increased_energy`, `high_libido`, `low_libido`, `brain_fog`, `diarrhea`, `constipation`

**Response (201):**
```json
{
  "success": true,
  "message": "Mood log created successfully",
  "data": {
    "log": { ... }
  }
}
```

#### Get Mood Logs
```http
GET /logs/mood?limit=30
GET /logs/mood?start_date=2025-11-01&end_date=2025-11-30
```
🔒 **Requires Authentication + Onboarding**

#### Get Mood Log by Date
```http
GET /logs/mood/:date
```
🔒 **Requires Authentication + Onboarding**

Example: `GET /logs/mood/2025-11-20`

#### Get Mood Statistics
```http
GET /logs/mood/stats?days=30
```
🔒 **Requires Authentication + Onboarding**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period_days": 30,
    "total_logs": 25,
    "mood_breakdown": {
      "happy": 10,
      "calm": 8,
      "anxious": 5,
      "irritable": 2
    },
    "avg_energy": "7.2",
    "common_symptoms": [
      { "symptom": "cramps", "count": 5 },
      { "symptom": "fatigue", "count": 4 }
    ]
  }
}
```

#### Delete Mood Log
```http
DELETE /logs/mood/:logId
```
🔒 **Requires Authentication + Onboarding**

---

### Calendar

#### Get Calendar Data
```http
GET /calendar?year=2025&month=11
```
🔒 **Requires Authentication + Onboarding**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 11,
    "days": [
      {
        "date": "2025-11-01",
        "has_period": true,
        "flow_intensity": "medium",
        "has_mood_log": true,
        "mood": "calm",
        "energy_level": 6,
        "symptoms_count": 2,
        "is_predicted": false
      },
      ...
    ],
    "predictions": [...]
  }
}
```

#### Get Calendar Range
```http
GET /calendar/range?start=2025-01&end=2025-03
```
🔒 **Requires Authentication + Onboarding**

---

### User

#### Update Profile
```http
PATCH /users/profile
```
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "first_name": "Jane",
  "avg_cycle_length": 29
}
```

#### Get User Statistics
```http
GET /users/stats
```
🔒 **Requires Authentication**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_cycles": 12,
    "total_mood_logs": 180,
    "current_streak": 30,
    "member_since": "2025-01-15T10:30:00Z"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid request data (400)
- `INVALID_CREDENTIALS` - Wrong email/password (401)
- `TOKEN_EXPIRED` - JWT token expired (401)
- `INVALID_TOKEN` - Invalid JWT token (401)
- `USER_NOT_FOUND` - User does not exist (404)
- `ONBOARDING_REQUIRED` - User must complete onboarding first (403)
- `SUBSCRIPTION_REQUIRED` - Feature requires premium subscription (403)
- `DUPLICATE_ENTRY` - Resource already exists (409)
- `NETWORK_ERROR` - Connection issues
- `INTERNAL_ERROR` - Server error (500)

---

## Rate Limiting

API requests are rate limited to **100 requests per 15 minutes** per IP address.

Exceeding this limit returns:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Testing

**Demo Account (Seeded in Database):**
- Email: `jane@example.com`
- Password: `password123`

---

## Next Steps (Phase 2+)

- Insights generation endpoints
- Partner Mode API
- Subscription/payment endpoints
- Push notification triggers
- Data export endpoints

---

**Last Updated:** Phase 1 MVP Implementation
