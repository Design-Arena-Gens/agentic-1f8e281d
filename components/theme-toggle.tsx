'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
    >
      {mounted && currentTheme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
