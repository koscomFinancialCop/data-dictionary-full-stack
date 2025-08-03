# 엑셀 데이터 임포트 가이드

## 엑셀 파일 형식

### 필수 컬럼
- **korean**: 한글 용어 (필수)
- **english**: 영어 변수명 (필수)

### 선택 컬럼
- **type**: 타입 (변수, 함수, 클래스 등) - 기본값: "변수"
- **category**: 카테고리 (사용자, 금융, 거래 등)
- **description**: 설명
- **usage**: 사용 예시
- **tags**: 검색 태그 (쉼표로 구분)

### 엑셀 파일 예시

| korean | english | type | category | description | usage | tags |
|--------|---------|------|----------|-------------|--------|------|
| 사용자 | user | 변수 | 사용자 | 시스템 사용자 | const user = getUser(); | 사용자,user,유저 |
| 로그인 | login | 함수 | 인증 | 로그인 기능 | await login(credentials); | 로그인,login,signin |
| 계좌번호 | accountNumber | 변수 | 금융 | 계좌 번호 | const accountNumber = account.number; | 계좌번호,account,계좌 |

## 설치 및 설정

### 1. 필요한 패키지 설치
```bash
npm install xlsx
npm install --save-dev @types/node
```

### 2. package.json에 스크립트 추가
```json
{
  "scripts": {
    "import:excel": "ts-node scripts/import-excel.ts"
  }
}
```

## 사용 방법

### 기본 임포트
```bash
npm run import:excel ./data/variables.xlsx
```

### 기존 데이터 삭제 후 임포트
```bash
npm run import:excel ./data/variables.xlsx --clear
```

## 단계별 프로세스

### 1. 엑셀 파일 준비
1. 위의 형식에 맞춰 엑셀 파일 생성
2. 첫 번째 행에 컬럼명 입력
3. 데이터 입력 (한글, 영어는 필수)

### 2. 파일 저장
- 파일을 `.xlsx` 또는 `.xls` 형식으로 저장
- 프로젝트 내 `data` 폴더에 저장 권장

### 3. 데이터베이스 준비
```bash
# PostgreSQL이 실행 중인지 확인
brew services list

# 데이터베이스가 없다면 생성
npm run db:push
```

### 4. 임포트 실행
```bash
# 예: data 폴더의 variables.xlsx 파일 임포트
npm run import:excel ./data/variables.xlsx
```

### 5. 확인
```bash
# Prisma Studio로 데이터 확인
npm run db:studio

# 또는 웹 애플리케이션에서 검색 테스트
npm run dev
```

## 대량 데이터 처리

### 배치 처리 (1000개 이상의 데이터)
대량의 데이터를 처리할 때는 배치 처리를 권장합니다:

```typescript
// scripts/import-excel-batch.ts
const BATCH_SIZE = 100;

for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
  const batch = jsonData.slice(i, i + BATCH_SIZE);
  await prisma.variableMapping.createMany({
    data: batch.map(row => ({
      // ... 데이터 매핑
    }))
  });
}
```

## 문제 해결

### 일반적인 오류

1. **"Cannot find module 'xlsx'"**
   ```bash
   npm install xlsx
   ```

2. **"Korean or english is required"**
   - 엑셀 파일에서 한글과 영어 컬럼이 비어있지 않은지 확인

3. **중복 데이터 오류**
   - `--clear` 옵션 사용하여 기존 데이터 삭제
   - 또는 중복 체크 로직 추가

### 데이터 검증
임포트 전 데이터 검증을 위한 체크리스트:
- [ ] 한글과 영어 필드가 모두 채워져 있는가?
- [ ] 영어 변수명이 유효한 형식인가? (공백, 특수문자 없음)
- [ ] 카테고리가 일관성 있게 작성되었는가?
- [ ] 태그가 쉼표로 올바르게 구분되어 있는가?