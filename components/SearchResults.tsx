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
      <div className="mt-8 bg-[#2f2f2f] rounded-xl border border-[#444] p-8 text-center" role="region" aria-live="polite">
        <div className="text-[#8e8e8e] mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-white/90 mb-2">"{query}"에 대한 검색 결과가 없습니다.</h2>
        <p className="text-[#8e8e8e] text-sm">다른 한글 단어로 검색해보세요.</p>
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
          className="bg-[#2f2f2f] rounded-2xl border border-[#444] hover:border-[#10a37f]/50 hover:bg-[#2f2f2f]/80 transition-all duration-200 group overflow-hidden"
          aria-label={`${result.korean}의 영어 변수명`}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#10a37f]/10 text-[#10a37f] rounded-full text-xs font-medium">
                      {result.type}
                    </span>
                    {result.description && (
                      <p className="text-[#8e8e8e] text-sm">
                        {result.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-medium text-white">
                      {result.korean}
                    </h3>
                    <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <code className="text-2xl font-mono text-[#10a37f] font-semibold">
                      {result.english}
                    </code>
                  </div>
                </div>
              </div>
            
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.english);
                  setCopiedIndex(index);
                  setTimeout(() => setCopiedIndex(null), 2000);
                }}
                className="p-3 rounded-xl bg-[#3e3e3e] text-[#8e8e8e] hover:text-white hover:bg-[#10a37f] transition-all duration-200 group-hover:scale-105"
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
          
          <div className="bg-[#1a1a1a] px-6 py-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h4 className="text-sm text-[#10a37f] font-medium">사용 예시</h4>
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