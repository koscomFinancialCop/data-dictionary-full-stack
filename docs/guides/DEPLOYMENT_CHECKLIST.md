# Vercel Deployment Checklist

## Pre-Deployment Checklist

### 1. Local Testing
- [ ] Run `npm run build` locally to ensure build succeeds
- [ ] Test all API endpoints locally
- [ ] Verify Prisma Client generation works
- [ ] Check migration files are committed

### 2. Environment Variables
Ensure these are set in Vercel Dashboard:

#### Required Variables
- [ ] `DATABASE_URL` - Prisma Accelerate connection string
- [ ] `DIRECT_URL` - Direct database connection for migrations
- [ ] `RAG_WEBHOOK_URL` - RAG pipeline webhook
- [ ] `RAG_TIMEOUT` - Request timeout (30000)
- [ ] `RAG_MAX_RETRIES` - Max retry attempts (3)
- [ ] `ENABLE_RAG_SUGGESTIONS` - Enable RAG feature (true)
- [ ] `RAG_MIN_CONFIDENCE` - Minimum confidence score (0.7)

#### Optional Variables
- [ ] `NEXT_PUBLIC_ANALYTICS_ID` - Analytics tracking ID
- [ ] `NODE_ENV` - Set to "production" (auto-set by Vercel)

### 3. Database Setup
- [ ] Verify Prisma Accelerate API key is valid
- [ ] Test direct database connection with psql or pgAdmin
- [ ] Ensure database allows connections from Vercel IPs
- [ ] Check SSL mode is set correctly

## Deployment Steps

### Step 1: Initial Setup
```bash
# 1. Push latest code
git add .
git commit -m "feat: Configure Vercel deployment with Prisma Accelerate"
git push origin main

# 2. In Vercel Dashboard
# - Import project from GitHub
# - Set environment variables
# - Choose "icn1" region for Korean users
```

### Step 2: First Deployment
1. Vercel will automatically:
   - Install dependencies
   - Generate Prisma Client
   - Run migrations (if DIRECT_URL is set in build env)
   - Build Next.js application
   - Deploy to edge network

2. Monitor deployment logs for:
   - Successful Prisma generation
   - Migration completion
   - Build success

### Step 3: Post-Deployment Verification
```bash
# 1. Check health endpoint
curl https://your-app.vercel.app/api/health

# 2. Test main features
# - Variable search
# - Translation
# - RAG suggestions
# - Dashboard stats
```

### Step 4: Production Data Migration
If migrating from local database:

```bash
# 1. Export local data
npm run migrate:export

# 2. Set production database URL
export PRODUCTION_DATABASE_URL="your-direct-db-url"

# 3. Run migration
npm run migrate:prod
```

## Troubleshooting Guide

### Build Failures

#### "Cannot find module '@prisma/client'"
```bash
# Solution: Ensure postinstall script runs
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

#### "P1001: Can't reach database server"
- Check DATABASE_URL format
- Verify Prisma Accelerate API key
- Ensure database accepts connections

#### "Migration failed"
- Use DIRECT_URL for migrations, not Accelerate URL
- Check database user has migration permissions
- Verify all migration files are committed

### Runtime Issues

#### Slow Performance
- Check Prisma Accelerate metrics
- Enable query caching for read-heavy operations
- Monitor function cold starts

#### Connection Timeouts
- Increase function maxDuration in vercel.json
- Check Prisma Accelerate connection pool settings
- Monitor database CPU and connections

#### 500 Errors
- Check function logs in Vercel dashboard
- Verify all environment variables are set
- Test database connection with health endpoint

## Performance Optimization

### 1. Edge Caching
```typescript
// Add caching headers for static data
export async function GET() {
  const data = await prisma.variableMapping.findMany()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

### 2. Query Optimization
```typescript
// Use select to fetch only needed fields
const mappings = await prisma.variableMapping.findMany({
  select: {
    id: true,
    korean: true,
    english: true,
    type: true
  },
  take: 100
})
```

### 3. Connection Pooling
- Prisma Accelerate handles this automatically
- Monitor pool usage in Accelerate dashboard
- Adjust based on traffic patterns

## Monitoring Setup

### 1. Vercel Analytics
- Enable Web Analytics in project settings
- Monitor Core Web Vitals
- Track API performance

### 2. Prisma Accelerate Dashboard
- Monitor query performance
- Check connection pool health
- Set up alerts for errors

### 3. Custom Monitoring
```typescript
// Add to API routes
console.log('API_METRIC', {
  endpoint: '/api/search',
  duration: endTime - startTime,
  status: 'success'
})
```

## Security Checklist

- [ ] All environment variables are encrypted in Vercel
- [ ] Database connection uses SSL
- [ ] API routes validate all inputs
- [ ] No sensitive data in logs
- [ ] CORS configured appropriately
- [ ] Rate limiting implemented for public APIs

## Rollback Plan

### Quick Rollback
1. In Vercel Dashboard:
   - Go to Deployments
   - Find previous working deployment
   - Click "..." menu → "Promote to Production"

### Database Rollback
```bash
# If migrations cause issues
npx prisma migrate resolve --rolled-back [migration_name]
```

## Success Criteria

- [ ] Health check returns 200 OK
- [ ] All pages load without errors
- [ ] Search functionality works
- [ ] RAG suggestions appear when enabled
- [ ] Dashboard shows correct stats
- [ ] Performance metrics meet targets:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1