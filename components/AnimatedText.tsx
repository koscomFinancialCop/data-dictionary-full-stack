'use client';

import { useState, useEffect } from 'react';

const phrases = [
  '사용자명이 변수로 뭐였더라?',
  '선물옵션은 FNO? FTNO?',
  '당신의 생각을 변수로 변환해보세요',
  '금융의 새로운 가치를 창조하는',
  'Digital Innovator, 코스콤',
];

export default function AnimatedText() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseDuration = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        // 타이핑 중
        setCurrentText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        // 타이핑 완료, 잠시 대기 후 삭제 시작
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && charIndex > 0) {
        // 삭제 중
        setCurrentText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (isDeleting && charIndex === 0) {
        // 삭제 완료, 다음 문구로
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, currentPhraseIndex, isDeleting]);

  return (
    <div className="mb-8 h-16 flex items-center justify-center">
      <h1 className="text-2xl font-light text-white/80">
        {currentText}
        <span className="animate-pulse text-white/60">|</span>
      </h1>
    </div>
  );
}