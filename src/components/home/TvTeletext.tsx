'use client';
import Image from 'next/image';
import {useState}from'react';
import {equipo}from'@/app/sobre-nosotros/_data/equipo';
import styles from './TvTeletext.module.css';
export default function TvTeletext({onClose}:{onClose:()=>void}){
  const[page,setPage]=useState(0);const founders=equipo[0];
  return <section className={styles.teletext} aria-label="Teletexto de Latech: sobre nosotros"><header><b>P{100+page}</b><span>LATECH TEXT</span><span>0{page+1} / 03</span></header><div className={styles.scroll} data-studio-scroll tabIndex={0} aria-label="Contenido del teletexto"><h3>SOBRE<br/><em>NOSOTROS.</em></h3><p className={styles.strip}>TU IMAGINACIÓN ES NUESTRO LÍMITE.</p>
    {page===0?<div className={styles.founders}><div className={styles.photo}><Image src={founders.foto.src} alt={founders.foto.alt} width={64} height={91} sizes="64px"/><span>ANDRÉS + LUIS</span></div><div><h4>DOS AMIGOS.<br/>UNA MISMA IDEA.</h4><p>Somos Andrés Rubio y Luis Grondona, fundadores de Latech.</p><p>Empezamos ayudando a familiares y amigos. Hoy diseñamos experiencias digitales para que otros negocios crezcan.</p></div></div>:page===1?<><h4>NO HACEMOS WEBS<br/>PARA PASAR DESAPERCIBIDOS.</h4><p>Diseño, estrategia e interacción. Combinamos cuidado visual y visión de negocio para dar a cada proyecto una voz propia.</p><p>Detrás de cada empresa hay una persona, una historia y un esfuerzo que merece ser visto.</p><p className={styles.highlight}>TU PROYECTO NO ES UN NÚMERO.</p></>:<><h4>CRECER JUNTOS.</h4><p>Nos implicamos personalmente: escuchamos, entendemos el negocio y acompañamos a nuestros clientes.</p><p>Webs, tiendas y experiencias que se sienten. Con cercanía, transparencia y atención al detalle.</p><a href="/sobre-nosotros">CONOCE A TODO EL EQUIPO →</a></>}
    <p className={styles.footer}>100 · FUNDADORES / 101 · VISIÓN / 102 · EQUIPO</p></div><nav aria-label="Páginas del teletexto">{['FUNDADORES','VISIÓN','EQUIPO'].map((label,i)=><button key={label} aria-pressed={page===i} onClick={()=>setPage(i)}><i/>{label}</button>)}<button onClick={onClose}><i/>VOLVER</button></nav></section>;
}
