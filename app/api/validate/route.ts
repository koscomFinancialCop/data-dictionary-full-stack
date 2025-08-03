import { NextRequest, NextResponse } from 'next/server';

interface ValidationRule {
  name: string;
  test: (variable: string) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface ValidationIssue {
  line: number;
  column: number;
  variable: string;
  issue: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
}

const validationRules: ValidationRule[] = [
  {
    name: 'no-korean',
    test: (variable: string) => !/[가-힣]/.test(variable),
    message: '한글 변수명은 사용할 수 없습니다',
    severity: 'error',
    suggestion: '영어 변수명을 사용하세요'
  },
  {
    name: 'min-length',
    test: (variable: string) => variable.length >= 2,
    message: '변수명이 너무 짧습니다',
    severity: 'warning',
    suggestion: '의미를 명확히 표현하는 변수명을 사용하세요'
  },
  {
    name: 'max-length',
    test: (variable: string) => variable.length <= 40,
    message: '변수명이 너무 깁니다',
    severity: 'warning',
    suggestion: '간결하면서도 의미있는 변수명을 사용하세요'
  },
  {
    name: 'camelCase',
    test: (variable: string) => {
      // 상수는 대문자 허용
      if (variable === variable.toUpperCase() && variable.includes('_')) return true;
      // 클래스/컴포넌트는 PascalCase 허용
      if (/^[A-Z]/.test(variable) && /[a-z]/.test(variable)) return true;
      // 일반 변수는 camelCase
      return /^[a-z]/.test(variable);
    },
    message: '변수명 규칙을 위반했습니다',
    severity: 'warning',
    suggestion: 'camelCase, PascalCase, 또는 UPPER_CASE를 사용하세요'
  },
  {
    name: 'no-reserved',
    test: (variable: string) => {
      const reserved = ['class', 'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 
                       'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw',
                       'new', 'this', 'super', 'extends', 'import', 'export', 'default', 'async', 'await'];
      return !reserved.includes(variable);
    },
    message: '예약어는 변수명으로 사용할 수 없습니다',
    severity: 'error'
  },
  {
    name: 'meaningful-name',
    test: (variable: string) => {
      const meaningless = ['a', 'b', 'c', 'd', 'e', 'x', 'y', 'z', 'i', 'j', 'k', 'temp', 'tmp', 'data', 'info'];
      return !meaningless.includes(variable.toLowerCase());
    },
    message: '의미 없는 변수명입니다',
    severity: 'info',
    suggestion: '변수의 용도를 명확히 나타내는 이름을 사용하세요'
  },
  {
    name: 'no-numbers-only',
    test: (variable: string) => !/^\d+$/.test(variable),
    message: '숫자로만 이루어진 변수명은 사용할 수 없습니다',
    severity: 'error'
  },
  {
    name: 'korean-romanization',
    test: (variable: string) => {
      // 한글 로마자 표기 패턴 감지
      const romanizations = ['jumun', 'jango', 'gyeoljae', 'maemae', 'jeunggeogeum', 'yesugeum'];
      return !romanizations.some(r => variable.toLowerCase().includes(r));
    },
    message: '한글 발음을 로마자로 표기한 변수명입니다',
    severity: 'error',
    suggestion: '적절한 영어 단어를 사용하세요'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '코드를 입력해주세요' },
        { status: 400 }
      );
    }

    // 변수 추출 (간단한 정규식 기반)
    const variablePatterns = [
      /(?:const|let|var)\s+([a-zA-Z_$가-힣][a-zA-Z0-9_$가-힣]*)/g,
      /function\s+([a-zA-Z_$가-힣][a-zA-Z0-9_$가-힣]*)/g,
      /class\s+([a-zA-Z_$가-힣][a-zA-Z0-9_$가-힣]*)/g,
    ];

    const issues: ValidationIssue[] = [];
    const lines = code.split('\n');
    const checkedVariables = new Set<string>();

    lines.forEach((line: string, lineIndex: number) => {
      variablePatterns.forEach((pattern: RegExp) => {
        let match;
        pattern.lastIndex = 0; // Reset regex
        
        while ((match = pattern.exec(line)) !== null) {
          const variable = match[1];
          
          // 중복 체크 방지
          if (checkedVariables.has(variable)) continue;
          checkedVariables.add(variable);
          
          const column = match.index + match[0].indexOf(variable);
          
          // 각 규칙 검증
          validationRules.forEach(rule => {
            if (!rule.test(variable)) {
              issues.push({
                line: lineIndex + 1,
                column: column + 1,
                variable,
                issue: rule.message,
                suggestion: rule.suggestion,
                severity: rule.severity,
                rule: rule.name
              });
            }
          });
        }
      });
    });

    // 한글 변수명 변환 제안
    const koreanVariables = issues
      .filter(issue => issue.rule === 'no-korean')
      .map(issue => issue.variable);

    const suggestions: { [key: string]: string } = {};
    
    if (koreanVariables.length > 0) {
      // 기본 매핑 먼저 시도
      const commonMappings: { [key: string]: string } = {
        '사용자': 'user',
        '이름': 'name',
        '주문': 'order',
        '거래': 'transaction',
        '잔고': 'balance',
        '계좌': 'account',
        '증거금': 'margin',
        '매수': 'buy',
        '매도': 'sell',
        '가격': 'price',
        '수량': 'quantity',
        '금액': 'amount',
        '수수료': 'fee',
        '예수금': 'deposit',
        '주식': 'stock',
        '종목': 'symbol'
      };

      // 각 한글 변수에 대해 RAG 제안 시도
      for (const variable of koreanVariables) {
        // 먼저 기본 매핑 확인
        let suggested = false;
        for (const [korean, english] of Object.entries(commonMappings)) {
          if (variable.includes(korean)) {
            suggestions[variable] = variable.replace(korean, english);
            suggested = true;
            break;
          }
        }

        // 기본 매핑에 없으면 RAG API 호출 (옵션)
        if (!suggested) {
          try {
            // RAG API 호출 (실제 구현 시)
            // const ragResponse = await fetch('https://koscom.app.n8n.cloud/webhook/invoke', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ chatInput: variable })
            // });
            // const ragData = await ragResponse.json();
            // if (ragData.suggestions?.length > 0) {
            //   suggestions[variable] = ragData.suggestions[0].english;
            // }
            
            // 임시로 기본 제안
            suggestions[variable] = 'variable' + variable.length;
          } catch (error) {
            console.error('RAG API error for variable:', variable, error);
          }
        }
      }
    }

    return NextResponse.json({
      issues,
      suggestions,
      summary: {
        total: issues.length,
        errors: issues.filter(i => i.severity === 'error').length,
        warnings: issues.filter(i => i.severity === 'warning').length,
        info: issues.filter(i => i.severity === 'info').length
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: '코드 검증 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}