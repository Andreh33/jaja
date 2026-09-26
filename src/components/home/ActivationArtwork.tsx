import { useId } from 'react';

// Original vector art: no remote image requests, fonts, stock claims or canvas.
export default function ActivationArtwork({ kind }: { kind: 'restaurant' | 'company' | 'lamp' | 'vase' | 'bowl' }) {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="0 0 440 380" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-ceramic`} x1="105" y1="80" x2="340" y2="320" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset=".46" stopColor="#e2f3ff" /><stop offset="1" stopColor="#5a92b7" /></linearGradient>
      <linearGradient id={`${id}-blue`} x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#74ceff" /><stop offset="1" stopColor="#0d4f8f" /></linearGradient>
      <linearGradient id={`${id}-wall`} x1="100" y1="120" x2="330" y2="320" gradientUnits="userSpaceOnUse"><stop stopColor="#f1f7fa" /><stop offset="1" stopColor="#8cb1cc" /></linearGradient>
    </defs>
    <ellipse cx="226" cy="329" rx="150" ry="19" fill="#020e23" opacity=".22" />
    {kind === 'restaurant' && <g transform="rotate(-18 220 190)">
      <ellipse cx="220" cy="207" rx="153" ry="137" fill="#0b2c50" />
      <ellipse cx="220" cy="195" rx="153" ry="137" fill={`url(#${id}-ceramic)`} />
      <ellipse cx="220" cy="195" rx="118" ry="105" stroke="#abc8dc" strokeWidth="2" />
      <ellipse cx="220" cy="195" rx="105" ry="91" fill="#ecf5f9" />
      <path d="M151 221c10-52 54-95 108-71 23 10 26 43 1 63-37 31-85 43-109 8Z" fill="#b85223" />
      <path d="M159 213c13-36 48-69 91-56 21 7 24 26 1 44-31 26-68 36-92 12Z" fill="#e99353" />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M${175 + i * 20} ${190 - i * 7}l17 29`} stroke="#a24724" strokeWidth="5" strokeLinecap="round" />)}
      <g fill="#315f46"><ellipse cx="257" cy="132" rx="14" ry="24" transform="rotate(42 257 132)" /><ellipse cx="281" cy="150" rx="11" ry="24" transform="rotate(71 281 150)" /><ellipse cx="264" cy="160" rx="13" ry="21" transform="rotate(-42 264 160)" /></g>
      <g fill="#dfaa4a"><circle cx="168" cy="241" r="10" /><circle cx="196" cy="253" r="8" /><circle cx="278" cy="221" r="11" /><circle cx="252" cy="246" r="7" /></g>
      <path d="M139 161c-8 28-7 48 0 62M292 179c5 13 5 28 0 43" stroke="#859544" strokeWidth="5" strokeLinecap="round" />
    </g>}
    {kind === 'company' && <g>
      <path d="m69 190 134-89 169 60-143 112Z" fill="#ecf5fc" /><path d="m69 190 160 83v83L69 267Z" fill="#6894b5" /><path d="m229 273 143-112v86L229 356Z" fill="#c0d9e9" />
      <path d="M120 167V89l117-63v142l-65 51Z" fill={`url(#${id}-wall)`} /><path d="m237 26 74 39v134l-74-31Z" fill="#77a4c2" /><path d="m120 89 52 25 65-88-117 63Z" fill="#f6fafc" />
      <path d="M159 166v-43l39-22v88Z" fill="#153d5a" /><path d="m165 161 29-16v39l-29 15Z" fill="#8acfff" />
      <path d="m269 84 27 13v61l-27-12Z" fill="#153d5a" /><path d="m255 234 83-59v47l-83 63Z" fill="#133b57" />
      {[0, 1, 2, 3, 4].map(i => <path key={i} d={`m${123 + i * 13} ${237 + i * 7} 42-25 16 8-42 26Z`} fill={i % 2 ? '#abc9df' : '#e8f3fa'} />)}
      <path d="M328 141V85" stroke="#132e3d" strokeWidth="3" /><ellipse cx="330" cy="83" rx="21" ry="32" fill="#2d6970" />
    </g>}
    {kind === 'lamp' && <g>
      <ellipse cx="223" cy="314" rx="86" ry="17" fill="#164269" /><ellipse cx="220" cy="307" rx="86" ry="17" fill={`url(#${id}-ceramic)`} />
      <path d="M218 300V126" stroke="#accbe0" strokeWidth="13" /><path d="M215 300V126" stroke="#ecf9ff" strokeWidth="4" />
      <path d="M93 166c0-68 53-117 127-117s127 49 127 117Z" fill={`url(#${id}-blue)`} /><ellipse cx="220" cy="166" rx="127" ry="20" fill="#132f53" /><ellipse cx="220" cy="166" rx="73" ry="10" fill="#ffe0a7" />
      <path d="M118 133c18-45 52-63 88-67" stroke="#cbebff" strokeWidth="3" strokeLinecap="round" opacity=".65" />
    </g>}
    {kind === 'vase' && <g>
      <path d="M185 75h72l-10 87c31 29 54 75 49 123-5 56-153 56-158 0-5-48 18-94 49-123Z" fill={`url(#${id}-ceramic)`} /><ellipse cx="221" cy="76" rx="36" ry="9" fill="#497896" /><ellipse cx="221" cy="76" rx="28" ry="5" fill="#183b52" />
      <path d="M167 271c-2-45 11-74 31-99" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" />
      <path d="M224 78 234 20M221 69l-27-39" stroke="#4c6353" strokeWidth="3" /><ellipse cx="243" cy="26" rx="19" ry="8" fill="#658a75" transform="rotate(-35 243 26)" /><ellipse cx="191" cy="30" rx="20" ry="8" fill="#83a68e" transform="rotate(28 191 30)" />
    </g>}
    {kind === 'bowl' && <g><path d="M76 171c9 91 66 142 145 142s136-51 145-142Z" fill={`url(#${id}-ceramic)`} /><ellipse cx="221" cy="171" rx="145" ry="54" fill="#b1d0e3" /><ellipse cx="221" cy="171" rx="129" ry="43" fill={`url(#${id}-blue)`} /><path d="M113 219c18 41 53 66 91 70" stroke="#fff" strokeWidth="4" opacity=".6" strokeLinecap="round" /></g>}
  </svg>;
}
