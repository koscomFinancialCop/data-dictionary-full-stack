#!/bin/bash

# Script to run Prisma Studio with direct database connection
# Prisma Studio doesn't work with Prisma Accelerate URLs

echo "🚀 Starting Prisma Studio with direct database connection..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep DIRECT_URL | xargs)
fi

# Use DIRECT_URL for Prisma Studio
DATABASE_URL="$DIRECT_URL" npx prisma studio