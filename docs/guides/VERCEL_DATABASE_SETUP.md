# Vercel Database Setup Guide

This guide will help you configure your Vercel deployment to use your PostgreSQL database.

## 1. Database Connection Options

### Option A: Using Local PostgreSQL with Remote Access (Current Setup)
Your current local database: `postgresql://gundorit@localhost:5432/data_dictionary`

To make this accessible from Vercel, you'll need to:
1. Configure your PostgreSQL to accept remote connections
2. Set up port forwarding or use a tunneling service
3. Use a static IP or dynamic DNS service

### Option B: Using a Cloud Database Provider (Recommended)
For production deployments, consider using:
- **Vercel Postgres** (Seamless integration)
- **Supabase** (Free tier available)
- **Neon** (Serverless Postgres)
- **Railway** (Simple deployment)
- **Render** (Free tier available)

## 2. Setting Up Vercel Environment Variables

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to "Settings" → "Environment Variables"

### Step 2: Add Database Environment Variables
Add the following environment variables:

```
DATABASE_URL="your_production_database_url"
DIRECT_URL="your_direct_database_url" (if using connection pooling)
```

### Step 3: Add Other Environment Variables
```
RAG_WEBHOOK_URL="https://koscom.app.n8n.cloud/webhook/invoke"
RAG_TIMEOUT="30000"
RAG_MAX_RETRIES="3"
ENABLE_RAG_SUGGESTIONS="true"
RAG_MIN_CONFIDENCE="0.7"
```

## 3. Database Migration Strategy

### Option 1: Using Vercel Postgres (Recommended)
1. In Vercel Dashboard, go to "Storage" → "Create Database" → "Postgres"
2. Copy the connection string provided
3. Update your environment variables

### Option 2: Using External Database
If using Supabase, Neon, or another provider:

1. Create a new database in your chosen provider
2. Get the connection string (usually includes SSL parameters)
3. Example connection strings:

**Supabase:**
```
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require"
```

**Neon:**
```
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

## 4. Prisma Configuration for Production

Update your `prisma/schema.prisma` if needed:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

## 5. Deployment Configuration

### Update vercel.json for build settings:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["icn1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### Update package.json build script:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

## 6. Database Migration Steps

### Step 1: Export Current Data
```bash
# Export your local data
pg_dump -U gundorit -d data_dictionary > data_dictionary_backup.sql
```

### Step 2: Import to Production Database
```bash
# Import to production database
psql [PRODUCTION_DATABASE_URL] < data_dictionary_backup.sql
```

### Step 3: Run Migrations
```bash
# Apply migrations to production
npx prisma migrate deploy
```

## 7. Security Considerations

### SSL Configuration
Most cloud providers require SSL connections. Ensure your connection string includes:
- `?sslmode=require` or `?ssl=true`

### Connection Pooling
For serverless environments, use connection pooling:
- Vercel Postgres includes this automatically
- For other providers, use services like PgBouncer

### Environment Variable Security
- Never commit `.env` files
- Use Vercel's environment variable encryption
- Set different values for Preview/Production environments

## 8. Testing Your Deployment

### Local Testing with Production Database
```bash
# Create .env.production.local
DATABASE_URL="your_production_database_url"

# Test locally
npm run build
npm run start
```

### Verify Database Connection
1. Deploy to Vercel
2. Check function logs in Vercel Dashboard
3. Test API endpoints:
   - `/api/translate`
   - `/api/validate`
   - `/api/activity`

## 9. Troubleshooting

### Common Issues:

**Connection Timeout:**
- Check if database allows connections from Vercel's IP ranges
- Verify SSL settings
- Check connection pooling limits

**Migration Failures:**
- Ensure `prisma migrate deploy` runs in build command
- Check if database user has CREATE/ALTER permissions

**Environment Variable Issues:**
- Verify variables are set for correct environment (Preview/Production)
- Check for typos in variable names
- Ensure no quotes in Vercel environment variable values

## 10. Monitoring

### Database Monitoring
- Set up monitoring in your database provider
- Monitor connection counts
- Track query performance

### Vercel Monitoring
- Check Function logs
- Monitor build logs
- Set up alerts for failures

## Quick Start with Vercel Postgres

1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Copy all provided environment variables
3. Add them to your project's environment variables
4. Redeploy your project
5. Run `npx prisma migrate deploy` from Vercel's console or as part of build

## Support Resources

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Troubleshooting Database Connections](https://vercel.com/docs/storage/vercel-postgres/troubleshooting)