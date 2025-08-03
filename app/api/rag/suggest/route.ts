import { NextRequest, NextResponse } from 'next/server';
import { RAGWebhookRequest, RAGWebhookResponse } from '@/types/rag';

// RAG 설정 - n8n webhook URL 사용
const RAG_CONFIG = {
  webhookUrl: process.env.RAG_WEBHOOK_URL || 'https://koscom.app.n8n.cloud/webhook/invoke',
  apiKey: process.env.RAG_API_KEY,
  timeout: parseInt(process.env.RAG_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.RAG_MAX_RETRIES || '3'),
};

// 캐시 저장소 (간단한 메모리 캐시)
const suggestionCache = new Map<string, { data: RAGWebhookResponse; timestamp: number }>();
const CACHE_TTL = 3600000; // 1시간

export async function POST(request: NextRequest) {
  try {
    const body: RAGWebhookRequest = await request.json();
    const { query, context, language = 'ko' } = body;

    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      );
    }

    // 캐시 확인
    const cacheKey = `${query}-${context || ''}-${language}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('캐시에서 RAG 제안 반환:', cacheKey);
      return NextResponse.json(cached.data);
    }

    // RAG 웹훅 호출
    console.log('RAG 웹훅 호출:', query);
    const startTime = Date.now();
    
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries < RAG_CONFIG.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), RAG_CONFIG.timeout);
        
        const response = await fetch(RAG_CONFIG.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(RAG_CONFIG.apiKey && { 'Authorization': `Bearer ${RAG_CONFIG.apiKey}` }),
          },
          body: JSON.stringify({
            chatInput: query, // n8n webhook 형식에 맞춤
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`RAG API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        // n8n 응답 형식 파싱 및 정규화
        const parsedSuggestions = parseN8nResponse(data, query);
        
        const normalizedResponse: RAGWebhookResponse = {
          suggestions: parsedSuggestions,
          metadata: {
            ragVersion: '1.0',
            responseTime,
          },
        };
        
        // 캐시 저장
        suggestionCache.set(cacheKey, {
          data: normalizedResponse,
          timestamp: Date.now(),
        });
        
        return NextResponse.json(normalizedResponse);
        
      } catch (error) {
        lastError = error as Error;
        retries++;
        
        if (retries < RAG_CONFIG.maxRetries) {
          // 지수 백오프
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    }
    
    // 모든 재시도 실패
    console.error('RAG 웹훅 호출 실패:', lastError);
    
    // 폴백: 간단한 규칙 기반 제안
    const fallbackSuggestions = generateFallbackSuggestions(query);
    
    return NextResponse.json({
      suggestions: fallbackSuggestions,
      metadata: {
        ragVersion: 'fallback',
        responseTime: Date.now() - startTime,
      },
    });
    
  } catch (error) {
    console.error('RAG 제안 API 오류:', error);
    return NextResponse.json(
      { error: 'RAG 제안을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// n8n 응답 파싱 함수
function parseN8nResponse(data: any, originalQuery: string): any[] {
  const suggestions = [];
  
  // n8n 응답 형식에 따라 파싱 로직 조정
  // 예상 응답 형식:
  // 1. 직접 변수명 제안
  // 2. 배열 형태의 제안 목록
  // 3. 객체 형태의 단일 제안
  
  // n8n 응답 확인
  console.log('n8n 응답 원본:', data);
  
  // 케이스 1: output 필드가 있는 경우 (n8n 형식)
  if (data && data.output) {
    suggestions.push({
      english: String(data.output).trim(),
      confidence: 0.85,
      reasoning: 'AI 추천 변수명',
      type: 'variable',
      category: '금융',
    });
  }
  // 케이스 2: 문자열 응답 (단일 제안)
  else if (typeof data === 'string') {
    suggestions.push({
      english: data.trim(),
      confidence: 0.8,
      reasoning: 'RAG 파이프라인 제안',
      type: 'variable',
      category: '일반',
    });
  }
  // 케이스 2: 객체 응답
  else if (data && typeof data === 'object') {
    // 배열인 경우
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (typeof item === 'string') {
          suggestions.push({
            english: item.trim(),
            confidence: 0.9 - (index * 0.1), // 순서대로 신뢰도 감소
            reasoning: 'RAG 파이프라인 제안',
            type: 'variable',
            category: '일반',
          });
        } else if (item.name || item.variable || item.english) {
          suggestions.push({
            english: (item.name || item.variable || item.english).trim(),
            confidence: item.confidence || (0.9 - (index * 0.1)),
            reasoning: item.reason || item.reasoning || 'RAG 파이프라인 제안',
            type: item.type || 'variable',
            category: item.category || '일반',
          });
        }
      });
    }
    // 단일 객체인 경우
    else if (data.suggestion || data.variable || data.english || data.result) {
      const suggestion = data.suggestion || data.variable || data.english || data.result;
      
      // 여러 제안이 포함된 텍스트인 경우 파싱
      if (typeof suggestion === 'string' && suggestion.includes(',')) {
        suggestion.split(',').forEach((item: string, index: number) => {
          suggestions.push({
            english: item.trim(),
            confidence: 0.9 - (index * 0.1),
            reasoning: 'RAG 파이프라인 제안',
            type: 'variable',
            category: '일반',
          });
        });
      } else {
        suggestions.push({
          english: typeof suggestion === 'string' ? suggestion.trim() : String(suggestion),
          confidence: data.confidence || 0.85,
          reasoning: data.reasoning || 'RAG 파이프라인 제안',
          type: data.type || 'variable',
          category: data.category || '일반',
        });
      }
    }
  }
  
  // 제안이 없는 경우 폴백
  if (suggestions.length === 0) {
    console.log('n8n 응답 파싱 실패, 원본 데이터:', data);
    return generateFallbackSuggestions(originalQuery);
  }
  
  return suggestions;
}

// 폴백 제안 생성 (간단한 규칙 기반)
function generateFallbackSuggestions(query: string): any[] {
  const suggestions = [];
  
  // 주문증거금 같은 금융 용어 매핑
  const financialTerms: { [key: string]: string[] } = {
    '주문증거금': ['orderMargin', 'orderDeposit', 'orderCollateral'],
    '증거금': ['margin', 'deposit', 'collateral'],
    '주문': ['order', 'orderRequest', 'trade'],
    '잔고': ['balance', 'position', 'holdings'],
    '체결': ['execution', 'filled', 'completed'],
    '미체결': ['pending', 'unfilled', 'openOrder'],
  };
  
  // 금융 용어 체크
  for (const [term, englishOptions] of Object.entries(financialTerms)) {
    if (query.includes(term)) {
      englishOptions.forEach((english, index) => {
        suggestions.push({
          english,
          confidence: 0.7 - (index * 0.1),
          reasoning: '금융 도메인 규칙 기반 제안',
          type: 'variable',
          category: '금융',
        });
      });
      return suggestions;
    }
  }
  
  // 일반 규칙 기반 변환
  const rules = [
    { pattern: /사용자|유저/, english: 'user', type: 'variable' },
    { pattern: /이름|명/, english: 'name', type: 'variable' },
    { pattern: /번호|넘버/, english: 'number', type: 'variable' },
    { pattern: /날짜|일자/, english: 'date', type: 'variable' },
    { pattern: /시간|타임/, english: 'time', type: 'variable' },
    { pattern: /목록|리스트/, english: 'list', type: 'variable' },
    { pattern: /조회|검색/, english: 'search', type: 'function' },
    { pattern: /저장|등록/, english: 'save', type: 'function' },
    { pattern: /삭제|제거/, english: 'delete', type: 'function' },
    { pattern: /수정|변경/, english: 'update', type: 'function' },
  ];
  
  for (const rule of rules) {
    if (rule.pattern.test(query)) {
      suggestions.push({
        english: rule.english,
        confidence: 0.5,
        reasoning: '규칙 기반 폴백 제안',
        type: rule.type,
        category: '일반',
      });
    }
  }
  
  // 카멜케이스 변환 시도
  const camelCase = query
    .split(/\s+/)
    .map((word, index) => 
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
    
  if (camelCase && camelCase !== query) {
    suggestions.push({
      english: camelCase,
      confidence: 0.3,
      reasoning: '카멜케이스 변환',
      type: 'variable',
      category: '일반',
    });
  }
  
  return suggestions;
}