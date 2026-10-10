import { useState, useMemo, useRef } from 'react';
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { TECH_ICONS, CATEGORIES } from '../../data/techIcons';

// Returns perceived luminance (0–1) of a hex color
function luminance(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function IconSvg({ icon, size = 20 }) {
  if (icon.type === 'emoji') {
    return <span style={{ fontSize: size * 0.9 }}>{icon.emoji}</span>;
  }
  // Use white for very dark icons so they're visible on dark backgrounds
  const fill = luminance(icon.hex) < 0.12 ? '#ffffff' : `#${icon.hex}`;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
    >
      <path d={icon.path} />
    </svg>
  );
}

export { IconSvg };

export default function IconPickerModal({ onSelect, onClose }) {
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('All');
  const pillsRef = useRef(null);

  const scrollPills = (dir) => {
    if (pillsRef.current) pillsRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return TECH_ICONS.filter(ic => {
      const matchCat = category === 'All' || ic.category === category;
      const matchQ   = !q || ic.name.toLowerCase().includes(q) || ic.key.includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-[#222] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#222]">
          <h3 className="text-white text-sm font-semibold tracking-wide">Choose Icon</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2">
            <Search size={13} className="text-white/30 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="bg-transparent text-white text-sm outline-none placeholder-white/25 w-full"
            />
          </div>
        </div>

        {/* Category pills with scroll arrows */}
        <div className="flex items-center gap-1 px-3 py-3 border-b border-[#222]">
          <button
            onClick={() => scrollPills(-1)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          <div
            ref={pillsRef}
            className="flex items-center gap-2 overflow-x-auto flex-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 whitespace-nowrap text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-accent border-accent text-white'
                    : 'bg-transparent border-[#333] text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollPills(1)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-2">
          {filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-10">No icons found</p>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {filtered.map(icon => (
                <button
                  key={icon.key}
                  onClick={() => { onSelect(icon.key); onClose(); }}
                  title={icon.name}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] hover:border-accent/40 border border-transparent transition-all group"
                >
                  <IconSvg icon={icon} size={22} />
                  <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors truncate w-full text-center leading-tight">
                    {icon.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
