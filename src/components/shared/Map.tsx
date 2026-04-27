'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    L?: typeof import('leaflet');
  }
}

// Coordenadas Latech — Calle Puente 3, Puebla de la Calzada · Badajoz
// Si quieres afinar la posición exacta, abre Google Maps, click derecho en la
// puerta de tu oficina → "Copiar coordenadas" → pega los dos valores aquí.
const LATECH_LAT = 38.88503;
const LATECH_LNG = -6.62253;

export default function Map() {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      if (!document.head.querySelector('link[href*="leaflet@1.9.4"]')) document.head.appendChild(link);
      if (cancelled || !ref.current) return;
      initialized.current = true;

      const map = L.map(ref.current, {
        center: [LATECH_LAT, LATECH_LNG],
        zoom: 17,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      const icon = L.divIcon({
        className: 'latech-marker',
        html: `<div style="width:34px;height:34px;border-radius:50%;background:radial-gradient(circle, #8B5CF6 0%, #7C3AED 100%);box-shadow:0 0 0 3px rgba(139,92,246,0.3),0 0 20px rgba(139,92,246,0.6);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:bold;">L</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker([LATECH_LAT, LATECH_LNG], { icon })
        .addTo(map)
        .bindPopup('<b>Latech</b><br/>Calle Puente 3<br/>Puebla de la Calzada · Badajoz')
        .openPopup();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={ref} className="h-[420px] w-full rounded-3xl" style={{ background: 'var(--bg-elevated)' }} />;
}
