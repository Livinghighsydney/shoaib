import { motion } from 'framer-motion';
import { Code2, Search, Bug, ShieldCheck, Cpu, Brain, Plus, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

const ICON_MAP = {
  code:   Code2,
  search: Search,
  bug:    Bug,
  shield: ShieldCheck,
  cpu:    Cpu,
  brain:  Brain,
};

export default function Services() {
  const { content, updateSection } = useContent();
  const { isEditMode } = useAuth();
  const services = content?.services;

  if (!services) return null;

  const update = (field, value) => updateSection('services', { ...services, [field]: value });
  const updateItem = (i, field, value) => {
    const items = services.items.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    update('items', items);
  };
  const addItem = () => update('items', [...services.items, {
    id: Date.now(), title: 'New Service', description: 'Describe this service.', icon: 'code',
  }]);
  const removeItem = (i) => update('items', services.items.filter((_, idx) => idx !== i));

  return (
    <section id="services" className="bg-secondary py-24 section-divider">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-14 flex-wrap gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs tracking-widest uppercase">Services</span>
            </div>
            <EditableText
              value={services.heading}
              onSave={v => update('heading', v)}
              as="h2"
              className="text-white text-3xl font-semibold leading-snug"
              multiline
            />
          </div>
          <a
            href="#contact"
            className="hidden lg:inline-flex items-center gap-2 border border-border text-text-secondary hover:text-white hover:border-white/40 px-5 py-2.5 rounded text-sm transition-colors"
          >
            Explore More →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.items.map((service, i) => {
            const Icon = ICON_MAP[service.icon] || Code2;
            return (
              <motion.div
                key={service.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative group bg-card border border-border hover:border-accent/30 rounded-lg p-7 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Number */}
                <span className="font-display text-[80px] text-white/[0.04] absolute top-4 right-6 leading-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="w-12 h-12 bg-accent/15 border border-accent/20 rounded-lg flex items-center justify-center mb-6">
                  <Icon size={22} className="text-accent" />
                </div>

                <EditableText
                  value={service.title}
                  onSave={v => updateItem(i, 'title', v)}
                  as="h3"
                  className="text-white font-semibold text-lg mb-3"
                />
                <EditableText
                  value={service.description}
                  onSave={v => updateItem(i, 'description', v)}
                  as="p"
                  className="text-text-secondary text-sm leading-relaxed"
                  multiline
                />

                {isEditMode && (
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} className="text-accent" />
                  </button>
                )}
              </motion.div>
            );
          })}
          {isEditMode && (
            <button
              onClick={addItem}
              className="border border-dashed border-accent/30 rounded-lg p-7 flex items-center justify-center gap-2 text-accent hover:bg-accent-dim transition-colors"
            >
              <Plus size={16} /> Add Service
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
