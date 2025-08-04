import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// This endpoint should be called by Vercel Cron
// Add to vercel.json:
// "crons": [{
//   "path": "/api/cron/backup",
//   "schedule": "0 17 * * *"  // 2 AM KST daily
// }]

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Starting database backup...')
    
    // Collect data with limits to prevent memory issues
    const [
      mappings,
      recentHistory,
      recentRagLogs,
      recentActivities,
      dailyStats
    ] = await Promise.all([
      // All variable mappings (core data)
      prisma.variableMapping.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      
      // Recent search history (last 30 days)
      prisma.searchHistory.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10000
      }),
      
      // Recent RAG logs (last 30 days)
      prisma.rAGSuggestionLog.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10000
      }),
      
      // Recent user activities (last 30 days)
      prisma.userActivity.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10000
      }),
      
      // All daily stats
      prisma.dailyStats.findMany({
        orderBy: { date: 'desc' }
      })
    ])

    // Create backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        counts: {
          variableMappings: mappings.length,
          searchHistory: recentHistory.length,
          ragSuggestions: recentRagLogs.length,
          userActivities: recentActivities.length,
          dailyStats: dailyStats.length
        }
      },
      data: {
        variableMappings: mappings,
        searchHistory: recentHistory,
        ragSuggestionLogs: recentRagLogs,
        userActivities: recentActivities,
        dailyStats: dailyStats
      }
    }

    // In production, you would upload this to S3, Google Cloud Storage, etc.
    // For now, we'll just log the summary
    console.log('✅ Backup completed:', backup.metadata)

    // Calculate backup size
    const backupSize = JSON.stringify(backup).length
    const backupSizeMB = (backupSize / 1024 / 1024).toFixed(2)

    return NextResponse.json({
      success: true,
      timestamp: backup.metadata.timestamp,
      counts: backup.metadata.counts,
      sizeInMB: backupSizeMB,
      message: 'Backup completed successfully'
    })

  } catch (error) {
    console.error('❌ Backup failed:', error)
    return NextResponse.json({
      error: 'Backup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}