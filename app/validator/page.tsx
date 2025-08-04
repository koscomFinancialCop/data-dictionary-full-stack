'use client';

import { useState } from 'react';
import CodeValidator from '@/components/CodeValidator';

export default function ValidatorPage() {
  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '48px 16px'
  };

  const contentWrapperStyle = {
    width: '100%',
    maxWidth: '1024px',
    margin: '0 auto'
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        <CodeValidator />
      </div>
    </div>
  );
}