# Fluxo.io Architecture Guide

## 📁 Project Structure

```
fluxo.io/
├── apps/                          # Applications
│   ├── web/                       # Frontend (Next.js + React Flow)
│   ├── api-gateway/               # API Gateway (Next.js API)
│   ├── auth/                      # Auth microservice (Next.js API)
│   ├── user-service/              # User microservice (Next.js API)
│   └── docs/                      # Documentation site
├── packages/                      # Shared packages
│   ├── auth-utils/                # Auth utilities, middleware & service clients
│   ├── database-utils/            # Database utilities & Prisma
│   ├── ui/                        # Shared UI components
│   ├── eslint-config/             # ESLint configurations
│   └── typescript-config/         # TypeScript configurations
└── root files...
```

## 📦 Dependency Management Strategy

### 1. **App-Specific Dependencies**

Install in the **respective app folder**:

```bash
# Frontend dependencies (React Flow, UI libraries)
cd apps/web
pnpm add reactflow @headlessui/react

# Auth microservice dependencies (NextAuth, OAuth providers)
cd apps/auth
pnpm add next-auth @auth/prisma-adapter

# Backend microservice dependencies
cd apps/api
pnpm add express prisma @prisma/client
```

### 2. **Shared Dependencies**

Install in **packages** for reuse across apps:

```bash
# Shared auth utilities
cd packages/auth-utils
pnpm add jsonwebtoken bcryptjs

# Shared database utilities
cd packages/database-utils
pnpm add prisma @prisma/client

# Shared UI components (if multiple apps need React Flow)
cd packages/ui
pnpm add reactflow
```

### 3. **Root Dependencies**

Only for **build tools, dev tools, and workspace management**:

```bash
# At root level
pnpm add -D -w typescript eslint prettier turbo
```

## 🔐 Authentication Architecture

### **Shared Auth Package** (`packages/auth-utils/`)

```typescript
// packages/auth-utils/src/index.ts
export * from "./jwt"; // JWT token utilities
export * from "./user"; // User validation & password hashing
export * from "./middleware"; // Auth middleware for Next.js
```

### **Auth Middleware Usage**

#### 1. **Protect API Routes**

```typescript
// apps/web/app/api/profile/route.ts
import { authMiddleware, AuthenticatedRequest } from "@repo/auth-utils";

export async function GET(request: NextRequest) {
  const authResponse = authMiddleware(request);
  if (authResponse.status !== 200) return authResponse;

  const authRequest = request as AuthenticatedRequest;
  const { userId, email, role } = authRequest.auth!;

  return NextResponse.json({ user: { id: userId, email, role } });
}
```

#### 2. **Role-Based Access Control**

```typescript
// apps/web/app/api/admin/route.ts
import { withRole } from "@repo/auth-utils";

export async function POST(request: NextRequest) {
  const roleResponse = withRole(["admin"])(request);
  if (roleResponse.status !== 200) return roleResponse;

  // Only admins can access this route
  return NextResponse.json({ message: "Admin action completed" });
}
```

#### 3. **Next.js Middleware (Route Protection)**

```typescript
// apps/web/middleware.ts
import { authMiddleware, optionalAuthMiddleware } from "@repo/auth-utils";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/home")) {
    return authMiddleware(request);
  }

  // Optional auth for other routes
  return optionalAuthMiddleware(request);
}
```

## 🏗️ Microservice Structure

### **Auth Microservice** (`apps/auth/`)

```
apps/auth/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts      # POST /api/auth/login
│   │       ├── register/route.ts   # POST /api/auth/register
│   │       └── refresh/route.ts    # POST /api/auth/refresh
│   └── page.tsx                    # Auth service dashboard
├── package.json
└── middleware.ts                   # Auth-specific middleware
```

### **Frontend App** (`apps/web/`)

```
apps/web/
├── app/
│   ├── dashboard/                  # Protected routes
│   ├── api/
│   │   └── profile/route.ts        # Uses auth middleware
│   └── page.tsx
├── components/
│   └── FlowDiagram.tsx             # React Flow component
├── middleware.ts                   # Route protection
└── package.json                    # Includes reactflow dependency
```

## 🔄 Data Flow Example (API Gateway Pattern)

### **1. User Login Flow**

```
Frontend (web) → API Gateway → Auth Service → Database
     ↓
API Gateway → Frontend (tokens)
```

### **2. Protected Route Access**

```
User Request → API Gateway → Auth Service (validate token) → Microservice
```

### **3. Service Communication**

```
Frontend → API Gateway → Auth Service (validate) → User Service → Database
```

### **4. Microservice Communication**

```
API Gateway → Auth Service (port 3001)
API Gateway → User Service (port 3002)
API Gateway → Payment Service (port 3003)
```

## 🚀 Development Commands

### **Install Dependencies**

```bash
# Install all workspace dependencies
pnpm install

# Install app-specific dependency
cd apps/web && pnpm add reactflow

# Install shared package dependency
cd packages/auth-utils && pnpm add jsonwebtoken
```

### **Run Applications**

```bash
# Run all apps in development
pnpm dev

# Run specific app
cd apps/web && pnpm dev
cd apps/auth && pnpm dev --port 3001
```

### **Build & Deploy**

```bash
# Build all packages and apps
pnpm build

# Build specific app
cd apps/web && pnpm build
```

## 📋 Best Practices

### **1. Package Organization**

- **Apps**: Self-contained applications with their own dependencies
- **Packages**: Reusable utilities shared across apps
- **Root**: Only build tools and workspace management

### **2. Middleware Placement**

- **Shared middleware**: In `packages/auth-utils/src/middleware.ts`
- **App-specific middleware**: In each app's `middleware.ts`
- **API route middleware**: Imported from shared packages

### **3. Dependency Management**

- Install app-specific deps in app folders
- Install shared deps in package folders
- Use workspace references (`workspace:*`) for internal packages

### **4. Type Safety**

- Export types from shared packages
- Use TypeScript across all packages
- Share type definitions via `@repo/typescript-config`

This architecture ensures:

- ✅ **Code Reusability**: Shared auth logic across all apps
- ✅ **Type Safety**: Consistent types across the monorepo
- ✅ **Scalability**: Easy to add new microservices
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Performance**: Optimized builds with Turborepo caching
