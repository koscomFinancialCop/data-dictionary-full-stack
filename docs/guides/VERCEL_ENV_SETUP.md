# Vercel Environment Variables Setup Guide

## Overview

This guide provides step-by-step instructions for setting up environment variables in Vercel for the DataDictionary project.

## Required Environment Variables

### 1. Database Configuration

#### DATABASE_URL (Required)
- **Description**: Prisma Accelerate connection string
- **Format**: `prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY`
- **Where to get**: Prisma Accelerate Dashboard → Your project → Connection strings
- **Example**: `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### DIRECT_URL (Required for migrations)
- **Description**: Direct PostgreSQL connection for running migrations
- **Format**: `postgres://username:password@host:5432/database?sslmode=require`
- **Where to get**: Your database provider (Neon, Supabase, etc.)
- **Example**: `postgres://user:pass@db.provider.com:5432/mydb?sslmode=require`
- **Note**: Only add to build environment if you want automatic migrations

### 2. RAG Pipeline Configuration

#### RAG_WEBHOOK_URL (Required)
- **Description**: Webhook URL for RAG suggestions
- **Default**: `https://koscom.app.n8n.cloud/webhook/invoke`
- **Format**: Full HTTPS URL

#### RAG_TIMEOUT (Required)
- **Description**: Timeout for RAG requests in milliseconds
- **Default**: `30000`
- **Recommended**: Between 10000-60000

#### RAG_MAX_RETRIES (Required)
- **Description**: Maximum retry attempts for failed RAG requests
- **Default**: `3`
- **Recommended**: Between 1-5

#### ENABLE_RAG_SUGGESTIONS (Required)
- **Description**: Enable/disable RAG suggestions feature
- **Default**: `true`
- **Options**: `true` or `false`

#### RAG_MIN_CONFIDENCE (Required)
- **Description**: Minimum confidence score for RAG suggestions
- **Default**: `0.7`
- **Range**: 0.0 to 1.0

### 3. Security

#### CRON_SECRET (Required for backups)
- **Description**: Secret key to authenticate cron job requests
- **Generate**: Use a random string generator
- **Length**: At least 32 characters
- **Example**: `your-very-long-random-secret-key-here`

### 4. Optional Variables

#### NEXT_PUBLIC_ANALYTICS_ID (Optional)
- **Description**: Analytics tracking ID (Google Analytics, etc.)
- **Format**: Provider-specific format
- **Note**: Must start with `NEXT_PUBLIC_` to be available client-side

## Step-by-Step Setup

### Step 1: Access Vercel Dashboard

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to "Settings" tab
4. Click on "Environment Variables" in the left sidebar

### Step 2: Add Environment Variables

For each variable:

1. Click "Add New"
2. Enter the variable name (e.g., `DATABASE_URL`)
3. Enter the value
4. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional)
5. Click "Save"

### Step 3: Special Considerations

#### For DATABASE_URL:
```
Name: DATABASE_URL
Value: prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_ACTUAL_API_KEY
Environments: Production, Preview, Development
```

#### For DIRECT_URL:
```
Name: DIRECT_URL
Value: postgres://your-actual-connection-string
Environments: Production, Preview
Note: Only needed if you want automatic migrations during deployment
```

#### For CRON_SECRET:
```
Name: CRON_SECRET
Value: [Generate a secure random string]
Environments: Production only
```

### Step 4: Verify Setup

After adding all variables:

1. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push
   ```

2. Check deployment logs for:
   - "Environment variables loaded"
   - "Prisma Client generated"
   - "Migrations deployed" (if DIRECT_URL is set)

3. Test the health endpoint:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

## Environment Variable Templates

### Production Environment
```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_PROD_API_KEY"
DIRECT_URL="postgres://prod_user:prod_pass@prod-db.com:5432/prod_db?sslmode=require"
RAG_WEBHOOK_URL="https://koscom.app.n8n.cloud/webhook/invoke"
RAG_TIMEOUT="30000"
RAG_MAX_RETRIES="3"
ENABLE_RAG_SUGGESTIONS="true"
RAG_MIN_CONFIDENCE="0.7"
CRON_SECRET="your-production-cron-secret-key"
```

### Preview Environment
```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_PREVIEW_API_KEY"
DIRECT_URL="postgres://preview_user:preview_pass@preview-db.com:5432/preview_db?sslmode=require"
RAG_WEBHOOK_URL="https://koscom.app.n8n.cloud/webhook/invoke"
RAG_TIMEOUT="30000"
RAG_MAX_RETRIES="3"
ENABLE_RAG_SUGGESTIONS="true"
RAG_MIN_CONFIDENCE="0.7"
```

## Troubleshooting

### Common Issues

1. **"Environment variable not found"**
   - Ensure variable names match exactly (case-sensitive)
   - Redeploy after adding variables
   - Check if variable is set for the correct environment

2. **"Cannot connect to database"**
   - Verify DATABASE_URL format
   - Check Prisma Accelerate API key validity
   - Ensure database allows connections

3. **"Migrations failed"**
   - DIRECT_URL must bypass Prisma Accelerate
   - Database user needs migration permissions
   - Check if migrations are already applied

4. **"Cron job unauthorized"**
   - CRON_SECRET must match in both Vercel and code
   - Ensure it's set for Production environment

### Debugging Commands

```bash
# Check if variables are set (in Vercel Functions logs)
console.log('DB URL exists:', !!process.env.DATABASE_URL)
console.log('Direct URL exists:', !!process.env.DIRECT_URL)

# Test connection
npx prisma db pull

# Validate schema
npx prisma validate
```

## Security Best Practices

1. **Never commit sensitive values**
   - Use `.env.local` for local development
   - Add `.env*` to `.gitignore`

2. **Use different values per environment**
   - Separate API keys for production/preview
   - Different database credentials

3. **Rotate secrets regularly**
   - Update CRON_SECRET monthly
   - Rotate database passwords quarterly

4. **Limit access**
   - Use read-only database users where possible
   - Restrict IP access to databases

## Next Steps

After setting up environment variables:

1. Deploy your application
2. Run database migrations (if needed)
3. Test all features
4. Set up monitoring
5. Configure alerts

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Use the `/api/health` endpoint
3. Review Prisma Accelerate dashboard
4. Contact support with error messages