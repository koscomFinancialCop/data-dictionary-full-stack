'use client';

import { useState, useEffect } from 'react';

interface DailyStat {
  date: string;
  totalTranslations: number;
  totalValidations: number;
  totalRagSuggestions: number;
}

interface RecentActivity {
  id: string;
  activityType: string;
  query: string;
  createdAt: string;
  success: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    dailyStats: DailyStat[];
    totalStats: { translation?: number; validation?: number; rag_suggestion?: number };
    recentActivities: RecentActivity[];
    todayStats: {
      totalTranslations: number;
      totalValidations: number;
      totalRagSuggestions: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/activity?days=7');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'translation':
        return (
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        );
      case 'validation':
        return (
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rag_suggestion':
        return (
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'translation': return '변수명 변환';
      case 'validation': return '코드 검증';
      case 'rag_suggestion': return 'AI 제안';
      default: return type;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  // Styles
  const containerStyle = {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#0f0f0f'
  };

  const headerStyle = {
    marginBottom: '40px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#999999'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };

  const statCardStyle = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #2d2d2d',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const statCardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#888888',
    fontWeight: '500'
  };

  const statValueStyle = {
    fontSize: '36px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px'
  };

  const statChangeStyle = (positive: boolean) => ({
    fontSize: '13px',
    color: positive ? '#10a37f' : '#ef4444',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  });

  const chartContainerStyle = {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #2d2d2d',
    marginBottom: '40px'
  };

  const chartTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '24px'
  };

  const activityContainerStyle = {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #2d2d2d'
  };

  const activityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #2d2d2d',
    transition: 'all 0.2s ease'
  };

  const activityIconStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#252525',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10a37f'
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  };

  const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '3px solid #252525',
    borderTop: '3px solid #10a37f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const todayStats = stats?.todayStats || { totalTranslations: 0, totalValidations: 0, totalRagSuggestions: 0 };
  const totalStats = stats?.totalStats || {};

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>대시보드</h1>
        <p style={subtitleStyle}>서비스 사용 현황과 통계를 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div style={statsGridStyle}>
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 163, 127, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={statCardHeaderStyle}>
            <span style={statLabelStyle}>오늘 변환 횟수</span>
            <svg style={{ width: '24px', height: '24px', color: '#10a37f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div style={statValueStyle}>{todayStats.totalTranslations.toLocaleString()}</div>
          <div style={statChangeStyle(true)}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            전체 {(totalStats.translation || 0).toLocaleString()}건
          </div>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(16, 163, 127, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
        </div>

        <div 
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={statCardHeaderStyle}>
            <span style={statLabelStyle}>오늘 검증 횟수</span>
            <svg style={{ width: '24px', height: '24px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={statValueStyle}>{todayStats.totalValidations.toLocaleString()}</div>
          <div style={statChangeStyle(true)}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            전체 {(totalStats.validation || 0).toLocaleString()}건
          </div>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
        </div>

        <div 
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={statCardHeaderStyle}>
            <span style={statLabelStyle}>오늘 AI 제안</span>
            <svg style={{ width: '24px', height: '24px', color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div style={statValueStyle}>{todayStats.totalRagSuggestions.toLocaleString()}</div>
          <div style={statChangeStyle(true)}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            전체 {(totalStats.rag_suggestion || 0).toLocaleString()}건
          </div>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div style={chartContainerStyle}>
        <h2 style={chartTitleStyle}>주간 사용 추이</h2>
        <div style={{ height: '300px', position: 'relative' }}>
          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: '16px' }}>
              {stats.dailyStats.map((stat, index) => {
                const maxValue = Math.max(...stats.dailyStats.map(s => 
                  s.totalTranslations + s.totalValidations + s.totalRagSuggestions
                )) || 1;
                const total = stat.totalTranslations + stat.totalValidations + stat.totalRagSuggestions;
                const height = (total / maxValue) * 100;
                const date = new Date(stat.date);
                
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '250px', 
                      display: 'flex', 
                      alignItems: 'flex-end',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '100%',
                        height: `${height}%`,
                        background: 'linear-gradient(180deg, #10a37f 0%, #0ea573 100%)',
                        borderRadius: '8px 8px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1)';
                      }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-30px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '12px',
                          color: '#ffffff',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          {total}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666666' }}>
                      {date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666666' }}>
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div style={activityContainerStyle}>
        <h2 style={chartTitleStyle}>최근 활동</h2>
        <div>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                style={activityItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#252525';
                  e.currentTarget.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.paddingLeft = '0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={activityIconStyle}>
                    {getActivityIcon(activity.activityType)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                      {getActivityLabel(activity.activityType)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
                      {activity.query}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#666666' }}>
                  {formatTime(activity.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
              아직 활동 기록이 없습니다
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}