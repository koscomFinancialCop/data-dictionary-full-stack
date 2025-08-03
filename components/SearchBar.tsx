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
      <div className="relative w-full" role="search">
      <form onSubmit={handleSubmit} className="relative" role="form">
        <div className={`
          relative flex items-center bg-[#2f2f2f] rounded-3xl border-2 
          transition-all duration-200 shadow-lg h-24
          ${isFocused ? 'border-[#10a37f] shadow-[0_0_15px_rgba(16,163,127,0.15)]' : 'border-transparent hover:border-[#444]'}
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
            placeholder="무엇이든 물어보세요"
            className="w-full text-lg text-white bg-transparent outline-none focus:outline-none rounded-l-xl placeholder:text-[#8e8e8e] font-normal"
            style={{
              padding: '24px 32px'
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
          className="absolute top-full left-0 right-0 mt-2 bg-[#2f2f2f] rounded-2xl border border-[#444] overflow-hidden z-10 shadow-xl"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={selectedSuggestionIndex === index}
              className={`w-full px-6 py-3 text-left transition-colors flex items-center text-sm ${
                selectedSuggestionIndex === index
                  ? 'bg-[#3e3e3e] text-white'
                  : 'hover:bg-[#3e3e3e] text-white/80'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <svg className="w-4 h-4 mr-3 text-[#8e8e8e]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 2a8 8 0 016.32 12.906l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z" />
              </svg>
              <span>{suggestion}</span>
            </button>
          ))}
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
  </>
  );
}