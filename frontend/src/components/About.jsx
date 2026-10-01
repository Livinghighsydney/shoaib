import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

export default function About() {
  const { content, updateSection } = useContent();
  const { isEditMode } = useAuth();
  const about = content?.about;

  if (!about) return null;

  const update = (field, value) => updateSection('about', { ...about, [field]: value });

  /* ── Stats ── */
  const updateStat = (i, field, val) => {
    const stats = about.stats.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    update('stats', stats);
  };
  const addStat = () => update('stats', [...about.stats, { value: '0', label: 'New Stat' }]);
  const removeStat = (i) => update('stats', about.stats.filter((_, idx) => idx !== i));

  /* ── Cards ── */
  const cards = about.cards || [];
  const updateCard = (i, field, val) => {
    const next = cards.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    update('cards', next);
  };
  const addCard = () => update('cards', [...cards, { id: Date.now(), emoji: '⭐', title: 'New Card', subtitle: 'Details here' }]);
  const removeCard = (i) => update('cards', cards.filter((_, idx) => idx !== i));

  return (
    <section id="about" className="bg-light-bg py-24 section-divider">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            {/* Stats */}
            <div className="flex flex-wrap gap-10 mb-10">
              {about.stats.map((stat, i) => (
                <div key={i} className="relative group">
                  <div className="font-display text-6xl text-light-text">
                    <EditableText
                      value={stat.value}
                      onSave={v => updateStat(i, 'value', v)}
                      as="span"
                    />
                  </div>
                  <EditableText
                    value={stat.label}
                    onSave={v => updateStat(i, 'label', v)}
                    as="p"
                    className="text-[#666] text-xs tracking-wide mt-1"
                  />
                  {isEditMode && (
                    <button onClick={() => removeStat(i)} className="absolute -top-3 -right-3 w-5 h-5 bg-accent text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                  )}
                </div>
              ))}
              {isEditMode && (
                <button onClick={addStat} className="flex items-center gap-1 text-xs text-accent border border-dashed border-accent/40 px-3 py-2 rounded hover:bg-accent-dim transition-colors self-start mt-1">
                  <Plus size={12} /> Add Stat
                </button>
              )}
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs tracking-widest uppercase">About Me</span>
            </div>

            <EditableText
              value={about.heading}
              onSave={v => update('heading', v)}
              as="h2"
              className="text-light-text text-3xl lg:text-4xl font-semibold leading-tight"
              multiline
            />
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <EditableText
              value={about.description}
              onSave={v => update('description', v)}
              as="p"
              className="text-[#444] text-base leading-relaxed"
              multiline
            />

            {/* Cards grid */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {cards.map((card, i) => (
                <div key={card.id || i} className="relative group bg-white border border-[#e0e0e0] rounded p-5 shadow-sm">
                  <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center mb-3">
                    <EditableText
                      value={card.emoji}
                      onSave={v => updateCard(i, 'emoji', v)}
                      as="span"
                      className="text-sm"
                    />
                  </div>
                  <EditableText
                    value={card.title}
                    onSave={v => updateCard(i, 'title', v)}
                    as="p"
                    className="text-light-text text-sm font-medium"
                  />
                  <EditableText
                    value={card.subtitle}
                    onSave={v => updateCard(i, 'subtitle', v)}
                    as="p"
                    className="text-[#888] text-xs mt-1"
                  />
                  {isEditMode && (
                    <button onClick={() => removeCard(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} className="text-accent" />
                    </button>
                  )}
                </div>
              ))}
              {isEditMode && (
                <button onClick={addCard} className="border border-dashed border-accent/30 rounded p-5 flex items-center justify-center gap-2 text-accent text-sm hover:bg-accent-dim transition-colors min-h-[100px]">
                  <Plus size={14} /> Add Card
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
