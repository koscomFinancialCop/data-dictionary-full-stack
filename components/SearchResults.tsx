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
      <div className="space-y-3" role="status" aria-live="polite" aria-label="검색 결과 로딩 중">
        <span className="sr-only">검색 결과를 불러오는 중입니다...</span>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#1a1a1a]/20 animate-pulse" aria-hidden="true">
            <div className="flex items-center gap-8">
              <div className="h-6 bg-[#333]/20 rounded w-24"></div>
              <div className="w-4 h-4 bg-[#333]/20 rounded"></div>
              <div className="h-6 bg-[#333]/20 rounded w-32"></div>
              <div className="h-4 bg-[#333]/20 rounded w-48"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div role="region" aria-live="polite">
        <div className="text-center py-12">
          <p className="text-base text-[#666] mb-2">
            "{query}"에 대한 검색 결과가 없습니다
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#10a37f] rounded-full animate-pulse"></div>
            <p className="text-sm text-[#10a37f]">AI가 제안을 준비하고 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="검색 결과">
      <h2 className="sr-only">검색 결과 목록</h2>
      <div className="space-y-3">
        {currentResults.map((result, index) => (
        <article
          key={`${currentPage}-${index}`}
          className="group"
          aria-label={`${result.korean}의 영어 변수명`}
          style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fade-in 0.4s ease-out forwards',
            opacity: 0
          }}
        >
          <div className="flex items-center justify-between p-6 rounded-2xl bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/30 transition-all duration-300 cursor-pointer"
               onClick={() => {
                 navigator.clipboard.writeText(result.english);
                 setCopiedIndex(index);
                 setTimeout(() => setCopiedIndex(null), 2000);
               }}>
            <div className="flex items-center gap-8">
              {/* Korean */}
              <div className="min-w-[120px]">
                <p className="text-lg font-medium text-white">
                  {result.korean}
                </p>
              </div>
              
              {/* Arrow */}
              <svg className="w-4 h-4 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* English */}
              <div className="min-w-[150px]">
                <code className="text-lg font-mono text-[#10a37f] font-medium">
                  {result.english}
                </code>
              </div>
              
              {/* Description */}
              {result.description && (
                <>
                  <div className="w-px h-4 bg-[#333]"></div>
                  <p className="text-sm text-[#666]">
                    {result.description}
                  </p>
                </>
              )}
            </div>
            
            {/* Copy indicator */}
            <div className="flex items-center gap-3">
              <span className={`text-xs transition-opacity duration-300 ${
                copiedIndex === index ? 'opacity-100 text-[#10a37f]' : 'opacity-0'
              }`}>
                복사됨
              </span>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                copiedIndex === index 
                  ? 'bg-[#10a37f]/20 text-[#10a37f]' 
                  : 'text-[#444] group-hover:text-[#666]'
              }`}>
                {copiedIndex === index ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className="mt-12 flex justify-center" aria-label="페이지 내비게이션">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                currentPage === 1
                  ? 'text-[#444] cursor-not-allowed'
                  : 'text-[#666] hover:text-white'
              }`}
              aria-label="이전 페이지"
            >
              이전
            </button>
            
            <div className="flex items-center gap-1 mx-4">
              {pageNumbers.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-[#444]">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 ${
                      currentPage === page
                        ? 'text-white font-medium'
                        : 'text-[#666] hover:text-white'
                    }`}
                    aria-label={`페이지 ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'text-[#444] cursor-not-allowed'
                  : 'text-[#666] hover:text-white'
              }`}
              aria-label="다음 페이지"
            >
              다음
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}