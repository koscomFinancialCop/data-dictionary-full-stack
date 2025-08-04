'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { RAGSuggestion } from '@/types/rag';

interface RAGSuggestionPopupProps {
  isOpen: boolean;
  suggestions: RAGSuggestion[];
  originalQuery: string;
  onAccept: (suggestion: RAGSuggestion) => void;
  onReject: () => void;
  onClose: () => void;
}

export default function RAGSuggestionPopup({
  isOpen,
  suggestions,
  originalQuery,
  onAccept,
  onReject,
  onClose,
}: RAGSuggestionPopupProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Styles
  const overlayStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 50
  };

  const containerStyle = {
    position: 'fixed' as const,
    inset: 0,
    overflow: 'auto',
    zIndex: 50
  };

  const contentWrapperStyle = {
    display: 'flex',
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  };

  const dialogPanelStyle = {
    width: '100%',
    maxWidth: '600px',
    background: 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease'
  };

  const titleStyle = {
    marginBottom: '24px',
    textAlign: 'center' as const
  };

  const titleIconStyle = {
    width: '48px',
    height: '48px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(16, 163, 127, 0.1)',
    color: '#10a37f'
  };

  const titleTextStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)'
  };

  const suggestionItemStyle = (isHovered: boolean) => ({
    padding: '20px',
    borderRadius: '12px',
    background: isHovered ? 'rgba(16, 163, 127, 0.08)' : 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${isHovered ? 'rgba(16, 163, 127, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
  });

  const suggestionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  };

  const englishTextStyle = {
    fontSize: '18px',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontWeight: '600',
    color: '#10a37f'
  };

  const typeTagStyle = {
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '20px',
    background: 'rgba(16, 163, 127, 0.1)',
    color: '#10a37f',
    border: '1px solid rgba(16, 163, 127, 0.2)'
  };

  const confidenceStyle = (confidence: number) => {
    const getColor = () => {
      if (confidence >= 0.8) return '#22c55e';
      if (confidence >= 0.6) return '#f59e0b';
      return '#fb923c';
    };

    return {
      fontSize: '13px',
      color: getColor(),
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    };
  };

  const confidenceBarStyle = {
    width: '40px',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden'
  };

  const confidenceFillStyle = (confidence: number) => ({
    width: `${confidence * 100}%`,
    height: '100%',
    background: confidence >= 0.8 ? '#22c55e' : confidence >= 0.6 ? '#f59e0b' : '#fb923c',
    transition: 'width 0.3s ease'
  });

  const reasoningStyle = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: '1.5'
  };

  const emptyStateStyle = {
    textAlign: 'center' as const,
    padding: '48px 24px'
  };

  const emptyIconStyle = {
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
    color: 'rgba(255, 255, 255, 0.2)'
  };

  const emptyTextStyle = {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.4)'
  };

  const footerStyle = {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'center'
  };

  const closeButtonStyle = {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div style={overlayStyle} />
        </Transition.Child>

        <div style={containerStyle}>
          <div style={contentWrapperStyle}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel style={dialogPanelStyle}>
                <Dialog.Title as="div" style={titleStyle}>
                  <div style={titleIconStyle}>
                    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 style={titleTextStyle}>AI 추천</h3>
                  <p style={subtitleStyle}>
                    "{originalQuery}"에 대한 영어 변수명 제안
                  </p>
                </Dialog.Title>

                <div>
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        style={suggestionItemStyle(hoveredIndex === index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onAccept(suggestion)}
                      >
                        <div style={suggestionHeaderStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <code style={englishTextStyle}>{suggestion.english}</code>
                            <span style={typeTagStyle}>{suggestion.type}</span>
                          </div>
                          <div style={confidenceStyle(suggestion.confidence)}>
                            <div style={confidenceBarStyle}>
                              <div style={confidenceFillStyle(suggestion.confidence)}></div>
                            </div>
                            <span>{Math.round(suggestion.confidence * 100)}%</span>
                          </div>
                        </div>
                        {suggestion.reasoning && (
                          <p style={reasoningStyle}>{suggestion.reasoning}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={emptyStateStyle}>
                      <svg style={emptyIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p style={emptyTextStyle}>추천할 변수명이 없습니다</p>
                    </div>
                  )}
                </div>

                <div style={footerStyle}>
                  <button
                    type="button"
                    style={closeButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onClick={onReject}
                  >
                    닫기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}