const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function importSample1000() {
  console.log('📊 Sample 1000 데이터 임포트 시작...')
  
  try {
    // Excel 파일 읽기
    const filePath = path.join(__dirname, '../data/sample_data_1000.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`📄 ${jsonData.length}개의 데이터를 읽었습니다.`)
    
    // 데이터 정제 및 검증
    const validData = jsonData.filter((row: any) => {
      return row['의미'] && row['축약된 변수명']
    }).map((row: any) => {
      // 한글과 영어 풀이말에서 타입 추출
      const koreanTerm = String(row['의미']).trim()
      const englishFull = row['영어 풀이말'] ? String(row['영어 풀이말']).trim() : ''
      const englishAbbr = String(row['축약된 변수명']).trim()
      const description = row['부가적인 설명'] ? String(row['부가적인 설명']).trim() : null
      
      // 카테고리 추측
      let category = '일반'
      if (koreanTerm.includes('금액') || koreanTerm.includes('가격') || koreanTerm.includes('율')) {
        category = '금융'
      } else if (koreanTerm.includes('일자') || koreanTerm.includes('시간') || koreanTerm.includes('날짜')) {
        category = '시간'
      } else if (koreanTerm.includes('코드') || koreanTerm.includes('번호') || koreanTerm.includes('ID')) {
        category = '식별자'
      } else if (koreanTerm.includes('사용자') || koreanTerm.includes('고객')) {
        category = '사용자'
      }
      
      return {
        korean: koreanTerm,
        english: englishAbbr,
        type: '변수', // 대부분 변수/상수
        category: category,
        description: description || englishFull || null,
        usage: `const ${englishAbbr} = data.${englishAbbr};`,
        tags: [koreanTerm, englishAbbr, englishFull].filter(t => t),
        source: 'import',
        confidence: 0.9
      }
    })
    
    console.log(`✅ ${validData.length}개의 유효한 데이터를 준비했습니다.`)
    
    // 기존 데이터 개수 확인
    const beforeCount = await prisma.variableMapping.count()
    console.log(`📊 기존 데이터: ${beforeCount}개`)
    
    // 배치 처리로 데이터 삽입
    const batchSize = 100
    let insertedCount = 0
    let skippedCount = 0
    
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize)
      
      for (const data of batch) {
        try {
          await prisma.variableMapping.create({ data })
          insertedCount++
          
          if (insertedCount % 100 === 0) {
            console.log(`⏳ ${insertedCount}개 삽입 완료...`)
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            // 중복 데이터
            skippedCount++
          } else {
            console.error(`❌ 오류 발생 (${data.korean}):`, error.message)
          }
        }
      }
    }
    
    // 최종 결과
    const afterCount = await prisma.variableMapping.count()
    console.log(`\n📊 임포트 결과:`)
    console.log(`- 읽은 데이터: ${jsonData.length}개`)
    console.log(`- 유효한 데이터: ${validData.length}개`)
    console.log(`- 성공적으로 삽입: ${insertedCount}개`)
    console.log(`- 중복으로 건너뜀: ${skippedCount}개`)
    console.log(`- 전체 데이터: ${afterCount}개 (이전: ${beforeCount}개)`)
    
    // 카테고리별 통계
    const categories = await prisma.variableMapping.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })
    
    console.log(`\n📈 카테고리별 통계:`)
    categories.slice(0, 10).forEach((cat: any) => {
      console.log(`- ${cat.category || '미분류'}: ${cat._count}개`)
    })
    
    // 타입별 통계
    const types = await prisma.variableMapping.groupBy({
      by: ['type'],
      _count: true,
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    })
    
    console.log(`\n📊 타입별 통계:`)
    types.forEach((type: any) => {
      console.log(`- ${type.type}: ${type._count}개`)
    })
    
    console.log('\n✅ Sample 1000 데이터 임포트 완료!')
    console.log('🌐 이제 Vercel 배포 환경에서도 이 데이터에 접근할 수 있습니다.')
    
  } catch (error) {
    console.error('❌ 임포트 실패:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
importSample1000().catch(console.error)