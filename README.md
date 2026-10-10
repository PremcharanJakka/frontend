# FinPath — Custom React + Spring Boot + MySQL

A clean-room full-stack implementation of the FinPath personal-finance product using the existing FinPath interface as the visual reference. The application no longer depends on Supabase.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide
- Backend: Java 21, Spring Boot 3.5, Spring Security, JWT, Spring Data JPA, JDBC
- Database: MySQL 8+

## Project structure

```text
FinPath/
  src/                 # React frontend — same FinPath pages/components/style language
  backend/              # Spring Boot REST API
    src/main/java/...   # auth, security, controllers, services
    src/main/resources/schema.sql
  .env.example
  backend/.env.example
```

## 1. MySQL

Create the database once:

```sql
CREATE DATABASE finpath CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The Spring Boot backend creates the tables on startup from `backend/src/main/resources/schema.sql`.

## 2. Backend configuration

Set environment variables or edit `backend/src/main/resources/application.properties`:

```text
DB_URL=jdbc:mysql://localhost:3306/finpath?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=use-a-long-random-secret-at-least-32-characters
JWT_EXPIRATION_MS=86400000
```

Start backend:

```bash
cd backend
mvn spring-boot:run
```

API health check: `http://localhost:8080/api/health`

## 3. Frontend

Create `.env.local`:

```text
VITE_API_URL=http://localhost:8080/api
```

Then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Authentication

Spring Security handles registration and login. Passwords are stored as BCrypt hashes. Successful login returns a signed JWT. The React app stores the token locally and sends it as a Bearer token to protected API endpoints.

## Security model

- All finance records are scoped to the authenticated user's ID.
- The backend never trusts a client-supplied `user_id` on inserts.
- Update/delete operations require both record ID and authenticated owner.
- The JWT secret must be changed before deployment.
- CORS is restricted to the local Vite origins by default.

## Notes

The current UI is intentionally preserved as the visual baseline. The Supabase client has been replaced with a small API compatibility layer so existing page data flows can migrate to the Spring Boot REST API without redesigning the interface.

For production, add HTTPS, refresh-token rotation, email delivery for password resets, rate limiting, structured logging, and environment-specific CORS/DB settings.
