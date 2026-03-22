# 🔌 TYPEMASTER PRO - BACKEND API SPECIFICATIONS

**Version**: 1.0  
**Last Updated**: January 15, 2026  
**Status**: 📋 SPECIFICATION READY FOR IMPLEMENTATION

---

## 📊 OVERVIEW

This document defines the complete backend API structure for TypeMaster Pro, including all endpoints, request/response formats, validation rules, and security requirements.

---

## 🏗️ ARCHITECTURE

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 15+ (Primary) + Redis (Cache/Sessions)
- **ORM**: Prisma 5.x
- **Authentication**: JWT + OAuth 2.0
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit + Redis
- **CAPTCHA**: Google reCAPTCHA v3 or hCaptcha

### Project Structure
```
backend/
├── src/
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, validation, rate limiting
│   ├── models/           # Prisma schema
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helpers
│   └── validators/       # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
├── tests/
│   ├── unit/
│   └── integration/
└── .env.example
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. POST `/api/auth/captcha/verify`
**Purpose**: Verify CAPTCHA token before allowing login/signup

**Request**:
```json
{
  "token": "string",          // CAPTCHA token from frontend
  "action": "login|signup"    // Action type
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "captchaToken": "jwt_token_here",  // Valid for 2 minutes
  "expiresAt": "2026-01-15T14:45:00Z"
}
```

**Response** (Failure - 400):
```json
{
  "success": false,
  "error": "CAPTCHA verification failed",
  "code": "CAPTCHA_INVALID"
}
```

**Validation**:
- Token must be valid Google reCAPTCHA/hCaptcha token
- Score must be >= 0.5 (for reCAPTCHA v3)
- Token expires after 2 minutes
- Rate limit: 10 attempts per IP per hour

---

### 2. POST `/api/auth/login`
**Purpose**: Authenticate user with email/password or OAuth

**Request**:
```json
{
  "captchaToken": "string",     // From /captcha/verify
  "provider": "google|facebook|phone",
  "credentials": {
    "email": "user@example.com",  // For email login
    "password": "hashed_password", // For email login
    "oauthToken": "string",        // For OAuth
    "phoneNumber": "+1234567890",  // For phone
    "otpCode": "123456"            // For phone OTP
  },
  "deviceInfo": {
    "userAgent": "string",
    "platform": "desktop|mobile",
    "screenWidth": 1920,
    "screenHeight": 1080
  }
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "restricted|active",
    "profileComplete": false,
    "joinedAt": "2026-01-15T10:00:00Z"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600
  }
}
```

**Response** (Failure - 401):
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_FAILED"
}
```

**Validation**:
- CAPTCHA token must be valid and not expired
- Device must be desktop (mobile blocked)
- Email/password must match database
- OAuth token must be verified with provider
- OTP must be valid and not expired
- Rate limit: 5 attempts per IP per 15 minutes

---

### 3. POST `/api/auth/otp/request`
**Purpose**: Request OTP for phone login

**Request**:
```json
{
  "captchaToken": "string",
  "phoneNumber": "+1234567890",
  "countryCode": "+1"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "OTP sent to +1234567890",
  "expiresIn": 300  // 5 minutes
}
```

**Validation**:
- CAPTCHA token required
- Phone number must be valid E.164 format
- Rate limit: 3 requests per phone per hour
- OTP expires after 5 minutes

---

### 4. POST `/api/auth/refresh`
**Purpose**: Refresh access token

**Request**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "accessToken": "new_jwt_access_token",
  "expiresIn": 3600
}
```

---

### 5. POST `/api/auth/logout`
**Purpose**: Invalidate user session

**Request**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 PROFILE ENDPOINTS

### 6. GET `/api/profile`
**Purpose**: Get user profile

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "status": "active",
    "profile": {
      "fatherName": "James Doe",
      "dateOfBirth": "1990-01-15",
      "mobileNumber": "+1234567890",
      "city": "New York",
      "country": "USA",
      "gender": "Male",
      "maritalStatus": "Single",
      "occupation": "Developer",
      "address": "123 Main St",
      "religion": "Christian",
      "employmentStatus": "Employed"
    },
    "stats": {
      "testsTaken": 50,
      "avgWpm": 65,
      "bestWpm": 95,
      "accuracy": 94,
      "totalWords": 12500,
      "totalErrors": 750
    }
  }
}
```

---

### 7. PUT `/api/profile`
**Purpose**: Update user profile

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "captchaToken": "string",  // Required for profile submission
  "name": "John Doe",
  "avatar": "base64_or_url",
  "profile": {
    "fatherName": "James Doe",
    "dateOfBirth": "1990-01-15",
    "mobileNumber": "+1234567890",
    "city": "New York",
    "country": "USA",
    "gender": "Male",
    "maritalStatus": "Single",
    "occupation": "Developer",
    "address": "123 Main St",
    "religion": "Christian",
    "employmentStatus": "Employed"
  }
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ },
  "statusChanged": true,  // If status changed from restricted to active
  "profileComplete": true
}
```

**Validation**:
- All required fields must be present
- Name: 3-50 characters, no special chars except spaces
- Father Name: 3-50 characters
- DOB: Valid date, user must be 13+ years old
- Mobile: Valid phone number format
- City: 2-50 characters
- Country: Valid country name
- Gender: "Male" | "Female" | "Other"
- Marital Status: "Single" | "Married" | "Divorced" | "Widowed"
- Occupation: 2-50 characters
- Address: 10-200 characters
- Fake inputs blocked: "abc", "test", "123", etc.

---

## 📝 TYPING TEST ENDPOINTS

### 8. POST `/api/tests/start`
**Purpose**: Start a new typing test

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "mode": "preset|custom|code",
  "difficulty": "beginner|intermediate|hard",
  "duration": 60,
  "textId": "b1",  // For preset mode
  "customText": "string"  // For custom mode
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "testId": "uuid",
  "text": "The cat sat on the mat...",
  "startTime": "2026-01-15T14:00:00Z",
  "duration": 60
}
```

**Validation**:
- User must have `status: active`
- Profile must be 100% complete
- Rate limit: 100 tests per user per day

---

### 9. POST `/api/tests/submit`
**Purpose**: Submit typing test results

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "testId": "uuid",
  "results": {
    "wpm": 65,
    "accuracy": 94,
    "errors": 15,
    "duration": 60,
    "totalChars": 250,
    "keystrokes": [
      { "char": "T", "timestamp": 1234567890, "correct": true },
      // ... all keystrokes
    ],
    "integrityScore": 95,
    "hashChain": "final_hash_value"
  },
  "deviceInfo": {
    "pollingRate": 1000,
    "hardwareAdvantage": 0.95
  }
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "testId": "uuid",
  "verified": true,
  "achievements": ["speed_demon", "accuracy_master"],
  "stats": {
    "avgWpm": 66,
    "bestWpm": 95,
    "testsTaken": 51
  }
}
```

**Validation**:
- Test ID must exist and belong to user
- Test must not be already submitted
- WPM must be realistic (< 200)
- Accuracy must be 0-100%
- Integrity score must be >= 70
- Hash chain must be valid
- Keystrokes must match test duration
- Anti-cheat checks:
  - Variance analysis
  - N-gram consistency
  - Timing patterns
  - Hardware detection

---

## 🏆 LEADERBOARD ENDPOINTS

### 10. GET `/api/leaderboard`
**Purpose**: Get leaderboard rankings

**Query Parameters**:
```
?period=daily|weekly|monthly|alltime
&mode=wpm|accuracy
&limit=100
&offset=0
```

**Response** (Success - 200):
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "John Doe",
      "avatar": "url",
      "wpm": 120,
      "accuracy": 98,
      "testsTaken": 500
    }
    // ... more entries
  ],
  "userRank": {
    "rank": 42,
    "percentile": 85
  },
  "total": 1000
}
```

---

### 11. POST `/api/leaderboard/submit`
**Purpose**: Submit score to leaderboard (Level 2+)

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "testId": "uuid",
  "wpm": 120,
  "accuracy": 98
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "rank": 42,
  "improved": true,
  "previousRank": 50
}
```

**Validation**:
- User must be Level 2+
- Test must be verified
- Integrity score >= 90
- No duplicate submissions

---

## 🎮 MULTIPLAYER ENDPOINTS

### 12. POST `/api/multiplayer/matchmaking`
**Purpose**: Find opponent for typing duel

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "mode": "ranked|casual",
  "avgWpm": 65
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "matchId": "uuid",
  "opponent": {
    "id": "uuid",
    "name": "Jane Doe",
    "avatar": "url",
    "avgWpm": 68
  },
  "startTime": "2026-01-15T14:05:00Z"
}
```

---

## 🔒 MIDDLEWARE & SECURITY

### Authentication Middleware
```javascript
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Device Validation Middleware
```javascript
const requireDesktop = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent);
  
  if (isMobile) {
    return res.status(403).json({
      error: 'Desktop only',
      code: 'MOBILE_BLOCKED'
    });
  }
  next();
};
```

### Profile Completion Middleware
```javascript
const requireCompleteProfile = (req, res, next) => {
  if (req.user.status !== 'active') {
    return res.status(403).json({
      error: 'Profile incomplete',
      code: 'PROFILE_REQUIRED',
      profileUrl: '/profile'
    });
  }
  next();
};
```

### Rate Limiting
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ client: redisClient })
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 OTPs
  keyGenerator: (req) => req.body.phoneNumber
});
```

---

## 📊 DATABASE SCHEMA (Prisma)

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  name              String
  avatar            String?
  status            String    @default("restricted") // restricted | active | banned
  provider          String    // google | facebook | phone
  emailVerified     Boolean   @default(false)
  isEmailSubscribed Boolean   @default(false)
  welcomeEmailSent  Boolean   @default(false)
  
  profile           Profile?
  stats             Stats?
  tests             Test[]
  achievements      Achievement[]
  sessions          Session[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Profile {
  id               String   @id @default(uuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id])
  
  fatherName       String
  dateOfBirth      String
  mobileNumber     String
  city             String
  country          String
  gender           String
  maritalStatus    String
  occupation       String
  address          String
  religion         String?
  employmentStatus String?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Stats {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  
  testsTaken   Int      @default(0)
  avgWpm       Int      @default(0)
  bestWpm      Int      @default(0)
  accuracy     Int      @default(0)
  totalWords   Int      @default(0)
  totalErrors  Int      @default(0)
  
  level        Int      @default(1)
  xp           Int      @default(0)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Test {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  
  mode           String   // preset | custom | code
  difficulty     String   // beginner | intermediate | hard
  duration       Int
  text           String
  
  wpm            Int
  accuracy       Int
  errors         Int
  totalChars     Int
  
  integrityScore Int
  hashChain      String
  keystrokes     Json
  
  verified       Boolean  @default(false)
  flagged        Boolean  @default(false)
  
  createdAt      DateTime @default(now())
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  
  refreshToken String   @unique
  deviceInfo   Json
  ipAddress    String
  
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

---

## 🧪 ERROR CODES

| Code | HTTP | Description |
|------|------|-------------|
| `CAPTCHA_INVALID` | 400 | CAPTCHA verification failed |
| `CAPTCHA_EXPIRED` | 400 | CAPTCHA token expired |
| `AUTH_FAILED` | 401 | Invalid credentials |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `UNAUTHORIZED` | 401 | No valid token provided |
| `MOBILE_BLOCKED` | 403 | Mobile device not allowed |
| `PROFILE_REQUIRED` | 403 | Profile incomplete |
| `RATE_LIMIT` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 📝 NEXT STEPS

1. **Set up project structure** - Initialize Node.js + Express + Prisma
2. **Configure database** - PostgreSQL + Redis
3. **Implement authentication** - JWT + OAuth + CAPTCHA
4. **Add middleware** - Auth, validation, rate limiting
5. **Create endpoints** - Following this specification
6. **Write tests** - Unit + integration tests
7. **Deploy** - Staging → Production

---

**Document Version**: 1.0  
**Status**: ✅ READY FOR IMPLEMENTATION  
**Estimated Implementation Time**: 2-3 weeks
