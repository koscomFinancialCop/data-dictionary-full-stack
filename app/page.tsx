'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import AnimatedText from '@/components/AnimatedText';

export default function Home() {
  // Initialize session ID
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('sessionId')) {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
  }, []);
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
      // Get session ID for tracking
      const sessionId = typeof window !== 'undefined' 
        ? sessionStorage.getItem('sessionId') || 'anonymous' 
        : 'anonymous';
        
      const response = await fetch(`/api/translate?q=${encodeURIComponent(query)}`, {
        headers: {
          'x-session-id': sessionId
        }
      });
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

  // Styles
  const containerStyle = {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '48px 16px'
  };

  const backgroundDecorationStyle = {
    position: 'fixed' as const,
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none' as const
  };

  const decorationBlobStyle1 = {
    position: 'absolute' as const,
    top: '-160px',
    right: '-160px',
    width: '320px',
    height: '320px',
    backgroundColor: 'rgba(16, 163, 127, 0.05)',
    borderRadius: '50%',
    filter: 'blur(60px)'
  };

  const decorationBlobStyle2 = {
    position: 'absolute' as const,
    bottom: '-160px',
    left: '-160px',
    width: '320px',
    height: '320px',
    backgroundColor: 'rgba(16, 163, 127, 0.05)',
    borderRadius: '50%',
    filter: 'blur(60px)'
  };

  const contentWrapperStyle = {
    width: '100%',
    maxWidth: '1024px',
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 10
  };

  const searchBarWrapperStyle = {
    position: 'relative' as const,
    marginBottom: '32px'
  };

  const searchBarGlowStyle = {
    position: 'absolute' as const,
    inset: 0,
    zIndex: -1,
    filter: 'blur(48px)',
    opacity: 0.2
  };

  const searchBarGlowInnerStyle = {
    height: '100%',
    width: '100%',
    background: 'linear-gradient(to right, #10a37f, #0ea573)',
    borderRadius: '50%'
  };

  const searchResultsWrapperStyle = {
    animation: 'fadeIn 0.5s ease-out'
  };

  return (
    <div style={containerStyle}>
      {/* Background decoration */}
      <div style={backgroundDecorationStyle}>
        <div style={decorationBlobStyle1}></div>
        <div style={decorationBlobStyle2}></div>
      </div>
      
      <div style={contentWrapperStyle}>
        <AnimatedText />
        
        <div style={searchBarWrapperStyle}>
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoading}
            onNoResults={hasNoResults ? handleNoResults : undefined}
          />
          
          {/* Search bar glow effect */}
          <div style={searchBarGlowStyle}>
            <div style={searchBarGlowInnerStyle}></div>
          </div>
        </div>
        
        {searchQuery && (
          <div style={searchResultsWrapperStyle}>
            <SearchResults 
              results={searchResults} 
              isLoading={isLoading}
              query={searchQuery}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
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