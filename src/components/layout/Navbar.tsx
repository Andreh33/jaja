'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import MagneticButton from '../effects/MagneticButton';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/blog', label: 'Blog' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'top-7' : 'top-7',
      )}
    >
      <nav
        className={cn(
          'mx-auto flex w-full max-w-7xl items-center justify-between px-6 transition-all duration-300',
          scrolled ? 'h-14' : 'h-20',
          'glass border-b',
        )}
        style={{
          backgroundColor: scrolled ? 'rgba(7,5,14,0.85)' : 'rgba(7,5,14,0.55)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <Link href="/" className="z-10 flex items-center" aria-label="Latech inicio">
          <Logo size={scrolled ? 'sm' : 'md'} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-white/60 hover:text-white',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(249,115,22,0.12))',
                      border: '1px solid rgba(139,92,246,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="link-underline text-sm font-medium text-white/70 transition-colors hover:text-white">
            Iniciar sesión
          </Link>
          <MagneticButton href="/tienda" className="!py-2 !px-5 !text-xs">
            Empezar
          </MagneticButton>
        </div>

        <button
          aria-label="Abrir menú"
          onClick={() => setOpen((s) => !s)}
          className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full glass md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <div className="mx-4 mt-2 rounded-2xl glass-strong p-4">
              <div className="flex flex-col gap-1">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                        isActive(item.href) ? 'text-white' : 'text-white/70 hover:text-white',
                      )}
                      style={isActive(item.href) ? { background: 'rgba(139,92,246,0.15)' } : {}}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="my-2 h-px" style={{ background: 'var(--border-subtle)' }} />
                <Link href="/login" className="block rounded-xl px-4 py-3 text-base text-white/70">
                  Iniciar sesión
                </Link>
                <Link
                  href="/tienda"
                  className="rounded-full px-4 py-3 text-center text-base font-semibold text-white"
                  style={{ background: 'var(--grad-signature)' }}
                >
                  Empezar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
