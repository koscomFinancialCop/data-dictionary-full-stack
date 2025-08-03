'use client';

import { useState, useEffect } from 'react';

const phrases = [
  '한글 변수명을 영어로 바꿔보세요',
  '코드의 가독성을 높이는 첫걸음',
  'AI가 추천하는 영어 변수명',
  '개발자를 위한 번역 도구',
  'Where Korean Meets Code',
];

export default function AnimatedText() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 30 : 80;
    const pauseDuration = 3000;

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
    <div className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Main Title */}
      <div className="text-center mb-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            K-Generator
          </span>
        </h1>
        <p className="text-lg text-[#666] font-medium">
          AI를 활용한 용어 사전 기반의 변수 생성기
        </p>
      </div>

      {/* Animated Text */}
      <div className="h-12 flex items-center justify-center">
        <p className="text-2xl md:text-3xl font-light">
          <span className="bg-gradient-to-r from-[#10a37f] via-[#0ea573] to-[#10a37f] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            {currentText}
          </span>
          <span className="inline-block w-0.5 h-8 bg-[#10a37f] ml-1 animate-blink"></span>
        </p>
      </div>
    </div>
  );
}