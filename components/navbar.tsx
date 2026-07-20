'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Upload, CreditCard, Shield, Users, Home, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/upload', label: 'Upload Work', icon: Upload },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funding', label: 'Funding', icon: CreditCard },
  { href: '/insurance', label: 'Insurance', icon: Shield },
  { href: '/admin', label: 'Admin', icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">TaanaBaana</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase">Credit</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
