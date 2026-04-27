'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full rounded-3xl glass" />,
});

export default function MapWrapper() {
  return <Map />;
}
