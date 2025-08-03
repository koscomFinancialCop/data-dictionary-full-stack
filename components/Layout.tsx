'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    },
    {
      id: 'generator',
      name: '변수 생성기',
      path: '/',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'validator',
      name: '코드 검증기',
      path: '/validator',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    }
  ];

  const bottomItems = [
    {
      id: 'settings',
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const sidebarStyle = {
    position: 'fixed' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: '60px',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '20px',
    paddingBottom: '20px',
    transition: 'width 0.2s ease-in-out',
    zIndex: 40
  };

  const logoStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #10a37f 0%, #0ea573 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    cursor: 'pointer'
  };

  const navStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    paddingTop: '20px'
  };

  const linkStyle = (isActive: boolean, isHovered: boolean) => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isActive ? '#252525' : isHovered ? '#252525' : 'transparent',
    color: isActive ? '#ffffff' : '#888888',
    transition: 'all 0.15s ease',
    position: 'relative' as const,
    cursor: 'pointer'
  });

  const tooltipStyle = {
    position: 'absolute' as const,
    left: '60px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#252525',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    whiteSpace: 'nowrap' as const,
    opacity: 0,
    pointerEvents: 'none' as const,
    transition: 'opacity 0.15s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  };

  const mainStyle = {
    marginLeft: '60px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    backgroundColor: '#0f0f0f'
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#ffffff', display: 'flex' }}>
      {/* Minimal Sidebar - Desktop */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={logoStyle}>
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>K</span>
        </div>

        {/* Main Navigation */}
        <nav style={navStyle}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const isHovered = hoveredItem === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.path}
                style={{ textDecoration: 'none' }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={linkStyle(isActive, isHovered)}>
                  {item.icon}
                  {/* Tooltip */}
                  <div style={{
                    ...tooltipStyle,
                    opacity: isHovered ? 1 : 0
                  }}>
                    {item.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          {bottomItems.map((item) => {
            const isActive = pathname === item.path;
            const isHovered = hoveredItem === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.path}
                style={{ textDecoration: 'none' }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={linkStyle(isActive, isHovered)}>
                  {item.icon}
                  {/* Tooltip */}
                  <div style={{
                    ...tooltipStyle,
                    opacity: isHovered ? 1 : 0
                  }}>
                    {item.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
          ...(isMobile && { display: 'block' })
        }}
        aria-label="메뉴"
      >
        <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Main content */}
      <main style={mainStyle}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          style={{
            display: isMobile ? 'block' : 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}