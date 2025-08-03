import { NextRequest, NextResponse } from 'next/server';

// 한글-영어 변수명 사전
const dictionary: Record<string, { english: string; type: string; description?: string }[]> = {
  // 사용자 관련
  '사용자': [
    { english: 'user', type: 'noun', description: '시스템을 사용하는 사람' },
    { english: 'member', type: 'noun', description: '회원' },
  ],
  '사용자명': [
    { english: 'userName', type: 'variable', description: 'camelCase 변수명' },
    { english: 'username', type: 'variable', description: '소문자 변수명' },
    { english: 'user_name', type: 'variable', description: 'snake_case 변수명' },
  ],
  '사용자ID': [
    { english: 'userId', type: 'variable' },
    { english: 'userID', type: 'variable' },
    { english: 'user_id', type: 'variable' },
  ],
  '사용자정보': [
    { english: 'userInfo', type: 'variable' },
    { english: 'userInformation', type: 'variable' },
    { english: 'user_info', type: 'variable' },
  ],
  
  // 인증 관련
  '로그인': [
    { english: 'login', type: 'verb' },
    { english: 'signIn', type: 'verb' },
    { english: 'logIn', type: 'verb' },
  ],
  '로그아웃': [
    { english: 'logout', type: 'verb' },
    { english: 'signOut', type: 'verb' },
    { english: 'logOut', type: 'verb' },
  ],
  '비밀번호': [
    { english: 'password', type: 'noun' },
    { english: 'pwd', type: 'abbreviation' },
    { english: 'pass', type: 'abbreviation' },
  ],
  
  // 데이터 관련
  '목록': [
    { english: 'list', type: 'noun' },
    { english: 'items', type: 'noun' },
    { english: 'array', type: 'noun' },
  ],
  '데이터': [
    { english: 'data', type: 'noun' },
    { english: 'information', type: 'noun' },
    { english: 'info', type: 'abbreviation' },
  ],
  '검색': [
    { english: 'search', type: 'verb/noun' },
    { english: 'find', type: 'verb' },
    { english: 'query', type: 'noun' },
  ],
  
  // 시간 관련
  '날짜': [
    { english: 'date', type: 'noun' },
    { english: 'day', type: 'noun' },
  ],
  '시간': [
    { english: 'time', type: 'noun' },
    { english: 'hour', type: 'noun' },
    { english: 'timestamp', type: 'noun' },
  ],
  '시작일': [
    { english: 'startDate', type: 'variable' },
    { english: 'beginDate', type: 'variable' },
    { english: 'start_date', type: 'variable' },
  ],
  '종료일': [
    { english: 'endDate', type: 'variable' },
    { english: 'finishDate', type: 'variable' },
    { english: 'end_date', type: 'variable' },
  ],
  
  // 상태 관련
  '상태': [
    { english: 'status', type: 'noun' },
    { english: 'state', type: 'noun' },
    { english: 'condition', type: 'noun' },
  ],
  '활성': [
    { english: 'active', type: 'adjective' },
    { english: 'enabled', type: 'adjective' },
    { english: 'isActive', type: 'variable' },
  ],
  '비활성': [
    { english: 'inactive', type: 'adjective' },
    { english: 'disabled', type: 'adjective' },
    { english: 'isInactive', type: 'variable' },
  ],
  
  // 기타 공통 용어
  '제목': [
    { english: 'title', type: 'noun' },
    { english: 'subject', type: 'noun' },
    { english: 'heading', type: 'noun' },
  ],
  '내용': [
    { english: 'content', type: 'noun' },
    { english: 'body', type: 'noun' },
    { english: 'text', type: 'noun' },
  ],
  '설명': [
    { english: 'description', type: 'noun' },
    { english: 'desc', type: 'abbreviation' },
    { english: 'explanation', type: 'noun' },
  ],
  '번호': [
    { english: 'number', type: 'noun' },
    { english: 'no', type: 'abbreviation' },
    { english: 'id', type: 'noun' },
  ],
  '이름': [
    { english: 'name', type: 'noun' },
    { english: 'title', type: 'noun' },
  ],
  '전화번호': [
    { english: 'phoneNumber', type: 'variable' },
    { english: 'phone', type: 'noun' },
    { english: 'tel', type: 'abbreviation' },
  ],
  '이메일': [
    { english: 'email', type: 'noun' },
    { english: 'mail', type: 'noun' },
    { english: 'emailAddress', type: 'variable' },
  ],
  '주소': [
    { english: 'address', type: 'noun' },
    { english: 'addr', type: 'abbreviation' },
    { english: 'location', type: 'noun' },
  ],
  '회원': [
    { english: 'member', type: 'noun' },
    { english: 'user', type: 'noun' },
  ],
  '회원가입': [
    { english: 'signUp', type: 'verb' },
    { english: 'register', type: 'verb' },
    { english: 'join', type: 'verb' },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const results: Array<{
    korean: string;
    english: string;
    type: string;
    description?: string;
  }> = [];

  // 정확한 매칭 우선
  if (dictionary[query]) {
    dictionary[query].forEach(item => {
      results.push({
        korean: query,
        ...item,
      });
    });
  }

  // 부분 매칭
  Object.entries(dictionary).forEach(([korean, translations]) => {
    if (korean !== query && korean.includes(query)) {
      translations.forEach(item => {
        results.push({
          korean,
          ...item,
        });
      });
    }
  });

  // 결과 정렬 (정확한 매칭이 먼저 오도록)
  results.sort((a, b) => {
    if (a.korean === query && b.korean !== query) return -1;
    if (a.korean !== query && b.korean === query) return 1;
    return 0;
  });

  return NextResponse.json({
    query,
    results: results.slice(0, 10), // 최대 10개까지만 반환
    total: results.length,
  });
}