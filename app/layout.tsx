import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TextToVideo Converter Pro',
  description: 'Converta textos extensos em áudio MP3 e vídeo MP4 com alta qualidade e rapidez.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-50`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
