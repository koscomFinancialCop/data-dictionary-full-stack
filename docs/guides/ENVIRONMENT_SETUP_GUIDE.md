# 환경 설정 가이드

## 개요

DataDictionary 프로젝트는 로컬 개발과 프로덕션 환경에서 다른 데이터베이스를 사용합니다.

## 환경별 설정

### 1. 로컬 개발 환경

로컬에서는 PostgreSQL 데이터베이스를 직접 사용합니다.

#### 파일: `.env.development.local`
```env
# Local development database
DATABASE_URL="postgresql://username@localhost:5432/data_dictionary"
DIRECT_URL="postgresql://username@localhost:5432/data_dictionary"

# RAG Pipeline Configuration
RAG_WEBHOOK_URL=https://koscom.app.n8n.cloud/webhook/invoke
RAG_TIMEOUT=30000
RAG_MAX_RETRIES=3
ENABLE_RAG_SUGGESTIONS=true
RAG_MIN_CONFIDENCE=0.7
```

### 2. 프로덕션/Vercel 환경

프로덕션에서는 Prisma Accelerate를 통해 연결합니다.

#### 파일: `.env.local`
```env
# Prisma Accelerate Database URLs
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DIRECT_URL="postgres://username:password@host:5432/database?sslmode=require"

# RAG Pipeline Configuration
RAG_WEBHOOK_URL=https://koscom.app.n8n.cloud/webhook/invoke
RAG_TIMEOUT=30000
RAG_MAX_RETRIES=3
ENABLE_RAG_SUGGESTIONS=true
RAG_MIN_CONFIDENCE=0.7
```

## 환경 변수 우선순위

Next.js는 다음 순서로 환경 변수를 로드합니다:

1. `.env.development.local` (개발 환경에서만)
2. `.env.local` (모든 환경)
3. `.env.development` (개발 환경에서만)
4. `.env`

## 데이터베이스 전환

### 로컬 데이터베이스 사용하기

1. `.env.development.local` 파일 생성
2. 로컬 PostgreSQL URL 설정
3. 서버 재시작

```bash
npm run dev
```

### 원격 데이터베이스 사용하기

1. `.env.development.local` 파일 삭제 또는 이름 변경
2. `.env.local`의 Prisma Accelerate URL 사용
3. 서버 재시작

```bash
mv .env.development.local .env.development.local.bak
npm run dev
```

## 데이터 동기화

### 로컬 → 프로덕션 마이그레이션

```bash
export PRODUCTION_DATABASE_URL="postgres://..."
npm run migrate:prod
```

### 프로덕션 → 로컬 복사

```bash
# 프로덕션 데이터 백업
pg_dump $PRODUCTION_DATABASE_URL > backup.sql

# 로컬에 복원
psql -U username -d data_dictionary < backup.sql
```

## 문제 해결

### "데이터가 보이지 않아요"

1. 현재 사용 중인 데이터베이스 확인:
   ```bash
   curl http://localhost:3000/api/health | jq
   ```

2. 환경 변수 확인:
   - `.env.development.local` 존재 → 로컬 DB 사용
   - `.env.development.local` 없음 → 원격 DB 사용

3. 데이터 위치 확인:
   ```bash
   # 로컬 데이터 개수
   psql -U username -d data_dictionary -c "SELECT COUNT(*) FROM \"VariableMapping\";"
   
   # 원격 데이터 개수 (API 통해서)
   curl http://localhost:3000/api/health | jq .database.stats.variableMappings
   ```

### Prisma Studio 사용

Prisma Studio는 항상 직접 연결이 필요합니다:

```bash
# 로컬 데이터베이스
DATABASE_URL="postgresql://username@localhost:5432/data_dictionary" npx prisma studio

# 원격 데이터베이스
DATABASE_URL="$DIRECT_URL" npx prisma studio
```

## 권장 워크플로우

1. **개발**: 로컬 데이터베이스 사용 (`.env.development.local`)
2. **테스트**: 원격 데이터베이스 테스트 (`.env.local`)
3. **배포**: Vercel에서 자동으로 프로덕션 환경 변수 사용

## 주의사항

- `.env.local`과 `.env.development.local`을 Git에 커밋하지 마세요
- 프로덕션 데이터베이스 URL은 안전하게 관리하세요
- 데이터 마이그레이션 전 백업을 수행하세요