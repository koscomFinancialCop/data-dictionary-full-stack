# 데이터 동기화 확인 가이드

## 개요

Prisma Studio나 스크립트를 통해 로컬에서 삽입한 데이터가 Vercel 배포 환경에서 실제로 접근 가능한지 확인하는 방법을 설명합니다.

## 데이터 동기화 원리

```
로컬 환경                     클라우드 데이터베이스              Vercel 배포
    │                              │                              │
    ├──── DIRECT_URL ─────────────►│◄──── DATABASE_URL ──────────┤
    │     (직접 연결)               │     (Prisma Accelerate)     │
    │                              │                              │
    └─ Prisma Studio/Scripts       └─ PostgreSQL DB              └─ Next.js App
```

- **동일한 데이터베이스**: 로컬과 Vercel이 같은 데이터베이스를 사용
- **즉시 동기화**: 데이터 삽입/수정이 즉시 반영됨
- **연결 방식만 다름**: 로컬은 직접 연결, Vercel은 Prisma Accelerate 경유

## 데이터 동기화 확인 방법

### 1. Health Check API 사용

```bash
# Vercel 배포 후
curl https://your-app.vercel.app/api/health

# 응답 예시
{
  "status": "healthy",
  "database": {
    "connected": true,
    "stats": {
      "variableMappings": 515,  # 삽입한 데이터 개수 확인
      "userActivities": 100
    }
  }
}
```

### 2. 웹 인터페이스에서 확인

1. https://your-app.vercel.app 접속
2. 검색창에 삽입한 데이터 검색 (예: "계좌번호", "사용자이름")
3. 결과가 표시되면 동기화 성공

### 3. API 직접 호출

```bash
# 번역 API 테스트
curl -X POST https://your-app.vercel.app/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "계좌번호"}'

# 응답
{
  "translation": "accountNumber",
  "confidence": 1.0,
  "source": "manual"
}
```

### 4. 대시보드에서 통계 확인

https://your-app.vercel.app/dashboard 접속하여:
- 전체 변수 매핑 수
- 최근 검색 기록
- 사용 통계

## 데이터 삽입 방법

### 방법 1: Prisma Studio 사용

```bash
# Prisma Studio 실행 (DIRECT_URL 사용)
npm run db:studio

# 브라우저에서 http://localhost:5555 접속
# GUI를 통해 데이터 추가/수정/삭제
```

### 방법 2: 스크립트 사용

```bash
# 샘플 데이터 삽입
npm run db:seed:sample

# 엑셀 파일 임포트
npm run import:excel
```

### 방법 3: API 호출

```javascript
// POST /api/dictionary/add
const response = await fetch('/api/dictionary/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    korean: '신규용어',
    english: 'newTerm',
    type: '변수',
    category: '일반'
  })
})
```

## 동기화 확인 체크리스트

- [ ] 로컬에서 데이터 삽입 완료
- [ ] Vercel 배포 환경의 Health API 응답 확인
- [ ] 웹 인터페이스에서 검색 테스트
- [ ] API 엔드포인트 직접 호출 테스트
- [ ] 대시보드 통계 업데이트 확인

## 문제 해결

### 데이터가 보이지 않는 경우

1. **연결 확인**
   ```bash
   # 로컬에서 데이터베이스 연결 테스트
   npx prisma db pull
   ```

2. **환경 변수 확인**
   - Vercel 대시보드에서 DATABASE_URL 설정 확인
   - DIRECT_URL과 같은 데이터베이스를 가리키는지 확인

3. **캐시 문제**
   - 브라우저 캐시 삭제
   - Vercel 함수 재배포

### 성능 최적화

1. **Prisma Accelerate 캐싱 활용**
   ```typescript
   const data = await prisma.variableMapping.findMany({
     cacheStrategy: {
       ttl: 60,  // 60초 캐싱
       swr: 120  // 120초 동안 stale 데이터 제공
     }
   })
   ```

2. **인덱스 확인**
   - korean, english 필드에 인덱스 설정됨
   - 검색 성능 최적화

## 모니터링

### Prisma Accelerate Dashboard
- 쿼리 성능 모니터링
- 캐시 히트율 확인
- 연결 풀 사용률 체크

### Vercel Analytics
- API 응답 시간
- 에러율 모니터링
- 사용자 활동 추적

## 베스트 프랙티스

1. **대량 데이터 삽입 시**
   - 배치 처리 사용
   - 트랜잭션으로 묶어서 처리

2. **프로덕션 데이터 관리**
   - 정기적인 백업 (일일 cron job 설정됨)
   - 데이터 검증 후 삽입

3. **보안 고려사항**
   - 민감한 데이터는 암호화
   - API 엔드포인트에 적절한 인증 추가