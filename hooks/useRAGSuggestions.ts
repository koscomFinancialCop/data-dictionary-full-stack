'use client';

import { useState, useCallback } from 'react';
import { RAGSuggestion, RAGWebhookResponse, DictionaryAddRequest } from '@/types/rag';

interface UseRAGSuggestionsReturn {
  getSuggestions: (query: string) => Promise<void>;
  suggestions: RAGSuggestion[];
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
  addToDictionary: (korean: string, suggestion: RAGSuggestion) => Promise<boolean>;
}

export function useRAGSuggestions(): UseRAGSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<RAGSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      reset();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rag/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          language: 'ko',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get suggestions: ${response.statusText}`);
      }

      const data: RAGWebhookResponse = await response.json();
      
      // 최소 신뢰도 필터링 (환경 변수에서 설정 가능)
      const minConfidence = 0.3; // 또는 process.env.NEXT_PUBLIC_RAG_MIN_CONFIDENCE
      const filteredSuggestions = data.suggestions.filter(
        s => s.confidence >= minConfidence
      );

      setSuggestions(filteredSuggestions);
    } catch (err) {
      console.error('RAG suggestions error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  const addToDictionary = useCallback(async (
    korean: string, 
    suggestion: RAGSuggestion
  ): Promise<boolean> => {
    try {
      const payload: DictionaryAddRequest = {
        korean,
        english: suggestion.english,
        type: suggestion.type || '변수',
        category: suggestion.category || '일반',
        description: suggestion.reasoning || '',
        source: 'rag',
        confidence: suggestion.confidence,
      };

      const response = await fetch('/api/dictionary/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add to dictionary');
      }

      return result.success;
    } catch (err) {
      console.error('Failed to add to dictionary:', err);
      return false;
    }
  }, []);

  return {
    getSuggestions,
    suggestions,
    isLoading,
    error,
    reset,
    addToDictionary,
  };
}