'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: string;
}

export function Navbar({ onRefresh, isLoading, lastUpdated }: NavbarProps) {
  const pathname = usePathname();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const navLinks = [
    { href: '/', label: '₿ BTC Dashboard', icon: '📊' },
    { href: '/polymarket', label: '🎲 Polymarket', icon: '🎲' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--surface-card)] border-b border-[var(--border-grid)] shadow-sm">
      <div className="max-w-[1800px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">◈</span>
              <span className="h1-title text-[var(--color-accent-main)]">CryptoLens</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 label-micro transition-all ${
                    pathname === link.href
                      ? 'bg-[var(--color-accent-main)] text-white'
                      : 'text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Refresh Controls */}
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="hidden lg:flex items-center gap-2 text-[var(--ink-tertiary)]">
                <span className="label-micro">LAST UPDATED:</span>
                <span className="data-numerical text-xs">{lastUpdated}</span>
              </div>
            )}

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 border transition-all label-micro ${
                autoRefresh
                  ? 'border-[var(--signal-success)] bg-[rgba(0,110,80,0.1)] text-[var(--signal-success)]'
                  : 'border-[var(--border-element)] text-[var(--ink-secondary)] hover:border-[var(--color-accent-main)]'
              }`}
            >
              <span className={autoRefresh ? 'animate-pulse' : ''}>⟳</span>
              {autoRefresh ? `AUTO (${countdown}s)` : 'AUTO OFF'}
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-1.5 bg-[var(--color-accent-main)] text-white label-micro transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-accent-hover)]'
              }`}
            >
              <span className={isLoading ? 'animate-spin' : ''}>↻</span>
              {isLoading ? 'UPDATING...' : 'REFRESH'}
            </button>

            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-[var(--signal-success)] animate-pulse' : 'bg-[var(--ink-tertiary)]'}`} />
              <span className="label-micro text-[var(--ink-secondary)]">
                {autoRefresh ? 'LIVE' : 'STATIC'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-element)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 text-center px-3 py-2 label-micro ${
                pathname === link.href
                  ? 'bg-[var(--color-accent-main)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--ink-secondary)]'
              }`}
            >
              {link.icon} {link.label.split(' ').pop()}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

