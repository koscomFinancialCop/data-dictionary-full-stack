'use client';

import { useState, useEffect } from 'react';

const phrases = [
  '사용자명을 영어로 바꾸려면?',
  '비밀번호는 password? pwd?',
  '날짜 변수명이 뭐였더라...',
  '회원가입은 signUp? register?',
  '목록은 list? items? array?',
  '한글 변수명을 영어로 변환해보세요',
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
    <div className="mb-12 h-20 flex items-center justify-center">
      <h1 className="text-3xl font-light text-white/80">
        {currentText}
        <span className="animate-pulse text-white/60">|</span>
      </h1>
    </div>
  );
}