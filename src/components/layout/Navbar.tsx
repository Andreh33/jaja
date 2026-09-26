'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, X } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/tienda', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'El estudio' },
  { href: '/blog', label: 'Ideas' },
  { href: '/lab', label: 'Laboratorio' },
  { href: '/contacto', label: 'Contacto' },
];

const PRIMARY_NAV = [NAV[1], NAV[2], NAV[3], NAV[5]];

function Brand() {
  return <Image src="/brand/latech-logo.webp" alt="" width={52} height={27} className={styles.brandMark} unoptimized preload />;
}

export default function Navbar() {
  const pathname = usePathname();
  const sentinel = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;
    if (typeof window.IntersectionObserver === 'undefined') {
      const sync = () => setCompact(window.scrollY > 80);
      sync();
      window.addEventListener('scroll', sync, { passive: true });
      return () => window.removeEventListener('scroll', sync);
    }
    // Observe one threshold instead of updating React on every scroll frame.
    const observer = new IntersectionObserver(([entry]) => {
      setCompact(entry.boundingClientRect.top < 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { queueMicrotask(() => setOpen(false)); }, [pathname]);
  const active = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <span ref={sentinel} className={styles.sentinel} aria-hidden="true" />
      <header className={styles.header} data-compact={compact}>
        <nav className={styles.island} aria-label="Navegación principal">
          <div className={styles.surface} aria-hidden="true" />
          <Link href="/" className={styles.brand} aria-label="Latech, inicio"><Brand /></Link>
          <div className={styles.links}>
            {PRIMARY_NAV.map(item => (
              <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined}>
                {item.href === '/sobre-nosotros' ? 'Estudio' : item.href === '/lab' ? 'Lab' : item.label}
              </Link>
            ))}
          </div>
          <Link href="/tienda/calculadora" className={styles.projectLink}>
            <span>Tu proyecto</span><ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <Dialog.Trigger
            className={styles.menuButton}
            aria-label="Abrir menú de navegación"
            onClick={(event) => setKeyboardOpen(event.detail === 0)}
          >
            <span className={styles.menuGlyph} aria-hidden="true"><i /><i /></span>
          </Dialog.Trigger>
        </nav>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} data-keyboard={keyboardOpen} />
        <Dialog.Content className={styles.panel} data-keyboard={keyboardOpen}>
          <div className={styles.panelHeader}>
            <Link href="/" className={styles.panelBrand} aria-label="Latech, inicio" onClick={close}><Brand /></Link>
            <Dialog.Title className={styles.panelTitle}>Todo empieza con una idea.</Dialog.Title>
            <Dialog.Close className={styles.closeButton} aria-label="Cerrar menú"><X size={20} aria-hidden="true" /></Dialog.Close>
          </div>
          <Dialog.Description className={styles.srOnly}>Explora Latech o empieza a configurar tu proyecto. Pulsa Escape para cerrar.</Dialog.Description>
          <nav className={styles.expandedLinks} aria-label="Todas las páginas">
            {NAV.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={close} aria-current={active(item.href) ? 'page' : undefined}>
                <span className={styles.linkNumber} aria-hidden="true">0{index + 1}</span>
                <span>{item.label}</span>
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            ))}
            <Link href="/empleo" onClick={close} aria-current={active('/empleo') ? 'page' : undefined}>
              <span className={styles.linkNumber} aria-hidden="true">08</span><span>Trabaja con nosotros</span><ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </nav>
          <div className={styles.panelFooter}>
            <Link href="/login" className={styles.clientLink} onClick={close}>Área cliente <ArrowUpRight size={14} aria-hidden="true" /></Link>
            <Link href="/tienda/calculadora" className={styles.panelCta} onClick={close}>Construir mi proyecto <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
