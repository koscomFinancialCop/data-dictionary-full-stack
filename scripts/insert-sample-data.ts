const { PrismaClient } = require('@prisma/client')

// Prisma Studio를 통해 삽입할 때는 DIRECT_URL을 사용해야 하지만,
// 이 스크립트는 어느 환경에서든 동작합니다
const prisma = new PrismaClient()

const sampleData = [
  // 금융 관련 용어
  {
    korean: '계좌번호',
    english: 'accountNumber',
    type: '변수',
    category: '금융',
    description: '사용자의 은행 계좌 번호',
    usage: 'const accountNumber = user.accountNumber;',
    tags: ['금융', '계좌', '식별자'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '잔액',
    english: 'balance',
    type: '변수',
    category: '금융',
    description: '계좌의 현재 잔액',
    usage: 'const balance = account.balance;',
    tags: ['금융', '잔액', '금액'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '거래내역',
    english: 'transactionHistory',
    type: '변수',
    category: '금융',
    description: '계좌의 거래 내역 목록',
    usage: 'const transactionHistory = await getTransactionHistory(accountId);',
    tags: ['금융', '거래', '이력'],
    source: 'manual',
    confidence: 1.0
  },
  
  // 사용자 관련 용어
  {
    korean: '사용자이름',
    english: 'userName',
    type: '변수',
    category: '사용자',
    description: '시스템 사용자의 이름',
    usage: 'const userName = user.name;',
    tags: ['사용자', '이름', '식별자'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '비밀번호',
    english: 'password',
    type: '변수',
    category: '사용자',
    description: '사용자 계정의 비밀번호',
    usage: 'const hashedPassword = await bcrypt.hash(password, 10);',
    tags: ['사용자', '보안', '인증'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '이메일주소',
    english: 'emailAddress',
    type: '변수',
    category: '사용자',
    description: '사용자의 이메일 주소',
    usage: 'const emailAddress = user.email;',
    tags: ['사용자', '이메일', '연락처'],
    source: 'manual',
    confidence: 1.0
  },
  
  // 상품 관련 용어
  {
    korean: '상품명',
    english: 'productName',
    type: '변수',
    category: '상품',
    description: '판매 상품의 이름',
    usage: 'const productName = product.name;',
    tags: ['상품', '이름', '제품'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '재고수량',
    english: 'stockQuantity',
    type: '변수',
    category: '상품',
    description: '상품의 현재 재고 수량',
    usage: 'if (stockQuantity > 0) { enablePurchase(); }',
    tags: ['상품', '재고', '수량'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '판매가격',
    english: 'sellingPrice',
    type: '변수',
    category: '상품',
    description: '상품의 판매 가격',
    usage: 'const totalPrice = sellingPrice * quantity;',
    tags: ['상품', '가격', '금액'],
    source: 'manual',
    confidence: 1.0
  },
  
  // 함수 관련
  {
    korean: '계산하다',
    english: 'calculate',
    type: '함수',
    category: '동작',
    description: '값을 계산하는 함수',
    usage: 'function calculate(a, b) { return a + b; }',
    tags: ['함수', '계산', '연산'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '저장하다',
    english: 'save',
    type: '함수',
    category: '동작',
    description: '데이터를 저장하는 함수',
    usage: 'async function save(data) { await db.insert(data); }',
    tags: ['함수', '저장', '데이터베이스'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '가져오다',
    english: 'fetch',
    type: '함수',
    category: '동작',
    description: '데이터를 가져오는 함수',
    usage: 'async function fetch(id) { return await db.findById(id); }',
    tags: ['함수', '조회', '데이터베이스'],
    source: 'manual',
    confidence: 1.0
  },
  
  // 클래스 관련
  {
    korean: '사용자',
    english: 'User',
    type: '클래스',
    category: '모델',
    description: '사용자 정보를 담는 클래스',
    usage: 'class User { constructor(name, email) { ... } }',
    tags: ['클래스', '모델', '사용자'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '주문',
    english: 'Order',
    type: '클래스',
    category: '모델',
    description: '주문 정보를 담는 클래스',
    usage: 'class Order { constructor(userId, items) { ... } }',
    tags: ['클래스', '모델', '주문'],
    source: 'manual',
    confidence: 1.0
  },
  {
    korean: '상품',
    english: 'Product',
    type: '클래스',
    category: '모델',
    description: '상품 정보를 담는 클래스',
    usage: 'class Product { constructor(name, price) { ... } }',
    tags: ['클래스', '모델', '상품'],
    source: 'manual',
    confidence: 1.0
  }
]

async function insertSampleData() {
  console.log('🚀 샘플 데이터 삽입 시작...')
  
  try {
    // 기존 데이터 개수 확인
    const existingCount = await prisma.variableMapping.count()
    console.log(`📊 기존 데이터: ${existingCount}개`)
    
    // 샘플 데이터 삽입
    let insertedCount = 0
    for (const data of sampleData) {
      try {
        await prisma.variableMapping.create({ data })
        insertedCount++
        console.log(`✅ 삽입 완료: ${data.korean} → ${data.english}`)
      } catch (error) {
        // 중복 데이터는 건너뛰기
        console.log(`⏭️  건너뛰기: ${data.korean} → ${data.english} (이미 존재)`)
      }
    }
    
    // 결과 요약
    const totalCount = await prisma.variableMapping.count()
    console.log(`\n📊 삽입 결과:`)
    console.log(`- 시도한 데이터: ${sampleData.length}개`)
    console.log(`- 성공적으로 삽입: ${insertedCount}개`)
    console.log(`- 전체 데이터: ${totalCount}개`)
    
    // 카테고리별 통계
    const categories = await prisma.variableMapping.groupBy({
      by: ['category'],
      _count: true
    })
    
    console.log(`\n📈 카테고리별 통계:`)
    categories.forEach((cat: any) => {
      console.log(`- ${cat.category || '미분류'}: ${cat._count}개`)
    })
    
    console.log('\n✅ 샘플 데이터 삽입 완료!')
    console.log('🌐 이제 Vercel 배포 환경에서도 이 데이터에 접근할 수 있습니다.')
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
insertSampleData()