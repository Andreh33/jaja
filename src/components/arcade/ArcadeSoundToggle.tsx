'use client';
import{useEffect,useSyncExternalStore}from'react';
import{arcadeSoundEnabled,toggleArcadeSound,subscribeArcadeSound,initializeArcadeSound}from'@/lib/arcade-audio';
export default function ArcadeSoundToggle({className}:{className?:string}){useEffect(initializeArcadeSound,[]);const on=useSyncExternalStore(subscribeArcadeSound,arcadeSoundEnabled,()=>true);return<button className={className} type="button" aria-pressed={on} aria-label={on?'Silenciar sonido':'Activar sonido'} onClick={()=>void toggleArcadeSound()}>{on?'Sonido activo':'Activar sonido'}</button>;}
