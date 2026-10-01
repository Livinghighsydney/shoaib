const _loadedFonts = new Set(['Inter', 'Bebas Neue']); // already in index.css

export function ensureFontLoaded(family) {
  if (!family || _loadedFonts.has(family)) return;
  _loadedFonts.add(family);
  const id = `gf-${family.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex, amount = 20) {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.slice(0, 2), 16) + amount).toString(16).padStart(2, '0');
  const g = Math.min(255, parseInt(h.slice(2, 4), 16) + amount).toString(16).padStart(2, '0');
  const b = Math.min(255, parseInt(h.slice(4, 6), 16) + amount).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function injectThemeCSS(theme) {
  if (theme?.bodyFont) ensureFontLoaded(theme.bodyFont);
  if (theme?.displayFont) ensureFontLoaded(theme.displayFont);

  let el = document.getElementById('portfolio-theme');
  if (!el) {
    el = document.createElement('style');
    el.id = 'portfolio-theme';
    document.head.appendChild(el);
  }
  if (!theme) { el.textContent = ''; return; }

  const parts = [];

  // ── Section backgrounds ───────────────────────────────────────────────────
  const isGrad = theme.type === 'gradient';
  const bg = isGrad
    ? `linear-gradient(${theme.gradientDir || '135deg'}, ${theme.gradientFrom || '#0a0a0a'}, ${theme.gradientTo || '#0a0a0a'})`
    : (theme.color || '#0a0a0a');
  const bgProp = isGrad ? 'background' : 'background-color';
  parts.push(`.bg-primary{${bgProp}:${bg}!important}`);
  parts.push(`.bg-secondary{${bgProp}:${bg}!important}`);

  // ── Accent color ─────────────────────────────────────────────────────────
  const a = theme.accentColor || '#8B1A10';
  if (a !== '#8B1A10') {
    const al  = lighten(a, 18);
    parts.push(`.text-accent{color:${a}!important}`);
    parts.push(`.bg-accent{background-color:${a}!important}`);
    parts.push(`.border-accent{border-color:${a}!important}`);
    parts.push(`.hover\\:text-accent:hover{color:${a}!important}`);
    parts.push(`.hover\\:border-accent:hover{border-color:${a}!important}`);
    parts.push(`.hover\\:bg-accent-light:hover{background-color:${al}!important}`);
    parts.push(`.bg-accent-dim{background-color:${hexToRgba(a, 0.15)}!important}`);
    parts.push(`.text-accent\\/50{color:${hexToRgba(a, 0.5)}!important}`);
    parts.push(`.text-accent\\/60{color:${hexToRgba(a, 0.6)}!important}`);
    parts.push(`.border-accent\\/30{border-color:${hexToRgba(a, 0.3)}!important}`);
    parts.push(`.border-accent\\/40{border-color:${hexToRgba(a, 0.4)}!important}`);
    parts.push(`::-webkit-scrollbar-thumb{background:${a}!important}`);
  }

  // ── Body text color ───────────────────────────────────────────────────────
  // Must override .text-white too — most headings/spans use that class explicitly
  const tc = theme.textColor || '#ffffff';
  if (tc !== '#ffffff') {
    parts.push(`body{color:${tc}!important}`);
    parts.push(`.text-white{color:${tc}!important}`);
  }

  // ── Body font ─────────────────────────────────────────────────────────────
  const bf = theme.bodyFont || 'Inter';
  if (bf !== 'Inter') {
    parts.push(`body,html{font-family:'${bf}',sans-serif!important}`);
  }

  // ── Display / heading font ────────────────────────────────────────────────
  const df = theme.displayFont || 'Bebas Neue';
  if (df !== 'Bebas Neue') {
    parts.push(`.font-display{font-family:'${df}',sans-serif!important}`);
  }

  el.textContent = parts.join('');
}
