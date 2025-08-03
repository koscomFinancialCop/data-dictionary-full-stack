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
      name: '생성기',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'validator',
      name: '검증기',
      path: '/validator',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    }
  ];

  // Remove currentItem as we're removing the header

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
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#171717] border-r border-[#333]/50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-[#333]/50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#10a37f] to-[#0ea573] bg-clip-text text-transparent">
              K-Generator
            </h1>
            <p className="text-xs text-[#666] mt-2">AI 기반 개발 도구</p>
          </div>

          {/* New Session Button */}
          <div className="p-4 border-b border-[#333]/50">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#10a37f]/10 hover:bg-[#10a37f]/20 border border-[#10a37f]/20 text-[#10a37f] transition-all duration-200 group">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">새 세션</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      className={`
                        group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#10a37f]/10 to-[#0ea573]/10 text-white border border-[#10a37f]/20' 
                          : 'text-[#999] hover:text-white hover:bg-[#222]/50 border border-transparent'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className={`
                        ${isActive ? 'text-[#10a37f]' : 'text-[#666] group-hover:text-[#10a37f]'} 
                        ml-1 transition-colors duration-200
                      `}>
                        {item.icon}
                      </span>
                      <span className={`
                        text-sm font-medium transition-all duration-200
                        ${isActive ? '' : 'group-hover:translate-x-1'}
                      `}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-[#333]/50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10a37f] animate-pulse"></div>
              <p className="text-xs text-[#666]">
                Powered by Claude
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
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