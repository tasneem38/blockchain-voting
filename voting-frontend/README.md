# BlockVote — Blockchain Voting Frontend

A complete React 18 frontend for a Booth-Level Blockchain Voting System with MFA.

## Tech Stack
- **React 18** + Vite
- **React Router v6**
- **Axios** — API calls with JWT interceptors
- **TailwindCSS** — Dark theme styling
- **Socket.io-client** — Live vote updates
- **Recharts** — Admin results bar chart
- **react-qr-code** — Vote receipt QR code
- **react-hot-toast** — Notifications
- **lucide-react** — Icons

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env` (already created):
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run dev server
```bash
npm run dev
# → http://localhost:5173
```

---

## Pages

| Route           | Description                            | Auth Required |
|----------------|----------------------------------------|---------------|
| `/login`        | Voter ID + Password login              | No            |
| `/verify-otp`   | 6-digit OTP with countdown timer       | No            |
| `/vote`         | Candidate selection & vote casting     | Voter JWT     |
| `/confirmation` | QR receipt + blockchain tx hash        | Voter JWT     |
| `/admin`        | Full admin dashboard (7 tabs)          | Admin JWT     |

## Admin Dashboard Tabs
1. **Overview** — Live metric cards (voters, votes, booths, turnout)
2. **Voters** — Searchable table + add/delete voters
3. **Candidates** — Manage candidates per booth
4. **Booths** — Toggle booth active status
5. **Results** — Recharts bar chart with live Socket.io updates
6. **Audit Log** — Paginated, filterable audit trail
7. **Election Control** — Open/close election with confirmation

---

## Architecture Notes
- **AuthContext** — In-memory JWT only (never localStorage)
- **SocketContext** — Auto-connects with JWT, disconnects on logout
- **api.js** — Axios instance with auth interceptors; auto-logout on 401
- **ProtectedRoute / AdminRoute** — Route guards for voter/admin roles

---

## Build for Production
```bash
npm run build
```
Output in `dist/`.
