import type { ExperimentSlug } from '../_lib/experiments';
import styles from '../lab.module.css';

/** Original code-native illustrations. No canvas or game runtime on the listing. */
export default function ExperimentArt({ kind }: { kind: ExperimentSlug }) {
  return <div className={`${styles.art} ${styles[kind === 'rayos-x' ? 'xrayArt' : `${kind}Art`]}`} aria-hidden="true">
    {kind === 'escape' ? <><div className={styles.browserBar}><i /><i /><i /><span>serviciosonlineweb.com</span></div><div className={styles.fragment}>Tu imaginación,<br /><strong>nuestro límite.</strong></div><div className={styles.platformOne} /><div className={styles.platformTwo} /><div className={styles.bean}><i /><i /></div><span className={styles.burst}>↗</span></> : null}
    {kind === 'runner' ? <><div className={styles.runnerTrail} /><div className={styles.runnerHill} /><span className={styles.coin}>✦</span><div className={styles.runnerBean}><i /><i /></div><div className={styles.runnerBlock} /></> : null}
    {kind === 'lienzo' ? <svg viewBox="0 0 500 230" fill="none"><path d="M65 156C122 42 86 211 175 118S192 223 285 81 366 209 438 69" stroke="#3b82f6" strokeWidth="19" strokeLinecap="round" /><path d="M55 188C173 201 275 166 423 183" stroke="#67c4ff" strokeWidth="10" strokeLinecap="round" /><circle cx="398" cy="50" r="12" fill="#c5eaff" /><path d="m311 35 5 15 15 5-15 5-5 15-5-15-15-5 15-5Z" fill="#93c5fd" /></svg> : null}
    {kind === 'capo' ? <div className={styles.codeArt}><span>&lt;Latech&gt;</span><span>&nbsp; &lt;Imaginación /&gt;</span><span>&nbsp; &lt;Diseño /&gt;</span><span>&nbsp; &lt;Interacción /&gt;</span><span>&lt;/Latech&gt;</span></div> : null}
    {kind === 'rayos-x' ? <div className={styles.layersArt}><i /><i /><i /><span>Contenido</span></div> : null}
  </div>;
}
