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
    <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#10a37f]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#10a37f]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <AnimatedText />
        
        <div className="relative mb-8">
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
          <div className="animate-fade-in">
            <SearchResults 
              results={searchResults} 
              isLoading={isLoading}
              query={searchQuery}
            />
          </div>
        )}
      </div>
    </div>
  );
}