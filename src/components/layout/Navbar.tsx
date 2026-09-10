'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDownRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import MagneticButton from '../effects/MagneticButton';
import styles from './public-mobile.module.css';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/blog', label: 'Blog' },
  { href: '/lab', label: 'Laboratorio' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/empleo', label: 'Ofertas de empleo' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { queueMicrotask(() => setOpen(false)); }, [pathname]);

  useEffect(() => {
    // Release the dialog's focus and scroll lock when desktop navigation appears.
    const desktop = window.matchMedia('(min-width: 1280px)');
    const onBreakpoint = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', onBreakpoint);
    return () => desktop.removeEventListener('change', onBreakpoint);
  }, []);

  const isActive = (href: string) => href === '/'
    ? pathname === '/'
    : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className={styles.header}>
        <nav
          aria-label="Navegación principal"
          className={cn(styles.navbar, 'glass', scrolled && styles.navbarScrolled)}
        >
          <Link href="/" className={styles.logoLink} aria-label="Latech inicio">
            <Logo size={scrolled ? 'sm' : 'md'} />
          </Link>

          <div className={styles.desktopLinks}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(styles.desktopLink, isActive(item.href) && styles.desktopLinkActive)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.desktopActions}>
            <Link href="/login" className="link-underline text-sm font-medium text-white/70">
              Iniciar sesión
            </Link>
            <MagneticButton href="/tienda" aria-label="Ver servicios y precios" className="!py-2 !px-5 !text-xs">
              Ver servicios
            </MagneticButton>
          </div>

          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Abrir menú"
              className={styles.menuTrigger}
              onPointerDown={() => setKeyboardNavigation(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setKeyboardNavigation(true);
              }}
            >
              <span>Menú</span>
              <Menu size={18} aria-hidden />
            </button>
          </Dialog.Trigger>
        </nav>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.menuOverlay} data-motion={keyboardNavigation ? 'none' : 'enabled'} />
        <Dialog.Content
          className={styles.menuPanel}
          data-motion={keyboardNavigation ? 'none' : 'enabled'}
          onEscapeKeyDown={() => setKeyboardNavigation(true)}
        >
          <div className={styles.menuHeading}>
            <Dialog.Title className="sr-only">Menú de Latech</Dialog.Title>
            <Logo />
            <Dialog.Close asChild>
              <button type="button" aria-label="Cerrar menú" className={styles.menuClose}>
                <X size={20} aria-hidden />
              </button>
            </Dialog.Close>
          </div>
          <div className={styles.menuBody}>
            <Dialog.Description className={styles.menuDescription}>
              Tu imaginación, nuestro límite.
            </Dialog.Description>
            <nav aria-label="Navegación móvil">
              <ul className={styles.menuLinks}>
                {NAV.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={styles.menuLink}
                    >
                      <span className={styles.menuIndex} aria-hidden>{String(index + 1).padStart(2, '0')}</span>
                      <span>{item.label}</span>
                      {isActive(item.href)
                        ? <span className={styles.activeDot} aria-hidden />
                        : <ArrowUpRight size={17} className={styles.menuArrow} aria-hidden />}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.menuFooter}>
              <Link href="/tienda/calculadora" onClick={() => setOpen(false)} className={styles.menuCta}>
                Calcular mi proyecto <ArrowDownRight size={20} aria-hidden />
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className={styles.menuLogin}>
                Iniciar sesión <ArrowUpRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
