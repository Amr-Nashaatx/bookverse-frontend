# Book Review Frontend

React frontend for the Book Review app. It connects to the Book Review API and provides the user-facing experience for authentication, browsing books, writing reviews, managing shelves, author onboarding, publishing books, editing chapters, preview sharing, and notifications.

## Linked Repository

This frontend is designed to work with the backend API repository:

- Backend API: https://github.com/Amr-Nashaatx/book-review-api

## Tech Stack

- React 19
- Vite
- React Router
- Zustand
- Mantine UI
- TipTap editor
- Axios
- React Toastify
- dnd kit helpers
- ESLint

## Features

- Signup, login, logout, protected routes, and persistent auth state
- Book browsing with filters, genre options, sorting, and load-more pagination
- Book detail pages with reviews and shelf actions
- Create and edit book flows for authenticated users
- Author onboarding and author-owned book management
- Chapter workspace with editing and chapter navigation
- Drag/reorder-friendly chapter tooling through dnd kit
- Shelf pages and add-to-shelf interactions
- Avatar and cover upload fields
- Preview sharing flow for draft/published book previews
- Notification bell with unread count, read actions, and SSE updates
- Toasts, reusable error boundaries, and shared layout components

## Project Structure

```text
src/
  components/       Shared UI components
  hooks/            Data fetching and interaction hooks
  layouts/          App and workspace layouts
  pages/            Route-level pages
  stores/           Zustand state stores
  styles/           Global styles
  theme/            Mantine theme setup
  utils/            API request helpers and utilities
docs/               Project notes and migration docs
public/             Static assets
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.development` in the frontend repo:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the backend API first, then run the frontend:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev      # Start the Vite dev server
npm run build    # Build production assets
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Routes

```text
/signup
/login
/profile
/books
/books/new
/books/:id
/books/:id/edit
/books/:id/chapters
/author/onboarding
/author/my-books
/shelves/:id
```

## API Integration Notes

- The API base URL is read from `VITE_API_BASE_URL`.
- Requests are sent with credentials so the API can use HTTP-only auth cookies.
- Expired sessions trigger an `auth:expired` browser event and redirect users to login.
- Notifications connect to the backend SSE stream at `/notifications/stream`.
- The backend repository linked above contains the Express API, database models, and test suite.

## Backend Requirement

Run the backend API at `http://localhost:5000/api` before using the app locally. See the linked backend README for environment variables, Docker Compose, database setup, and API test commands.
