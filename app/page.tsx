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

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#212121]">
        메인 컨텐츠로 건너뛰기
      </a>
      
      <main id="main-content" className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl">
          <AnimatedText />
          
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          
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