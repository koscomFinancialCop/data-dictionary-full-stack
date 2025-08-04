# DataDictionary 개발 가이드라인

이 폴더에는 DataDictionary 프로젝트의 개발 가이드라인과 아키텍처 문서가 포함되어 있습니다.

## 📐 아키텍처 문서

### 1. [ARCHITECTURE.md](./ARCHITECTURE.md)
- 전체 시스템 아키텍처 개요
- 기술 스택 및 선택 이유
- 주요 설계 결정 사항

### 2. [API-DESIGN.md](./API-DESIGN.md)
- RESTful API 설계 원칙
- 엔드포인트 명세
- 요청/응답 형식

### 3. [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md)
- React 컴포넌트 구조
- 상태 관리 패턴
- 재사용 가능한 컴포넌트 설계

### 4. [DEPLOYMENT-ARCHITECTURE.md](./DEPLOYMENT-ARCHITECTURE.md)
- 배포 아키텍처 및 인프라
- CI/CD 파이프라인
- 환경별 구성

### 5. [VERCEL_POSTGRES_QUICKSTART.md](./VERCEL_POSTGRES_QUICKSTART.md)
- Vercel Postgres 빠른 시작 가이드
- 초기 설정 방법
- 모범 사례

## 🔧 개발 가이드라인

### 코드 스타일
- TypeScript 사용
- ESLint 규칙 준수
- Prettier 포맷팅 적용

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 추가 또는 수정
chore: 빌드 과정 또는 보조 도구 수정
```

### 네이밍 컨벤션
- 컴포넌트: PascalCase (예: `SearchBar`)
- 함수/변수: camelCase (예: `getUserData`)
- 상수: UPPER_SNAKE_CASE (예: `MAX_RESULTS`)
- 파일명: kebab-case (예: `user-profile.tsx`)

### 폴더 구조
```
app/              # Next.js App Router
├── api/          # API 라우트
├── dashboard/    # 대시보드 페이지
└── validator/    # 검증기 페이지

components/       # 재사용 가능한 컴포넌트
├── Layout.tsx    # 레이아웃 컴포넌트
├── SearchBar.tsx # 검색 바
└── ...

lib/              # 유틸리티 및 라이브러리
├── prisma.ts     # Prisma 클라이언트
└── ...

types/            # TypeScript 타입 정의
└── rag.ts        # RAG 관련 타입
```

## 🔒 보안 가이드라인

1. **환경 변수**
   - 민감한 정보는 절대 코드에 하드코딩하지 않음
   - `.env.local` 사용 (깃에 포함되지 않음)

2. **API 보안**
   - 입력값 검증 필수
   - SQL 인젝션 방지 (Prisma 사용)
   - XSS 방지 (React 자동 이스케이핑)

3. **데이터 보호**
   - 개인정보는 암호화하여 저장
   - 로그에 민감한 정보 포함 금지

## 🧪 테스트 가이드라인

1. **단위 테스트**
   - 모든 유틸리티 함수에 대한 테스트 작성
   - Jest 사용

2. **통합 테스트**
   - API 엔드포인트 테스트
   - 데이터베이스 연동 테스트

3. **E2E 테스트**
   - 주요 사용자 시나리오 테스트
   - Playwright 사용 (선택사항)

## 📊 성능 가이드라인

1. **데이터베이스 쿼리**
   - N+1 문제 방지
   - 적절한 인덱스 사용
   - 페이지네이션 구현

2. **프론트엔드 최적화**
   - 이미지 최적화 (Next.js Image 컴포넌트)
   - 코드 스플리팅
   - 캐싱 전략 구현

3. **API 응답 시간**
   - 목표: 95% 요청이 200ms 이내
   - Prisma Accelerate로 연결 풀링 최적화

## 🤝 협업 가이드라인

1. **코드 리뷰**
   - 모든 PR은 최소 1명의 리뷰 필요
   - 건설적인 피드백 제공

2. **문서화**
   - 새로운 기능은 문서화 필수
   - API 변경사항은 명세 업데이트

3. **이슈 관리**
   - 버그/기능 요청은 GitHub Issues 사용
   - 라벨을 통한 분류

## 📝 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)