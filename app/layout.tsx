import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TaanaBaana Credit — AI Credit for Handloom Weavers',
  description:
    'AI-powered credit scoring, invoice financing, and insurance for handloom weavers. Upload work, get evaluated, access funding.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
