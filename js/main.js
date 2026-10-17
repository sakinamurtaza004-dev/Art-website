/* Sakina Art Blog – shared script: pencil-sketch artwork, nav, cursor, transitions, GSAP */
const CFG = window.SITE_CONFIG;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = !!window.gsap;
if (HAS_GSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

// pastel journal palette (the key names are kept from earlier versions so other scripts still work)
//  yellow = butter  | orange = soft coral | coral = muted rose | magenta = pale lavender-pink | amber = peach
const PAL = { yellow: '#F5DFA0', orange: '#E8957A', coral: '#D4849A', magenta: '#E8C4D4', amber: '#F2C4A0' };
const PEN = '#4a3426', SIENNA = '#B5614A';

const CATEGORIES = [
  { id: 'paintings', name: 'Paintings', flora: 'palette', tint: PAL.yellow },
  { id: 'resin', name: 'Resin Art', flora: 'drops', tint: PAL.magenta },
  { id: 'tshirts', name: 'T-Shirts', flora: 'swatches', tint: PAL.amber },
  { id: 'decor', name: 'Home Décor', flora: 'palette2', tint: PAL.orange },
  { id: 'gifting', name: 'Gifting', flora: 'tube', tint: PAL.coral }
];
const catOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
const catName = id => catOf(id).name;
const money = n => '₹' + Number(n).toLocaleString('en-IN');

/* ---------- pencil-sketch SVG sprite ---------- */
// a thin pencil line
const pen = (d, o = .8, w = 1.4, c = PEN) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>`;
// pencil outline (drawn three times, slightly off, like a scratchy hand) over a ghostly off-register wash
const sk = (d, wash, op = .24, hatch = '') =>
  `<path d="${d}" fill="${wash}" fill-opacity="${op}" transform="translate(2.2 2)" filter="url(#wash)"/>` +
  (hatch ? `<path d="${hatch}" fill="url(#hatch)"/>` : '') +
  pen(d, .85, 1.5) +
  `<path d="${d}" fill="none" stroke="${PEN}" stroke-width=".9" stroke-opacity=".38" stroke-linecap="round" transform="translate(1.7 -1.3) rotate(.7 100 100)"/>` +
  `<path d="${d}" fill="none" stroke="${SIENNA}" stroke-width=".8" stroke-opacity=".42" stroke-linecap="round" transform="translate(-1.4 1.5) rotate(-.6 100 100)"/>`;
// a soft watercolour blob with a loose pencil ring
const wblob = (cx, cy, r, c, op = .3) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r * .82).toFixed(1)}" fill="${c}" fill-opacity="${op}" filter="url(#wash)" transform="rotate(-14 ${cx} ${cy})"/>` +
  pen(`M${cx - r} ${cy}C${cx - r} ${cy - r * .9} ${cx + r * .9} ${cy - r * .95} ${cx + r} ${cy - r * .1}C${cx + r * 1.03} ${cy + r * .8} ${cx - r * .2} ${cy + r * .95} ${cx - r} ${cy}Z`, .5, 1.1);
const teardrop = (cx, cy, s) =>
  `M${cx} ${cy - s * 1.1}C${cx + s * .2} ${cy - s * .5} ${cx + s * .9} ${cy + s * .1} ${cx + s * .9} ${cy + s * .5}C${cx + s * .9} ${cy + s * 1.05} ${cx + s * .45} ${cy + s * 1.3} ${cx} ${cy + s * 1.3}C${cx - s * .45} ${cy + s * 1.3} ${cx - s * .9} ${cy + s * 1.05} ${cx - s * .9} ${cy + s * .5}C${cx - s * .9} ${cy + s * .1} ${cx - s * .2} ${cy - s * .5} ${cx} ${cy - s * 1.1}Z`;
const dropArt = (cx, cy, s, c) => sk(teardrop(cx, cy, s), c, .28) + pen(`M${cx - s * .4} ${cy + s * .2}Q${cx - s * .45} ${cy + s * .7} ${cx - s * .15} ${cy + s * .95}`, .45, 1);

const tube = (wash1, wash2) => `<g filter="url(#pencil)"><g transform="rotate(-30 100 105)">
  ${sk('M90 50C80 26 94 8 106 18C120 8 134 30 113 50Z', wash2, .3)}
  ${pen('M96 40C98 30 100 24 104 22M108 36C112 30 116 28 120 30', .4, 1)}
  ${sk('M88 50L112 51L112 64L88 64Z', '#d9cdb8', .2)}
  ${sk('M80 64L120 63L134 80L66 81Z', '#f0e6d2', .2, 'M100 64L120 63L134 80L100 81Z')}
  ${sk('M66 80C68 110 70 140 72 168L128 169C130 140 131 108 134 80Z', wash1, .22, 'M112 82L134 80C131 108 130 140 128 169L108 168Z')}
  <path d="M67.6 104C85 100 115 108 132.4 103L131 146C115 150 85 142 69 146Z" fill="${wash1}" fill-opacity=".3" filter="url(#wash)"/>
  ${pen('M67.6 104C85 100 115 108 132.4 103M69 146C85 142 115 150 131 146', .7, 1.2)}
  ${pen('M78 125Q90 114 100 125T122 125', .75, 1.6, SIENNA)}
  ${pen('M70 152C85 148 100 154 130 150M72 159C90 156 108 161 127 157M74 92C90 99 108 90 126 97M76 86C92 92 106 85 124 90', .5, 1)}
  ${sk('M72 168L128 169L129 184L71 183Z', '#d9cdb8', .22, 'M72 168L128 169L129 184L71 183Z')}
  ${pen('M80 169V183M90 169V184M100 169V184M110 169V184M120 169V183', .6, 1.1)}
</g></g>`;

const brushArt = (handle, bristle, rot) => {
  let bristles = '';
  for (let i = -3; i <= 3; i++) bristles += pen(`M${100 + i * 2.3} 62C${100 + i * 2.7} 44 ${100 + i * .8} 26 ${100 + i * .15} 12`, .42, .8);
  return `<g filter="url(#pencil)"><g transform="rotate(${rot} 100 105)">
  ${sk('M95 192L105 191C106 150 108 120 108 94L92 94C92 120 94 150 95 192Z', handle, .28, 'M101 94L108 94C108 120 106 150 105 191L100 192Z')}
  ${pen('M98 182C99 150 98 124 97 100M103 176C104 150 104 124 103 100', .35, .9)}
  ${sk('M91 94L109 94L107 62L93 62Z', '#d9cdb8', .2, 'M100 94L109 94L107 62L100 62Z')}
  ${pen('M92 71H108M91.6 79H108.4M91.2 87H108.8', .5, 1)}
  ${sk('M93 62C88 44 95 26 100 10C105 26 112 44 107 62Z', bristle, .3)}
  ${bristles}
  <circle cx="115" cy="28" r="4.5" fill="${bristle}" fill-opacity=".3" filter="url(#wash)"/>${pen('M111 28a4 4 0 1 0 8 0a4 4 0 1 0-8 0', .45, 1)}
  <circle cx="86" cy="9" r="3" fill="${bristle}" fill-opacity=".3" filter="url(#wash)"/>
  ${pen('M100 14C96 28 103 34 99 48', .35, 2.4)}
</g></g>`;
};
const flatBrush = (handle, bristle, rot) => {
  let b = '';
  for (let i = -5; i <= 5; i++) b += pen(`M${100 + i * 2.8} 66L${100 + i * 2.6} 26`, .38, .8);
  return `<g filter="url(#pencil)"><g transform="rotate(${rot} 100 105)">
  ${sk('M94 192L106 192L109 96L91 96Z', handle, .28, 'M101 96L109 96L106 192L100 192Z')}
  ${pen('M97 180C98 150 98 124 97 102M104 176C105 150 105 124 104 102', .35, .9)}
  ${sk('M87 96L113 96L116 66L84 66Z', '#d9cdb8', .2, 'M100 96L113 96L116 66L100 66Z')}
  ${pen('M86 78H114M85.5 87H114.5', .5, 1)}
  ${sk('M84 66L116 66L114 26C110 16 90 16 86 26Z', bristle, .3)}
  ${b}
  <circle cx="123" cy="20" r="4" fill="${bristle}" fill-opacity=".3" filter="url(#wash)"/>
</g></g>`;
};
const PAL_BODY = 'M100 22C152 14 190 54 184 102C180 142 140 184 96 178C68 174 60 150 80 140C96 132 90 114 70 116C36 120 12 92 24 62C36 34 68 24 100 22Z';
const roundPalette = `<g filter="url(#pencil)">
  ${sk(PAL_BODY, PAL.yellow, .28, 'M120 120C150 132 176 112 184 102C180 142 140 184 96 178C112 160 118 140 120 120Z')}
  ${pen('M48 82C48 77 54 74 60 74C67 74 70 79 69 84C68 89 62 91 56 90C50 89 48 86 48 82Z', .8, 1.4)}
  ${pen('M40 98C46 104 54 106 62 104', .4, 1)}
  ${wblob(104, 52, 15, PAL.amber, .45)}${wblob(145, 72, 15, PAL.orange, .4)}${wblob(158, 108, 14, PAL.coral, .4)}${wblob(141, 145, 14, PAL.magenta, .5)}${wblob(104, 155, 13, PAL.yellow, .5)}${wblob(112, 104, 9, PAL.amber, .35)}
</g>`;
const RECT_BODY = 'M48 44H152C170 44 180 58 178 80C176 120 170 150 140 156H52C30 156 20 140 22 120C24 90 22 44 48 44Z';
const rectPalette = `<g transform="rotate(8 100 100)"><g filter="url(#pencil)">
  ${sk(RECT_BODY, PAL.amber, .28, 'M90 156H52C30 156 20 140 22 120C24 100 24 80 26 66C50 90 80 110 90 156Z')}
  ${pen('M38 72C38 67 44 64 50 64C57 64 60 69 59 74C58 79 52 81 46 80C40 79 38 76 38 72Z', .8, 1.4)}
  ${wblob(86, 72, 14, PAL.yellow, .5)}${wblob(120, 66, 14, PAL.orange, .4)}${wblob(152, 82, 13, PAL.coral, .4)}${wblob(144, 120, 13, PAL.magenta, .5)}${wblob(106, 124, 14, PAL.amber, .45)}${wblob(66, 122, 12, PAL.yellow, .4)}
</g></g>`;
const fan = () => [[-34, PAL.yellow], [-17, PAL.amber], [0, PAL.orange], [17, PAL.coral], [34, PAL.magenta]].map(([a, c]) =>
  `<g transform="rotate(${a} 100 176)"><g filter="url(#pencil)">${sk('M88 30H112Q114 30 114 33V176H86V33Q86 30 88 30Z', '#fffaf0', .25)}
   <rect x="90" y="35" width="20" height="62" rx="3" fill="${c}" fill-opacity=".42" filter="url(#wash)"/>${pen('M90 35H110V97H90Z', .5, 1)}
   ${pen('M92 108H108M92 116H104M92 124H108', .4, 1)}</g></g>`).join('') +
  `<circle cx="100" cy="170" r="5.5" fill="none" stroke="${PEN}" stroke-opacity=".7" stroke-width="1.5"/>`;
const SPLASH = 'M100 40C124 34 150 52 152 78C170 82 176 108 160 120C166 144 140 160 120 150C108 170 80 166 74 146C50 150 34 126 46 106C30 90 44 66 66 62C70 46 84 42 100 40Z';
const splat = `<g filter="url(#wash)">
  <path d="${SPLASH}" fill="${PAL.coral}" fill-opacity=".26"/>
  <path d="${SPLASH}" fill="${PAL.amber}" fill-opacity=".34" transform="translate(40 40) scale(.6)"/>
  <path d="${SPLASH}" fill="${PAL.yellow}" fill-opacity=".45" transform="translate(70 72) scale(.3)"/>
  <circle cx="28" cy="40" r="7" fill="${PAL.orange}" fill-opacity=".35"/><circle cx="174" cy="40" r="5" fill="${PAL.coral}" fill-opacity=".35"/><circle cx="22" cy="150" r="4.5" fill="${PAL.yellow}" fill-opacity=".5"/><circle cx="176" cy="164" r="8" fill="${PAL.amber}" fill-opacity=".4"/><circle cx="150" cy="22" r="3.5" fill="${PAL.magenta}" fill-opacity=".5"/>
  <path d="M96 156C93 172 98 184 95 194" stroke="${PAL.coral}" stroke-opacity=".3" stroke-width="9" fill="none" stroke-linecap="round"/>
</g><g filter="url(#pencil)">
  <path d="${SPLASH}" fill="none" stroke="${PEN}" stroke-opacity=".4" stroke-width="1.1" stroke-dasharray="26 6 12 5 40 8" stroke-linecap="round"/>
  ${pen('M90 156C88 172 93 183 90 192M101 156C99 172 104 183 100 192', .35, 1)}
  ${pen('M28 33a7 7 0 1 0 .1 0M174 35a5 5 0 1 0 .1 0M176 156a8 8 0 1 0 .1 0', .45, 1)}
</g>`;
const dropsArt = `<g filter="url(#pencil)">${dropArt(72, 78, 28, PAL.coral)}${dropArt(130, 100, 21, PAL.yellow)}${dropArt(98, 146, 16, PAL.magenta)}${dropArt(154, 50, 10, PAL.orange)}${dropArt(42, 144, 10, PAL.amber)}</g>`;
// a hand-drawn sketchbook / journal with spiral binding, a bookmark ribbon and a pencil
let rings = '';
for (let i = 0; i < 8; i++) { const y = 54 + i * 15.5; rings += pen(`M${40 + i * .5} ${y}c-8 -3 -8 7 0 6`, .7, 1.4) + pen(`M${47 + i * .5} ${y + 1}c8 -2 6 -6 -2 -7`, .5, 1); }
const journal = `<g filter="url(#pencil)">
  ${sk('M48 34L150 28L158 168L54 174Z', PAL.magenta, .3, 'M132 28L150 28L158 168L140 169Z')}
  ${pen('M154 40L162 38M156 60L164 58M157 80L165 78M158 100L166 98M158 120L166 118M159 140L167 138', .4, 1)}
  ${rings}
  ${sk('M74 62L130 59L133 96L77 99Z', PAL.yellow, .4)}
  ${pen('M84 72L120 70M85 80L116 78M86 88L108 86', .55, 1.2)}
  ${pen('M112 40l3 6 6 1-5 4 1 6-5-3-6 3 1-6-4-5 6-1z', .5, 1, SIENNA)}
  ${sk('M120 172L120 194L127 187L134 195L134 170Z', PAL.coral, .4)}
  ${sk('M30 150L158 112L162 122L34 162Z', PAL.amber, .35, 'M30 150L158 112L160 118L32 156Z')}
  ${pen('M30 150L16 162L34 162M44 147L48 158M62 142L66 153M80 137L84 148', .6, 1.1)}
  ${sk('M158 112L168 109L172 119L162 122Z', PAL.coral, .5)}
</g>`;

/* ---------- pencil-sketch florals + watercolour blooms ---------- */
const petalPath = (r, w) => `M100 100C${100 - w} ${100 - r * .45} ${100 - w * .85} ${100 - r} 100 ${100 - r}C${100 + w * .85} ${100 - r} ${100 + w} ${100 - r * .45} 100 100Z`;
const flowerArt = (c1, c2, c3) => {
  let out = '';
  [0, 60, 120, 180, 240, 300].forEach((a, i) => {
    out += `<g transform="rotate(${a} 100 100)">${sk(petalPath(80, 34), c1, .26, i % 3 === 0 ? petalPath(80, 34) : '')}${pen('M100 78C101 60 99 44 100 34', .35, .9)}</g>`;
  });
  [30, 102, 174, 246, 318].forEach(a => { out += `<g transform="rotate(${a} 100 100)">${sk(petalPath(52, 24), c2, .32)}</g>`; });
  out += wblob(100, 100, 13, c3, .5) + pen('M92 96h.1M108 94h.1M100 106h.1M95 104h.1M105 100h.1', .8, 2.6);
  return `<g filter="url(#pencil)">${out}</g>`;
};
const leaf = (x, y, ang, len, c) =>
  `<g transform="translate(${x} ${y}) rotate(${ang})">${sk(`M0 0C${(len * .22).toFixed(1)} ${(-len * .2).toFixed(1)} ${(len * .22).toFixed(1)} ${(-len * .7).toFixed(1)} 0 ${-len}C${(-len * .22).toFixed(1)} ${(-len * .7).toFixed(1)} ${(-len * .22).toFixed(1)} ${(-len * .2).toFixed(1)} 0 0Z`, c, .36)}${pen(`M0 -2L0 ${(-len * .85).toFixed(1)}`, .4, .9)}</g>`;
const smallFlower = (x, y, r, c) => [0, 72, 144, 216, 288].map(a =>
  wblob(+(x + Math.sin(a * Math.PI / 180) * r * 1.05).toFixed(1), +(y - Math.cos(a * Math.PI / 180) * r * 1.05).toFixed(1), +(r * .78).toFixed(1), c, .42)).join('') + wblob(x, y, +(r * .5).toFixed(1), PAL.yellow, .65);
const sprigArt = `<g filter="url(#pencil)">
  ${pen('M100 196C96 150 108 100 100 40', .75, 1.5, SIENNA)}${pen('M100 152C84 138 68 124 58 98M101 120C120 108 136 92 144 68', .7, 1.3, SIENNA)}
  ${leaf(98, 175, -50, 34, PAL.yellow)}${leaf(100, 166, 50, 32, PAL.yellow)}${leaf(86, 140, -62, 28, PAL.amber)}${leaf(118, 112, 58, 28, PAL.yellow)}${leaf(100, 90, -38, 24, PAL.amber)}
  ${smallFlower(100, 36, 9, PAL.coral)}${smallFlower(58, 94, 8, PAL.magenta)}${smallFlower(144, 64, 8.5, PAL.amber)}</g>`;
const wildArt = `<g filter="url(#pencil)">
  ${pen('M60 198C58 160 64 130 56 98', .75, 1.4, SIENNA)}${pen('M100 198C102 150 96 110 104 70', .75, 1.4, SIENNA)}${pen('M142 198C140 164 148 140 150 118', .75, 1.4, SIENNA)}
  ${leaf(60, 176, -48, 28, PAL.yellow)}${leaf(60, 160, 46, 24, PAL.amber)}${leaf(101, 170, -52, 30, PAL.yellow)}${leaf(100, 136, 50, 26, PAL.amber)}${leaf(142, 180, -45, 24, PAL.yellow)}
  ${smallFlower(56, 92, 13, PAL.magenta)}${smallFlower(104, 62, 15, PAL.coral)}${smallFlower(150, 112, 12, PAL.amber)}</g>`;
const branchArt = (() => {
  const B = [[26, 190], [58, 142], [104, 100], [170, 26]];
  const at = t => { const u = 1 - t; return [0, 1].map(k => u ** 3 * B[0][k] + 3 * u * u * t * B[1][k] + 3 * u * t * t * B[2][k] + t ** 3 * B[3][k]); };
  let s = pen('M26 190C58 142 104 100 170 26', .75, 1.5, SIENNA);
  for (let i = 1; i <= 8; i++) {
    const t = i / 9, p = at(t), q = at(t + .02), ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI + 90, side = i % 2 ? 1 : -1;
    s += leaf(+p[0].toFixed(1), +p[1].toFixed(1), Math.round(ang + side * 48), +(27 - i * .8).toFixed(1), i % 2 ? PAL.yellow : PAL.amber);
  }
  return `<g filter="url(#pencil)">${s}</g>`;
})();
const BLOOM1 = 'M100 22C146 14 184 46 182 92C190 128 160 168 118 174C92 190 52 176 38 146C14 124 22 82 46 62C54 40 76 26 100 22Z';
const BLOOM2 = 'M104 28C150 30 178 62 172 104C170 140 138 176 98 172C62 176 26 148 28 108C20 70 52 36 104 28Z';
// a watercolour stain: pooled pigment with a darker rim and a second wash on top
const bloom = (c1, c2, d) => `<g filter="url(#wash)"><path d="${d}" fill="${c1}" fill-opacity=".36"/><path d="${d}" fill="none" stroke="${c1}" stroke-opacity=".45" stroke-width="5"/><path d="${d}" fill="${c2}" fill-opacity=".3" transform="translate(30 30) scale(.7)"/><circle cx="168" cy="170" r="7" fill="${c1}" fill-opacity=".45"/><circle cx="26" cy="40" r="5" fill="${c2}" fill-opacity=".45"/></g>`;

/* ---------- contact icons ---------- */
const ICON = {
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.6 20.4l1.3-4.7A8.5 8.5 0 1 1 8.3 19.2z"/><path d="M9.1 8.7c.3 2.5 2.7 5 5.9 5.7l1.2-1.4-2-1-.9.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.9-1-2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 6 8-6"/></svg>'
};
ICON.gear = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
const socials = `<a class="soc" href="${CFG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.ig}</a><a class="soc" href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.wa}</a><a class="soc" href="mailto:${CFG.email}" aria-label="Email">${ICON.mail}</a>`;

const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="wc" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d"/>
    <feGaussianBlur in="d" stdDeviation=".7"/>
  </filter>
  <filter id="wash" x="-25%" y="-25%" width="150%" height="150%">
    <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="9" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="8" result="d"/>
    <feGaussianBlur in="d" stdDeviation="1.6"/>
  </filter>
  <filter id="pencil" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="5" result="a"/>
    <feDisplacementMap in="SourceGraphic" in2="a" scale="3.2" result="b"/>
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="2" result="c"/>
    <feDisplacementMap in="b" in2="c" scale="1.4"/>
  </filter>
  <filter id="rough" x="-5%" y="-20%" width="110%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="8" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>
  </filter>
  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><path d="M0 0V5" stroke="#6b4a3a" stroke-width=".9" stroke-opacity=".5"/></pattern>
  <pattern id="hatch2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><path d="M0 0V6" stroke="#6b4a3a" stroke-width=".8" stroke-opacity=".4"/></pattern>
  <symbol id="tube" viewBox="0 0 200 200">${tube(PAL.coral, PAL.orange)}</symbol>
  <symbol id="tube2" viewBox="0 0 200 200">${tube(PAL.yellow, PAL.coral)}</symbol>
  <symbol id="brush" viewBox="0 0 200 200">${brushArt(PAL.yellow, PAL.coral, -34)}</symbol>
  <symbol id="brush2" viewBox="0 0 200 200">${flatBrush(PAL.amber, PAL.orange, 30)}</symbol>
  <symbol id="palette" viewBox="0 0 200 200">${roundPalette}</symbol>
  <symbol id="palette2" viewBox="0 0 200 200">${rectPalette}</symbol>
  <symbol id="swatches" viewBox="0 0 200 200">${fan()}</symbol>
  <symbol id="splat" viewBox="0 0 200 200">${splat}</symbol>
  <symbol id="drops" viewBox="0 0 200 200">${dropsArt}</symbol>
  <symbol id="journal" viewBox="0 0 200 200">${journal}</symbol>
  <symbol id="flower" viewBox="0 0 200 200">${flowerArt(PAL.coral, PAL.amber, PAL.yellow)}</symbol>
  <symbol id="flower2" viewBox="0 0 200 200">${flowerArt(PAL.magenta, PAL.yellow, PAL.orange)}</symbol>
  <symbol id="sprig" viewBox="0 0 200 200">${sprigArt}</symbol>
  <symbol id="wildflowers" viewBox="0 0 200 200">${wildArt}</symbol>
  <symbol id="branch" viewBox="0 0 200 200">${branchArt}</symbol>
  <symbol id="bloom" viewBox="0 0 200 200">${bloom(PAL.amber, PAL.coral, BLOOM1)}</symbol>
  <symbol id="bloom2" viewBox="0 0 200 200">${bloom(PAL.yellow, PAL.magenta, BLOOM2)}</symbol>
  <symbol id="bloom3" viewBox="0 0 200 200">${bloom(PAL.magenta, PAL.orange, BLOOM1)}</symbol>
</defs></svg>`;
document.body.insertAdjacentHTML('afterbegin', SPRITE);

const floraSVG = t => `<svg viewBox="0 0 200 200" aria-hidden="true"><use href="#${t}" width="200" height="200"/></svg>`;
// thin dry-brush divider: broken, bristly lines in sienna and rose, low opacity
const dry = (d, c, w, o, dash) => `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-dasharray="${dash}" fill="none" stroke-linecap="round"/>`;
const BRUSH = `<svg viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true"><g filter="url(#pencil)">
  ${dry('M6 20C120 14 230 26 380 19S620 14 794 22', SIENNA, 1.6, .5, '90 6 40 4 120 9 60 5 200 7')}
  ${dry('M30 24C200 19 330 28 480 23S680 19 770 25', PAL.coral, 3, .38, '70 10 150 6 40 12 120 5')}
  ${dry('M120 15C250 11 400 19 560 14', PAL.amber, 5, .35, '50 8 20 6 140 10 80 6')}
  ${dry('M300 27C420 30 560 26 700 29', SIENNA, 1, .4, '30 5 60 8 90 4')}</g></svg>`;
const fill = root => {
  root.querySelectorAll('[data-flora]:empty').forEach(el => el.innerHTML = floraSVG(el.dataset.flora));
  root.querySelectorAll('[data-brush]:empty').forEach(el => el.innerHTML = BRUSH);
};

/* ---------- header / footer / mobile menu ---------- */
const page = document.body.dataset.page;
const LINKS = [['index.html', 'Home', 'home'], ['customise.html', 'Customise', 'customise'], ['shop.html', 'Shop', 'shop'], ['about.html', 'About', 'about'], ['contact.html', 'Contact', 'contact']];
const UL = '<svg class="ul" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><path class="y" d="M2 5 Q18 2 38 5 T70 4 T98 4" pathLength="1"/><path class="o" d="M3 6 Q22 3 42 6 T72 5 T97 6" pathLength="1"/></svg>';
const BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

if (document.getElementById('site-header')) document.getElementById('site-header').innerHTML = `
<header class="site"><div class="wrap nav">
  <a class="logo" href="index.html"><svg class="logo-ic" viewBox="0 0 200 200" aria-hidden="true"><use href="#palette" width="200" height="200"/></svg><span data-paint>${CFG.brand}</span></a>
  <nav class="menu" aria-label="Main">${LINKS.map(l => `<a href="${l[0]}" class="${page === l[2] ? 'active' : ''}">${l[1]}${UL}</a>`).join('')}</nav>
  <div class="nav-r">
    ${socials}
    <a class="gear" href="admin.html" aria-label="Studio admin login" title="Studio admin">${ICON.gear}</a>
    <button class="cart-btn" id="cart-btn" type="button" aria-label="Open cart">${BAG}<span class="badge" id="cart-count" hidden>0</span></button>
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</div></header>
<div class="mnav" id="mnav" aria-hidden="true">
  <div class="flora mn1" data-flora="palette"></div><div class="flora mn2" data-flora="brush"></div><div class="flora mn3" data-flora="journal"></div>
  <nav>${LINKS.map(l => `<a href="${l[0]}" class="${page === l[2] ? 'active' : ''}">${l[1]}</a>`).join('')}<div class="mn-soc">${socials}</div></nav>
</div>`;

if (document.getElementById('site-footer')) document.getElementById('site-footer').innerHTML = `
<footer class="site-footer">
  <div class="flora f1" data-flora="tube2"></div><div class="flora f2" data-flora="splat"></div><div class="flora d" data-flora="flower" style="width:150px;height:150px;left:20%;bottom:-46px;transform:rotate(-10deg)"></div><div class="flora d" data-flora="wildflowers" style="width:150px;height:150px;right:20%;bottom:-40px"></div>
  <div class="wrap">
    <div class="cols">
      <div><h3>${CFG.brand}</h3><p>Painted by hand,<br>made with soul.</p></div>
      <div><h3>Explore</h3><ul>${LINKS.map(l => `<li><a href="${l[0]}">${l[1]}</a></li>`).join('')}</ul></div>
      <div><h3>Say hello</h3><ul>
        <li><a href="${CFG.instagram}" target="_blank" rel="noopener">${CFG.handle}</a></li>
        <li><a href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="mailto:${CFG.email}">${CFG.email}</a></li></ul></div>
    </div>
    <p class="copy">© ${new Date().getFullYear()} ${CFG.brand}</p>
  </div>
</footer>
<a class="wa-float" href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">Chat</a>
<div id="wash-page" aria-hidden="true"></div>`;

const burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
function toggleMenu(open) {
  if (!mnav) return;
  open = open ?? !mnav.classList.contains('open');
  mnav.classList.toggle('open', open);
  burger.classList.toggle('on', open);
  burger.setAttribute('aria-expanded', open);
  mnav.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && HAS_GSAP && !RM) gsap.fromTo('#mnav nav a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .1, duration: .9, ease: 'power3.out', delay: .2 });
}
if (burger) burger.onclick = () => toggleMenu();

/* ---------- products (shared by Home + Shop) ---------- */
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const placeholderHTML = id => { const c = catOf(id); return `<div class="ph" style="--tint:${c.tint}">${floraSVG(c.flora)}</div>`; };
const phHTML = p => p.image
  ? `<img class="photo" src="${p.image}" alt="${escH(p.title)}" loading="lazy" data-cat="${p.category}">`
  : placeholderHTML(p.category);
const priceText = p => p.price ? `${p.from ? 'From ' : ''}${money(p.price)}` : 'Price on request';
// a picture that fails to load (offline, bad path) falls back to a pencil sketch
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.classList.contains('photo')) {
    const d = document.createElement('div'); d.innerHTML = placeholderHTML(t.dataset.cat);
    t.replaceWith(d.firstElementChild);
  }
}, true);

/* ---------- listings live in a Supabase database: whatever the admin uploads is visible to every visitor ---------- */
const CUSTOM_FOR = { paintings: 'portraits', resin: 'jewellery', tshirts: 'tshirt', decor: 'decor', gifting: 'gifting' };
const SUPA = { on: !!(CFG.supabaseUrl && CFG.supabaseKey), url: String(CFG.supabaseUrl || '').replace(/\/+$/, ''), key: CFG.supabaseKey || '' };
const supaHeaders = token => ({ apikey: SUPA.key, Authorization: 'Bearer ' + (token || SUPA.key) });
// only web links or our own assets/ folder are allowed as an image source
const safeImg = u => { u = String(u || '').trim(); return /^(https?:\/\/|assets\/)/i.test(u) ? u.replace(/"/g, '%22').replace(/</g, '%3C') : ''; };
// database row -> the camelCase shape used around the site
const fromRow = r => ({
  id: r.id, title: r.title, category: r.category, description: r.description, price: r.price, priceType: r.price_type,
  size: r.size, medium: r.medium, images: Array.isArray(r.images) ? r.images : [], visible: r.visible, oneOfAKind: r.one_of_a_kind, createdAt: r.created_at
});
// listing -> the product shape the shop already understands
function listingToProduct(l) {
  const fixed = l.priceType === 'fixed', from = l.priceType === 'from';
  const price = (fixed || from) && Number(l.price) > 0 ? Number(l.price) : null;
  const category = CUSTOM_FOR[l.category] ? l.category : 'paintings';
  const images = (l.images && l.images.length ? l.images : [l.imageUrl]).map(safeImg).filter(Boolean);
  return {
    id: String(l.id), title: l.title || 'Untitled', category, medium: l.medium || '', size: l.size || '',
    price, from: from && !!price, original: !!l.oneOfAKind,
    availability: l.oneOfAKind ? 'Only 1 available' : (fixed && price ? 'In stock' : 'Made to order'),
    cta: fixed && price ? 'cart' : 'enquire', custom: CUSTOM_FOR[category], ratio: '4/5',
    image: images[0] || '', images, description: l.description || ''
  };
}
// connected -> the visible listings from the database; not connected yet -> the sample pieces
async function loadProducts() {
  if (SUPA.on) {
    const r = await fetch(`${SUPA.url}/rest/v1/listings?select=*&visible=eq.true&order=created_at.desc`, { headers: supaHeaders(), cache: 'no-store' });
    if (!r.ok) throw new Error('Could not load listings (' + r.status + ')');
    return (await r.json()).map(fromRow).map(listingToProduct);
  }
  return fetch('data/products.json').then(r => r.json()).then(j => j.products);
}
// home page: one piece from each of up to three categories
const pickFeatured = ps => {
  const seen = new Set(), out = [];
  ps.forEach(p => { if (out.length < 3 && !seen.has(p.category)) { seen.add(p.category); out.push(p); } });
  ps.forEach(p => { if (out.length < 3 && !out.includes(p)) out.push(p); });
  return out;
};

const featured = document.getElementById('featured');
if (featured) loadProducts().then(ps => {
  featured.innerHTML = ps.length ? pickFeatured(ps).map(p => `
    <a class="piece reveal" href="shop.html?open=${p.id}">
      <figure>${phHTML(p)}</figure>
      <div class="cap"><span class="kicker">${catName(p.category)}</span><h3>${escH(p.title)}</h3><p>${escH(p.medium)} · ${priceText(p)}</p><span class="btn sm">View piece</span></div>
    </a>`).join('') : '<p class="empty">New pieces are on their way — follow along on Instagram to see them first.</p>';
  fill(featured); reveal(featured);
}).catch(() => { featured.innerHTML = '<p class="empty">The collection is taking a moment to load — please try again shortly.</p>'; });
const tiles = document.getElementById('ig-tiles');
if (tiles) tiles.innerHTML = [['palette', PAL.yellow], ['brush', PAL.amber], ['tube', PAL.coral], ['journal', PAL.magenta], ['splat', PAL.orange], ['drops', PAL.yellow]]
  .map(([f, t]) => `<a class="tile reveal" href="${CFG.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><div class="ph" style="--tint:${t}">${floraSVG(f)}</div><span class="tile-ic">${ICON.ig}</span></a>`).join('');

// hero background: exactly the Shop banner's painted bands (same shapes, thickness, colours and opacity)
const heroBand = document.getElementById('hero-band');
if (heroBand) heroBand.innerHTML = `<svg viewBox="0 0 1440 320" preserveAspectRatio="none"><g filter="url(#wc)" fill="none" stroke-linecap="round">
  <path d="M-20 120C300 60 520 180 820 110S1260 70 1470 130" stroke="${PAL.amber}" stroke-width="130" stroke-opacity=".5"/>
  <path d="M-20 200C260 250 560 150 860 215S1250 250 1470 190" stroke="${PAL.yellow}" stroke-width="100" stroke-opacity=".5"/>
  <path d="M200 160C480 120 760 200 1100 150" stroke="${PAL.magenta}" stroke-width="70" stroke-opacity=".4"/></g></svg>`;
// contact links set from the config (Follow / Email me / Message me cards)
const linkFor = { instagram: CFG.instagram, email: 'mailto:' + CFG.email, whatsapp: 'https://wa.me/' + CFG.whatsapp };
document.querySelectorAll('[data-link]').forEach(a => { a.href = linkFor[a.dataset.link]; if (a.dataset.link !== 'email') { a.target = '_blank'; a.rel = 'noopener'; } });
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICON[el.dataset.icon]; });
const textFor = { handle: CFG.handle, email: CFG.email };
document.querySelectorAll('[data-text]').forEach(el => { el.textContent = textFor[el.dataset.text]; });

fill(document);

/* ---------- animation helpers (slowed ~20% for a gentler feel) ---------- */
function splitPaint(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true">${[...w].map(ch => `<span class="ch">${ch}</span>`).join('')}</span>`).join(' ');
  return el.querySelectorAll('.ch');
}
function reveal(root = document, force = false) {
  if (!HAS_GSAP || RM || !window.ScrollTrigger) return;
  root.querySelectorAll('.reveal:not(.rv-done)').forEach((el, i) => {
    el.classList.add('rv-done');
    gsap.from(el, {
      y: 50, x: i % 2 ? 14 : -14, opacity: 0, rotate: i % 2 ? .7 : -.7, duration: 1.55, ease: 'power3.out',
      delay: (i % 3) * .1,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });
  if (force) ScrollTrigger.refresh();
}

// hero headline: each word is revealed bottom-to-top by a clip-path "paint stroke", one after the other
function revealWords(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map(w => `<span class="wd" aria-hidden="true"><span class="wi">${w}</span></span>`).join(' ');
  gsap.fromTo(el.querySelectorAll('.wd'), { clipPath: 'inset(100% -6% -22% -6%)' },
    { clipPath: 'inset(-22% -6% -22% -6%)', duration: .75, stagger: .2, ease: 'power3.out', delay: .4, clearProps: 'clipPath' });
  gsap.fromTo(el.querySelectorAll('.wi'), { y: '60%' }, { y: 0, duration: .75, stagger: .2, ease: 'power3.out', delay: .4, clearProps: 'transform' });
}

function intro() {
  if (!HAS_GSAP || RM) return;
  document.querySelectorAll('[data-reveal="words"]').forEach(revealWords);
  if (document.querySelector('.hero-splash')) gsap.from('.hero-splash', { opacity: 0, scale: .72, duration: 1.8, delay: .5, ease: 'power2.out' });
  // "How it works": the three steps float in one after another as they scroll into view
  if (window.ScrollTrigger && document.querySelector('.how-step')) {
    const steps = gsap.utils.toArray('.how-step');
    gsap.set(steps, { opacity: 0, y: 60 });
    ScrollTrigger.batch(steps, { start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, stagger: .24, ease: 'power3.out', clearProps: 'transform,opacity' }) });
  }
  document.querySelectorAll('[data-paint]').forEach((el, n) => {
    const chars = splitPaint(el);
    const target = getComputedStyle(el).color;
    gsap.fromTo(chars,
      { opacity: 0, filter: 'blur(14px)', scale: 1.25, y: 8, color: PAL.amber },
      { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0, color: target, duration: 1.6, ease: 'power2.out', stagger: .07, delay: .3 + n * .19, clearProps: 'filter,transform,color' });
  });
  const has = s => document.querySelector(s);
  if (has('.wash')) gsap.from('.wash', { opacity: 0, scale: 1.06, duration: 3, ease: 'power2.out' });
  if (has('.hero, .page-head p')) gsap.from('.hero .lead, .hero .actions, .hero .eyebrow, .page-head p', { opacity: 0, y: 20, duration: 1.4, stagger: .19, delay: 1.4, ease: 'power2.out' });
  if (has('.page-head .flora, .hero .flora')) gsap.from('.page-head .flora, .hero .flora', { opacity: 0, scale: .65, duration: 2.25, stagger: .25, ease: 'power2.out' });
  reveal(document);
}

/* ---------- paintbrush cursor: brief pastel trail + soft splatter on hover ---------- */
// the brush itself is the CSS cursor (see style.css); this adds the fading pastel dots
function cursor() {
  if (!HAS_GSAP || RM || !matchMedia('(pointer:fine)').matches) return;
  const cols = [PAL.amber, PAL.coral, PAL.yellow];   // peach, rose, butter – taken in turn
  let ci = 0; const pick = () => cols[ci++ % cols.length];
  const blobR = () => `${40 + Math.random() * 30}% ${40 + Math.random() * 30}% ${40 + Math.random() * 30}% ${40 + Math.random() * 30}%`;
  const dot = (x, y, size, life, spread = 0) => {
    const s = document.createElement('i'); s.className = 'splat';
    Object.assign(s.style, { width: size + 'px', height: size + 'px', background: pick(), left: x + 'px', top: y + 'px', borderRadius: blobR() });
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = spread * (.5 + Math.random());
    gsap.fromTo(s, { x: 0, y: 0, scale: .5, opacity: .9 }, { x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 1.1, opacity: 0, duration: life, ease: 'power1.out', onComplete: () => s.remove() });
  };
  let lx = -999, ly = -999, dist = 0, lastEl = null;
  addEventListener('mousemove', e => {
    dist += Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
    if (dist < 16) return;
    dist = 0;
    for (let i = 0; i < 2 + (Math.random() < .5 ? 1 : 0); i++)
      dot(e.clientX + (Math.random() - .5) * 10, e.clientY + (Math.random() - .5) * 10, 5 + Math.random() * 8, .5);
  }, { passive: true });
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a,button,[role=button],.pcard,.piece,.tile,.pill,select,input[type=range]');
    if (el && el !== lastEl) for (let i = 0; i < 6; i++) dot(e.clientX, e.clientY, 6 + Math.random() * 12, .9, 30);
    lastEl = el || null;
  });
}

/* ---------- page transition: watercolour wash ---------- */
const wash = document.getElementById('wash-page');
let leaving = false;
function pageWash() {
  if (!wash) return;
  if (!HAS_GSAP || RM) return;
  if (sessionStorage.getItem('wash')) {
    sessionStorage.removeItem('wash');
    gsap.set(wash, { x: 0 });
    gsap.to(wash, { x: '135vw', duration: 1.4, ease: 'power2.inOut', delay: .06 });
  }
  addEventListener('pageshow', e => { if (e.persisted) { leaving = false; gsap.set(wash, { x: '-135vw' }); } });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || leaving || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || a.target === '_blank' || a.hasAttribute('download')) return;
    if (u.pathname === location.pathname && u.search === location.search) { if (u.hash) return; e.preventDefault(); return; }
    e.preventDefault(); leaving = true; toggleMenu(false);
    gsap.fromTo(wash, { x: '-135vw' }, { x: 0, duration: 1.05, ease: 'power2.inOut', onComplete: () => { sessionStorage.setItem('wash', '1'); location.href = a.href; } });
  });
}

/* ---------- scroll behaviour: nav fill, progress brushstroke ---------- */
function scrollChrome() {
  const hdr = document.querySelector('header.site');
  const bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);
  const fillBar = bar.firstChild;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (hdr) hdr.classList.toggle('scrolled', y > 30);
    fillBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------- a rough sienna brushstroke between every section ---------- */
function sectionDividers() {
  const stroke = `<svg viewBox="0 0 1200 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 16C150 8 300 22 500 14S860 9 1000 18S1160 12 1200 15" fill="none" stroke="${SIENNA}" stroke-width="6" stroke-opacity=".3" stroke-linecap="round" filter="url(#wc)"/></svg>`;
  [...document.querySelectorAll('main > section, main > .page-head')].forEach((el, i) => {
    if (!i) return;
    const d = document.createElement('div');
    d.className = 'sec-div'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = stroke;
    el.before(d);
  });
}

cursor(); pageWash(); sectionDividers(); scrollChrome(); intro();
