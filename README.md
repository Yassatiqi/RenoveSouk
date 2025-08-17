# RenoveSouk - Marketplace for Renovation Materials

A full-stack marketplace application for renovation materials built with Next.js frontend and Python Flask backend.

## Architecture

This is a monorepo managed by Turborepo containing:

- **Frontend** (`apps/web`): Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend** (`apps/api`): Python Flask API with SQLAlchemy and SQLite

## Features

### Frontend (Next.js)

- **TypeScript** - For type safety and improved developer experience
- **Next.js 15** - Full-stack React framework with App Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **React Query** - Server state management
- **Next Themes** - Dark/light mode support
- **Zod** - Schema validation

### Backend (Python Flask)

- **Flask** - Lightweight web framework
- **SQLAlchemy** - Database ORM
- **Flask-Migrate** - Database migrations
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite** - Development database

### Development Tools

- **Biome** - Fast linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system
- **Bun** - Fast package manager and runtime

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (v1.2.17 or higher)
- **Python** (v3.11 or higher)
- **Git**

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Yassatiqi/RenoveSouk.git
cd RenoveSouk
```

2. **Install all dependencies:**

**For Windows:**

```bash
bun run setup
```

This will:

- Install Node.js dependencies with Bun
- Create Python virtual environment
- Install Python dependencies

### Manual Setup (Alternative)

If the automatic setup doesn't work:

1. **Install Node.js dependencies:**

```bash
bun install
```

2. **Setup Python environment:**

**Windows:**

```bash
cd apps/api
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Development

**Start all services (recommended):**

```bash
bun dev
```

This will start:

- Next.js frontend on [http://localhost:3001](http://localhost:3001)
- Flask API on [http://localhost:5001](http://localhost:5001)

**Start services individually:**

```bash
# Frontend only
bun dev:web

# Backend only
bun dev:api
```

## Project Structure

```
RenoveSouk/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │
│   └── api/                 # Python Flask Backend
│
├── biome.json              # Linting & formatting config
├── turbo.json             # Turborepo configuration
├── package.json           # Root package configuration
└── README.md
```

## Available Scripts

### Root Level Scripts

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `bun dev`         | Start all applications in development mode |
| `bun build`       | Build all applications for production      |
| `bun setup`       | Install all dependencies (Windows)         |
| `bun dev:web`     | Start only the frontend application        |
| `bun dev:api`     | Start only the backend API                 |
| `bun start`       | Start all applications in production mode  |
| `bun check-types` | Check TypeScript types across all apps     |
| `bun check`       | Run Biome formatting and linting           |
| `bun format`      | Format code with Biome                     |
| `bun lint`        | Lint code with Biome                       |

### Python Virtual Environment

**Activate Python environment:**

**Windows:**

```bash
cd apps/api
.\venv\Scripts\activate
```

**Install new Python packages:**

```bash
# After activating virtual environment
pip install package_name
pip freeze > requirements.txt  # Update requirements
```

## Database

The application uses SQLite for development with the following features:
