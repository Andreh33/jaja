'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/cursos/logout', { method: 'POST' });
    router.refresh();
  };
  return (
    <button
      onClick={logout}
      className="inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white/80"
    >
      <LogOut size={13} /> No soy yo
    </button>
  );
}
