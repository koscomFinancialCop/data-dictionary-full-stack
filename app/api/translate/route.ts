import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 기존 더미 데이터 (fallback용)
const variableMappings = [
  // 사용자 관련
  { korean: '사용자', english: 'user', type: '변수', description: '시스템 사용자' },
  { korean: '사용자명', english: 'userName', type: '변수', description: '사용자 이름' },
  { korean: '사용자정보', english: 'userInfo', type: '변수', description: '사용자 정보 객체' },
  { korean: '회원', english: 'member', type: '변수', description: '서비스 회원' },
  { korean: '회원가입', english: 'signUp', type: '함수', description: '회원 가입 기능' },
  { korean: '로그인', english: 'login', type: '함수', description: '로그인 기능' },
  { korean: '로그아웃', english: 'logout', type: '함수', description: '로그아웃 기능' },
  { korean: '비밀번호', english: 'password', type: '변수', description: '사용자 비밀번호' },
  
  // 정보 관련
  { korean: '이메일', english: 'email', type: '변수', description: '이메일 주소' },
  { korean: '전화번호', english: 'phoneNumber', type: '변수', description: '전화번호' },
  { korean: '주소', english: 'address', type: '변수', description: '주소 정보' },
  { korean: '이름', english: 'name', type: '변수', description: '이름' },
  { korean: '생년월일', english: 'birthDate', type: '변수', description: '생년월일' },
  
  // 금융 관련
  { korean: '계좌', english: 'account', type: '변수', description: '금융 계좌' },
  { korean: '계좌번호', english: 'accountNumber', type: '변수', description: '계좌 번호' },
  { korean: '거래', english: 'transaction', type: '변수', description: '금융 거래' },
  { korean: '입금', english: 'deposit', type: '함수', description: '입금 처리' },
  { korean: '출금', english: 'withdrawal', type: '함수', description: '출금 처리' },
  { korean: '잔액', english: 'balance', type: '변수', description: '계좌 잔액' },
  { korean: '주문', english: 'order', type: '변수', description: '주문 정보' },
  { korean: '체결', english: 'execution', type: '변수', description: '거래 체결' },
  { korean: '매수', english: 'buy', type: '함수', description: '매수 주문' },
  { korean: '매도', english: 'sell', type: '함수', description: '매도 주문' },
  { korean: '호가', english: 'orderBook', type: '변수', description: '호가 정보' },
  
  // 상품 관련
  { korean: '상품', english: 'product', type: '변수', description: '상품 정보' },
  { korean: '상품명', english: 'productName', type: '변수', description: '상품 이름' },
  { korean: '상품코드', english: 'productCode', type: '변수', description: '상품 코드' },
  { korean: '종목', english: 'stock', type: '변수', description: '주식 종목' },
  { korean: '종목코드', english: 'stockCode', type: '변수', description: '종목 코드' },
  
  // 시간 관련
  { korean: '날짜', english: 'date', type: '변수', description: '날짜' },
  { korean: '시간', english: 'time', type: '변수', description: '시간' },
  { korean: '시작일', english: 'startDate', type: '변수', description: '시작 날짜' },
  { korean: '종료일', english: 'endDate', type: '변수', description: '종료 날짜' },
  { korean: '등록일', english: 'registrationDate', type: '변수', description: '등록 날짜' },
  
  // 기타
  { korean: '검색', english: 'search', type: '함수', description: '검색 기능' },
  { korean: '목록', english: 'list', type: '변수', description: '목록 데이터' },
  { korean: '상세정보', english: 'details', type: '변수', description: '상세 정보' },
  { korean: '조회', english: 'query', type: '함수', description: '데이터 조회' },
  { korean: '수정', english: 'update', type: '함수', description: '데이터 수정' },
  { korean: '삭제', english: 'delete', type: '함수', description: '데이터 삭제' },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: '검색어를 입력해주세요' },
      { status: 400 }
    );
  }

  try {
    // 데이터베이스에서 검색
    const results = await prisma.variableMapping.findMany({
      where: {
        OR: [
          { korean: { contains: query, mode: 'insensitive' } },
          { english: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: [
        // 정확히 일치하는 경우 우선 (사용자 정의 정렬 필요)
        { korean: 'asc' }
      ],
      take: 20 // 더 많이 가져와서 필터링
    });

    // 클라이언트 측에서 정확도 순으로 재정렬
    const searchQuery = query.toLowerCase();
    const sortedResults = results.sort((a, b) => {
      const aKoreanLower = a.korean.toLowerCase();
      const bKoreanLower = b.korean.toLowerCase();
      const aEnglishLower = a.english.toLowerCase();
      const bEnglishLower = b.english.toLowerCase();
      
      // 정확히 일치하는 경우 우선
      const aExactMatch = aKoreanLower === searchQuery || aEnglishLower === searchQuery;
      const bExactMatch = bKoreanLower === searchQuery || bEnglishLower === searchQuery;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // 시작 부분이 일치하는 경우 우선
      const aStartsWith = aKoreanLower.startsWith(searchQuery) || aEnglishLower.startsWith(searchQuery);
      const bStartsWith = bKoreanLower.startsWith(searchQuery) || bEnglishLower.startsWith(searchQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // 길이가 짧은 것 우선
      return a.korean.length - b.korean.length;
    });

    // 검색 기록 저장 (비동기로 처리)
    prisma.searchHistory.create({
      data: {
        query: query,
        results: sortedResults.length
      }
    }).catch(console.error); // 에러가 나도 검색 결과는 반환

    // 활동 로깅 (비동기로 처리)
    const sessionId = request.headers.get('x-session-id') || 'anonymous';
    fetch(new URL('/api/activity', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'translation',
        query,
        result: { count: sortedResults.length },
        sessionId,
        success: true,
      }),
    }).catch(console.error);

    return NextResponse.json({
      results: sortedResults.slice(0, 10),
      total: sortedResults.length
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // 데이터베이스 연결 실패 시 더미 데이터로 폴백
    const fallbackResults = variableMappings.filter(item => {
      const koreanLower = item.korean.toLowerCase();
      const englishLower = item.english.toLowerCase();
      const searchQuery = query.toLowerCase();
      
      return koreanLower.includes(searchQuery) || englishLower.includes(searchQuery);
    }).slice(0, 10);

    return NextResponse.json({
      results: fallbackResults,
      total: fallbackResults.length,
      fallback: true // 클라이언트에 폴백 데이터임을 알림
    });
  }
}