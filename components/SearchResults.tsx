'use client';

import { useState } from 'react';

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
    <section className="mt-8 space-y-4" aria-label="검색 결과">
      <h2 className="sr-only">검색 결과 목록</h2>
      {results.map((result, index) => (
        <article
          key={index}
          className="bg-[#2f2f2f] rounded-xl border border-[#444] p-6 hover:border-white/30 transition-all duration-200 group"
          aria-label={`${result.korean}의 영어 변수명`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-xl font-semibold text-white">
                  <span className="sr-only">한글:</span>
                  {result.korean}
                </h3>
                <span className="text-[#8e8e8e]" aria-hidden="true">→</span>
                <code className="text-xl font-mono text-[#4ade80] bg-[#4ade80]/10 px-3 py-1 rounded">
                  <span className="sr-only">영어 변수명:</span>
                  {result.english}
                </code>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-[#444] text-white/70 rounded text-xs" role="note">
                  <span className="sr-only">타입:</span>
                  {result.type}
                </span>
                
                {result.description && (
                  <p className="text-[#8e8e8e]">
                    <span className="sr-only">설명:</span>
                    {result.description}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.english);
                setCopiedIndex(index);
                setTimeout(() => setCopiedIndex(null), 2000);
              }}
              className="p-2 text-[#8e8e8e] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2f2f2f] rounded"
              aria-label={`${result.english}를 클립보드에 복사`}
            >
              {copiedIndex === index ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              <span className="sr-only">
                {copiedIndex === index ? '복사됨' : '복사하기'}
              </span>
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#444]">
            <h4 className="text-sm text-white/70 mb-1">사용 예시:</h4>
            <pre className="overflow-x-auto">
              <code className="block text-sm font-mono text-[#8e8e8e] bg-[#1a1a1a] p-3 rounded-lg" aria-label="코드 예시">
                const {result.english} = getUserInfo();
              </code>
            </pre>
          </div>
        </article>
      ))}
    </section>
  );
}