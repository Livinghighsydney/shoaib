import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

export default function Experience() {
  const { content, updateSection } = useContent();
  const { isEditMode } = useAuth();
  const exp = content?.experience;

  if (!exp) return null;

  const update = (field, value) => updateSection('experience', { ...exp, [field]: value });
  const updateItem = (i, field, value) => {
    const items = exp.items.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    update('items', items);
  };
  const addItem = () => update('items', [...exp.items, {
    id: Date.now(), number: String(exp.items.length + 1).padStart(2, '0'),
    role: 'New Role', company: 'Company Name', period: '2020 – Present',
    description: 'Describe your responsibilities and achievements here.',
  }]);
  const removeItem = (i) => update('items', exp.items.filter((_, idx) => idx !== i));

  return (
    <section id="experience" className="bg-primary py-24 section-divider">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="lg:sticky lg:top-24 self-start"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs tracking-widest uppercase">Experience</span>
            </div>
            <h2 className="text-white text-4xl font-semibold leading-tight mb-2">
              <EditableText value={exp.heading} onSave={v => update('heading', v)} as="span" multiline />
            </h2>
            <p className="text-text-secondary text-lg">
              <EditableText value={exp.subheading} onSave={v => update('subheading', v)} as="span" />
            </p>
            <div className="mt-8 w-16 h-1 bg-accent rounded" />
          </motion.div>

          {/* Right: timeline items */}
          <div className="space-y-0">
            {exp.items.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative group border-b border-border py-8 last:border-b-0"
              >
                <div className="flex gap-6 items-start">
                  {/* Number */}
                  <EditableText
                    value={item.number}
                    onSave={v => updateItem(i, 'number', v)}
                    as="span"
                    className="font-display text-5xl text-white/10 leading-none flex-shrink-0 w-14"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <EditableText
                        value={item.role}
                        onSave={v => updateItem(i, 'role', v)}
                        as="h3"
                        className="text-white font-semibold text-lg"
                      />
                      <EditableText
                        value={item.period}
                        onSave={v => updateItem(i, 'period', v)}
                        as="span"
                        className="text-text-muted text-xs tracking-wide border border-border px-3 py-1 rounded-full"
                      />
                    </div>
                    <EditableText
                      value={item.company}
                      onSave={v => updateItem(i, 'company', v)}
                      as="p"
                      className="text-accent text-sm font-medium mb-3"
                    />
                    <EditableText
                      value={item.description}
                      onSave={v => updateItem(i, 'description', v)}
                      as="p"
                      className="text-text-secondary text-sm leading-relaxed"
                      multiline
                    />
                  </div>
                </div>

                {isEditMode && (
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} className="text-accent" />
                  </button>
                )}
              </motion.div>
            ))}

            {isEditMode && (
              <button
                onClick={addItem}
                className="w-full mt-4 border border-dashed border-accent/30 py-4 rounded flex items-center justify-center gap-2 text-accent hover:bg-accent-dim transition-colors text-sm"
              >
                <Plus size={16} /> Add Experience
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
