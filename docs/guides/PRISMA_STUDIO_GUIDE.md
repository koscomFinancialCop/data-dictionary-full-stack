# Prisma Studio with Prisma Accelerate Guide

## The Issue

When using Prisma Accelerate, you'll encounter this error when trying to use Prisma Studio:

```
Unable to communicate with Prisma Client. Is Studio still running?
TypeError: Failed to fetch
```

This happens because **Prisma Studio doesn't support Prisma Accelerate connection URLs**. It needs a direct database connection.

## Understanding the Connection Types

### 1. Prisma Accelerate URL (for your application)
```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```
- Used by your application in production
- Provides connection pooling and global caching
- Format: `prisma+postgres://` protocol

### 2. Direct Database URL (for Prisma Studio & migrations)
```
DIRECT_URL="postgres://username:password@host:5432/database?sslmode=require"
```
- Used for Prisma Studio, migrations, and direct database access
- Direct connection to your PostgreSQL database
- Format: Standard `postgres://` protocol

## Solutions

### Option 1: Use the npm script (Recommended)
```bash
npm run db:studio
```

This automatically uses the correct database URL.

### Option 2: Manual override
```bash
DATABASE_URL="$DIRECT_URL" npx prisma studio
```

### Option 3: Temporary environment variable
```bash
export DATABASE_URL=$DIRECT_URL
npx prisma studio
```

## Setting Up Your Environment

### 1. Ensure both URLs are in your `.env.local`:
```env
# For your application (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# For Prisma Studio and migrations (Direct connection)
DIRECT_URL="postgres://username:password@host:5432/database?sslmode=require"
```

### 2. Update your `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Common Issues and Solutions

### Issue 1: "Failed to fetch" error
**Cause**: Using Accelerate URL with Prisma Studio
**Solution**: Use DIRECT_URL instead

### Issue 2: "Connection refused" error
**Cause**: Database not accepting connections
**Solution**: Check firewall rules and allowed IP addresses

### Issue 3: "Authentication failed" error
**Cause**: Invalid credentials in DIRECT_URL
**Solution**: Verify username and password

### Issue 4: Studio opens but shows no data
**Cause**: Connected to wrong database
**Solution**: Verify DIRECT_URL points to correct database

## Best Practices

1. **Never use Accelerate URL for Prisma Studio**
   - Always use the direct database connection
   - The Accelerate URL is only for your application runtime

2. **Keep URLs separate**
   - DATABASE_URL for application
   - DIRECT_URL for tooling (Studio, migrations)

3. **Security considerations**
   - Limit direct database access to development machines
   - Use IP allowlisting for production databases
   - Rotate credentials regularly

## Quick Reference

```bash
# Start Prisma Studio (using npm script)
npm run db:studio

# Start Prisma Studio (manual)
DATABASE_URL="$DIRECT_URL" npx prisma studio

# Run migrations
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy

# Generate Prisma Client (works with either URL)
npx prisma generate

# Pull database schema
DATABASE_URL="$DIRECT_URL" npx prisma db pull
```

## Troubleshooting Checklist

1. ✅ Verify DIRECT_URL is set in `.env.local`
2. ✅ Ensure DIRECT_URL uses `postgres://` protocol
3. ✅ Check database is accessible from your machine
4. ✅ Verify credentials are correct
5. ✅ Ensure SSL mode matches database requirements
6. ✅ Check if port 5555 is available for Studio

## Additional Resources

- [Prisma Accelerate Documentation](https://www.prisma.io/docs/accelerate)
- [Prisma Studio Documentation](https://www.prisma.io/docs/concepts/components/prisma-studio)
- [Connection URL Reference](https://www.prisma.io/docs/reference/database-reference/connection-urls)