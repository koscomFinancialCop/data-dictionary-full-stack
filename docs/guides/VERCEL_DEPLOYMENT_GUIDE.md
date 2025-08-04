# Vercel Deployment Guide with Prisma Accelerate

## Overview

This guide covers the complete setup for deploying DataDictionary to Vercel with Prisma Accelerate for database connection pooling and global edge caching.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vercel Edge    │────▶│ Prisma Accelerate│────▶│  PostgreSQL DB  │
│  Functions      │     │  (Connection     │     │  (Hosted)       │
│                 │     │   Pooling)       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

1. Vercel account with Pro plan (for longer function duration)
2. Prisma Accelerate account
3. PostgreSQL database (already configured)

## Step 1: Environment Variables Setup

### Required Variables in Vercel Dashboard

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```bash
# Prisma Accelerate Connection
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Direct Database Connection (for migrations)
DIRECT_URL="postgres://username:password@host:5432/database?sslmode=require"

# RAG Pipeline Configuration
RAG_WEBHOOK_URL="https://koscom.app.n8n.cloud/webhook/invoke"
RAG_TIMEOUT="30000"
RAG_MAX_RETRIES="3"
ENABLE_RAG_SUGGESTIONS="true"
RAG_MIN_CONFIDENCE="0.7"

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
```

## Step 2: Prisma Configuration

### Update prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Create .env.production

```bash
# Production environment variables template
DATABASE_URL="${DATABASE_URL}"
DIRECT_URL="${DIRECT_URL}"
RAG_WEBHOOK_URL="${RAG_WEBHOOK_URL}"
RAG_TIMEOUT="${RAG_TIMEOUT}"
RAG_MAX_RETRIES="${RAG_MAX_RETRIES}"
ENABLE_RAG_SUGGESTIONS="${ENABLE_RAG_SUGGESTIONS}"
RAG_MIN_CONFIDENCE="${RAG_MIN_CONFIDENCE}"
```

## Step 3: Build Configuration

### Update vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["icn1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Step 4: Database Migration Strategy

### Option 1: Build-time Migration (Current)
- Migrations run during build using `prisma migrate deploy`
- Requires DIRECT_URL in build environment
- Best for simple deployments

### Option 2: Separate Migration Process
1. Create migration script:

```bash
# scripts/migrate-production.sh
#!/bin/bash
export DATABASE_URL=$DIRECT_URL
npx prisma migrate deploy
```

2. Run migrations separately:
```bash
npm run migrate:production
```

## Step 5: Connection Pooling Optimization

### Update lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
  
  // Enable Accelerate extension in production
  if (process.env.NODE_ENV === 'production') {
    return prisma.$extends(withAccelerate())
  }
  
  return prisma
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

## Step 6: Deployment Process

### Initial Deployment

1. Push to GitHub:
```bash
git add .
git commit -m "Configure Vercel deployment with Prisma Accelerate"
git push origin main
```

2. In Vercel Dashboard:
   - Import project from GitHub
   - Configure environment variables
   - Deploy

### Subsequent Deployments

1. For schema changes:
```bash
# Generate migration locally
npx prisma migrate dev --name your_migration_name

# Commit migration files
git add prisma/migrations
git commit -m "Add migration: your_migration_name"
git push
```

2. Vercel will automatically:
   - Run migrations
   - Generate Prisma Client
   - Build and deploy

## Step 7: Monitoring and Performance

### Database Monitoring

1. Prisma Accelerate Dashboard:
   - Monitor connection pool usage
   - Track query performance
   - View error logs

2. Vercel Functions:
   - Monitor function duration
   - Check error rates
   - Track cold starts

### Performance Optimization

1. **Connection Pool Settings**:
```typescript
// For high-traffic applications
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Accelerate handles pooling
})
```

2. **Edge Caching**:
```typescript
// Enable caching for read queries
const cachedData = await prisma.variableMapping.findMany({
  cacheStrategy: {
    ttl: 60, // Cache for 60 seconds
    swr: 120, // Serve stale while revalidating for 120 seconds
  },
})
```

## Step 8: Backup and Recovery

### Automated Backups

1. Create backup script:
```typescript
// scripts/backup-database.ts
import { exportToJSON } from './migrate-to-production'

async function scheduleBackup() {
  // Run daily at 2 AM KST
  await exportToJSON()
  // Upload to S3 or other storage
}
```

2. Set up Vercel Cron:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/backup",
    "schedule": "0 17 * * *"  // 2 AM KST
  }]
}
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**:
   - Check Prisma Accelerate status
   - Verify DATABASE_URL format
   - Ensure IP allowlisting if required

2. **Migration Failures**:
   - Use DIRECT_URL for migrations
   - Check database permissions
   - Verify schema compatibility

3. **Performance Issues**:
   - Enable query logging in development
   - Use Prisma Studio for debugging
   - Monitor Accelerate metrics

### Debug Commands

```bash
# Test database connection
npx prisma db pull

# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status

# Open Prisma Studio
npx prisma studio
```

## Security Best Practices

1. **Environment Variables**:
   - Never commit .env files
   - Use Vercel's encrypted variables
   - Rotate API keys regularly

2. **Database Access**:
   - Use Prisma Accelerate for pooling
   - Implement query timeouts
   - Monitor for suspicious activity

3. **API Security**:
   - Implement rate limiting
   - Validate all inputs
   - Use CORS appropriately

## Next Steps

1. ✅ Set up environment variables in Vercel
2. ✅ Deploy initial version
3. ✅ Run production migrations
4. ⬜ Set up monitoring alerts
5. ⬜ Configure automated backups
6. ⬜ Implement performance monitoring
7. ⬜ Create disaster recovery plan