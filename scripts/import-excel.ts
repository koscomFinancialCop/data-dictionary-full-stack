import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExcelRow {
  korean: string;
  english: string;
  type?: string;
  category?: string;
  description?: string;
  usage?: string;
  tags?: string;
}

async function importExcelToDatabase(filePath: string) {
  try {
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
    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
    
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

    for (const row of jsonData) {
      try {
        // 필수 필드 검증
        if (!row.korean || !row.english) {
          console.warn(`⚠️  건너뛰기: 한글 또는 영어가 없음`, row);
          errorCount++;
          continue;
        }

        // 태그 처리 (쉼표로 구분된 문자열을 배열로)
        const tags = row.tags 
          ? row.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : [row.korean.toLowerCase(), row.english.toLowerCase()];

        // 데이터베이스에 저장
        await prisma.variableMapping.create({
          data: {
            korean: row.korean.trim(),
            english: row.english.trim(),
            type: row.type?.trim() || '변수',
            category: row.category?.trim(),
            description: row.description?.trim(),
            usage: row.usage?.trim() || `const ${row.english} = get${row.english}();`,
            tags: tags
          }
        });

        successCount++;
        console.log(`✅ 임포트 성공: ${row.korean} → ${row.english}`);
      } catch (error) {
        console.error(`❌ 임포트 실패:`, row, error);
        errorCount++;
      }
    }

    console.log(`\n📊 임포트 완료!`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);

  } catch (error) {
    console.error('❌ 엑셀 임포트 중 오류:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 명령줄 인자 확인
const filePath = process.argv[2];

if (!filePath) {
  console.log(`
사용법: npm run import:excel <엑셀파일경로> [옵션]

옵션:
  --clear  기존 데이터를 모두 삭제하고 새로 임포트

예시:
  npm run import:excel ./data/variables.xlsx
  npm run import:excel ./data/variables.xlsx --clear
`);
  process.exit(1);
}

// 절대 경로로 변환
const absolutePath = path.isAbsolute(filePath) 
  ? filePath 
  : path.join(process.cwd(), filePath);

importExcelToDatabase(absolutePath);