# API Design Specification

## Overview

This document defines the API architecture, patterns, and data flow for the Next.js fullstack application. The design prioritizes type safety, performance, and developer experience.

## API Architecture Patterns

### 1. Route Organization

```
app/api/
├── v1/                         # Versioned API
│   ├── auth/                   # Authentication endpoints
│   │   ├── login/
│   │   │   └── route.ts       # POST /api/v1/auth/login
│   │   ├── logout/
│   │   │   └── route.ts       # POST /api/v1/auth/logout
│   │   ├── refresh/
│   │   │   └── route.ts       # POST /api/v1/auth/refresh
│   │   └── me/
│   │       └── route.ts       # GET /api/v1/auth/me
│   ├── users/
│   │   ├── route.ts           # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts       # GET, PUT, DELETE
│   │       └── avatar/
│   │           └── route.ts   # POST (upload), DELETE
│   └── middleware.ts          # API middleware
├── webhooks/                   # External webhooks
│   ├── stripe/
│   └── github/
└── trpc/                      # tRPC endpoints (optional)
    └── [trpc]/
        └── route.ts
```

### 2. Request/Response Standards

#### HTTP Status Codes
```typescript
enum ApiStatus {
  // Success
  OK = 200,                    // Success with data
  CREATED = 201,               // Resource created
  ACCEPTED = 202,              // Async operation started
  NO_CONTENT = 204,            // Success with no data

  // Client Errors
  BAD_REQUEST = 400,           // Invalid request
  UNAUTHORIZED = 401,          // Authentication required
  FORBIDDEN = 403,             // Insufficient permissions
  NOT_FOUND = 404,             // Resource not found
  CONFLICT = 409,              // Resource conflict
  UNPROCESSABLE = 422,         // Validation errors
  TOO_MANY_REQUESTS = 429,     // Rate limit exceeded

  // Server Errors
  INTERNAL_ERROR = 500,        // Server error
  NOT_IMPLEMENTED = 501,       // Feature not available
  SERVICE_UNAVAILABLE = 503,   // Service down
}
```

#### Response Format
```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string; // Development only
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}
```

### 3. Authentication & Authorization

#### JWT Token Structure
```typescript
interface JWTPayload {
  // Standard claims
  sub: string;          // User ID
  iat: number;          // Issued at
  exp: number;          // Expires at
  
  // Custom claims
  email: string;
  role: UserRole;
  permissions: string[];
  session_id: string;
}

interface RefreshToken {
  token: string;
  user_id: string;
  expires_at: Date;
  device_info?: {
    ip: string;
    user_agent: string;
    device_id?: string;
  };
}
```

#### Authorization Middleware
```typescript
// lib/api/auth.ts
export async function requireAuth(
  request: NextRequest,
  options?: {
    roles?: UserRole[];
    permissions?: string[];
  }
): Promise<AuthContext | NextResponse> {
  const token = await getToken(request);
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (options?.roles && !options.roles.includes(token.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return { user: token };
}
```

### 4. Data Validation

#### Input Validation with Zod
```typescript
// lib/validations/user.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(50),
  role: z.enum(['user', 'admin']).default('user'),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});
```

#### Validation Middleware
```typescript
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return { validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors,
            },
          },
          { status: 422 }
        );
      }
      throw error;
    }
  };
}
```

### 5. API Rate Limiting

```typescript
// lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiter = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),
  
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
    analytics: true,
  }),
  
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
    analytics: true,
  }),
};
```

### 6. Error Handling

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

export const ErrorCodes = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_FORBIDDEN: 'RESOURCE_FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
```

## Server Actions

### Action Patterns
```typescript
// app/actions/user.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateUserInput = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUser(input: z.infer<typeof CreateUserInput>) {
  // Validate input
  const validated = CreateUserInput.parse(input);
  
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Execute business logic
  const user = await db.user.create({
    data: validated,
  });
  
  // Revalidate cache
  revalidatePath('/users');
  
  return user;
}
```

### Error Boundaries for Actions
```typescript
// lib/actions/safe-action.ts
export function createSafeAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (validatedData: TInput) => Promise<TOutput>
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const validatedData = schema.parse(input);
      const result = await handler(validatedData);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          fieldErrors: error.flatten().fieldErrors,
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}
```

## Data Flow Patterns

### 1. Client-Server Communication

```typescript
// Client Component
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

export function UserList() {
  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });
  
  // Mutate data
  const createMutation = useMutation({
    mutationFn: api.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

### 2. Real-time Updates

```typescript
// Using Server-Sent Events
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const subscription = subscribeToUpdates((data) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      });
      
      request.signal.addEventListener('abort', () => {
        subscription.unsubscribe();
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 3. File Uploads

```typescript
// app/api/v1/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }
  
  // Validate file
  const validation = validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });
  
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  
  // Upload to storage
  const url = await uploadToStorage(file);
  
  return NextResponse.json({
    success: true,
    data: { url },
  });
}
```

## API Documentation

### OpenAPI Specification
```yaml
openapi: 3.1.0
info:
  title: Application API
  version: 1.0.0
  description: RESTful API for the application

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  expires_in:
                    type: integer
```

## Performance Optimization

### 1. Response Caching
```typescript
// Cache API responses
export async function GET(request: Request) {
  const cacheKey = new URL(request.url).toString();
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
      },
    });
  }
  
  const data = await fetchData();
  await cache.set(cacheKey, data, { ex: 300 }); // 5 minutes
  
  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
    },
  });
}
```

### 2. Database Query Optimization
```typescript
// Use database transactions
export async function transferCredits(
  fromUserId: string,
  toUserId: string,
  amount: number
) {
  return await db.$transaction(async (tx) => {
    // Deduct from sender
    const sender = await tx.user.update({
      where: { id: fromUserId },
      data: { credits: { decrement: amount } },
    });
    
    if (sender.credits < 0) {
      throw new Error('Insufficient credits');
    }
    
    // Add to receiver
    await tx.user.update({
      where: { id: toUserId },
      data: { credits: { increment: amount } },
    });
    
    // Log transaction
    await tx.transaction.create({
      data: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        type: 'TRANSFER',
      },
    });
  });
}
```

## Security Best Practices

### 1. Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

### 2. SQL Injection Prevention
```typescript
// Always use parameterized queries
const users = await db.$queryRaw`
  SELECT * FROM users 
  WHERE email = ${email} 
  AND status = ${status}
`;
```

### 3. CORS Configuration
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Configure CORS
  response.headers.set('Access-Control-Allow-Origin', process.env.CLIENT_URL!);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}
```

## Testing Strategy

### API Testing
```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/v1/users/route';

describe('/api/v1/users', () => {
  it('should list users', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const response = await GET(req as any);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

This comprehensive API design provides a solid foundation for building scalable, secure, and maintainable APIs in your Next.js application.