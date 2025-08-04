# Vercel Deployment Troubleshooting Guide

## Common Deployment Failures and Solutions

### 1. Prisma Schema Validation Error

**Error**: `Environment variable not found: DIRECT_URL`

**Cause**: Prisma schema requires DIRECT_URL but it's not available during build

**Solution**: 
- The `setup-vercel-env.js` script now sets DIRECT_URL from DATABASE_URL during build
- Ensure DATABASE_URL is set in Vercel environment variables

### 2. Build Command Failures

**Error**: `prisma migrate deploy` fails during build

**Cause**: Migrations should not run during build time

**Solution**: 
- Build command updated to: `node scripts/setup-vercel-env.js && prisma generate && next build`
- Run migrations separately after deployment if needed

### 3. Module Not Found Errors

**Error**: Cannot find module '@/lib/prisma'

**Cause**: Path alias resolution issues

**Solution**: 
- Ensure tsconfig.json has correct path mappings
- Use relative imports as fallback

### 4. Environment Variables Not Available

**Error**: Missing required environment variables

**Cause**: Variables not set in Vercel dashboard

**Required Variables**:
```
DATABASE_URL         # Prisma Accelerate connection string
RAG_WEBHOOK_URL     # RAG pipeline webhook
RAG_TIMEOUT         # Timeout in milliseconds
RAG_MAX_RETRIES     # Retry attempts
ENABLE_RAG_SUGGESTIONS # true/false
RAG_MIN_CONFIDENCE  # 0-1 confidence threshold
```

**Optional Variables**:
```
DIRECT_URL          # Only if running migrations
CRON_SECRET         # For cron job authentication
```

### 5. Large File/Folder Issues

**Error**: Build timeout or size limits

**Solution**: 
- `.vercelignore` file excludes unnecessary files
- Excludes: data files, scripts, documentation

### 6. TypeScript Compilation Errors

**Error**: Type errors during build

**Solution**:
- `skipLibCheck: true` in tsconfig.json
- Proper type definitions for all imports

## Debugging Steps

### 1. Check Vercel Build Logs
- Go to Vercel Dashboard → Your Project → Functions tab
- Click on failed deployment
- Review build logs for specific errors

### 2. Test Build Locally
```bash
# Simulate Vercel build environment
export NODE_ENV=production
npm run build
```

### 3. Verify Environment Variables
```bash
# Check if all required vars are set
node scripts/setup-vercel-env.js
```

### 4. Check Prisma Client Generation
```bash
npx prisma generate
```

### 5. Validate Schema
```bash
# With DIRECT_URL fallback
DIRECT_URL=$DATABASE_URL npx prisma validate
```

## Build Configuration

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "node scripts/setup-vercel-env.js && prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["icn1"]
}
```

### package.json scripts
```json
{
  "build": "prisma generate --no-engine && next build",
  "postinstall": "prisma generate"
}
```

## Common Fixes Applied

1. **Removed migration from build command**
   - Migrations should be run separately, not during build

2. **Added environment variable setup script**
   - Ensures DIRECT_URL is available for Prisma schema

3. **Created .vercelignore**
   - Excludes unnecessary files from deployment

4. **Updated TypeScript config**
   - Removed scripts from exclude list

5. **Added --no-engine flag**
   - Reduces bundle size in production

## If Deployment Still Fails

1. **Clear Vercel cache**:
   - Redeploy with "Force new deployment" option

2. **Check for hardcoded values**:
   - Ensure no localhost URLs or local paths

3. **Verify database connection**:
   - Test DATABASE_URL connection from Vercel IP

4. **Review recent changes**:
   - Check git diff for any breaking changes

## Contact Support

If issues persist after trying these solutions:
1. Check Vercel status page
2. Review Prisma Accelerate status
3. Contact Vercel support with deployment ID