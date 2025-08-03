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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#1a1a1a] p-8 text-left align-middle shadow-2xl transition-all">
                <Dialog.Title as="div" className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-1">
                    AI 추천 변수명
                  </h3>
                  <p className="text-sm text-[#666]">
                    "{originalQuery}"를 영어로 변환한 추천 결과입니다
                  </p>
                </Dialog.Title>

                <div className="space-y-3 mb-8">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-2xl bg-[#212121] hover:bg-[#252525] transition-all duration-300 cursor-pointer group"
                      onClick={() => onAccept(suggestion)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <code className="text-xl font-mono text-[#10a37f] font-medium">
                            {suggestion.english}
                          </code>
                          <span className="text-xs px-3 py-1 rounded-full bg-[#10a37f]/10 text-[#10a37f]">
                            {suggestion.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${getConfidenceColor(suggestion.confidence)}`}>
                            신뢰도 {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      {suggestion.reasoning && (
                        <p className="text-sm text-[#666] mt-3">
                          {suggestion.reasoning}
                        </p>
                      )}
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

                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#666]">
                    {suggestions.length > 0 ? '클릭하여 선택' : ''}
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm text-[#666] hover:text-white transition-colors"
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