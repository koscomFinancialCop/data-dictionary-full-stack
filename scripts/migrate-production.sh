#!/bin/bash

# Production migration script for Prisma Accelerate
# This script uses the DIRECT_URL to run migrations bypassing Accelerate

echo "🚀 Starting production database migration..."

# Check if DIRECT_URL is set
if [ -z "$DIRECT_URL" ]; then
  echo "❌ Error: DIRECT_URL environment variable is not set"
  echo "Please set DIRECT_URL to your direct database connection string"
  exit 1
fi

# Temporarily set DATABASE_URL to DIRECT_URL for migrations
export DATABASE_URL=$DIRECT_URL

echo "📋 Current migration status:"
npx prisma migrate status

echo ""
echo "🔄 Deploying migrations to production..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations deployed successfully!"
  
  # Generate Prisma Client
  echo "🔧 Generating Prisma Client..."
  npx prisma generate
  
  echo "✅ Production migration completed!"
else
  echo "❌ Migration failed. Please check the error messages above."
  exit 1
fi