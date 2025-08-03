const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function analyzeExcel(filePath: string) {
  try {
    console.log(`📊 엑셀 파일 분석 중: ${filePath}`);
    
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    // 엑셀 파일 읽기
    const workbook = XLSX.readFile(filePath);
    console.log(`\n📋 시트 목록:`, workbook.SheetNames);
    
    // 첫 번째 시트 분석
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`\n📊 데이터 개수: ${jsonData.length}개`);
    
    // 컬럼 정보 분석
    if (jsonData.length > 0) {
      const firstRow = jsonData[0] as any;
      console.log('\n📋 컬럼 목록:');
      Object.keys(firstRow).forEach(key => {
        console.log(`  - ${key}: ${typeof firstRow[key]} (예: ${firstRow[key]})`);
      });
      
      // 처음 5개 데이터 샘플 출력
      console.log('\n📊 데이터 샘플 (처음 5개):');
      jsonData.slice(0, 5).forEach((row: any, index: number) => {
        console.log(`\n[${index + 1}]`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
    }
    
    // 스키마 매핑 제안
    console.log('\n🔄 데이터베이스 스키마 매핑 제안:');
    console.log('VariableMapping 테이블 필드:');
    console.log('  - korean: 한글 용어 (필수)');
    console.log('  - english: 영어 변수명 (필수)');
    console.log('  - type: 타입 (변수/함수/클래스)');
    console.log('  - category: 카테고리');
    console.log('  - description: 설명');
    console.log('  - usage: 사용 예시');
    console.log('  - tags: 태그 배열');
    
  } catch (error) {
    console.error('❌ 엑셀 분석 중 오류:', error);
    process.exit(1);
  }
}

// 명령줄 인자 확인
const filePath = process.argv[2] || './data/sample_data_500.xlsx';

// 절대 경로로 변환
const absolutePath = path.isAbsolute(filePath) 
  ? filePath 
  : path.join(process.cwd(), filePath);

analyzeExcel(absolutePath);