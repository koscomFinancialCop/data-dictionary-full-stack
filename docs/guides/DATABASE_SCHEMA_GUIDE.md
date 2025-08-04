# 데이터베이스 테이블 스키마 가이드

현재 DataDictionary 프로젝트에서 사용하는 모든 테이블 스키마입니다.
Vercel Postgres나 다른 PostgreSQL 데이터베이스에 생성할 때 이 스키마를 사용하세요.

## 테이블 구조

### 1. VariableMapping (변수명 매핑 테이블)
메인 테이블로 한글-영어 변수명 매핑 정보를 저장합니다.

```sql
CREATE TABLE "VariableMapping" (
    "id" TEXT NOT NULL,
    "korean" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "usage" TEXT,
    "tags" TEXT[],
    "source" TEXT NOT NULL DEFAULT 'manual',
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableMapping_pkey" PRIMARY KEY ("id")
);

-- Unique constraint
CREATE UNIQUE INDEX "VariableMapping_korean_english_type_key" ON "VariableMapping"("korean", "english", "type");

-- Indexes
CREATE INDEX "VariableMapping_korean_idx" ON "VariableMapping"("korean");
CREATE INDEX "VariableMapping_english_idx" ON "VariableMapping"("english");
CREATE INDEX "VariableMapping_category_idx" ON "VariableMapping"("category");
CREATE INDEX "VariableMapping_tags_idx" ON "VariableMapping"("tags");
CREATE INDEX "VariableMapping_source_idx" ON "VariableMapping"("source");
```

**필드 설명:**
- `id`: 고유 식별자 (CUID)
- `korean`: 한글 용어
- `english`: 영어 변수명
- `type`: 타입 (변수, 함수, 클래스 등)
- `category`: 카테고리 (금융, 사용자, 거래 등)
- `description`: 설명
- `usage`: 사용 예시
- `tags`: 검색용 태그 배열
- `source`: 데이터 출처 ("manual", "rag", "import")
- `confidence`: RAG confidence score (0-1)
- `createdAt`: 생성일시
- `updatedAt`: 수정일시

### 2. SearchHistory (검색 기록)
사용자의 검색 기록을 저장합니다.

```sql
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");
```

### 3. RAGSuggestionLog (RAG 제안 로그)
AI가 제안한 변수명과 사용자의 수락/거부 기록을 저장합니다.

```sql
CREATE TABLE "RAGSuggestionLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RAGSuggestionLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "RAGSuggestionLog_query_idx" ON "RAGSuggestionLog"("query");
CREATE INDEX "RAGSuggestionLog_accepted_idx" ON "RAGSuggestionLog"("accepted");
CREATE INDEX "RAGSuggestionLog_createdAt_idx" ON "RAGSuggestionLog"("createdAt");
```

### 4. UserActivity (사용자 활동 로그)
번역, 검증, RAG 제안 등 모든 사용자 활동을 추적합니다.

```sql
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "query" TEXT,
    "result" JSONB,
    "userId" TEXT,
    "sessionId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "UserActivity_activityType_idx" ON "UserActivity"("activityType");
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");
CREATE INDEX "UserActivity_sessionId_idx" ON "UserActivity"("sessionId");
CREATE INDEX "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");
```

**activityType 값:**
- "translation": 변수명 번역
- "validation": 코드 검증
- "rag_suggestion": AI 제안

### 5. DailyStats (일별 통계)
대시보드에 표시할 일별 통계 데이터를 저장합니다.

```sql
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalTranslations" INTEGER NOT NULL DEFAULT 0,
    "totalValidations" INTEGER NOT NULL DEFAULT 0,
    "totalRagSuggestions" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- Unique constraint
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");

-- Index
CREATE INDEX "DailyStats_date_idx" ON "DailyStats"("date");
```

## Prisma 마이그레이션 사용

### 1. 새 데이터베이스에 테이블 생성
```bash
# 환경 변수 설정 후
npx prisma migrate deploy
```

### 2. 개발 환경에서 마이그레이션 생성
```bash
npx prisma migrate dev --name init
```

### 3. 스키마 동기화 확인
```bash
npx prisma db push
```

## 데이터 타입 참고

- `TEXT`: 가변 길이 문자열
- `INTEGER`: 정수
- `DOUBLE PRECISION`: 부동소수점
- `BOOLEAN`: true/false
- `TIMESTAMP(3)`: 밀리초 단위 타임스탬프
- `DATE`: 날짜만 (시간 제외)
- `JSONB`: JSON 데이터 (PostgreSQL)
- `TEXT[]`: 텍스트 배열

## 인덱스 전략

성능 최적화를 위한 인덱스:
1. **검색 필드**: korean, english, query
2. **필터링 필드**: category, type, source, activityType
3. **정렬 필드**: createdAt, date
4. **조인 필드**: userId, sessionId
5. **배열 필드**: tags (GIN 인덱스)

## 주의사항

1. **CUID vs UUID**: Prisma는 기본적으로 CUID를 사용합니다
2. **타임스탬프**: UTC 기준으로 저장됩니다
3. **배열 타입**: PostgreSQL의 네이티브 배열 타입을 사용합니다
4. **JSONB**: 구조화된 데이터 저장에 사용되며 쿼리 가능합니다