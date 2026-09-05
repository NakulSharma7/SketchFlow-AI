# SketchFlow AI

> The intelligent whiteboard for software engineers and creators. Draw manual flowcharts or prompt AI to build complex backend, auth, and database architecture diagrams in seconds.

## Architecture

This project is a monorepo containing:
- **`frontend/`**: React 19 + Vite + TypeScript + Tailwind CSS
- **`backend/`**: Express + TypeScript + Prisma ORM (SQLite) + Google Gemini AI

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```
Backend runs at `http://localhost:5000`.

### 2. Frontend Setup

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Environment Configuration

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

## Features

- **Whiteboard Canvas**: Freehand sketching, shapes (rectangles, circles, arrows), text, and style customization.
- **AI Architecture Generation**: Generate flowcharts, sequence diagrams, and architecture blueprints with Gemini AI.
- **Auth & Board Persistence**: JWT authentication with bcrypt hashing, boards saved in SQLite database via Prisma.
