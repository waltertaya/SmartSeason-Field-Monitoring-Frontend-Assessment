# SmartSeason Field Monitoring System — Frontend

React frontend for the SmartSeason Field Monitoring System, built with **Vite + React + Tailwind CSS**.

## Setup

### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:8000` (see backend README)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so no CORS issues in development.

## Features

### Admin
- Dashboard with total fields, status breakdown (active/at risk/completed), stage breakdown, and recent updates feed
- Full field list with search and stage filter
- Create / edit / delete fields
- Assign fields to field agents
- View all field update history

### Field Agent
- Dashboard showing only assigned fields and their stats
- View assigned fields and their details
- Log field updates (stage + notes)
- View own update history per field

## Tech Stack

- **Vite + React 19** — fast dev experience
- **React Router v6** — client-side routing
- **Axios** — API client with JWT interceptors (auto-refresh on 401)
- **Tailwind CSS v4** — utility-first styling
- **Context API** — lightweight auth state management

## Project Structure

```
src/
  api/          # axios instance + API call functions
  context/      # AuthContext (user state, login/logout)
  components/   # Navbar, Layout, ProtectedRoute, badges
  pages/        # Login, Dashboard, Fields, FieldDetail
```
