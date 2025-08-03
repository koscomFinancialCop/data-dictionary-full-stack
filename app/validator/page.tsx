'use client';

import { useState } from 'react';
import CodeValidator from '@/components/CodeValidator';

export default function ValidatorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#10a37f] to-[#0ea573] bg-clip-text text-transparent mb-4">
            코드 검증기
          </h1>
          <p className="text-[#999] text-lg">
            코드의 변수명 규칙을 검증하고 개선 사항을 제안합니다
          </p>
        </div>
        
        <CodeValidator />
      </div>
    </div>
  );
}