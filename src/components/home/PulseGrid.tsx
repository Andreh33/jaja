'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import styles from './PulseGrid.module.css';

const paths = [
  'M0 168H504V336H924V168H1512V504H2016',
  'M2016 756H1596V588H1176V756H672V504H0',
  'M672 0V252H840V588H1008V924H1344V1176',
  'M1680 0V336H1428V672H1596V1008H2016',
];

export default function PulseGrid({ paused }: { paused: boolean }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => { const update = () => setTabVisible(!document.hidden); update(); document.addEventListener('visibilitychange', update); return () => document.removeEventListener('visibilitychange', update); }, []);
  return <div ref={ref} className={styles.field} data-running={visible && tabVisible && !paused} aria-hidden="true">
    <svg width="2016" height="1176" className={styles.grid}>
      <defs><pattern id={id} width="84" height="84" patternUnits="userSpaceOnUse"><path d="M84 0H0V84" fill="none" stroke="#7ebafa" strokeOpacity=".13" strokeWidth="1" /></pattern></defs>
      <rect width="2016" height="1176" fill={`url(#${id})`} />
      {paths.map((d, i) => <g key={d}>
        <path d={d} className={styles.track} />
        <path d={d} pathLength="100" className={styles.pulse} style={{ animationDelay: `${i * -3}s` }} />
      </g>)}
    </svg>
  </div>;
}
