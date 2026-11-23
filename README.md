# SketchFlow AI

**The intelligent whiteboard for software engineers and creators.**

Draw manual flowcharts or prompt AI to build complex backend, authentication, and database architecture diagrams in seconds.

## 🚀 Overview

SketchFlow AI is an AI-powered interactive whiteboard that combines traditional drawing tools with AI-based diagram generation.

It allows users to create diagrams manually using shapes, arrows, text, and freehand drawing, or generate structured diagrams simply by describing their ideas in natural language.

Powered by Google Gemini AI, SketchFlow transforms prompts into visual diagrams, making it easier to brainstorm, visualize technical concepts, and design software architectures.

## ✨ Features

### 🎨 Interactive Whiteboard
- Freehand drawing.
- Create rectangles, diamonds, and ellipses.
- Add arrows, connectors, and text.
- Custom eraser with geometric hit-testing.
- Pan and zoom functionality.
- Undo and redo support.
- Custom HTML5 Canvas rendering engine.

### 🤖 AI-Powered Diagram Generation
- Generate diagrams using natural-language prompts.
- Generate flowcharts.
- Generate sequence diagrams.
- Generate software architecture diagrams.
- Convert AI-generated structured data into visual canvas elements.
- Fallback procedural template generators.

### 🔐 Authentication
- User registration and login.
- JWT-based authentication.
- Password hashing using bcryptjs.
- Protected API routes.

### 💾 Data Management
- Save whiteboard states.
- Retrieve previously saved boards.
- Store serialized canvas data.
- Database management using Prisma ORM and SQLite.

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- React Router DOM v7
- HTML5 Canvas API

### Backend
- Node.js
- Express 4
- TypeScript
- JWT (`jsonwebtoken`)
- `bcryptjs`
- Zod

### Database
- SQLite
- Prisma ORM 5

### AI Integration
- Google Gemini AI
- Gemini 1.5 Flash
- `@google/generative-ai`

## 🏗️ Architecture

SketchFlow AI follows a full-stack client-server architecture.

```text
                  USER
                    |
                    v
          REACT + TYPESCRIPT
                    |
          INTERACTIVE WHITEBOARD
                    |
              HTTP REQUESTS
                    |
                    v
           NODE.JS + EXPRESS
                    |
          +---------+---------+
          |                   |
          v                   v
       PRISMA              GEMINI API
          |                   |
          v                   v
        SQLITE          AI-GENERATED DATA
          |                   |
          +---------+---------+
                    |
                    v
                 FRONTEND
                    |
                    v
               HTML5 CANVAS
```

## ⚙️ How It Works

1. The user opens SketchFlow AI and registers or logs in.
2. The user creates or opens a whiteboard.
3. The user can draw manually using the available drawing tools.
4. Alternatively, the user enters a natural-language prompt to generate a diagram.
5. The backend sends the prompt to Google Gemini.
6. Gemini generates structured diagram information, including elements, labels, connectors, and coordinates.
7. The backend processes the response and sends the generated data to the frontend.
8. The frontend renders the diagram using the custom HTML5 Canvas engine.
9. Users can edit and save their diagrams.

## 🧠 Custom Canvas Engine

One of the core parts of SketchFlow AI is its custom HTML5 Canvas implementation.

The canvas engine handles:
- Vector geometry and element rendering.
- Freehand drawing paths.
- Shape and text rendering.
- Point-to-segment distance calculations.
- Hit-testing for selecting and erasing elements.
- Pan and zoom transformations.
- Undo and redo history management.

## 🔑 Authentication Flow

SketchFlow AI uses JWT-based authentication.

- Passwords are hashed using bcryptjs before storage.
- JWT tokens are generated after successful authentication.
- Protected API routes verify the token before allowing access.
- Zod validates incoming request data.

## 📂 Project Structure

```text
SketchFlow-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   │   └── useCanvas.ts
│   │   └── ...
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── aiService.ts
│   │   ├── prisma/
│   │   └── ...
│   └── package.json
├── README.md
└── .gitignore
```


## 💻 Getting Started

### Prerequisites

- Node.js
- npm
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/NakulSharma7/SketchFlow-AI.git
cd SketchFlow-AI
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Configure environment variables

Create the backend `.env` file and configure the values expected by your application. For example:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_gemini_api_key"
```

Use the exact environment variable names and database URL expected by your code. Do not commit real secrets to Git.

### 5. Set up the database

```bash
cd backend
npm run prisma:generate
```

### 6. Start the application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`.

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 🎯 Project Objective

The main objective of SketchFlow AI is to simplify the process of creating and visualizing technical diagrams by combining an interactive whiteboard with AI-powered diagram generation.

Instead of manually creating every element, users can describe their ideas and let AI generate a structured visual representation.

## 🔮 Future Improvements

- Real-time collaborative whiteboarding.
- Cloud-based board storage.
- Export diagrams in multiple formats.
- More AI-generated diagram types.
- Advanced editing and customization tools.

## 👨‍💻 Author

**Nakul Sharma**

G.L. Bajaj Institute of Technology and Management

---

⭐ If you find SketchFlow AI interesting, consider giving the repository a star!
