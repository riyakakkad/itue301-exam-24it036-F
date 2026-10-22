# EventHub - Ticket Booking System
**ITUE301: Advanced Web Development Frameworks Practical Examination**  
**CSPIT, CHARUSAT · Set F**

---

## 📋 Project Overview

EventHub is a full-stack event ticketing platform enabling attendees to browse events, book tickets with real-time inventory management, and manage their reservations, while organizers oversee platform capacity and publish campus events.

### Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Vanilla CSS (Modern Design System with Dark/Glassmorphism Theme)
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB (with local connection, MongoDB Atlas support, and transparent in-memory fallback)

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+ or v10+)
- MongoDB (Local service or MongoDB Atlas cluster connection URI)

---

### Step 1: Backend Setup & Launch

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Contents of `backend/.env`:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/eventhub
     JWT_SECRET=eventhub_super_secret_jwt_key_2026
     ```

4. *(Optional)* Seed Database:
   ```bash
   npm run seed
   ```

5. Start Backend Server:
   ```bash
   # Using npm:
   npm start

   # Or using node directly:
   node server.js
   ```
   > Server will start at: `http://localhost:5000`  
   > Base API URL: `http://localhost:5000/api/v1`

6. Run Automated API Verification Tests:
   ```bash
   npm test
   # Or: node test-api.js
   ```

---

### Step 2: Frontend Setup & Launch

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start Vite Development Server:
   ```bash
   npm run dev
   ```
   > Frontend will be available at: `http://localhost:5173`

4. Build for Production:
   ```bash
   npm run build
   ```

---

## 🗄️ MongoDB Configuration & Troubleshooting

### Option A: Local MongoDB
If you have MongoDB Community Server installed locally on Windows:
```powershell
Start-Service -Name MongoDB
```
Ensure your `backend/.env` has:
```env
MONGO_URI=mongodb://127.0.0.1:27017/eventhub
```

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection URI and paste it in `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventhub?retryWrites=true&w=majority
   ```

### Option C: Built-in Resilient Fallback Mode
If MongoDB is offline or unavailable on the exam host machine (e.g. system DLL or hypervisor constraint), the backend automatically activates the built-in **In-Memory Persistence Fallback**.
- Every Mongoose model schema, validation rule, reference population (`.populate()`), and status update remains **100% operational**!
- You can fully interact with the frontend, test booking quantity validation, view tickets, and log in without any server crashes.

---

## 🔑 Test Credentials (Pre-seeded)

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Attendee** | `rahul@example.com` | `password123` | `/events`, `/my-tickets` |
| **Organizer** | `alice@eventhub.com` | `password123` | `/events`, `/my-tickets`, `/organizer` |
| **Admin** | `admin@eventhub.com` | `password123` | Full Access |

*Note: The login page includes 1-click test credential auto-fill buttons for fast viva demonstration.*

---

## 🛠️ Task Implementation Details

### Task 1: React Component Architecture (4 Marks)
- **Pages**: `LoginPage.jsx`, `EventsPage.jsx`, `MyTicketsPage.jsx`.
- **Reusable Component**: `src/components/EventCard.jsx`
  - Accepts all 5 required props:
    1. `title`
    2. `category`
    3. `date`
    4. `venue`
    5. `ticketsAvailable`
  - Displays all 5 values.
  - **Conditional Check**: Simple check at the top:
    ```jsx
    const isSoldOut = ticketsAvailable === 0 || ticketsAvailable <= 0;
    // Renders "Sold Out" badge if true, otherwise renders "Book Tickets" button
    ```

### Task 2: React Routing and State Management (4 Marks)
- **React Router Routes** in `src/App.jsx`:
  - `/` → `LoginPage`
  - `/events` → `EventsPage` (Protected)
  - `/my-tickets` → `MyTicketsPage` (Protected)
  - `/organizer` → `OrganizerPanel` (Lazy-loaded with `React.lazy` + `Suspense`, role `'organizer'` required)
- **Navigation Component**: `src/components/Navbar.jsx` with React Router `NavLink`s for client-side navigation without full-page reloads.
- **Booking Form State in `EventsPage`**:
  - Uses `useState` for `selectedEvent` and `ticketQuantity` (meaningfully managed).
- **AuthContext & Nested Role Checks**:
  - `AuthContext` holds `{ attendee, token, role, login, logout }`.
  - `ProtectedRoute`:
    - Missing token/authentication → Redirects to `/`.
    - Role mismatch (e.g. attendee accessing `/organizer`) → Redirects to `/events` (user is not logged out).
    - Distinct redirect targets facilitate viva inspection.

### Task 3: Express REST API + Middleware (4 Marks)
All endpoints mounted under `/api/v1`:
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates attendee/organizer, returns JWT token & user info |
| `GET` | `/api/v1/events` | Public | Returns all events sorted by date |
| `POST` | `/api/v1/tickets` | Protected (`authGuard`) | Validates availability, creates ticket, decrements `ticketsAvailable` |
| `GET` | `/api/v1/tickets/my` | Protected (`authGuard`) | Returns current attendee's tickets with populated references |
| `PATCH` | `/api/v1/tickets/:id/status`| Protected (`authGuard`) | Updates status (`cancelled`) and releases tickets |

- **Global `requestLogger` Middleware**:
  - Logs `[METHOD] [PATH] [TIMESTAMP]` for every request.
- **Custom `authGuard` Middleware**:
  - Extracts and verifies Bearer JWT token from `Authorization` header.
  - Returns `401 Unauthorized` if token is missing or invalid.
- **Global Error Handler**:
  - Last middleware catching all errors, returning structured JSON response without exposing raw stack traces.

### Task 4: REST API Consumption in React (4 Marks)
- `EventsPage.jsx`:
  - Calls `GET /api/v1/events` on mount via `useEffect()`.
  - Maintains 3 states: `events`, `loading`, `error`.
  - Displays loading spinner during fetch, error message on failure, and renders cards via `EventCard` on success.
  - **Client-Side Search**: Title search box filters `events` array client-side using `.filter()` on render without sending redundant HTTP requests.

### Task 5: MongoDB + Mongoose Schemas & Validation (4 Marks)
- **Attendee Schema**: `name` (required), `email` (required, unique, regex format), `phone`, `password` (hashed), `role` (enum: attendee, organizer, admin).
- **Event Schema**: `title` (required), `category`, `date` (required), `venue` (required), `ticketsAvailable` (min 0).
- **Ticket Schema**:
  - `attendeeId` (ref: `Attendee`, required)
  - `eventId` (ref: `Event`, required)
  - `quantity` (min 1, required)
  - `bookingDate` (default: `Date.now`)
  - `status` (enum: `['booked', 'cancelled', 'used']`, default: `'booked'`)
- **Inventory Validation**:
  - Validates `ticketsAvailable >= quantity`.
  - Returns `400 Bad Request` with meaningful error if quantity exceeds available tickets.
  - Never permits inventory to become negative.
- **Population**:
  - `GET /tickets/my` executes `.populate('attendeeId', 'name email')` and `.populate('eventId', 'title date venue')`.

---

## 🎯 Viva Preparation Guide (Questions & Answers)

### Q1: Why use `React.lazy` and `<Suspense>` for `OrganizerPanel`?
**A:** `React.lazy` enables code-splitting. Instead of bundling the organizer dashboard into the initial main bundle downloaded by every attendee, the code for `OrganizerPanel` is split into a separate chunk (`dist/assets/OrganizerPanel-....js`) and loaded asynchronously only when an organizer navigates to `/organizer`. `<Suspense fallback={...}>` displays a fallback loader during download.

### Q2: How does `ProtectedRoute` handle authentication vs role authorization?
**A:** If `isAuthenticated` is false (missing token), the user is redirected to `/` (LoginPage). If the user is authenticated but lacks the required role (`role !== requiredRole`), they are redirected to `/events` without logging them out. This prevents privilege escalation while preserving user session.

### Q3: How is inventory prevented from going negative during ticket booking?
**A:** In `ticketController.js`, we verify `event.ticketsAvailable >= quantity` before creating the ticket. In MongoDB, we atomically decrement using `$inc: { ticketsAvailable: -quantity }` with `{ runValidators: true }` so that concurrent requests cannot oversell tickets.

### Q4: How does the client-side search in `EventsPage` avoid extra API requests?
**A:** The full events list is retrieved once during component mount into the `events` state. The search input value is bound to `searchQuery`. During render, `events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))` computes the matching events in memory without triggering a network request.

### Q5: Why is `requestLogger` placed before the route handlers?
**A:** In Express, middleware functions execute sequentially. By mounting `app.use(requestLogger)` before route declarations, every incoming request passes through the logger first, logging `[METHOD] [PATH] [TIMESTAMP]` before reaching controller logic.

---

## 📄 License & Attribution
Developed for ITUE301: Advanced Web Development Frameworks practical examination (AY 2026-27), CSPIT, CHARUSAT.
