import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DictionaryAddRequest } from '@/types/rag';

export async function POST(request: NextRequest) {
  try {
    const body: DictionaryAddRequest = await request.json();
    const { korean, english, type, category, description, source, confidence } = body;

    // 필수 필드 검증
    if (!korean || !english || !type) {
      return NextResponse.json(
        { 
          success: false,
          message: '필수 필드가 누락되었습니다 (korean, english, type)' 
        },
        { status: 400 }
      );
    }

    // 중복 체크
    const existing = await prisma.variableMapping.findFirst({
      where: {
        OR: [
          { korean, english },
          { korean, english: { not: english } }, // 같은 한글에 다른 영어
          { korean: { not: korean }, english }, // 다른 한글에 같은 영어
        ]
      }
    });

    if (existing) {
      // 완전히 같은 매핑이면 성공으로 처리
      if (existing.korean === korean && existing.english === english) {
        return NextResponse.json({
          success: true,
          data: existing,
          message: '이미 등록된 변수명입니다',
        });
      }
      
      // 충돌하는 경우 에러
      return NextResponse.json({
        success: false,
        message: `충돌하는 변수명이 존재합니다: ${existing.korean} → ${existing.english}`,
        existing,
      }, { status: 409 });
    }

    // 태그 생성
    const tags = [
      korean.toLowerCase(),
      english.toLowerCase(),
      ...(description || '').toLowerCase().split(' ').filter(tag => tag.length > 2)
    ].filter((v, i, a) => a.indexOf(v) === i); // 중복 제거

    // 사용 예시 생성
    const usage = generateUsageExample(english, type);

    // 데이터베이스에 저장
    const newMapping = await prisma.variableMapping.create({
      data: {
        korean,
        english,
        type,
        category: category || '일반',
        description: description || '',
        usage,
        tags,
        source: source || 'manual',
        confidence,
      },
    });

    return NextResponse.json({
      success: true,
      data: newMapping,
      message: '변수명이 성공적으로 추가되었습니다',
    });

  } catch (error) {
    console.error('변수명 추가 오류:', error);
    
    // Prisma 에러 처리
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json({
        success: false,
        message: '이미 존재하는 변수명입니다',
      }, { status: 409 });
    }

    return NextResponse.json(
      { 
        success: false,
        message: '변수명 추가 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

// 사용 예시 생성 함수
function generateUsageExample(english: string, type: string): string {
  switch (type) {
    case '함수':
      return `${english}();`;
    case '클래스':
      return `const instance = new ${english}();`;
    case '상수':
      return `const ${english.toUpperCase()} = '${english}';`;
    case '변수':
    default:
      return `const ${english} = get${english.charAt(0).toUpperCase() + english.slice(1)}();`;
  }
}