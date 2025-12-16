# Sweet Shop Management System

A full-stack web application for managing a sweet shop: browse sweets, search and filter, purchase with stock updates, and an admin panel for CRUD operations.

## Overview

- Customer-facing catalog with search by name, category, and price range.
- Secure authentication (login/register), cookie-based sessions, and role-based admin access.
- Admin inventory management: create, update, delete sweets; restock via backend routes.
- Backend REST API using Express + MongoDB (Mongoose).
- Frontend built with React + Vite + Tailwind CSS.

## Features

- **Auth**: Login, Register, cookie-based session, admin role gate.
- **Catalog**: List sweets, detail view, search `q`, filter by `category`, `minPrice`, `maxPrice`.
- **Purchase**: Buy items, update stock via `/api/sweets/:id/purchase`.
- **Admin**: Create, update, delete sweets, manage inventory.
- **Responsive UI**: Reusable components and subtle animations.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, `react-router-dom`, Axios, `motion`.
- **Backend**: Node.js, Express 5, Mongoose 9, JWT, bcrypt, cookie-parser, CORS.
- **Testing (Backend)**: Jest, Supertest, mongodb-memory-server.

## Project Structure

- **Backend**: API, models, middleware, and tests
  - Entry point: [Backend/src/server.js](Backend/src/server.js)
  - App setup: [Backend/src/app.js](Backend/src/app.js)
  - DB config: [Backend/src/config/Database.js](Backend/src/config/Database.js)
  - Routers: [Backend/src/routes](Backend/src/routes)
  - Models: [Backend/src/models](Backend/src/models)
  - Tests: [Backend/tests](Backend/tests)
- **Frontend**: React app with pages and UI components
  - App root: [Frontend/src/App.jsx](Frontend/src/App.jsx)
  - Pages: [Frontend/src/pages](Frontend/src/pages)
  - Auth Context: [Frontend/src/contexts/AuthContext.jsx](Frontend/src/contexts/AuthContext.jsx)
  - API client: [Frontend/src/lib/axios.js](Frontend/src/lib/axios.js)
  - UI Components: [Frontend/src/components/ui](Frontend/src/components/ui)

## API Overview

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Profile**
  - `GET /api/profile`
- **Sweets**
  - `GET /api/sweets` — list all
  - `GET /api/sweets/search` — search by `q`, `category`, `minPrice`, `maxPrice`
  - `GET /api/sweets/:id` — get details
  - `POST /api/sweets` — create (admin)
  - `PUT /api/sweets/:id` — update (admin)
  - `DELETE /api/sweets/:id` — delete (admin)
- **Inventory**
  - `POST /api/sweets/:id/purchase` — purchase and decrement stock
  - `POST /api/inventory/restock` — restock (admin)

## Setup & Run Locally

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)

### Backend Setup

1. Navigate to backend folder and install dependencies:
   ```bash
   cd Backend
   npm install
   ```
2. Create a `.env` file in `Backend/` with:

   ```env
   MONGODB_URI=mongodb://localhost:27017/sweetshop
   JWT_SECRET=replace_with_a_strong_secret
   port=3000
   BCRYPT_SALT_ROUNDS=give_your_own_salt

   ```

   Note: The server reads `port` (lowercase). Use `3000` to match the frontend axios base URL.

3. (Optional) Seed an admin user:
   ```bash
   npm run seed:admin
   ```
4. Start the server:
   ```bash
   npm run dev   # auto-restart on changes
   # or
   npm start     # production-like run
   ```
5. The backend should be available at `http://localhost:3000`.

### Frontend Setup

1. Navigate to frontend folder and install dependencies:
   ```bash
   cd ../Frontend
   npm install
   ```
2. Verify Axios base URL matches the backend:
   - See [Frontend/src/lib/axios.js](Frontend/src/lib/axios.js) — currently `http://localhost:3000` with `withCredentials: true`.
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open the app at `http://localhost:5173`.

### Backend Tests

Run the backend test suite:

```bash
cd Backend
npm test
```

## Environment & CORS

- CORS is configured in [Backend/src/app.js](Backend/src/app.js) to allow `http://localhost:5173` with credentials.
- Frontend sends cookies (`withCredentials: true`). Ensure your browser allows third-party cookies in dev if proxies differ.

## My AI Usage

- **Tools Used**: GitHub Copilot (GPT-5) and ChatGPT.
- **How I Used AI**: Primarily to generate boilerplate scaffolding (React/Vite setup, basic component structures) and a handful of test cases. Core application logic, API integrations, state management, routing, and business rules were implemented manually. All AI-generated snippets were reviewed and adapted to fit the project’s architecture and coding style.
- **Reflection on Impact**:
  - **Speed**: Accelerated initial setup and reduced repetitive boilerplate work, letting me focus on core features.
  - **Quality**: Helpful for quick test templates and component skeletons, but required careful review; human oversight was essential to ensure correctness, security, and consistency.
  - **Workflow**: AI worked best as a companion for scaffolding and ideas, not as a replacement for design decisions or feature implementations. The balance kept code maintainable and aligned with project requirements.

## Troubleshooting

- **Frontend `npm install` fails**: Ensure Node.js version is 18+ and you have network access to npm registry.
- **Cannot connect to MongoDB**: Verify `MONGODB_URI` in `.env` and that MongoDB is running.
- **Auth issues**: Confirm `JWT_SECRET` is set and browser accepts cookies; clear cookies and retry login.
- **CORS errors**: Keep backend on `http://localhost:3000` and frontend on `http://localhost:5173` or adjust CORS `origin` in `app.js`.

## License

This project is for learning and demonstration purposes.
