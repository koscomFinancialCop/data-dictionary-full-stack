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

  // Styles
  const containerStyle = {
    background: 'rgba(26, 26, 26, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    animation: 'slideUp 0.3s ease-out'
  };

  const loadingSkeletonStyle = {
    height: '60px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '12px',
    animation: 'shimmer 1.5s infinite'
  };

  const resultItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  const resultItemHoverStyle = {
    background: 'rgba(16, 163, 127, 0.1)',
    transform: 'translateX(4px)',
    borderColor: 'rgba(16, 163, 127, 0.3)'
  };

  const koreanTextStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    minWidth: '100px'
  };

  const englishTextStyle = {
    fontSize: '16px',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontWeight: '600',
    color: '#10a37f',
    minWidth: '120px'
  };

  const arrowStyle = {
    width: '16px',
    height: '16px',
    color: 'rgba(255, 255, 255, 0.3)',
    margin: '0 16px'
  };

  const descriptionStyle = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: '16px',
    flex: 1
  };

  const copyButtonStyle = (copied: boolean) => ({
    padding: '6px',
    borderRadius: '8px',
    background: copied ? 'rgba(16, 163, 127, 0.2)' : 'transparent',
    color: copied ? '#10a37f' : 'rgba(255, 255, 255, 0.4)',
    transition: 'all 0.2s ease',
    border: '1px solid transparent'
  });

  const copiedTextStyle = {
    fontSize: '12px',
    color: '#10a37f',
    marginRight: '8px',
    minWidth: '50px',
    textAlign: 'right' as const,
    opacity: 0,
    transition: 'opacity 0.2s ease'
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '24px',
    gap: '8px'
  };

  const pageButtonStyle = (active: boolean) => ({
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
    background: active ? 'rgba(16, 163, 127, 0.2)' : 'transparent',
    border: active ? '1px solid rgba(16, 163, 127, 0.3)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const navButtonStyle = (disabled: boolean) => ({
    padding: '6px 16px',
    fontSize: '14px',
    color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)',
    background: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'color 0.2s ease'
  });

  const noResultsStyle = {
    textAlign: 'center' as const,
    padding: '48px 24px'
  };

  const noResultsTextStyle = {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '12px'
  };

  const aiLoadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#10a37f'
  };

  const dotStyle = {
    width: '6px',
    height: '6px',
    background: '#10a37f',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite'
  };

  if (isLoading) {
    return (
      <div style={containerStyle} role="status" aria-live="polite" aria-label="검색 결과 로딩 중">
        <span style={{ position: 'absolute', left: '-9999px' }}>검색 결과를 불러오는 중입니다...</span>
        {[1, 2, 3].map((i) => (
          <div key={i} style={loadingSkeletonStyle} aria-hidden="true"></div>
        ))}
        <style jsx>{`
          @keyframes shimmer {
            0% { opacity: 0.3; }
            50% { opacity: 0.5; }
            100% { opacity: 0.3; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div style={containerStyle} role="region" aria-live="polite">
        <div style={noResultsStyle}>
          <p style={noResultsTextStyle}>
            "{query}"에 대한 검색 결과가 없습니다
          </p>
          <div style={aiLoadingStyle}>
            <div style={dotStyle}></div>
            <p>AI가 제안을 준비하고 있습니다</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section aria-label="검색 결과" style={containerStyle}>
      <h2 style={{ position: 'absolute', left: '-9999px' }}>검색 결과 목록</h2>
      <div>
        {currentResults.map((result, index) => (
          <article
            key={`${currentPage}-${index}`}
            aria-label={`${result.korean}의 영어 변수명`}
            style={{
              ...resultItemStyle,
              opacity: 0,
              animation: `fadeIn 0.3s ease-out ${index * 0.05}s forwards`
            }}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, resultItemHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, {
                background: 'rgba(255, 255, 255, 0.03)',
                transform: 'translateX(0)',
                borderColor: 'rgba(255, 255, 255, 0.05)'
              });
            }}
            onClick={() => {
              navigator.clipboard.writeText(result.english);
              setCopiedIndex(index);
              setTimeout(() => setCopiedIndex(null), 2000);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <span style={koreanTextStyle}>{result.korean}</span>
              
              <svg style={arrowStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              <code style={englishTextStyle}>{result.english}</code>
              
              {result.description && (
                <span style={descriptionStyle}>{result.description}</span>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                ...copiedTextStyle,
                opacity: copiedIndex === index ? 1 : 0
              }}>
                복사됨
              </span>
              <button
                style={copyButtonStyle(copiedIndex === index)}
                onMouseEnter={(e) => {
                  if (copiedIndex !== index) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (copiedIndex !== index) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                aria-label="복사"
              >
                {copiedIndex === index ? (
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav style={paginationStyle} aria-label="페이지 내비게이션">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={navButtonStyle(currentPage === 1)}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
            aria-label="이전 페이지"
          >
            이전
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 16px' }}>
            {pageNumbers.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} style={{ padding: '0 8px', color: 'rgba(255, 255, 255, 0.3)' }}>...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  style={pageButtonStyle(currentPage === page)}
                  onMouseEnter={(e) => {
                    if (currentPage !== page) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== page) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
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
            style={navButtonStyle(currentPage === totalPages)}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
            aria-label="다음 페이지"
          >
            다음
          </button>
        </nav>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}