import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { EditableText } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

const ICON_MAP = {
  python: '🐍',
  react: '⚛️',
  nodejs: '🟢',
  cpp: '⚙️',
  linux: '🐧',
  vscode: '💻',
  postgresql: '🐘',
  mysql: '🗄️',
  docker: '🐳',
  git: '🔀',
  default: '🔧',
};

export default function TechStack() {
  const { content, updateSection } = useContent();
  const { isEditMode } = useAuth();
  const crafted = content?.crafted;
  const techStack = content?.techStack;

  if (!crafted || !techStack) return null;

  const updateCrafted = (field, value) => updateSection('crafted', { ...crafted, [field]: value });
  const updateTech = (field, value) => updateSection('techStack', { ...techStack, [field]: value });

  const addTechItem = () => {
    updateSection('techStack', {
      ...techStack,
      items: [...techStack.items, { name: 'New Tool', icon: 'default' }],
    });
  };

  const removeTechItem = (i) => {
    updateSection('techStack', {
      ...techStack,
      items: techStack.items.filter((_, idx) => idx !== i),
    });
  };

  const updateTechItem = (i, field, value) => {
    const items = techStack.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    updateSection('techStack', { ...techStack, items });
  };

  return (
    <>
      {/* "The Crafted Mind" banner */}
      <section className="bg-secondary py-20 section-divider overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-text-muted text-xs tracking-[0.3em] uppercase mb-3">
              <EditableText value={crafted.title} onSave={v => updateCrafted('title', v)} as="span" />
            </p>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white tracking-wider leading-none">
              <EditableText value={crafted.subtitle} onSave={v => updateCrafted('subtitle', v)} as="span" />
            </h2>
          </motion.div>

          {/* Stats row */}
          <div className="mt-14 flex flex-wrap justify-center gap-12">
            {crafted.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="font-display text-5xl text-white">
                  <EditableText value={stat.value} onSave={v => {
                    const stats = crafted.stats.map((s, si) => si === i ? { ...s, value: v } : s);
                    updateSection('crafted', { ...crafted, stats });
                  }} as="span" />
                </div>
                <EditableText
                  value={stat.label}
                  onSave={v => {
                    const stats = crafted.stats.map((s, si) => si === i ? { ...s, label: v } : s);
                    updateSection('crafted', { ...crafted, stats });
                  }}
                  as="p"
                  className="text-text-secondary text-xs tracking-wide mt-1"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="techstack" className="bg-primary py-20 section-divider">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs tracking-widest uppercase">Tech Stack</span>
              <div className="w-8 h-px bg-accent" />
            </div>
            <h2 className="text-white text-3xl font-semibold">
              <EditableText value={techStack.heading} onSave={v => updateTech('heading', v)} as="span" />
            </h2>
            <p className="text-text-secondary mt-2">
              <EditableText value={techStack.subheading} onSave={v => updateTech('subheading', v)} as="span" />
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative group"
              >
                <div className="flex items-center gap-2 bg-card border border-border hover:border-accent/40 transition-colors px-5 py-3 rounded-full">
                  <span className="text-lg">{ICON_MAP[item.icon] || ICON_MAP.default}</span>
                  <EditableText
                    value={item.name}
                    onSave={v => updateTechItem(i, 'name', v)}
                    as="span"
                    className="text-text-secondary text-sm font-medium"
                  />
                </div>
                {isEditMode && (
                  <button
                    onClick={() => removeTechItem(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
            {isEditMode && (
              <button
                onClick={addTechItem}
                className="flex items-center gap-2 border border-dashed border-accent/40 px-5 py-3 rounded-full text-accent text-sm hover:bg-accent-dim transition-colors"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
