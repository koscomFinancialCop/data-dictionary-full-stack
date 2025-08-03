'use client';

import { useState } from 'react';

interface ValidationIssue {
  line: number;
  column: number;
  variable: string;
  issue: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
}

interface ValidationResponse {
  issues: ValidationIssue[];
  suggestions: { [key: string]: string };
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

export default function CodeValidator() {
  const [code, setCode] = useState('');
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ [key: string]: string }>({});
  const [summary, setSummary] = useState<{ total: number; errors: number; warnings: number; info: number } | null>(null);

  const validateCode = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setIssues([]);
    setSuggestions({});
    setSummary(null);
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const data: ValidationResponse = await response.json();
      
      setIssues(data.issues);
      setSuggestions(data.suggestions);
      setSummary(data.summary);
    } catch (error) {
      console.error('Validation error:', error);
      // 에러 시 기본 메시지 표시
      setIssues([{
        line: 0,
        column: 0,
        variable: '',
        issue: '코드 검증 중 오류가 발생했습니다',
        severity: 'error'
      }]);
    } finally {
      setIsValidating(false);
    }
  };

  const getSeverityColor = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getSeverityIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Code Input */}
      <div>
        <label htmlFor="code-input" className="block text-sm font-medium text-[#999] mb-2">
          코드 입력
        </label>
        <textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="검증할 코드를 입력하세요..."
          className="w-full h-64 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono text-sm placeholder:text-[#666] focus:outline-none focus:border-[#10a37f]/50 resize-none"
          spellCheck={false}
        />
      </div>

      {/* Validate Button */}
      <button
        onClick={validateCode}
        disabled={!code.trim() || isValidating}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${!code.trim() || isValidating
            ? 'bg-[#333] text-[#666] cursor-not-allowed'
            : 'bg-[#10a37f] text-white hover:bg-[#0ea573]'
          }
        `}
      >
        {isValidating ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            검증 중...
          </span>
        ) : (
          '코드 검증'
        )}
      </button>

      {/* Results */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">
              검증 결과
            </h3>
            {summary && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-red-400">
                  오류: {summary.errors}
                </span>
                <span className="text-yellow-400">
                  경고: {summary.warnings}
                </span>
                {summary.info > 0 && (
                  <span className="text-blue-400">
                    정보: {summary.info}
                  </span>
                )}
              </div>
            )}
          </div>
          {issues.map((issue, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">{getSeverityIcon(issue.severity)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono font-semibold">{issue.variable}</code>
                    <span className="text-xs text-[#666]">
                      {issue.line}:{issue.column}
                    </span>
                  </div>
                  <p className="text-sm mb-1">{issue.issue}</p>
                  {issue.suggestion && (
                    <p className="text-xs text-[#999]">
                      💡 {issue.suggestion}
                    </p>
                  )}
                  {suggestions[issue.variable] && (
                    <p className="text-xs text-[#10a37f] mt-1">
                      추천: <code className="font-mono">{suggestions[issue.variable]}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Issues */}
      {code.trim() && issues.length === 0 && !isValidating && (
        <div className="p-8 rounded-lg bg-green-400/10 border border-green-400/20 text-center">
          <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-400 font-medium">모든 변수명이 규칙을 준수합니다!</p>
        </div>
      )}
    </div>
  );
}