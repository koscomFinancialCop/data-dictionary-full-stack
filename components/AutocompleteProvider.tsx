'use client';

// 확장 가능한 자동완성 제공자 클래스
// 미래에 데이터베이스나 외부 API와 연결하기 쉽도록 설계

interface AutocompleteSource {
  getSuggestions(query: string): Promise<string[]>;
}

// Mock 데이터 소스 (개발용)
class MockAutocompleteSource implements AutocompleteSource {
  private mockData = [
    // 사용자 관련
    '사용자', '사용자명', '사용자정보', '사용자ID', '사용자번호',
    // 회원 관련
    '회원', '회원가입', '회원정보', '회원번호', '회원탈퇴',
    // 인증 관련
    '로그인', '로그아웃', '비밀번호', '인증', '권한',
    // 정보 관련
    '이메일', '전화번호', '주소', '이름', '생년월일',
    // 금융 관련
    '계좌', '계좌번호', '거래', '입금', '출금', '잔액',
    '주문', '체결', '매수', '매도', '호가',
    // 상품 관련
    '상품', '상품명', '상품코드', '종목', '종목코드',
    // 시간 관련
    '날짜', '시간', '시작일', '종료일', '등록일',
    // 기타
    '검색', '목록', '상세정보', '조회', '수정', '삭제'
  ];

  async getSuggestions(query: string): Promise<string[]> {
    // 검색어 정규화
    const normalizedQuery = query.toLowerCase().trim();
    
    // 매칭 로직
    const suggestions = this.mockData
      .filter(item => {
        const normalizedItem = item.toLowerCase();
        // 시작 부분 매칭 우선
        if (normalizedItem.startsWith(normalizedQuery)) {
          return true;
        }
        // 포함 매칭
        return normalizedItem.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        // 시작 부분 매칭을 우선 정렬
        const aStarts = aLower.startsWith(normalizedQuery);
        const bStarts = bLower.startsWith(normalizedQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // 길이가 짧은 것 우선
        return a.length - b.length;
      })
      .slice(0, 5);

    // 비동기 동작 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => resolve(suggestions), 50);
    });
  }
}

// 데이터베이스 소스 (미래 구현을 위한 템플릿)
class DatabaseAutocompleteSource implements AutocompleteSource {
  async getSuggestions(query: string): Promise<string[]> {
    // TODO: 실제 데이터베이스 연결 구현
    // const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
    // const data = await response.json();
    // return data.suggestions;
    
    // 현재는 Mock 데이터 반환
    return new MockAutocompleteSource().getSuggestions(query);
  }
}

// 메인 AutocompleteProvider 클래스
export class AutocompleteProvider {
  private sources: AutocompleteSource[] = [];
  
  constructor() {
    // 기본 소스 추가 (나중에 설정으로 변경 가능)
    this.addSource(new MockAutocompleteSource());
  }
  
  // 소스 추가 메서드 (확장성)
  addSource(source: AutocompleteSource) {
    this.sources.push(source);
  }
  
  // 소스 제거 메서드
  removeSource(source: AutocompleteSource) {
    const index = this.sources.indexOf(source);
    if (index > -1) {
      this.sources.splice(index, 1);
    }
  }
  
  // 통합 검색 제안
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    // 모든 소스에서 병렬로 제안 가져오기
    const allSuggestionsPromises = this.sources.map(source => 
      source.getSuggestions(query).catch(() => [])
    );
    
    const allSuggestionsArrays = await Promise.all(allSuggestionsPromises);
    
    // 중복 제거 및 병합
    const uniqueSuggestions = new Set<string>();
    allSuggestionsArrays.forEach(suggestions => {
      suggestions.forEach(suggestion => {
        uniqueSuggestions.add(suggestion);
      });
    });
    
    // 배열로 변환하고 최대 5개 반환
    return Array.from(uniqueSuggestions).slice(0, 5);
  }
  
  // 데이터베이스 모드로 전환 (미래 구현)
  enableDatabaseMode() {
    this.sources = [new DatabaseAutocompleteSource()];
  }
  
  // 혼합 모드 (Mock + Database)
  enableHybridMode() {
    this.sources = [
      new MockAutocompleteSource(),
      new DatabaseAutocompleteSource()
    ];
  }
}