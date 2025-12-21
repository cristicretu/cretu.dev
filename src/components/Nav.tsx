'use client';

import { useEffect, useState } from 'react';

export default function Nav() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showHint, setShowHint] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Only show hint if user hasn't used keyboard nav before
    const hasUsedNav = localStorage.getItem('nav-hint-dismissed');
    if (!hasUsedNav) {
      setShowHint(true);
      // Auto-hide after 5 seconds anyway
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('nav-hint-dismissed', 'true');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      const active = document.activeElement;
      if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;

      // Navigate with keyboard
      if (e.key === '1' && !e.metaKey && !e.ctrlKey) {
        dismissHint();
        window.location.href = '/';
      } else if (e.key === '2' && !e.metaKey && !e.ctrlKey) {
        dismissHint();
        window.location.href = '/writing';
      } else if (e.key === '3' && !e.metaKey && !e.ctrlKey) {
        dismissHint();
        window.location.href = '/work';
      } else if (e.key === '4' && !e.metaKey && !e.ctrlKey) {
        dismissHint();
        window.location.href = '/resources';
      } else if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        dismissHint();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* Desktop nav - bottom left */}
      <nav className="fixed bottom-6 left-6 z-50 font-mono text-xs hidden lg:block">
        {showHint && (
          <div className="mb-3 text-neutral-300 dark:text-neutral-700 animate-pulse">
            press keys to navigate
          </div>
        )}
        <div className="flex flex-col gap-1 text-neutral-400 dark:text-neutral-600">
          <a href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <span className="text-neutral-300 dark:text-neutral-700">[1]</span> home
          </a>
          <a href="/writing" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <span className="text-neutral-300 dark:text-neutral-700">[2]</span> writing
          </a>
          <a href="/work" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <span className="text-neutral-300 dark:text-neutral-700">[3]</span> work
          </a>
          <a href="/resources" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <span className="text-neutral-300 dark:text-neutral-700">[4]</span> resources
          </a>
          <button
            onClick={toggleTheme}
            className="text-left hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <span className="text-neutral-300 dark:text-neutral-700">[t]</span> {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </nav>

      {/* Mobile nav - bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Expanded menu */}
        {mobileOpen && (
          <div className="bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
            <div className="flex flex-col gap-3 font-mono text-sm text-neutral-600 dark:text-neutral-400">
              <a href="/" className="active:text-neutral-900 dark:active:text-neutral-100">
                → home
              </a>
              <a href="/writing" className="active:text-neutral-900 dark:active:text-neutral-100">
                → writing
              </a>
              <a href="/work" className="active:text-neutral-900 dark:active:text-neutral-100">
                → work
              </a>
              <a href="/resources" className="active:text-neutral-900 dark:active:text-neutral-100">
                → resources
              </a>
              <button
                onClick={toggleTheme}
                className="text-left active:text-neutral-900 dark:active:text-neutral-100"
              >
                → {theme === 'dark' ? 'light mode' : 'dark mode'}
              </button>
            </div>
          </div>
        )}

        {/* Toggle bar */}
        <div className="bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full px-6 py-4 font-mono text-xs text-neutral-500 dark:text-neutral-500 flex items-center justify-between"
          >
            <span>{mobileOpen ? '× close' : '↑ menu'}</span>
            <span className="text-neutral-400 dark:text-neutral-600">cretu.dev</span>
          </button>
        </div>
      </nav>

      {/* Spacer for mobile to prevent content being hidden behind nav */}
      <div className="h-16 sm:hidden" />
    </>
  );
}
