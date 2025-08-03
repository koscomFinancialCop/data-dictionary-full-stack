'use client';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#252525]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#888]">총 변환 횟수</h3>
              <svg className="w-5 h-5 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">1,234</p>
            <p className="text-xs text-[#10a37f] mt-1">+12% from last week</p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#252525]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#888]">검증된 코드</h3>
              <svg className="w-5 h-5 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">892</p>
            <p className="text-xs text-[#10a37f] mt-1">+8% from last week</p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#252525]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#888]">사용자 만족도</h3>
              <svg className="w-5 h-5 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">98%</p>
            <p className="text-xs text-[#10a37f] mt-1">Excellent rating</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#252525]">
          <h2 className="text-lg font-semibold text-white mb-4">최근 활동</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-[#252525]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white">변수명 변환</p>
                  <p className="text-xs text-[#666]">주문증거금 → orderMargin</p>
                </div>
              </div>
              <span className="text-xs text-[#666]">방금 전</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-[#252525]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white">코드 검증 완료</p>
                  <p className="text-xs text-[#666]">8개 변수명 검증, 2개 개선 제안</p>
                </div>
              </div>
              <span className="text-xs text-[#666]">5분 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}