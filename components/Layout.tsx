'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: 'generator',
      name: '변수 생성기',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      description: '한글 변수명을 영어로 변환'
    },
    {
      id: 'validator',
      name: '코드 검증기',
      path: '/validator',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '변수명 규칙 검증'
    }
  ];

  const currentItem = menuItems.find(item => item.path === pathname) || menuItems[0];

  return (
    <div className="min-h-screen bg-[#212121] text-white flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] transition-colors"
        aria-label="메뉴"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#171717] border-r border-[#333]/50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-4 border-b border-[#333]/50">
            <h1 className="text-lg font-semibold text-white">K-Generator</h1>
            <p className="text-xs text-[#666] mt-1">AI 기반 개발 도구</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-[#2a2a2a] text-white' 
                          : 'text-[#999] hover:text-white hover:bg-[#222]'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className={isActive ? 'text-[#10a37f]' : ''}>{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-[#666]">{item.description}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#333]/50">
            <p className="text-xs text-[#666] text-center">
              Powered by Claude • 금융매체팀
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-[#333]/50 bg-[#1a1a1a]/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-medium text-white">{currentItem.name}</h2>
            <p className="text-sm text-[#666] mt-1">{currentItem.description}</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}