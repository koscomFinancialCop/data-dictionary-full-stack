// RAG Pipeline Types

export interface RAGSuggestion {
  english: string;
  confidence: number;
  reasoning: string;
  type: 'variable' | 'function' | 'class';
  category: string;
}

export interface RAGWebhookRequest {
  query: string;
  context?: string;
  language: 'ko' | 'en';
}

export interface RAGWebhookResponse {
  suggestions: RAGSuggestion[];
  metadata: {
    ragVersion: string;
    responseTime: number;
  };
}

export interface DictionaryAddRequest {
  korean: string;
  english: string;
  type: string;
  category: string;
  description: string;
  source: 'rag' | 'manual';
  confidence?: number;
}

export interface DictionaryAddResponse {
  success: boolean;
  data?: any;
  message: string;
}

export interface RAGConfig {
  webhookUrl: string;
  apiKey?: string;
  timeout: number;
  maxRetries: number;
  minConfidence: number;
}