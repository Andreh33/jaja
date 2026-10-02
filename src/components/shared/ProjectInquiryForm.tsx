'use client';

import { useId, useState } from 'react';
import { ArrowUpRight, Globe2, ShoppingBag } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';
import { projectInquiryMessage, type ProjectInquiry, type ProjectType } from '@/lib/project-inquiry';
import styles from './ProjectInquiryForm.module.css';

export default function ProjectInquiryForm({ initialType = 'web' }: { initialType?: ProjectType }) {
  const id = useId();
  const [form, setForm] = useState<ProjectInquiry>({ type: initialType, name: '', business: '', message: '' });
  const [prepared, setPrepared] = useState(false);
  const update = (field: keyof ProjectInquiry, value: string) => { setPrepared(false); setForm(current => ({ ...current, [field]: value })); };
  const href = whatsappLink(projectInquiryMessage(form));
  return <form className={styles.form} aria-label="Cuéntanos tu proyecto" onSubmit={event => {
    event.preventDefault();
    // Native required/minLength checks run before submit; whitespace needs its own check.
    if (form.name.trim().length < 2 || form.message.trim().length < 10) {
      const target = event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement>(form.name.trim().length < 2 ? '[data-name]' : 'textarea');
      target?.setCustomValidity('Escribe al menos 2 caracteres en el nombre y 10 en la idea.'); target?.reportValidity(); return;
    }
    setPrepared(true);
    window.open(href, '_blank', 'noopener,noreferrer');
  }}>
    <fieldset className={styles.choices}><legend>¿Qué necesitas?</legend>
      {([{ value: 'web', label: 'Página web', detail: 'Presenta tu negocio y consigue contactos.', Icon: Globe2 }, { value: 'tienda', label: 'Tienda online', detail: 'Muestra tus productos y vende por internet.', Icon: ShoppingBag }] as const).map(({ value, label, detail, Icon }) => <label key={value} className={styles.choice}>
        <input type="radio" name={`${id}-project`} value={value} checked={form.type === value} onChange={() => update('type', value)} />
        <span><Icon size={22} aria-hidden="true" /><strong>{label}</strong><small>{detail}</small></span>
      </label>)}
    </fieldset>
    <div className={styles.fields}>
      <label htmlFor={`${id}-name`}>Tu nombre<input id={`${id}-name`} data-name autoComplete="name" required minLength={2} maxLength={100} placeholder="Cómo te llamas" value={form.name} onChange={event => { event.target.setCustomValidity(''); update('name', event.target.value); }} /></label>
      <label htmlFor={`${id}-business`}>Tu negocio <small>(opcional)</small><input id={`${id}-business`} autoComplete="organization" maxLength={140} placeholder="Nombre de tu negocio" value={form.business} onChange={event => update('business', event.target.value)} /></label>
    </div>
    <label htmlFor={`${id}-idea`}>Cuéntanos tu idea<textarea id={`${id}-idea`} required minLength={10} maxLength={1800} rows={4} placeholder="A qué te dedicas, qué quieres conseguir y si ya tienes una web…" value={form.message} onChange={event => { event.target.setCustomValidity(''); update('message', event.target.value); }} /></label>
    <button type="submit" className="blue-button">Continuar por WhatsApp <ArrowUpRight size={18} aria-hidden="true" /></button>
    <p className={styles.note}>Se abrirá WhatsApp con todos los detalles. Podrás revisar el mensaje antes de enviarlo. <a href="/privacidad">Privacidad</a>.</p>
    {prepared && <p className={styles.receipt} role="status">Tu mensaje está preparado. <a href={href} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a> si no se ha abierto. El envío lo confirmas allí.</p>}
  </form>;
}
