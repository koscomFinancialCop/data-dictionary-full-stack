# 데이터베이스 설정 가이드

## PostgreSQL 상태

✅ PostgreSQL이 설치되어 있습니다 (버전 14.13)

## 1. 데이터베이스 생성

### PostgreSQL 서비스 시작
```bash
# macOS (Homebrew)
brew services start postgresql@14

# 또는 수동 시작
pg_ctl -D /opt/homebrew/var/postgresql@14 start
```

### 데이터베이스 생성
```bash
# PostgreSQL 접속
psql postgres

# 데이터베이스 생성
CREATE DATABASE data_dictionary;

# 사용자 생성 (선택사항)
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE data_dictionary TO myuser;

# 종료
\q
```

## 2. 환경 변수 설정

`.env` 파일 생성:
```env
# 로컬 개발용
DATABASE_URL="postgresql://postgres@localhost:5432/data_dictionary"

# 또는 사용자 지정
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/data_dictionary"
```

## 3. Prisma 마이그레이션

```bash
# 스키마를 데이터베이스에 적용
npm run db:push

# 초기 데이터 시드
npm run db:seed

# Prisma Studio로 확인 (선택사항)
npm run db:studio
```

## 4. 연결 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
# http://localhost:3000 접속 후 검색 테스트
```

## 문제 해결

### PostgreSQL이 실행되지 않는 경우
```bash
# 상태 확인
brew services list

# 재시작
brew services restart postgresql@14

# 로그 확인
tail -f /opt/homebrew/var/log/postgresql@14.log
```

### 연결 오류가 발생하는 경우
1. PostgreSQL 서비스가 실행 중인지 확인
2. DATABASE_URL이 올바른지 확인
3. 방화벽 설정 확인 (포트 5432)