'use client';
import{useSyncExternalStore}from'react';
import{arcadeSoundEnabled,toggleArcadeSound,subscribeArcadeSound}from'@/lib/arcade-audio';
export default function ArcadeSoundToggle({className}:{className?:string}){const on=useSyncExternalStore(subscribeArcadeSound,arcadeSoundEnabled,()=>false);return<button className={className} type="button" aria-pressed={on} onClick={()=>void toggleArcadeSound()}>{on?'Sonido activo':'Activar sonido'}</button>;}
