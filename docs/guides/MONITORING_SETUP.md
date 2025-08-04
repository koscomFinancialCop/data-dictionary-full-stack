# Monitoring and Alerting Setup Guide

## Overview

This guide covers setting up comprehensive monitoring for your DataDictionary application on Vercel with Prisma Accelerate.

## Monitoring Stack

### 1. Vercel Analytics (Built-in)

#### Setup
1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics (free tier available)
3. Add to your app:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Metrics Tracked
- Page views and unique visitors
- Top pages and referrers
- Device and browser analytics
- Core Web Vitals (LCP, FID, CLS)

### 2. Prisma Accelerate Monitoring

#### Access Dashboard
1. Log in to [Prisma Data Platform](https://console.prisma.io)
2. Select your project
3. Navigate to "Accelerate" → "Monitoring"

#### Key Metrics
- **Connection Pool**
  - Active connections
  - Pool utilization %
  - Connection wait time
  
- **Query Performance**
  - Query response times
  - Slow query log
  - Query errors
  
- **Cache Performance**
  - Cache hit rate
  - Cache size
  - TTL effectiveness

#### Set Up Alerts
1. Go to "Alerts" in Prisma Dashboard
2. Create alerts for:
   - Pool utilization > 80%
   - Query time > 1000ms
   - Error rate > 1%
   - Connection failures

### 3. Custom Application Monitoring

#### Implementation

```typescript
// lib/monitoring.ts
interface MetricData {
  endpoint: string
  duration: number
  status: 'success' | 'error'
  errorMessage?: string
  metadata?: Record<string, any>
}

export class MonitoringService {
  private static instance: MonitoringService
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }
  
  async trackApiCall(data: MetricData) {
    // Log to console (picked up by Vercel)
    console.log('API_METRIC', JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data
    }))
    
    // Track in database for analysis
    if (process.env.ENABLE_METRICS === 'true') {
      try {
        await prisma.userActivity.create({
          data: {
            activityType: 'api_metric',
            query: data.endpoint,
            success: data.status === 'success',
            metadata: {
              duration: data.duration,
              ...data.metadata
            }
          }
        })
      } catch (error) {
        console.error('Failed to track metric:', error)
      }
    }
  }
  
  async trackDatabaseQuery(query: string, duration: number) {
    console.log('DB_METRIC', JSON.stringify({
      timestamp: new Date().toISOString(),
      query: query.substring(0, 100), // Truncate for logging
      duration
    }))
  }
}

// Usage in API routes
export async function GET(request: Request) {
  const monitor = MonitoringService.getInstance()
  const startTime = Date.now()
  
  try {
    const result = await someOperation()
    
    await monitor.trackApiCall({
      endpoint: '/api/search',
      duration: Date.now() - startTime,
      status: 'success',
      metadata: { resultCount: result.length }
    })
    
    return NextResponse.json(result)
  } catch (error) {
    await monitor.trackApiCall({
      endpoint: '/api/search',
      duration: Date.now() - startTime,
      status: 'error',
      errorMessage: error.message
    })
    
    throw error
  }
}
```

#### Add Monitoring Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  const response = NextResponse.next()
  
  response.headers.set('x-request-id', requestId)
  
  // Log request (picked up by Vercel logs)
  console.log('REQUEST', JSON.stringify({
    requestId,
    path: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date().toISOString()
  }))
  
  return response
}

export const config = {
  matcher: '/api/:path*'
}
```

### 4. Health Check Monitoring

#### Enhanced Health Endpoint

```typescript
// app/api/health/detailed/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    external: await checkExternalServices()
  }
  
  const overall = Object.values(checks).every(c => c.healthy)
  
  return NextResponse.json({
    healthy: overall,
    timestamp: new Date().toISOString(),
    checks,
    metrics: await getMetrics()
  }, {
    status: overall ? 200 : 503
  })
}

async function checkDatabase() {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    return {
      healthy: true,
      responseTime: Date.now() - start
    }
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    }
  }
}

async function getMetrics() {
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  const [requests, errors] = await Promise.all([
    prisma.userActivity.count({
      where: { createdAt: { gte: dayAgo } }
    }),
    prisma.userActivity.count({
      where: {
        createdAt: { gte: dayAgo },
        success: false
      }
    })
  ])
  
  return {
    requestsLast24h: requests,
    errorsLast24h: errors,
    errorRate: requests > 0 ? (errors / requests) * 100 : 0
  }
}
```

### 5. External Monitoring Services

#### Option 1: Datadog (Recommended for Enterprise)

```typescript
// lib/datadog.ts
import { StatsD } from 'node-dogstatsd'

const dogstatsd = new StatsD({
  host: process.env.DD_AGENT_HOST,
  port: 8125
})

export function trackMetric(name: string, value: number, tags?: string[]) {
  dogstatsd.gauge(`datadictionary.${name}`, value, tags)
}

export function trackEvent(name: string, tags?: string[]) {
  dogstatsd.increment(`datadictionary.${name}`, tags)
}
```

#### Option 2: Sentry (Error Tracking)

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Prisma({ client: prisma })
  ]
})
```

### 6. Alerting Setup

#### Vercel Integrations

1. **PagerDuty Integration**
   - Go to Vercel → Integrations → PagerDuty
   - Configure alerts for deployment failures
   - Set up on-call schedules

2. **Slack Integration**
   - Go to Vercel → Integrations → Slack
   - Configure notifications for:
     - Deployment status
     - Function errors
     - Performance degradation

#### Custom Alerting

```typescript
// lib/alerting.ts
export async function sendAlert(
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  details?: any
) {
  // Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 [${severity.toUpperCase()}] ${message}`,
        attachments: details ? [{
          color: severity === 'critical' ? 'danger' : 'warning',
          fields: Object.entries(details).map(([k, v]) => ({
            title: k,
            value: String(v),
            short: true
          }))
        }] : []
      })
    })
  }
  
  // Also log for Vercel logs
  console.error('ALERT', { severity, message, details })
}

// Usage
if (errorRate > 5) {
  await sendAlert('high', 'High error rate detected', {
    errorRate: `${errorRate}%`,
    endpoint: '/api/translate',
    timeframe: 'last 5 minutes'
  })
}
```

## Dashboard Creation

### Monitoring Dashboard Component

```typescript
// app/monitoring/page.tsx
export default async function MonitoringDashboard() {
  const metrics = await getSystemMetrics()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="API Health"
        value={`${metrics.health.uptime}%`}
        trend={metrics.health.trend}
        status={metrics.health.status}
      />
      
      <MetricCard
        title="Response Time"
        value={`${metrics.performance.avgResponseTime}ms`}
        trend={metrics.performance.trend}
        threshold={200}
      />
      
      <MetricCard
        title="Error Rate"
        value={`${metrics.errors.rate}%`}
        trend={metrics.errors.trend}
        threshold={1}
        inverse
      />
      
      <MetricCard
        title="Database Pool"
        value={`${metrics.database.poolUtilization}%`}
        trend={metrics.database.trend}
        threshold={80}
      />
      
      <MetricCard
        title="Active Users"
        value={metrics.users.active}
        trend={metrics.users.trend}
      />
      
      <MetricCard
        title="Cache Hit Rate"
        value={`${metrics.cache.hitRate}%`}
        trend={metrics.cache.trend}
        threshold={90}
      />
    </div>
  )
}
```

## Monitoring Checklist

### Daily Checks
- [ ] Review error logs in Vercel Functions
- [ ] Check Prisma Accelerate pool utilization
- [ ] Monitor API response times
- [ ] Review slow query log

### Weekly Checks
- [ ] Analyze traffic patterns
- [ ] Review Core Web Vitals trends
- [ ] Check database growth rate
- [ ] Audit security alerts

### Monthly Checks
- [ ] Performance regression analysis
- [ ] Cost optimization review
- [ ] Capacity planning
- [ ] Incident post-mortems

## Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| API Response Time | >500ms | >1000ms | Investigate slow queries |
| Error Rate | >1% | >5% | Check logs, rollback if needed |
| DB Pool Usage | >70% | >90% | Scale connection pool |
| Memory Usage | >80% | >95% | Optimize or scale |
| Cache Hit Rate | <80% | <60% | Review caching strategy |

## Troubleshooting Guide

### High Response Times
1. Check Prisma Accelerate metrics
2. Review slow query log
3. Analyze N+1 query patterns
4. Consider query optimization

### High Error Rates
1. Check recent deployments
2. Review error logs
3. Verify external service health
4. Check rate limiting

### Database Issues
1. Monitor connection pool
2. Check for long-running queries
3. Review index usage
4. Consider read replicas

## Next Steps

1. Implement basic monitoring
2. Set up critical alerts
3. Create monitoring dashboard
4. Establish on-call rotation
5. Document runbooks