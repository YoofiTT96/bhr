# Nonnie HR System

Enterprise HR Management System built with React, Spring Boot, and PostgreSQL.

## Overview

Nonnie is a comprehensive HR management platform similar to HiBob, designed to handle all aspects of human resource management including:

- **Employee Management**: Complete employee lifecycle with hierarchical reporting structure
- **Time & Attendance Tracking**: Clock in/out, time tracking per project
- **Time Off Management**: Request, approve, and track paid/unpaid leave
- **Project & Client Management**: Assign employees to projects and clients
- **Document Signing**: Digital document signing within the application
- **Company Blog**: Internal communication with audience controls
- **Microsoft Integration**: SSO and calendar integration

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.2 with Java 21
- **Database**: PostgreSQL 15+ with Flyway migrations
- **Security**: Spring Security + OAuth2 + JWT
- **API**: Microsoft Graph API for calendar integration
- **ORM**: JPA/Hibernate with JSONB support

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit + React Query
- **Styling**: TailwindCSS 4
- **Routing**: React Router 7
- **Forms**: React Hook Form + Zod validation

### Infrastructure
- **Database**: PostgreSQL (Docker)
- **Authentication**: Microsoft Azure AD OAuth2

## Project Structure

```
nonnie-hr-system/
├── backend/           # Spring Boot application
├── frontend/          # React application
├── docs/              # Documentation
└── docker/            # Docker configurations
```

## Getting Started

### Prerequisites

- Java 21 JDK
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Maven 3.9+
- npm or yarn

### Quick Start

#### 1. Start PostgreSQL Database

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Then build and run
./mvnw clean install
./mvnw spring-boot:run
```

Backend will start at: http://localhost:8080

#### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Then install and run
npm install
npm run dev
```

Frontend will start at: http://localhost:5173

## Environment Configuration

### Backend (.env)

See [backend/.env.example](backend/.env.example) for required environment variables:
- Database credentials
- JWT secret
- Azure AD / Microsoft OAuth2 credentials
- CORS settings

### Frontend (.env)

See [frontend/.env.example](frontend/.env.example) for required environment variables:
- API base URL
- Microsoft Azure AD configuration

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[API Documentation](docs/API_DOCUMENTATION.md)** - REST API endpoints reference
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Database design and ERD
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup and development instructions
- **[Decisions Log](docs/DECISIONS.md)** - Architectural decision records

## Key Features

### Configurable Employee Sections

Employees can have dynamic custom sections (payroll, hobbies, emergency contacts, etc.) configured at runtime without code changes. Uses PostgreSQL JSONB for flexible data storage.

### Hierarchical Reporting Structure

Self-referencing employee relationships with circular reference prevention. Supports organization charts and team hierarchies.

### Role-Based Access Control (RBAC)

Four default roles (Admin, HR Manager, Manager, Employee) with granular permissions for different resources and actions.

### Microsoft Integration

- **Single Sign-On (SSO)**: Azure AD OAuth2 authentication
- **Calendar Sync**: Time-off requests sync to Outlook calendar
- **User Profile**: Fetch user details from Microsoft Graph

## Development

### Backend Development

```bash
cd backend

# Run with hot reload
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build for production
./mvnw clean package
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

- Unit tests with JUnit 5 and Mockito
- Integration tests with Testcontainers
- Repository tests with @DataJpaTest

### Frontend Tests (Coming Soon)

- Component tests with Vitest
- Integration tests with React Testing Library
- E2E tests with Playwright

## Database Migrations

Database schema is managed with Flyway. Migrations are in `backend/src/main/resources/db/migration/`.

To run migrations:
```bash
./mvnw flyway:migrate
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

Copyright © 2026 Turntabl. All rights reserved.

## Contact

For questions or support, please contact the development team.
