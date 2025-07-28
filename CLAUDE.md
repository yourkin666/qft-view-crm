# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

**IMPORTANT**: Always respond in Chinese when working in this repository, regardless of the language used in comments, documentation, or user interface text within the codebase.

## Development Commands

### Full Stack Development
```bash
# Install all dependencies (root + backend + frontend)
npm run install:all

# Start both backend and frontend in development mode
npm run dev

# Build both backend and frontend for production
npm run build:all

# Start production build
npm start
```

### Backend Commands
```bash
cd backend

# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugging

# Production
npm run build          # Build TypeScript
npm run start:prod     # Start production server

# Database
npm run prisma:migrate # Run database migrations
npm run prisma:studio  # Open Prisma Studio GUI
npm run prisma:seed    # Seed database with test data
npm run db:reset       # Reset database and re-seed

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Run ESLint
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev            # Start Vite dev server (port 5173)
npm run preview        # Preview production build

# Production
npm run build          # Build for production
npm run type-check     # TypeScript type checking

# Testing
npm run cypress:open   # Open Cypress GUI
npm run cypress:run    # Run Cypress tests headless
npm run lint           # Run ESLint
```

## Architecture Overview

### Backend Architecture (NestJS)
- **Framework**: NestJS with TypeScript, following modular architecture
- **Database**: SQLite with Prisma ORM (configured for MySQL in production)
- **Authentication**: JWT with Passport.js strategies (local, JWT)
- **Authorization**: Role-based access control (RBAC) with guards and decorators
- **Key Modules**:
  - `auth/` - JWT authentication and Passport strategies
  - `users/` - User management with role-based permissions
  - `viewing-records/` - Core business logic for property viewing records
  - `api-keys/` - API key management for third-party integrations
  - `public/` - Public endpoints for external API access
  - `export/` - Excel/PDF export functionality
  - `common/` - Shared guards, decorators, and Prisma service

### Frontend Architecture (React)
- **Framework**: React 19 with TypeScript and Vite build tool
- **UI Library**: Ant Design 5.26 with responsive design
- **State Management**: Redux Toolkit with structured slices
- **Routing**: React Router Dom 7 with protected routes
- **Key Structure**:
  - `components/` - Reusable UI components including mobile-responsive cards
  - `pages/` - Route-based page components
  - `store/slices/` - Redux state management (auth, viewingRecords, apiKeys, users)
  - `services/` - API client configuration and service functions
  - `hooks/` - Custom hooks including responsive design hooks

### Database Schema
Core entities and relationships:
- **Users** → **Roles** (many-to-one): Role-based permissions
- **Users** → **ViewingRecords** (one-to-many): Agent assignment
- **Users** → **ApiKeys** (one-to-many): Creator tracking
- **ApiKeys** → **ViewingRecords** (one-to-many): Source tracking
- **Properties** → **ViewingRecords** (one-to-many): Property details

### Authentication & Authorization
- JWT tokens stored in localStorage with automatic refresh
- Role-based guards: `@Roles('admin')` decorator
- API key authentication for public endpoints: `@UseGuards(ApiKeyGuard)`
- Protected frontend routes with `AuthGuard` component

### API Integration Points
- Internal API: `/api/*` with JWT authentication
- Public API: `/api/public/*` with API key authentication
- CORS configured for frontend proxy during development
- Axios interceptors handle token management and error responses

## Development Patterns

### Backend Patterns
- Use `@Injectable()` services for business logic
- DTOs with `class-validator` for request validation
- Prisma transactions for complex database operations
- Custom decorators like `@Roles()` for authorization
- Module-based organization with clear separation of concerns

### Frontend Patterns
- Redux Toolkit `createAsyncThunk` for API calls
- Ant Design Form components with validation
- Responsive design using custom `useResponsive` hook
- Centralized API error handling in axios interceptors
- TypeScript interfaces in `types/index.ts`

### Testing Setup
- Backend: Jest for unit tests, supertest for e2e tests
- Frontend: Cypress for end-to-end testing
- Test database isolation using Prisma transactions

### Default Test Accounts
When working with authentication, use these seeded accounts:
- Admin: `admin` / `admin123` (full system access)
- Agent: `agent001` / `agent123` (limited to own records)

## Key Configuration Files
- `backend/prisma/schema.prisma` - Database schema
- `frontend/vite.config.ts` - Build configuration and API proxy
- `backend/src/main.ts` - NestJS bootstrap and CORS setup
- `frontend/src/services/api.ts` - Axios configuration and interceptors