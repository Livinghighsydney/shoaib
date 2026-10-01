import { useState, useRef, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { injectThemeCSS, ensureFontLoaded } from '../../utils/themeUtils';

// ── Data ──────────────────────────────────────────────────────────────────────

const SOLID_PRESETS = ['#0a0a0a', '#080d1a', '#0d1117', '#0a0f0a', '#100814', '#130505', '#0f0f0f', '#1a1208'];

const GRADIENT_PRESETS = [
  { label: 'Crimson', from: '#0a0a0a', to: '#1e0808' },
  { label: 'Navy',    from: '#0a0a0a', to: '#080d1a' },
  { label: 'Forest',  from: '#0a0a0a', to: '#080f0a' },
  { label: 'Violet',  from: '#0a0a0a', to: '#100814' },
  { label: 'Slate',   from: '#0d1117', to: '#1a1208' },
  { label: 'Teal',    from: '#0a0a0a', to: '#071414' },
];

const DIRS = [
  { label: '↘', value: '135deg' },
  { label: '↓', value: '180deg' },
  { label: '→', value: '90deg'  },
  { label: '↗', value: '45deg'  },
];

const ACCENT_PRESETS = [
  '#8B1A10', '#1A4B8B', '#1A7B4B', '#8B6B1A',
  '#6B1A8B', '#1A6B7B', '#8B3A1A', '#1A8B5B',
];

const TEXT_QUICK = ['#ffffff', '#faf6f0', '#f0f4fa', '#e8e8e8', '#d4d4d4', '#c8c0b8'];

const BODY_FONTS = [
  'Inter', 'Outfit', 'DM Sans', 'Poppins',
  'Raleway', 'Nunito', 'Montserrat', 'Lato',
  'Manrope', 'Plus Jakarta Sans', 'Work Sans', 'Figtree',
];

const DISPLAY_FONTS = [
  'Bebas Neue', 'Oswald', 'Anton', 'Barlow Condensed',
  'Righteous', 'Russo One', 'Teko', 'Black Han Sans',
  'Syne', 'Space Grotesk', 'Chakra Petch', 'Black Ops One',
];

const DEFAULT_THEME = {
  type: 'solid', color: '#0a0a0a',
  gradientFrom: '#0a0a0a', gradientTo: '#1e0808', gradientDir: '135deg',
  accentColor: '#8B1A10', textColor: '#ffffff',
  bodyFont: 'Inter', displayFont: 'Bebas Neue',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-border/40" />;
}

function Label({ children }) {
  return <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">{children}</p>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ThemeEditor() {
  const { isEditMode } = useAuth();
  const { content, updateSection } = useContent();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('Background');
  const [local, setLocal] = useState(null);
  const debounceRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (content?.theme && !initialized.current) {
      setLocal({ ...DEFAULT_THEME, ...content.theme });
      initialized.current = true;
    }
  }, [content?.theme]);

  // Preload all font options when panel opens so buttons render in their own face
  useEffect(() => {
    if (!isEditMode || !open) return;
    [...BODY_FONTS, ...DISPLAY_FONTS].forEach(ensureFontLoaded);
  }, [isEditMode, open]);

  if (!isEditMode || !local) return null;

  const patch = (update) => {
    const next = { ...local, ...update };
    setLocal(next);
    injectThemeCSS(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateSection('theme', next, true), 400);
  };

  const previewBg = local.type === 'gradient'
    ? `linear-gradient(${local.gradientDir}, ${local.gradientFrom}, ${local.gradientTo})`
    : local.color;

  return (
    <div className="fixed bottom-24 right-6 z-[9998] flex flex-col items-end gap-2">

      {open && (
        <div className="w-72 bg-[#141414] border border-border rounded-xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Palette size={13} className="text-accent" />
              <span className="text-white text-xs font-medium">Site Theme</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {['Background', 'Typography'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${
                  tab === t
                    ? 'text-white border-b-2 border-accent -mb-px'
                    : 'text-text-muted hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4 max-h-[72vh] overflow-y-auto">

            {/* ── BACKGROUND TAB ──────────────────────────────────────────── */}
            {tab === 'Background' && (
              <>
                {/* Solid / Gradient toggle */}
                <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1">
                  {['solid', 'gradient'].map(t => (
                    <button key={t} onClick={() => patch({ type: t })}
                      className={`flex-1 py-1.5 rounded text-xs font-medium capitalize transition-all ${
                        local.type === t ? 'bg-accent text-white' : 'text-text-muted hover:text-white'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>

                {local.type === 'solid' ? (
                  <>
                    <div>
                      <Label>Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        {SOLID_PRESETS.map(c => (
                          <button key={c} onClick={() => patch({ color: c })} title={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              local.color === c ? 'border-accent scale-110' : 'border-transparent hover:border-white/30'
                            }`}
                            style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="color" value={local.color}
                        onChange={e => patch({ color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
                      <span className="text-text-secondary text-xs font-mono">{local.color}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Presets</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {GRADIENT_PRESETS.map(g => (
                          <button key={g.label}
                            onClick={() => patch({ gradientFrom: g.from, gradientTo: g.to })}
                            className={`h-8 rounded-md text-[10px] text-white/80 border transition-all ${
                              local.gradientFrom === g.from && local.gradientTo === g.to
                                ? 'border-accent' : 'border-border hover:border-white/30'
                            }`}
                            style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[{ key: 'gradientFrom', label: 'From' }, { key: 'gradientTo', label: 'To' }].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-text-muted text-[10px] w-7">{label}</span>
                          <input type="color" value={local[key]}
                            onChange={e => patch({ [key]: e.target.value })}
                            className="w-8 h-6 rounded cursor-pointer border border-border bg-transparent" />
                          <span className="text-text-secondary text-[11px] font-mono">{local[key]}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>Direction</Label>
                      <div className="flex gap-1">
                        {DIRS.map(d => (
                          <button key={d.value} onClick={() => patch({ gradientDir: d.value })}
                            className={`flex-1 py-1.5 rounded text-sm transition-colors ${
                              local.gradientDir === d.value
                                ? 'bg-accent text-white'
                                : 'bg-[#0a0a0a] text-text-muted hover:text-white'
                            }`}>
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Preview strip */}
                <div className="h-5 rounded-md border border-border" style={{ background: previewBg }} />
              </>
            )}

            {/* ── TYPOGRAPHY TAB ──────────────────────────────────────────── */}
            {tab === 'Typography' && (
              <>
                {/* Accent color */}
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {ACCENT_PRESETS.map(c => (
                      <button key={c} onClick={() => patch({ accentColor: c })} title={c}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          local.accentColor === c ? 'border-white scale-110' : 'border-transparent hover:border-white/30'
                        }`}
                        style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={local.accentColor || '#8B1A10'}
                      onChange={e => patch({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
                    <span className="text-text-secondary text-xs font-mono">{local.accentColor || '#8B1A10'}</span>
                  </div>
                </div>

                <Divider />

                {/* Text color — quick swatches + full picker */}
                <div>
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {TEXT_QUICK.map(c => (
                      <button key={c} onClick={() => patch({ textColor: c })} title={c}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                          local.textColor === c ? 'border-accent scale-110' : 'border-transparent hover:border-white/40'
                        }`}
                        style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={local.textColor || '#ffffff'}
                      onChange={e => patch({ textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
                    <span className="text-text-secondary text-xs font-mono">{local.textColor || '#ffffff'}</span>
                  </div>
                </div>

                <Divider />

                {/* Body font */}
                <div>
                  <Label>Body Font</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BODY_FONTS.map(f => (
                      <button key={f} onClick={() => patch({ bodyFont: f })}
                        className={`px-2 py-1.5 rounded-md border text-[11px] transition-all text-left truncate ${
                          local.bodyFont === f
                            ? 'border-accent bg-accent/10 text-white'
                            : 'border-border text-text-muted hover:border-white/30 hover:text-white'
                        }`}
                        style={{ fontFamily: `'${f}', sans-serif` }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Display / heading font */}
                <div>
                  <Label>Heading Font</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DISPLAY_FONTS.map(f => (
                      <button key={f} onClick={() => patch({ displayFont: f })}
                        className={`px-2 py-1.5 rounded-md border text-[11px] transition-all text-left truncate ${
                          local.displayFont === f
                            ? 'border-accent bg-accent/10 text-white'
                            : 'border-border text-text-muted hover:border-white/30 hover:text-white'
                        }`}
                        style={{ fontFamily: `'${f}', sans-serif` }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Live preview */}
                <div className="rounded-md border border-border p-3 space-y-1.5"
                  style={{ background: previewBg }}>
                  <p className="text-[20px] leading-none tracking-wide"
                    style={{ fontFamily: `'${local.displayFont}', sans-serif`, color: local.textColor || '#fff' }}>
                    Portfolio
                  </p>
                  <p className="text-[11px] leading-relaxed"
                    style={{ fontFamily: `'${local.bodyFont}', sans-serif`, color: local.textColor || '#fff', opacity: 0.65 }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-[11px] font-semibold"
                    style={{ fontFamily: `'${local.bodyFont}', sans-serif`, color: local.accentColor || '#8B1A10' }}>
                    Accent — {local.accentColor || '#8B1A10'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle */}
      <button onClick={() => setOpen(p => !p)} title="Theme Editor"
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-lg ${
          open
            ? 'bg-accent border-accent text-white'
            : 'bg-[#1a1a1a] border-border text-text-secondary hover:text-white hover:border-accent'
        }`}>
        <Palette size={16} />
      </button>
    </div>
  );
}
