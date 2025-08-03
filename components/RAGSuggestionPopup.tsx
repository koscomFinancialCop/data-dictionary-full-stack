'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { RAGSuggestion } from '@/types/rag';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return '높음';
    if (confidence >= 0.6) return '보통';
    return '낮음';
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b2b2b] to-[#252525] border border-[#444]/50 p-8 text-left align-middle shadow-2xl transition-all backdrop-blur-xl">
                <Dialog.Title as="div" className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#10a37f]/20 to-[#10a37f]/10">
                    <SparklesIcon className="h-7 w-7 text-[#10a37f]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      AI 변수명 제안
                    </h3>
                    <p className="text-sm text-[#666] mt-1">
                      "<span className="text-[#10a37f] font-medium">{originalQuery}</span>"에 대한 추천 변수명
                    </p>
                  </div>
                </Dialog.Title>

                <div className="space-y-4 mb-8">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] rounded-2xl p-6 border border-[#444]/30 hover:border-[#10a37f]/30 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      onClick={() => onAccept(suggestion)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <code className="text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#10a37f] to-[#0ea573] font-bold">
                            {suggestion.english}
                          </code>
                          <div className="flex gap-2">
                            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-[#10a37f]/20 to-[#10a37f]/10 text-[#10a37f] font-semibold">
                              {suggestion.type}
                            </span>
                            {suggestion.category && (
                              <span className="text-xs px-3 py-1.5 rounded-full bg-[#444]/30 text-[#888] font-medium">
                                {suggestion.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-sm font-semibold ${getConfidenceColor(suggestion.confidence)}`}>
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                            <p className="text-xs text-[#666]">신뢰도</p>
                          </div>
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                            suggestion.confidence >= 0.8 ? 'from-green-500/20 to-green-500/10' :
                            suggestion.confidence >= 0.6 ? 'from-yellow-500/20 to-yellow-500/10' :
                            'from-orange-500/20 to-orange-500/10'
                          } flex items-center justify-center`}>
                            <span className={`text-lg font-bold ${getConfidenceColor(suggestion.confidence)}`}>
                              {suggestion.confidence >= 0.8 ? 'A' : suggestion.confidence >= 0.6 ? 'B' : 'C'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {suggestion.reasoning && (
                        <p className="text-sm text-[#888] mb-4 leading-relaxed">
                          💡 {suggestion.reasoning}
                        </p>
                      )}
                      <div className="flex items-center gap-2 p-3 bg-[#1a1a1a]/50 rounded-xl">
                        <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <code className="text-xs text-[#666] font-mono">
                          const {suggestion.english} = get{suggestion.english.charAt(0).toUpperCase() + suggestion.english.slice(1)}();
                        </code>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#10a37f]/0 to-[#10a37f]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>

                {suggestions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-[#666] mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-[#888]">추천할 변수명이 없습니다.</p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#444]/30 pt-6">
                  <p className="text-sm text-[#666]">
                    {suggestions.length > 0 ? '제안을 클릭하여 선택하세요' : ''}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 justify-center rounded-2xl px-6 py-3 text-sm font-medium text-[#888] hover:text-white bg-[#1e1e1e]/50 hover:bg-[#1e1e1e] border border-[#444]/30 hover:border-[#444]/50 focus:outline-none focus:ring-2 focus:ring-[#10a37f] transition-all duration-300"
                      onClick={onReject}
                    >
                      <XCircleIcon className="h-4 w-4" />
                      닫기
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-xs text-[#666] text-center">
                  <kbd className="px-2 py-1 bg-[#1e1e1e]/50 rounded border border-[#444]/30">ESC</kbd> 키를 눌러 닫기
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}