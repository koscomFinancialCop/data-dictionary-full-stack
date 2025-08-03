'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import AnimatedText from '@/components/AnimatedText';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    korean: string;
    english: string;
    type: string;
    description?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNoResults, setHasNoResults] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setHasNoResults(false); // Reset state
    
    try {
      const response = await fetch(`/api/translate?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results);
        console.log('Page: Search results:', data.results.length);
        
        // 결과가 없을 때만 플래그 설정
        if (data.results.length === 0 && query.trim()) {
          console.log('Page: No results found, setting hasNoResults to true');
          setHasNoResults(true);
        }
      } else {
        console.error('API error:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNoResults = (query: string) => {
    // 결과가 없을 때 처리 (SearchBar가 자체적으로 RAG 호출)
    console.log('No results found for:', query);
    // SearchBar가 이 콜백을 감지하고 RAG를 호출합니다
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#212121] via-[#1a1a1a] to-[#212121] text-white overflow-x-hidden">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#212121]">
        메인 컨텐츠로 건너뛰기
      </a>
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#10a37f]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#10a37f]/5 rounded-full blur-3xl"></div>
      </div>
      
      <main id="main-content" className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <AnimatedText />
          
          <div className="relative">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoading}
              onNoResults={hasNoResults ? handleNoResults : undefined}
            />
            
            {/* Search bar glow effect */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
              <div className="h-full w-full bg-gradient-to-r from-[#10a37f] to-[#0ea573] rounded-full"></div>
            </div>
          </div>
          
          {searchQuery && (
            <div className="mt-20 animate-fade-in">
              <SearchResults 
                results={searchResults} 
                isLoading={isLoading}
                query={searchQuery}
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 py-6 text-center">
          <p className="text-xs text-[#666]">
            Powered by Claude • 금융매체팀 백건우
          </p>
        </footer>
      </main>
    </div>
  );
}