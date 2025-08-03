'use client';

import { useState, useRef, useEffect, useId } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listboxId = useId();

  useEffect(() => {
    // 자동완성 기능을 위한 mock 데이터
    if (query.length > 0) {
      const mockSuggestions = [
        '사용자',
        '사용자명',
        '사용자정보',
        '회원',
        '회원가입',
        '로그인',
        '비밀번호',
        '이메일',
        '전화번호',
        '주소',
        '검색',
        '목록',
        '상세정보',
        '날짜',
        '시간',
      ].filter(item => item.includes(query));
      setSuggestions(mockSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

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

  return (
    <div className="relative w-full" role="search">
      <form onSubmit={handleSubmit} className="relative" role="form">
        <div className={`
          relative flex items-center bg-white rounded-full shadow-md 
          transition-all duration-200 
          ${isFocused ? 'shadow-lg ring-2 ring-black' : 'hover:shadow-lg'}
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
            placeholder="한글 변수명을 입력하세요 (예: 사용자명)"
            className="w-full px-6 py-4 text-lg text-black bg-transparent outline-none rounded-l-full placeholder:text-gray-500"
            disabled={isLoading}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0 && isFocused}
            aria-controls={listboxId}
            aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
            aria-label="한글 변수명 검색"
          />
          
          <div className="flex items-center pr-4">
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setSelectedSuggestionIndex(-1);
                  inputRef.current?.focus();
                }}
                className="p-2 text-gray-500 hover:text-black transition-colors"
                aria-label="검색어 지우기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`
                p-2 transition-all duration-200
                ${isLoading || !query.trim() 
                  ? 'text-[#444] cursor-not-allowed' 
                  : 'text-[#8e8e8e] hover:text-white'
                }
              `}
              aria-label={isLoading ? '검색 중...' : '검색'}
            >
              {isLoading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 자동완성 드롭다운 */}
      {suggestions.length > 0 && isFocused && (
        <div 
          ref={suggestionsRef}
          id={listboxId}
          role="listbox"
          aria-label="검색 제안"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-10"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={selectedSuggestionIndex === index}
              className={`w-full px-6 py-3 text-left transition-colors flex items-center ${
                selectedSuggestionIndex === index
                  ? 'bg-gray-100 text-black font-medium'
                  : 'hover:bg-gray-50 text-black'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}