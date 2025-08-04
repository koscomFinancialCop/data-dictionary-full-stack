import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 활동 기록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activityType, query, result, sessionId, success = true, metadata } = body;

    // 활동 로그 생성
    const activity = await prisma.userActivity.create({
      data: {
        activityType,
        query,
        result,
        sessionId,
        success,
        metadata,
      },
    });

    // 오늘 날짜의 통계 업데이트
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await prisma.dailyStats.upsert({
      where: { date: today },
      update: {
        totalTranslations: activityType === 'translation' 
          ? { increment: 1 } 
          : undefined,
        totalValidations: activityType === 'validation' 
          ? { increment: 1 } 
          : undefined,
        totalRagSuggestions: activityType === 'rag_suggestion' 
          ? { increment: 1 } 
          : undefined,
      },
      create: {
        date: today,
        totalTranslations: activityType === 'translation' ? 1 : 0,
        totalValidations: activityType === 'validation' ? 1 : 0,
        totalRagSuggestions: activityType === 'rag_suggestion' ? 1 : 0,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}

// 활동 통계 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    // 최근 N일간의 통계
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const stats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 전체 누적 통계
    const totalStats = await prisma.userActivity.groupBy({
      by: ['activityType'],
      _count: {
        activityType: true,
      },
    });

    // 최근 활동
    const recentActivities = await prisma.userActivity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        activityType: true,
        query: true,
        createdAt: true,
        success: true,
      },
    });

    // 오늘의 통계
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await prisma.dailyStats.findUnique({
      where: { date: today },
    });

    return NextResponse.json({
      dailyStats: stats,
      totalStats: totalStats.reduce((acc, stat) => ({
        ...acc,
        [stat.activityType]: stat._count.activityType,
      }), {}),
      recentActivities,
      todayStats: todayStats || {
        totalTranslations: 0,
        totalValidations: 0,
        totalRagSuggestions: 0,
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}