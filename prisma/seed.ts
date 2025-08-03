import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const variableMappings = [
  // 사용자 관련
  { 
    korean: '사용자', 
    english: 'user', 
    type: '변수', 
    category: '사용자',
    description: '시스템 사용자',
    usage: 'const user = getUser();',
    tags: ['사용자', 'user', '유저', '회원']
  },
  { 
    korean: '사용자명', 
    english: 'userName', 
    type: '변수',
    category: '사용자', 
    description: '사용자 이름',
    usage: 'const userName = user.name;',
    tags: ['사용자명', 'username', '이름', 'name']
  },
  { 
    korean: '사용자정보', 
    english: 'userInfo', 
    type: '변수',
    category: '사용자', 
    description: '사용자 정보 객체',
    usage: 'const userInfo = getUserInfo();',
    tags: ['사용자정보', 'userinfo', '회원정보']
  },
  { 
    korean: '회원', 
    english: 'member', 
    type: '변수',
    category: '사용자', 
    description: '서비스 회원',
    usage: 'const member = getMember();',
    tags: ['회원', 'member', '멤버']
  },
  { 
    korean: '회원가입', 
    english: 'signUp', 
    type: '함수',
    category: '인증', 
    description: '회원 가입 기능',
    usage: 'await signUp(userData);',
    tags: ['회원가입', 'signup', 'register', '가입']
  },
  { 
    korean: '로그인', 
    english: 'login', 
    type: '함수',
    category: '인증', 
    description: '로그인 기능',
    usage: 'await login(credentials);',
    tags: ['로그인', 'login', 'signin', '인증']
  },
  { 
    korean: '로그아웃', 
    english: 'logout', 
    type: '함수',
    category: '인증', 
    description: '로그아웃 기능',
    usage: 'await logout();',
    tags: ['로그아웃', 'logout', 'signout']
  },
  { 
    korean: '비밀번호', 
    english: 'password', 
    type: '변수',
    category: '인증', 
    description: '사용자 비밀번호',
    usage: 'const password = form.password;',
    tags: ['비밀번호', 'password', 'pwd', '암호']
  },
  
  // 정보 관련
  { 
    korean: '이메일', 
    english: 'email', 
    type: '변수',
    category: '정보', 
    description: '이메일 주소',
    usage: 'const email = user.email;',
    tags: ['이메일', 'email', 'mail', '메일']
  },
  { 
    korean: '전화번호', 
    english: 'phoneNumber', 
    type: '변수',
    category: '정보', 
    description: '전화번호',
    usage: 'const phoneNumber = user.phone;',
    tags: ['전화번호', 'phone', 'tel', '연락처']
  },
  { 
    korean: '주소', 
    english: 'address', 
    type: '변수',
    category: '정보', 
    description: '주소 정보',
    usage: 'const address = user.address;',
    tags: ['주소', 'address', 'addr', '위치']
  },
  
  // 금융 관련
  { 
    korean: '계좌', 
    english: 'account', 
    type: '변수',
    category: '금융', 
    description: '금융 계좌',
    usage: 'const account = getAccount();',
    tags: ['계좌', 'account', '통장']
  },
  { 
    korean: '계좌번호', 
    english: 'accountNumber', 
    type: '변수',
    category: '금융', 
    description: '계좌 번호',
    usage: 'const accountNumber = account.number;',
    tags: ['계좌번호', 'accountnumber', '계좌']
  },
  { 
    korean: '거래', 
    english: 'transaction', 
    type: '변수',
    category: '금융', 
    description: '금융 거래',
    usage: 'const transaction = getTransaction();',
    tags: ['거래', 'transaction', '트랜잭션']
  },
  { 
    korean: '입금', 
    english: 'deposit', 
    type: '함수',
    category: '금융', 
    description: '입금 처리',
    usage: 'await deposit(amount);',
    tags: ['입금', 'deposit', '입출금']
  },
  { 
    korean: '출금', 
    english: 'withdrawal', 
    type: '함수',
    category: '금융', 
    description: '출금 처리',
    usage: 'await withdrawal(amount);',
    tags: ['출금', 'withdrawal', 'withdraw']
  },
  { 
    korean: '잔액', 
    english: 'balance', 
    type: '변수',
    category: '금융', 
    description: '계좌 잔액',
    usage: 'const balance = account.balance;',
    tags: ['잔액', 'balance', '잔고']
  },
  { 
    korean: '주문', 
    english: 'order', 
    type: '변수',
    category: '거래', 
    description: '주문 정보',
    usage: 'const order = createOrder();',
    tags: ['주문', 'order', '오더']
  },
  { 
    korean: '체결', 
    english: 'execution', 
    type: '변수',
    category: '거래', 
    description: '거래 체결',
    usage: 'const execution = order.execute();',
    tags: ['체결', 'execution', '거래체결']
  },
  { 
    korean: '매수', 
    english: 'buy', 
    type: '함수',
    category: '거래', 
    description: '매수 주문',
    usage: 'await buy(stockCode, quantity);',
    tags: ['매수', 'buy', '구매']
  },
  { 
    korean: '매도', 
    english: 'sell', 
    type: '함수',
    category: '거래', 
    description: '매도 주문',
    usage: 'await sell(stockCode, quantity);',
    tags: ['매도', 'sell', '판매']
  },
  
  // 시간 관련
  { 
    korean: '날짜', 
    english: 'date', 
    type: '변수',
    category: '시간', 
    description: '날짜',
    usage: 'const date = new Date();',
    tags: ['날짜', 'date', '일자']
  },
  { 
    korean: '시작일', 
    english: 'startDate', 
    type: '변수',
    category: '시간', 
    description: '시작 날짜',
    usage: 'const startDate = event.startDate;',
    tags: ['시작일', 'startdate', '시작날짜']
  },
  { 
    korean: '종료일', 
    english: 'endDate', 
    type: '변수',
    category: '시간', 
    description: '종료 날짜',
    usage: 'const endDate = event.endDate;',
    tags: ['종료일', 'enddate', '종료날짜']
  },
];

async function main() {
  console.log('Start seeding...');
  
  // 기존 데이터 삭제
  await prisma.variableMapping.deleteMany();
  await prisma.searchHistory.deleteMany();
  
  // 새 데이터 추가
  for (const data of variableMappings) {
    await prisma.variableMapping.create({ data });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });