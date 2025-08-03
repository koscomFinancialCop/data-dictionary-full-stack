'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

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
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            한글 → 영어 변수명 변환기
          </h1>
          
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          
          {searchQuery && (
            <SearchResults 
              results={searchResults} 
              isLoading={isLoading}
              query={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}