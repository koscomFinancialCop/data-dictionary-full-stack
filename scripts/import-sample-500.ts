const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

interface ExcelRow {
  '의미': string;
  '영어 풀이말': string;
  '축약된 변수명': string;
  '부가적인 설명'?: string;
}

async function importSample500() {
  try {
    const filePath = path.join(process.cwd(), 'data/sample_data_500.xlsx');
    console.log(`📊 엑셀 파일 읽기: ${filePath}`);
    
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    // 엑셀 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // JSON으로 변환
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 ${jsonData.length}개의 데이터를 찾았습니다.`);

    // 기존 데이터 삭제 옵션
    const args = process.argv.slice(2);
    if (args.includes('--clear')) {
      console.log('🗑️  기존 데이터 삭제 중...');
      await prisma.variableMapping.deleteMany();
    }

    // 데이터 임포트
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (const row of jsonData) {
      try {
        // 필수 필드 검증
        if (!row['의미'] || !row['축약된 변수명']) {
          console.warn(`⚠️  건너뛰기: 필수 필드 누락`, row);
          skipCount++;
          continue;
        }

        // 데이터 매핑
        const korean = row['의미'].trim();
        const english = row['축약된 변수명'].trim();
        const fullEnglish = row['영어 풀이말']?.trim() || '';
        const description = row['부가적인 설명']?.trim() || '';

        // 카테고리 추출 (영어 풀이말을 기반으로)
        let category = '일반';
        if (fullEnglish.includes('ACCOUNT') || fullEnglish.includes('BALANCE')) {
          category = '금융';
        } else if (fullEnglish.includes('USER') || fullEnglish.includes('MEMBER')) {
          category = '사용자';
        } else if (fullEnglish.includes('ORDER') || fullEnglish.includes('TRANSACTION')) {
          category = '거래';
        } else if (fullEnglish.includes('DATE') || fullEnglish.includes('TIME')) {
          category = '시간';
        } else if (fullEnglish.includes('SYSTEM') || fullEnglish.includes('COMPUTER')) {
          category = '시스템';
        }

        // 태그 생성
        const tags = [
          korean.toLowerCase(),
          english.toLowerCase(),
          ...fullEnglish.toLowerCase().split(' ').filter(tag => tag.length > 2)
        ].filter((v, i, a) => a.indexOf(v) === i); // 중복 제거

        // 사용 예시 생성
        const usage = `const ${english} = get${english}();`;

        // 데이터베이스에 저장
        await prisma.variableMapping.create({
          data: {
            korean: korean,
            english: english,
            type: '변수', // 기본값
            category: category,
            description: description || fullEnglish,
            usage: usage,
            tags: tags
          }
        });

        successCount++;
        console.log(`✅ 임포트 성공: ${korean} → ${english} (${fullEnglish})`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⏭️  중복 건너뛰기: ${row['의미']} → ${row['축약된 변수명']}`);
          skipCount++;
        } else {
          console.error(`❌ 임포트 실패:`, row, error);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 임포트 완료!`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`⏭️  건너뛰기: ${skipCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);

  } catch (error) {
    console.error('❌ 엑셀 임포트 중 오류:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
importSample500();