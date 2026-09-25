'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Logo from './Logo';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/tienda', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'El estudio' },
  { href: '/blog', label: 'Ideas' },
  { href: '/lab', label: 'Laboratorio' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1200px)');
    const close = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);
  useEffect(() => { queueMicrotask(() => setOpen(false)); }, [pathname]);
  const active = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <header className="blue-nav"><nav className="blue-nav-inner site-container" aria-label="Navegación principal">
      <Link href="/" aria-label="Latech inicio"><Logo /></Link>
      <div className="blue-nav-links">{NAV.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined}>{item.label}</Link>)}</div>
      <div className="blue-nav-actions"><Link href="/login" className="text-xs text-white/60">Área cliente</Link><Link href="/tienda/calculadora" className="blue-button">Empezar proyecto <ArrowUpRight size={14} /></Link></div>
      <Dialog.Trigger className="blue-nav-menu-trigger" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>{open ? <X size={20} /> : <Menu size={20} />}</Dialog.Trigger>
    </nav></header>
    <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[64] bg-black/60" /><Dialog.Content className="blue-mobile-menu">
      <div className="mb-4 flex items-center justify-between"><Dialog.Title className="eyebrow">EXPLORA LATECH</Dialog.Title><Dialog.Close aria-label="Cerrar menú" className="flex h-11 w-11 items-center justify-center"><X size={22} /></Dialog.Close></div>
      <Dialog.Description className="sr-only">Navega por nuestros proyectos, servicios y estudio.</Dialog.Description>
      {NAV.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item.href) ? 'page' : undefined}>{item.label}<ArrowUpRight size={20} /></Link>)}
      <Link href="/empleo" onClick={() => setOpen(false)}>Trabaja con nosotros <ArrowUpRight size={20} /></Link>
      <Link href="/login" onClick={() => setOpen(false)}>Área cliente <ArrowUpRight size={20} /></Link>
      <Link href="/tienda/calculadora" className="blue-button" onClick={() => setOpen(false)}>Construir mi proyecto <ArrowUpRight size={18} /></Link>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
