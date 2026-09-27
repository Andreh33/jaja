'use client';
import { useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { ListVideo, X } from 'lucide-react';
import { channelNumber, tvChannels } from '@/lib/tv-channels';
import styles from './TvRemote.module.css';

export default function TvChannelGuide({ channel, onSelect, disabled = false }: { channel: string; onSelect: (id: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger className={styles.guideTrigger} disabled={disabled} onClick={event => setKeyboard(event.detail === 0)}><ListVideo size={17} />Guía de canales</Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay data-keyboard={keyboard} className={styles.overlay} /><Dialog.Content data-keyboard={keyboard} className={`${styles.dialog} ${styles.guide}`}>
      <div className={styles.dialogHeading}><div><p className={styles.eyebrow}>LATECH / EN EMISIÓN</p><Dialog.Title>Cada canal, otro mundo.</Dialog.Title></div><Dialog.Close className={styles.close} aria-label="Cerrar guía de canales"><X size={20} /></Dialog.Close></div>
      <Dialog.Description className={styles.description}>Elige un proyecto. Su web se abre dentro de la televisión.</Dialog.Description>
      <div className={styles.channelGrid}>{tvChannels.map(item => <button type="button" key={item.id} aria-pressed={channel === item.id} onClick={() => { onSelect(item.id); setOpen(false); }}>
        <div className={styles.channelImage}><Image src={item.image} alt="" width={360} height={200} sizes="(max-width:600px) 42vw, 240px" /><span>CH {channelNumber(item.id)}</span></div>
        <strong>{item.name}</strong><small>{item.category}</small><i>{channel === item.id ? 'EN PANTALLA' : 'SINTONIZAR ↗'}</i>
      </button>)}</div>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
