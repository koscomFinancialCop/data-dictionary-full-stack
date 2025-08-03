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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#2b2b2b] border border-[#3e3e3e] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="h-6 w-6 text-purple-400" />
                  <h3 className="text-lg font-medium text-white">
                    AI 변수명 추천
                  </h3>
                </Dialog.Title>

                <div className="mb-4">
                  <p className="text-sm text-gray-400">
                    "<span className="text-white font-medium">{originalQuery}</span>"에 대한 추천 변수명
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-[#1e1e1e] rounded-lg p-4 border border-[#3e3e3e] hover:border-[#5e5e5e] transition-colors cursor-pointer"
                      onClick={() => onAccept(suggestion)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <code className="text-lg font-mono text-blue-400">
                            {suggestion.english}
                          </code>
                          <span className="text-xs px-2 py-1 rounded bg-[#2b2b2b] text-gray-400">
                            {suggestion.type}
                          </span>
                          {suggestion.category && (
                            <span className="text-xs px-2 py-1 rounded bg-[#2b2b2b] text-gray-400">
                              {suggestion.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getConfidenceColor(suggestion.confidence)}`}>
                            신뢰도: {Math.round(suggestion.confidence * 100)}%
                          </span>
                          <span className={`text-xs px-2 py-1 rounded bg-[#2b2b2b] ${getConfidenceColor(suggestion.confidence)}`}>
                            {getConfidenceLabel(suggestion.confidence)}
                          </span>
                        </div>
                      </div>
                      {suggestion.reasoning && (
                        <p className="text-sm text-gray-400 mt-2">
                          {suggestion.reasoning}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <code className="text-xs text-gray-500 font-mono">
                          사용 예시: const {suggestion.english} = get{suggestion.english.charAt(0).toUpperCase() + suggestion.english.slice(1)}();
                        </code>
                      </div>
                    </div>
                  ))}
                </div>

                {suggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    추천할 변수명이 없습니다.
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2b2b2b] border border-[#3e3e3e] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    onClick={onReject}
                  >
                    <XCircleIcon className="h-4 w-4" />
                    모두 거절
                  </button>
                  {suggestions.length > 0 && (
                    <p className="text-xs text-gray-500 self-center">
                      클릭하여 선택하세요
                    </p>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  ESC 키를 눌러 닫기
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}