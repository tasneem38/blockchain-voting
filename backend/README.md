# BlockVote Backend

> Secure Node.js/Express API powering the BlockVote electronic voting system. Handles authentication, vote recording, admin management, real-time updates via WebSockets, and optional blockchain integration.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Seeding the Database](#seeding-the-database)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
  - [Voter Routes](#voter-routes)
  - [Candidate Routes](#candidate-routes)
  - [Result Routes](#result-routes)
  - [Admin Routes](#admin-routes)
- [Architecture Overview](#architecture-overview)
- [Blockchain Integration](#blockchain-integration)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure the following are installed on your machine before you start:

| Requirement | Version | Purpose |
|---|---|---|
| **Node.js** | v18+ | JavaScript runtime |
| **npm** | v9+ | Package manager |
| **MongoDB Atlas** | Any | Database (cloud or local) |
| **Redis** | v6+ | OTP storage & token blacklisting |

> **Redis on Windows:** Install via [Memurai](https://www.memurai.com/) or run Redis through WSL2.

---

## Quick Start

```bash
# 1. Navigate to the backend directory
cd "voting 2.0/backend"

# 2. Install dependencies
npm install

# 3. Create your environment file
# Copy the template below into a file named .env

# 4. Seed the database with demo data (first time only)
npm run seed

# 5. Start the development server
npm run dev
```

The server will be running at **http://localhost:5000**.

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```env
# ─── Database ────────────────────────────────────────────────────────────────
# Your MongoDB Atlas connection string (replace <username>, <password>, <cluster>)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/voting_system?retryWrites=true&w=majority

# ─── JWT ─────────────────────────────────────────────────────────────────────
# A long, random secret string used to sign authentication tokens
JWT_SECRET=replace_this_with_a_long_random_secret_string_min_32_chars
JWT_EXPIRY=30m

# ─── Security ────────────────────────────────────────────────────────────────
# Number of bcrypt salt rounds (higher = more secure but slower; 12 is recommended)
BCRYPT_ROUNDS=12

# ─── Server ──────────────────────────────────────────────────────────────────
PORT=5000

# ─── Redis ───────────────────────────────────────────────────────────────────
# Local Redis instance (default port)
REDIS_URL=redis://localhost:6379

# ─── Email (SMTP via Gmail) ───────────────────────────────────────────────────
# IMPORTANT: Use an App Password, NOT your regular Gmail password.
# Generate one at: myaccount.google.com → Security → 2-Step Verification → App passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM="Voting System <your_email@gmail.com>"

# ─── Frontend ────────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173

# ─── Blockchain (Optional) ───────────────────────────────────────────────────
# Leave these as placeholder values to run in Mock Mode (no blockchain needed).
# Set real values only if you have deployed the VotingSystem smart contract.
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ADMIN_PRIVATE_KEY=0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Getting a Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (must be enabled)
3. Scroll down and click **App passwords**
4. Generate a new app password — copy the 16-character code
5. Paste it as the value of `EMAIL_PASS` (spaces are optional)

---

## Running the Server

| Command | Description |
|---|---|
| `npm run dev` | Start with **nodemon** (auto-restarts on file changes) — use for development |
| `npm start` | Start with plain **node** — use for production |
| `npm run seed` | Populate the database with demo voters, admins, candidates, and booths |

### What You Should See on Start

```
Server running on port 5000
Redis connected successfully
MongoDB Connected: ac-xxxxxxx.mongodb.net
Blockchain not configured (placeholder values detected) - running in mock mode
```

---

## Seeding the Database

Running `npm run seed` creates the following demo data:

### Admin & Polling Officer Logins
| Role | ID | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `ADMIN-001` | `Admin@1234` | Statewide Karnataka Overview & Election Control |
| **Polling Officer** | `OFFICER-BTM` | `Officer@1234` | Booth 1 (St. John Auditorium) Assistant Portal |

### Registered Voter Logins (10 Demo Voters across Karnataka)
| Voter ID | Voter Name | EPIC Number | Constituency | Polling Station / Booth | Password |
|---|---|---|---|---|---|
| `VOTER-001` | Ramesh Kumar | `KA/01/172/100001` | BTM Layout (AC-172) | St. John Auditorium, Koramangala | `Test@1234` |
| `VOTER-002` | Ananya Hegde | `KA/01/172/100002` | BTM Layout (AC-172) | St. John Auditorium, Koramangala | `Test@1234` |
| `VOTER-003` | Syed Mustafa | `KA/01/172/100003` | BTM Layout (AC-172) | St. John Auditorium, Koramangala | `Test@1234` |
| `VOTER-004` | Deepak Gowda | `KA/01/172/100004` | BTM Layout (AC-172) | Govt Primary School, Madiwala | `Test@1234` |
| `VOTER-005` | Sunita Rao | `KA/01/172/100005` | BTM Layout (AC-172) | Govt Primary School, Madiwala | `Test@1234` |
| `VOTER-006` | Vijay Prasad | `KA/01/173/100006` | Jayanagar (AC-173) | National College, Jayanagar 7th Block | `Test@1234` |
| `VOTER-007` | Meenakshi Sundaram | `KA/01/173/100007` | Jayanagar (AC-173) | National College, Jayanagar 7th Block | `Test@1234` |
| `VOTER-008` | Rahul Dravid | `KA/01/173/100008` | Jayanagar (AC-173) | National College, Jayanagar 7th Block | `Test@1234` |
| `VOTER-009` | Kavya Rao | `KA/01/174/100009` | C.V. Raman Nagar (AC-174) | HAL Public School, Indiranagar | `Test@1234` |
| `VOTER-010` | Mohammed Zameer | `KA/01/174/100010` | C.V. Raman Nagar (AC-174) | HAL Public School, Indiranagar | `Test@1234` |

> **Note:** The voter emails are fake and will bounce. OTPs will be printed to the backend terminal for development.

---

## API Reference

All API routes are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Auth Routes

**Base path:** `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | No | Submit voter/admin ID + password → sends OTP to email |
| `POST` | `/verify-otp` | No | Submit OTP → returns JWT token |
| `POST` | `/resend-otp` | No | Resend OTP (only after timer expires) |
| `POST` | `/logout` | ✅ Yes | Blacklist the current JWT token |

**Login Request Body:**
```json
{
  "voterId": "VOTER-001",
  "password": "Voter@1234"
}
```

**Verify OTP Request Body:**
```json
{
  "voterId": "VOTER-001",
  "otp": "123456"
}
```

---

### Voter Routes

**Base path:** `/api/vote` | Requires: Voter JWT token

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/cast` | Cast a vote for a candidate |
| `GET` | `/status` | Get current voter's voting status |

**Cast Vote Request Body:**
```json
{
  "candidateId": "CND-001"
}
```

---

### Candidate Routes

**Base path:** `/api/candidates` | Requires: Valid JWT token

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get candidates for the voter's assigned booth |

---

### Result Routes

**Base path:** `/api/results` | Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get election results (from blockchain or DB) |

---

### Admin Routes

**Base path:** `/api/admin` | Requires: Admin JWT token (SUPER_ADMIN or BOOTH_ADMIN)

#### Overview
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/overview` | Live stats: total voters, votes cast, turnout % |

#### Voters
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/voters` | List all voters (supports `?search=`, `?hasVoted=`, `?page=`, `?limit=`) |
| `POST` | `/voters` | Register a new voter |
| `DELETE` | `/voters/:id` | Delete a voter (cannot delete if they have voted) |
| `PATCH` | `/voters/:id/reset` | Reset a voter's voted status |

#### Candidates
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/candidates` | List all candidates |
| `POST` | `/candidates` | Add a new candidate |
| `DELETE` | `/candidates/:id` | Delete a candidate (not allowed while election is open) |

#### Booths
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/booths` | List all booths |
| `POST` | `/booths` | Create a new booth |
| `PATCH` | `/booths/:id/toggle` | Toggle a booth's active/inactive status |

#### Election Control
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/election/status` | Get election open/closed status + live turnout stats |
| `POST` | `/election/open` | Open the election |
| `POST` | `/election/close` | Close the election |

#### Audit Log
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/audit` | Get audit log entries (supports `?page=`, `?limit=`) |

#### Results (Admin)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/results` | Get detailed election results with booth breakdown |

---

## Architecture Overview

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── redis.js           # Redis client + OTP helpers
├── contracts/
│   └── VotingSystem.json  # Smart contract ABI (for blockchain mode)
├── controllers/
│   ├── authController.js      # Login, OTP verify, logout
│   ├── voteController.js      # Vote casting logic
│   ├── candidateController.js # Fetch candidates per booth
│   ├── resultController.js    # Compile election results
│   └── admin/                 # All admin-only controllers
├── middleware/
│   ├── authMiddleware.js   # JWT verification
│   ├── adminMiddleware.js  # Admin role check
│   ├── auditLogger.js      # Audit log helpers
│   └── rateLimiter.js      # API rate limiting
├── models/
│   ├── Admin.js            # Admin account schema
│   ├── AuditLog.js         # Immutable audit trail
│   ├── Booth.js            # Polling booth schema
│   ├── Candidate.js        # Candidate schema
│   ├── ElectionState.js    # Persists open/closed status
│   └── User.js             # Voter account schema
├── routes/
│   ├── authRoutes.js
│   ├── voteRoutes.js
│   ├── candidateRoutes.js
│   ├── resultRoutes.js
│   └── admin/              # All admin-only routes
├── scripts/
│   └── seed.js             # Database seeder
├── utils/
│   ├── blockchainService.js # Blockchain / Mock vote recording
│   ├── generateJWT.js       # JWT sign & verify
│   ├── generateOTP.js       # 6-digit OTP generator
│   └── sendEmail.js         # Nodemailer SMTP helper
└── server.js               # Express app entry point
```

---

## Blockchain Integration

The system supports two modes:

### Mock Mode
Activated automatically when `CONTRACT_ADDRESS` is the zero address or a placeholder. In this mode:
- Vote transactions return a randomly generated fake `txHash`.
- Election open/close state is persisted in **MongoDB** (via `ElectionState` model).
- No Ethereum node or wallet is needed.

### Live Blockchain Mode (Ganache / Ethereum Testnet)
To run in **Live Blockchain Mode**:

1. **Start Ganache:**
   ```bash
   npx ganache
   ```
   Listens on `http://127.0.0.1:8545` with 10 test accounts pre-funded with 1,000 ETH.

2. **Deploy the `VotingSystem.sol` Smart Contract:**
   ```bash
   node scripts/deployContract.js
   # Or: npm run deploy:contract
   ```
   This script compiles `backend/contracts/VotingSystem.sol`, deploys it to Ganache, updates `backend/contracts/VotingSystem.json` with the compiled ABI, and populates `CONTRACT_ADDRESS` and `ADMIN_PRIVATE_KEY` in `backend/.env`.

3. **Verify with MetaMask:**
   Add `Ganache Local` network (`http://127.0.0.1:8545`, Chain ID `1337`), import Account 0 private key from `.env`, and select `Ganache Local` to view your live ETH balance and transaction costs!

```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0xYourDeployedContractAddress
ADMIN_PRIVATE_KEY=0xYourAdminPrivateKey
```

---

## Security Features

| Feature | Implementation |
|---|---|
| **Password Hashing** | bcrypt with configurable salt rounds |
| **Two-Factor Auth** | Time-limited OTP sent to registered email |
| **JWT Blacklisting** | Logged-out tokens are blacklisted in Redis |
| **Account Lockout** | After 5 failed logins, account locks for 30 minutes |
| **Rate Limiting** | Global API rate limiter via `express-rate-limit` |
| **Helmet** | Secure HTTP headers set automatically |
| **CORS** | Restricted to `FRONTEND_URL` only |
| **Input Validation** | `express-validator` on all write endpoints |
| **Audit Trail** | Every significant action logged to `AuditLog` collection |
| **Vote Integrity** | Double-check: DB flag + blockchain prevents double voting |

---

## Troubleshooting

### `MongoServerError: Authentication failed`
- Double-check your `MONGO_URI` in `.env`
- Ensure your MongoDB Atlas user has **read/write** access to the database
- Check that your IP address is whitelisted in Atlas Network Access

### `Redis connection refused`
- Make sure Redis is running: `redis-cli ping` should return `PONG`
- On Windows: start Memurai or run Redis via WSL2

### `Email send failure: Invalid login`
- You must use a **Gmail App Password**, not your account password
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### OTP not arriving by email
- Check the backend terminal — the OTP is printed there for development purposes:
  ```
  🔑 [TESTING] OTP for VOTER-001: 123456
  ```

### `Election already open` error when clicking Open Election
- The election state is stored in MongoDB. Use **Close Election** first, then re-open.

### `contract.openElection is not a function`
- Your blockchain env vars look real but point to a non-existent contract.
- Reset them to the placeholder values in `.env` to use Mock Mode.
