'use client';

import { useState, useMemo, useEffect } from 'react';

interface SearchResult {
  korean: string;
  english: string;
  type: string;
  description?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export default function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 페이지네이션 계산
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  // 페이지 번호 배열 생성
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변 페이지만 표시
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) pages.push(1, '...');
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages) pages.push('...', totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // 페이지 변경 시 스크롤 위치 조정
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // 검색어 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4" role="status" aria-live="polite" aria-label="검색 결과 로딩 중">
        <span className="sr-only">검색 결과를 불러오는 중입니다...</span>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#2f2f2f] rounded-xl border border-[#444] p-6 animate-pulse" aria-hidden="true">
            <div className="h-6 bg-[#444] rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-[#444] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="mt-8" role="region" aria-live="polite">
        <div className="bg-gradient-to-br from-[#2f2f2f] to-[#252525] rounded-3xl border border-[#444]/50 p-12 text-center backdrop-blur-sm shadow-2xl">
          <div className="text-[#666] mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-white mb-3">
            검색 결과가 없습니다
          </h2>
          <p className="text-[#8e8e8e] text-base mb-2">
            <span className="text-[#10a37f] font-medium">"{query}"</span>에 대한 변수명을 찾을 수 없습니다.
          </p>
          <p className="text-[#666] text-sm">
            AI가 변수명을 제안해드릴 수 있습니다. 잠시만 기다려주세요...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-8" aria-label="검색 결과">
      <h2 className="sr-only">검색 결과 목록</h2>
      <div className="space-y-4">
        {currentResults.map((result, index) => (
        <article
          key={`${currentPage}-${index}`}
          className="bg-gradient-to-br from-[#2f2f2f] to-[#2a2a2a] rounded-3xl border border-[#444]/30 hover:border-[#10a37f]/30 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-xl"
          aria-label={`${result.korean}의 영어 변수명`}
        >
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#10a37f]/20 to-[#10a37f]/10 text-[#10a37f] rounded-full text-xs font-semibold tracking-wide">
                    {result.type}
                  </span>
                  {result.description && (
                    <p className="text-[#666] text-sm line-clamp-1">
                      {result.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-semibold text-white">
                    {result.korean}
                  </h3>
                  <div className="flex items-center gap-2 text-[#444]">
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#444] to-transparent"></div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="w-8 h-[2px] bg-gradient-to-l from-[#444] to-transparent"></div>
                  </div>
                  <code className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#10a37f] to-[#0ea573] font-bold">
                    {result.english}
                  </code>
                </div>
              </div>
            
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.english);
                  setCopiedIndex(index);
                  setTimeout(() => setCopiedIndex(null), 2000);
                }}
                className="p-3 rounded-2xl bg-[#1a1a1a]/50 text-[#666] hover:text-white hover:bg-[#10a37f] transition-all duration-300 group-hover:scale-110 backdrop-blur-sm"
                aria-label={`${result.english}를 클립보드에 복사`}
              >
                {copiedIndex === index ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="sr-only">
                  {copiedIndex === index ? '복사됨' : '복사하기'}
                </span>
              </button>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a]/30 px-8 py-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#10a37f]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h4 className="text-sm text-[#10a37f]/80 font-semibold">사용 예시</h4>
            </div>
            <pre className="overflow-x-auto">
              <code className="block text-sm font-mono text-[#abb2bf]" aria-label="코드 예시">
                <span className="text-[#c678dd]">const</span> <span className="text-[#e06c75]">{result.english}</span> = <span className="text-[#61afef]">getUserInfo</span>();
              </code>
            </pre>
          </div>
        </article>
      ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center" aria-label="페이지 내비게이션">
          <div className="flex items-center gap-1">
            {/* 이전 버튼 */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'text-[#666] cursor-not-allowed'
                  : 'text-[#8e8e8e] hover:text-white hover:bg-[#3e3e3e]'
              }`}
              aria-label="이전 페이지"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 페이지 번호 */}
            {pageNumbers.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-[#666]">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-[40px] h-10 px-3 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#10a37f] text-white'
                      : 'text-[#8e8e8e] hover:text-white hover:bg-[#3e3e3e]'
                  }`}
                  aria-label={`페이지 ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            ))}

            {/* 다음 버튼 */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'text-[#666] cursor-not-allowed'
                  : 'text-[#8e8e8e] hover:text-white hover:bg-[#3e3e3e]'
              }`}
              aria-label="다음 페이지"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}