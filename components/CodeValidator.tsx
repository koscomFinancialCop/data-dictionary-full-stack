'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and line numbers
  useEffect(() => {
    const handleScroll = () => {
      if (lineNumbersRef.current && textareaRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Generate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const validateCode = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setIssues([]);
    setSuggestions({});
    setSummary(null);
    
    try {
      // Get session ID for tracking
      const sessionId = typeof window !== 'undefined' 
        ? sessionStorage.getItem('sessionId') || 'anonymous' 
        : 'anonymous';
        
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
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
      case 'error': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
    }
  };

  const getSeverityIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return (
          <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Editor styles
  const editorContainerStyle = {
    position: 'relative' as const,
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    overflow: 'hidden',
    border: isFocused ? '1px solid rgba(16, 163, 127, 0.3)' : '1px solid #2d2d2d',
    boxShadow: isFocused ? '0 0 0 3px rgba(16, 163, 127, 0.1), 0 20px 40px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease'
  };

  const editorHeaderStyle = {
    backgroundColor: '#252526',
    padding: '8px 16px',
    borderBottom: '1px solid #2d2d2d',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const editorBodyStyle = {
    display: 'flex',
    height: '400px',
    backgroundColor: '#1e1e1e'
  };

  const lineNumbersStyle = {
    backgroundColor: '#1e1e1e',
    color: '#858585',
    padding: '16px 0',
    paddingRight: '16px',
    paddingLeft: '20px',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '21px',
    userSelect: 'none' as const,
    overflow: 'hidden',
    textAlign: 'right' as const,
    minWidth: '50px'
  };

  const textareaStyle = {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#d4d4d4',
    border: 'none',
    outline: 'none',
    padding: '16px',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '21px',
    resize: 'none' as const,
    overflow: 'auto' as const
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #10a37f 0%, #0ea573 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500' as const,
    cursor: code.trim() && !isValidating ? 'pointer' : 'not-allowed',
    opacity: code.trim() && !isValidating ? 1 : 0.5,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const issueItemStyle = (severity: ValidationIssue['severity']) => ({
    backgroundColor: '#252526',
    border: '1px solid #2d2d2d',
    borderLeft: `3px solid ${getSeverityColor(severity)}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Animated Logo */}
      <div style={{ 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'center',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          position: 'relative',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <svg 
            style={{ 
              width: '100%', 
              height: '100%',
              filter: 'drop-shadow(0 0 20px rgba(16, 163, 127, 0.5))'
            }} 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10a37f" />
                <stop offset="100%" stopColor="#0ea573" />
              </linearGradient>
            </defs>
            <path 
              stroke="url(#codeGradient)" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              style={{
                strokeDasharray: '100',
                strokeDashoffset: '100',
                animation: 'drawPath 1.5s ease-out forwards'
              }}
            />
          </svg>
        </div>
      </div>

      {/* Code Editor */}
      <div style={{ marginBottom: '24px' }}>
        <div style={editorContainerStyle}>
          {/* Editor Header */}
          <div style={editorHeaderStyle}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
            </div>
            <span style={{ color: '#cccccc', fontSize: '12px', marginLeft: '8px' }}>코드 편집기</span>
          </div>

          {/* Editor Body */}
          <div style={editorBodyStyle}>
            {/* Line Numbers */}
            <div 
              ref={lineNumbersRef}
              style={lineNumbersStyle}
            >
              {lineNumbers.map(num => (
                <div key={num} style={{ height: '21px' }}>{num}</div>
              ))}
            </div>

            {/* Code Input */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="// 검증할 코드를 입력하세요..."
              style={textareaStyle}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button
          onClick={validateCode}
          disabled={!code.trim() || isValidating}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (code.trim() && !isValidating) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 163, 127, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isValidating ? (
            <>
              <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              검증 중...
            </>
          ) : (
            '코드 검증'
          )}
        </button>

        {/* Summary */}
        {summary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
              <span style={{ color: '#999999' }}>오류</span>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>{summary.errors}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              <span style={{ color: '#999999' }}>경고</span>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>{summary.warnings}</span>
            </div>
            {summary.info > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                <span style={{ color: '#999999' }}>정보</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{summary.info}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Panel */}
      {issues.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            검증 결과
          </h2>
          {issues.map((issue, index) => (
            <div
              key={index}
              style={issueItemStyle(issue.severity)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#252526';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: getSeverityColor(issue.severity), marginTop: '2px' }}>
                  {getSeverityIcon(issue.severity)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <code style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#ffffff',
                      backgroundColor: '#1e1e1e',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'Consolas, "Courier New", monospace'
                    }}>
                      {issue.variable}
                    </code>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#858585',
                      fontFamily: 'Consolas, "Courier New", monospace'
                    }}>
                      {issue.line}:{issue.column}
                    </span>
                    {issue.rule && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#858585',
                        backgroundColor: '#1e1e1e',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {issue.rule}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#d4d4d4', marginBottom: issue.suggestion ? '8px' : '0' }}>
                    {issue.issue}
                  </p>
                  {issue.suggestion && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px',
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#1e1e1e',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#999999'
                    }}>
                      <span style={{ marginTop: '2px' }}>💡</span>
                      <span>{issue.suggestion}</span>
                    </div>
                  )}
                  {suggestions[issue.variable] && (
                    <div style={{ 
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(16, 163, 127, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 163, 127, 0.2)'
                    }}>
                      <span style={{ fontSize: '12px', color: '#10a37f', marginRight: '8px' }}>추천:</span>
                      <code style={{ 
                        fontSize: '13px', 
                        color: '#10a37f',
                        fontFamily: 'Consolas, "Courier New", monospace',
                        fontWeight: '600'
                      }}>
                        {suggestions[issue.variable]}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success State */}
      {code.trim() && issues.length === 0 && !isValidating && (
        <div style={{
          padding: '48px',
          borderRadius: '12px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          textAlign: 'center'
        }}>
          <svg style={{ width: '64px', height: '64px', color: '#22c55e', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ fontSize: '18px', color: '#22c55e', fontWeight: '600', marginBottom: '8px' }}>
            완벽합니다!
          </p>
          <p style={{ fontSize: '14px', color: '#999999' }}>
            모든 변수명이 규칙을 준수합니다
          </p>
        </div>
      )}

      {/* Add keyframe animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}