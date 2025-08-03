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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/translate?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results);
        console.log('Page: Search results:', data.results.length);
        
        // 결과가 없으면 SearchBar에 알림
        if (data.results.length === 0 && query.trim()) {
          console.log('Page: No results, calling handleNoResults');
          handleNoResults(query);
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
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#212121]">
        메인 컨텐츠로 건너뛰기
      </a>
      
      <main id="main-content" className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl">
          <AnimatedText />
          
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoading}
            onNoResults={handleNoResults}
          />
          
          {searchQuery && (
            <SearchResults 
              results={searchResults} 
              isLoading={isLoading}
              query={searchQuery}
            />
          )}
        </div>
      </main>
    </div>
  );
}