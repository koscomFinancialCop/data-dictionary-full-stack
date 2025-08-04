'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { AutocompleteProvider } from '@/components/AutocompleteProvider';
import { useRAGSuggestions } from '@/hooks/useRAGSuggestions';
import RAGSuggestionPopup from './RAGSuggestionPopup';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  onNoResults?: (query: string) => void;
}

export default function SearchBar({ onSearch, isLoading, onNoResults }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showRAGPopup, setShowRAGPopup] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listboxId = useId();
  const autocompleteProvider = new AutocompleteProvider();
  
  const { 
    getSuggestions: getRAGSuggestions, 
    suggestions: ragSuggestions, 
    isLoading: ragLoading, 
    addToDictionary,
    reset: resetRAG 
  } = useRAGSuggestions();

  useEffect(() => {
    // 확장 가능한 자동완성 시스템
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        const results = await autocompleteProvider.getSuggestions(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  // onNoResults가 호출되었을 때 RAG 제안 가져오기
  useEffect(() => {
    if (onNoResults && query.trim()) {
      console.log('SearchBar: onNoResults triggered for query:', query);
      const checkForRAGSuggestions = async () => {
        console.log('SearchBar: Fetching RAG suggestions for:', query);
        setRagQuery(query);
        await getRAGSuggestions(query);
        console.log('SearchBar: RAG suggestions received:', ragSuggestions.length);
        setShowRAGPopup(true);
      };
      
      // 약간의 지연 후 RAG 호출
      const timer = setTimeout(() => {
        checkForRAGSuggestions();
      }, 500); // 500ms로 줄임
      
      return () => clearTimeout(timer);
    }
  }, [onNoResults, query, getRAGSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };
  
  // RAG 제안 수락 처리
  const handleRAGAccept = async (suggestion: any) => {
    const success = await addToDictionary(ragQuery, suggestion);
    
    if (success) {
      // 성공하면 해당 검색어로 다시 검색
      setQuery(ragQuery);
      onSearch(ragQuery);
      setShowRAGPopup(false);
      resetRAG();
      setRagQuery('');
    } else {
      // 실패 시 알림
      console.error('Failed to add to dictionary');
    }
  };
  
  // RAG 팝업 닫기
  const handleRAGReject = () => {
    setShowRAGPopup(false);
    resetRAG();
    setRagQuery('');
  };

  return (
    <>
      <div className="relative w-full" style={{ marginBottom: '3rem' }} role="search">
      <form onSubmit={handleSubmit} className="relative" role="form">
        <div className={`
          relative flex items-center bg-gradient-to-r from-[#2a2a2a] to-[#252525] rounded-full border 
          transition-all duration-300 shadow-xl h-20
          ${isFocused 
            ? 'border-[#10a37f]/50 shadow-[0_0_30px_rgba(16,163,127,0.2)]' 
            : 'border-[#333]/50 hover:border-[#444]/50 shadow-[0_10px_40px_rgba(0,0,0,0.3)]'
          }
        `}>
          <label htmlFor={inputId} className="sr-only">
            한글 변수명 검색
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="무엇이든 입력하세요"
            className="w-full text-xl text-white bg-transparent outline-none focus:outline-none rounded-l-full placeholder:text-[#666] font-light tracking-wide"
            style={{
              padding: '20px 36px'
            }}
            disabled={isLoading || ragLoading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0 && isFocused}
            aria-controls={listboxId}
            aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
            aria-label="한글 변수명 검색"
          />
          
          {/* Loading indicator */}
          {(isLoading || ragLoading) && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 animate-spin text-[#10a37f]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      </form>

      {/* 자동완성 드롭다운 */}
      {suggestions.length > 0 && isFocused && (
        <div 
          ref={suggestionsRef}
          id={listboxId}
          role="listbox"
          aria-label="검색 제안"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '12px',
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            zIndex: 10,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <div style={{ padding: '8px' }}>
            {suggestions.map((suggestion, index) => {
              const isSelected = selectedSuggestionIndex === index;
              const highlightIndex = suggestion.toLowerCase().indexOf(query.toLowerCase());
              const beforeHighlight = suggestion.slice(0, highlightIndex);
              const highlighted = suggestion.slice(highlightIndex, highlightIndex + query.length);
              const afterHighlight = suggestion.slice(highlightIndex + query.length);
              
              return (
                <button
                  key={index}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '15px',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                    background: isSelected ? 'rgba(16, 163, 127, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  onMouseLeave={() => setSelectedSuggestionIndex(-1)}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(16, 163, 127, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}>
                    <svg 
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        color: isSelected ? '#10a37f' : 'rgba(255, 255, 255, 0.4)'
                      }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Text with highlighting */}
                  <div style={{ flex: 1 }}>
                    <span>
                      {highlightIndex >= 0 ? (
                        <>
                          <span style={{ color: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.6)' }}>
                            {beforeHighlight}
                          </span>
                          <span style={{ 
                            color: isSelected ? '#10a37f' : '#10a37f',
                            fontWeight: '600',
                            borderBottom: '1px solid currentColor'
                          }}>
                            {highlighted}
                          </span>
                          <span style={{ color: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.6)' }}>
                            {afterHighlight}
                          </span>
                        </>
                      ) : (
                        suggestion
                      )}
                    </span>
                  </div>
                  
                  {/* Enter hint */}
                  {isSelected && (
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(16, 163, 127, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        padding: '2px 6px',
                        background: 'rgba(16, 163, 127, 0.2)',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 163, 127, 0.3)',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        Enter
                      </span>
                    </div>
                  )}
                  
                  {/* Hover effect background */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 163, 127, 0.05) 50%, transparent 100%)',
                      opacity: 0.5,
                      pointerEvents: 'none'
                    }}></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Footer hint */}
          <div style={{
            padding: '8px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>↑↓ 이동</span>
            <span>Enter 선택</span>
            <span>Esc 닫기</span>
          </div>
        </div>
      )}
    </div>
    
    {/* RAG 제안 팝업 */}
    <RAGSuggestionPopup
      isOpen={showRAGPopup}
      suggestions={ragSuggestions}
      originalQuery={ragQuery}
      onAccept={handleRAGAccept}
      onReject={handleRAGReject}
      onClose={handleRAGReject}
    />
    
    {/* CSS animations */}
    <style jsx>{`
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  </>
  );
}