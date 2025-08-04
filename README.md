This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📚 프로젝트 문서

### 운영 가이드
DataDictionary 프로젝트의 설정 및 운영 가이드는 [docs/guides](./docs/guides) 폴더를 참조하세요.

- [Vercel 배포 가이드](./docs/guides/VERCEL_DEPLOYMENT_GUIDE.md) - Prisma Accelerate를 사용한 Vercel 배포
- [환경 변수 설정](./docs/guides/VERCEL_ENV_SETUP.md) - 필수 환경 변수 설정 방법
- [데이터베이스 스키마](./docs/guides/DATABASE_SCHEMA_GUIDE.md) - 테이블 구조 및 마이그레이션
- [모니터링 설정](./docs/guides/MONITORING_SETUP.md) - 애플리케이션 모니터링 구성

### 개발 가이드라인
개발 가이드라인과 아키텍처 문서는 [docs/guidelines](./docs/guidelines) 폴더를 참조하세요.

- [시스템 아키텍처](./docs/guidelines/ARCHITECTURE.md) - 전체 시스템 구조
- [API 설계](./docs/guidelines/API-DESIGN.md) - RESTful API 설계 원칙
- [컴포넌트 아키텍처](./docs/guidelines/COMPONENT-ARCHITECTURE.md) - React 컴포넌트 구조
- [배포 아키텍처](./docs/guidelines/DEPLOYMENT-ARCHITECTURE.md) - 배포 인프라 설계

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.local 파일 생성)
cp .env.example .env.local

# 3. 데이터베이스 마이그레이션
npm run db:migrate

# 4. 샘플 데이터 삽입
npm run db:seed:sample

# 5. 개발 서버 시작
npm run dev
```
