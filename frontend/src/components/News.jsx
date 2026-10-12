import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2, ArrowUpRight, ImageIcon, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableURL } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

const INTERVAL = 5000;

const variants = {
  enter: dir => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center:      { x: 0, opacity: 1 },
  exit:  dir => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

export default function News() {
  const { content, updateSection, uploadImage } = useContent();
  const { isEditMode } = useAuth();
  const news = content?.news;

  const [current,  setCurrent]  = useState(0);
  const [dir,      setDir]      = useState(1);
  const timerRef   = useRef(null);
  const hoveredRef = useRef(false);

  const items = news?.items ?? [];

  const go = useCallback((idx, direction) => {
    setDir(direction);
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    go((current + 1) % Math.max(items.length, 1), 1);
  }, [current, items.length, go]);

  const prev = useCallback(() => {
    go((current - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1), -1);
  }, [current, items.length, go]);

  // Auto-advance — restart timer on every slide change
  useEffect(() => {
    if (isEditMode || items.length <= 1) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!hoveredRef.current) next();
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [isEditMode, next, items.length]);

  if (!news) return null;

  const update = (field, value) => updateSection('news', { ...news, [field]: value });

  const updateItem = (i, patch) => {
    const next = news.items.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    update('items', next);
  };

  const addItem = () => update('items', [...news.items, {
    id: Date.now(),
    label: 'Event',
    title: 'New Event Title',
    description: 'Describe the event or news item here.',
    date: 'June 2026',
    link: '#',
    linkLabel: 'Learn More',
  }]);

  const removeItem = (i) => {
    update('items', news.items.filter((_, idx) => idx !== i));
    if (current >= news.items.length - 1) setCurrent(Math.max(0, current - 1));
  };

  const item = items[Math.min(current, items.length - 1)];

  return (
    <section id="news" className="bg-secondary py-20 section-divider overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-8 h-px bg-accent" />
          <EditableText
            value={news.heading}
            onSave={v => update('heading', v)}
            as="span"
            className="text-accent text-xs tracking-widest uppercase"
          />
        </div>

        {/* ── Edit mode: flat list ─────────────────────────────────── */}
        {isEditMode ? (
          <div className="space-y-4">
            {items.map((it, i) => (
              <div key={it.id || i} className="relative group bg-card border border-border rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_200px] gap-6 items-start">

                  {/* Label + date */}
                  <div className="flex flex-col gap-3">
                    <EditableText
                      value={it.label}
                      onSave={v => updateItem(i, { label: v })}
                      as="span"
                      className="text-xs text-accent tracking-widest uppercase border border-accent/30 px-2 py-1 rounded w-fit"
                    />
                    <EditableText
                      value={it.date}
                      onSave={v => updateItem(i, { date: v })}
                      as="span"
                      className="text-text-muted text-xs"
                    />
                  </div>

                  {/* Title + description */}
                  <div>
                    <EditableText
                      value={it.title}
                      onSave={v => updateItem(i, { title: v })}
                      as="h3"
                      className="text-white font-semibold text-lg mb-2"
                    />
                    <EditableText
                      value={it.description}
                      onSave={v => updateItem(i, { description: v })}
                      as="p"
                      className="text-text-secondary text-sm leading-relaxed"
                      multiline
                    />
                  </div>

                  {/* Link */}
                  <div className="flex flex-col gap-2">
                    <EditableText
                      value={it.linkLabel}
                      onSave={v => updateItem(i, { linkLabel: v })}
                      as="span"
                      className="text-xs text-text-muted"
                    />
                    <EditableURL
                      href={it.link}
                      onSaveHref={v => updateItem(i, { link: v })}
                      className="text-xs text-accent"
                    >
                      {it.linkLabel || 'Learn More'} →
                    </EditableURL>
                  </div>
                </div>

                {/* Image attachment */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 flex-wrap">
                  <span className="text-text-muted text-xs shrink-0">Image:</span>
                  {it.image ? (
                    <div className="relative group/img">
                      <img src={it.image} alt="" className="h-16 w-28 object-cover rounded-lg border border-border" />
                      <button
                        onClick={() => updateItem(i, { image: null })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-1.5 text-xs text-accent/70 hover:text-accent border border-dashed border-accent/25 hover:border-accent/50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                      <ImageIcon size={12} /> Attach image
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        if (e.target.files[0]) {
                          const url = await uploadImage(e.target.files[0]);
                          updateItem(i, { image: url });
                        }
                      }} />
                    </label>
                  )}
                </div>

                <button
                  onClick={() => removeItem(i)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} className="text-accent" />
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="w-full border border-dashed border-accent/30 rounded-lg py-4 flex items-center justify-center gap-2 text-accent hover:bg-accent-dim transition-colors text-sm"
            >
              <Plus size={16} /> Add Event / News
            </button>
          </div>

        ) : (
          /* ── Slider view ──────────────────────────────────────────── */
          item && (
            <div
              onMouseEnter={() => { hoveredRef.current = true; }}
              onMouseLeave={() => { hoveredRef.current = false; }}
            >
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={current}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center min-h-[260px]"
                >
                  {/* Left */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs text-accent tracking-widest uppercase border border-accent/30 px-3 py-1 rounded">
                        {item.label}
                      </span>
                      <span className="text-text-muted text-xs">{item.date}</span>
                    </div>

                    <h2 className="text-white text-3xl lg:text-4xl font-semibold leading-tight mb-6">
                      {item.title}
                    </h2>

                    {item.link && item.link !== '#' && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-accent hover:text-white border border-accent/30 hover:border-white/30 px-4 py-2 rounded transition-colors"
                      >
                        {item.linkLabel || 'Learn More'} <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>

                  {/* Right */}
                  <div className="border-l-0 lg:border-l border-t lg:border-t-0 border-border pt-6 lg:pt-0 pl-0 lg:pl-12">
                    {item.image ? (
                      <div className="flex flex-col gap-4">
                        <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#0a0a0a' }}>
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ) : (
                      <p className="text-text-secondary text-base leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls row */}
              <div className="flex items-center justify-between mt-10">
                {/* Dots */}
                <div className="flex items-center gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i, i > current ? 1 : -1)}
                      className={`transition-all duration-300 rounded-full ${
                        i === current
                          ? 'w-6 h-1.5 bg-accent'
                          : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Item counter + arrows */}
                <div className="flex items-center gap-4">
                  <span className="text-text-muted text-xs tabular-nums">
                    {String(current + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={prev}
                      className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-white hover:border-white/40 transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={next}
                      className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-white hover:border-white/40 transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto-advance progress bar */}
              {items.length > 1 && (
                <div className="mt-4 h-px bg-border w-full overflow-hidden">
                  <motion.div
                    key={`bar-${current}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                    className="h-full bg-accent origin-left"
                  />
                </div>
              )}
            </div>
          )
        )}

      </div>
    </section>
  );
}
