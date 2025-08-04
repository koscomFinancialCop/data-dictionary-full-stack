# DataDictionary 가이드 문서

이 폴더에는 DataDictionary 프로젝트의 모든 설정 및 운영 가이드가 포함되어 있습니다.

## 📚 문서 목록

### 1. 데이터베이스 관련
- [DATABASE_SCHEMA_GUIDE.md](./DATABASE_SCHEMA_GUIDE.md) - 데이터베이스 스키마 및 테이블 구조 가이드
- [PRISMA_STUDIO_GUIDE.md](./PRISMA_STUDIO_GUIDE.md) - Prisma Studio 사용법 (Accelerate 환경에서)

### 2. Vercel 배포 관련
- [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md) - Vercel 데이터베이스 초기 설정
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 배포 전체 가이드
- [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - 환경 변수 설정 가이드
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 배포 전 체크리스트

### 3. 모니터링
- [MONITORING_SETUP.md](./MONITORING_SETUP.md) - 모니터링 및 알림 설정 가이드

## 🚀 빠른 시작

### 로컬 개발 환경
```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 개발 서버 시작
npm run dev

# Prisma Studio 실행 (데이터 확인/수정)
npm run db:studio
```

### 데이터베이스 작업
```bash
# 샘플 데이터 삽입
npm run db:seed:sample

# 마이그레이션 생성
npm run db:migrate

# 프로덕션 마이그레이션
npm run migrate:production
```

### Vercel 배포
```bash
# 환경 변수 설정 후
git push origin main
```

## ⚡ 핵심 정보

### 데이터베이스 연결
- **애플리케이션**: Prisma Accelerate URL 사용 (`DATABASE_URL`)
- **Prisma Studio/마이그레이션**: Direct URL 사용 (`DIRECT_URL`)

### 환경 변수 우선순위
1. Production: Vercel 대시보드에서 설정
2. Local: `.env.local` 파일 사용
3. Example: `.env.example` 참조

### 데이터 동기화
- Prisma Studio로 삽입한 데이터는 즉시 Vercel 환경에서 사용 가능
- 동일한 데이터베이스를 참조하므로 실시간 동기화

## 🔧 문제 해결

### Prisma Studio 연결 오류
→ [PRISMA_STUDIO_GUIDE.md](./PRISMA_STUDIO_GUIDE.md) 참조

### Vercel 배포 실패
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 참조

### 환경 변수 오류
→ [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) 참조

## 📞 지원

추가 도움이 필요하면 다음을 확인하세요:
- Prisma 공식 문서: https://www.prisma.io/docs
- Vercel 공식 문서: https://vercel.com/docs
- 프로젝트 이슈 트래커: GitHub Issues