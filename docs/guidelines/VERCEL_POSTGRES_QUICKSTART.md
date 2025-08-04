# Vercel Postgres Quick Start Guide

The easiest way to deploy your DataDictionary app with a database on Vercel.

## Step 1: Create Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project "DataDictionary"
3. Click on "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a database name (e.g., "data-dictionary-db")
7. Select region "Seoul (icn1)" for best performance
8. Click "Create"

## Step 2: Connect Database to Project

1. After database creation, you'll see a connection dialog
2. Click "Connect" to automatically add environment variables
3. Vercel will add these variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` 
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

## Step 3: Update Environment Variables

1. Go to Settings → Environment Variables
2. Add or update these variables:

```
DATABASE_URL = Use value from POSTGRES_PRISMA_URL
DIRECT_URL = Use value from POSTGRES_URL_NON_POOLING

RAG_WEBHOOK_URL = https://koscom.app.n8n.cloud/webhook/invoke
RAG_TIMEOUT = 30000
RAG_MAX_RETRIES = 3
ENABLE_RAG_SUGGESTIONS = true
RAG_MIN_CONFIDENCE = 0.7
```

## Step 4: Export Your Local Data

Run this command locally:
```bash
npm run migrate:export
```

This creates a `data-backup.json` file with all your data.

## Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Configure Vercel Postgres"
git push
```

Vercel will automatically:
1. Install dependencies
2. Generate Prisma Client
3. Run database migrations
4. Build your app

## Step 6: Import Your Data

After deployment, you have two options:

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Run migration
PRODUCTION_DATABASE_URL=$DATABASE_URL npm run migrate:prod
```

### Option B: Manual Import via Vercel Dashboard
1. Go to your project → Functions tab
2. Create a temporary API route to import data
3. Upload your `data-backup.json`
4. Trigger the import

## Step 7: Verify Deployment

1. Visit your deployed app
2. Test these features:
   - Search for terms
   - Code validation
   - Dashboard statistics
   - RAG suggestions

## Troubleshooting

### "Database does not exist" error
The database is created but tables aren't. Run:
```bash
vercel env pull
npx prisma migrate deploy
```

### Connection timeout
Check if your database is in the same region as your deployment.

### Migration fails
Ensure your build command in vercel.json includes:
```json
"buildCommand": "prisma generate && prisma migrate deploy && next build"
```

## Database Management

### View your database:
1. Go to Storage → Your Database → Data Browser
2. Or use: `npx prisma studio` locally with production credentials

### Monitor usage:
1. Go to Storage → Your Database → Usage
2. Monitor connections, storage, and queries

## Cost Considerations

Vercel Postgres free tier includes:
- 60 compute hours per month
- 256 MB storage
- Perfect for small to medium projects

## Next Steps

1. Set up monitoring alerts
2. Configure backup strategy
3. Implement rate limiting
4. Add authentication (if needed)