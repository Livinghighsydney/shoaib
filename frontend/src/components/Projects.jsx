import { motion } from 'framer-motion';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage, EditableURL } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80';

export default function Projects() {
  const { content, updateSection, uploadImage } = useContent();
  const { isEditMode } = useAuth();
  const projects = content?.projects;

  if (!projects) return null;

  const update = (field, value) => updateSection('projects', { ...projects, [field]: value });
  const updateItem = (i, field, value) => {
    const items = projects.items.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    update('items', items);
  };
  const addItem = () => update('items', [...projects.items, {
    id: Date.now(), title: 'New Project', description: 'Project description.',
    tech: ['React'], image: null, link: '#',
  }]);
  const removeItem = (i) => update('items', projects.items.filter((_, idx) => idx !== i));
  const handleImageUpload = async (i, file) => {
    const url = await uploadImage(file);
    updateItem(i, 'image', url);
  };

  return (
    <section id="projects" className="bg-secondary py-24 section-divider">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-start justify-between mb-14 flex-wrap gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs tracking-widest uppercase">Portfolio</span>
            </div>
            <EditableText
              value={projects.heading}
              onSave={v => update('heading', v)}
              as="h2"
              className="text-white text-3xl font-semibold leading-snug"
              multiline
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.items.map((project, i) => (
            <motion.div
              key={project.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative group bg-card border border-border rounded-lg overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden bg-primary">
                <EditableImage
                  src={project.image || PLACEHOLDER}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onUpload={(file) => handleImageUpload(i, file)}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <EditableText
                    value={project.title}
                    onSave={v => updateItem(i, 'title', v)}
                    as="h3"
                    className="text-white font-semibold text-lg"
                  />
                  <EditableURL
                    href={project.link || '#'}
                    onSaveHref={v => updateItem(i, 'link', v)}
                    className="flex-shrink-0 w-8 h-8 border border-border rounded-full flex items-center justify-center hover:border-accent hover:text-accent transition-colors text-text-secondary"
                  >
                    <ArrowUpRight size={14} />
                  </EditableURL>
                </div>
                <EditableText
                  value={project.description}
                  onSave={v => updateItem(i, 'description', v)}
                  as="p"
                  className="text-text-secondary text-sm leading-relaxed mb-4"
                  multiline
                />
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, ti) => (
                    <span key={ti} className="text-xs text-text-secondary border border-border px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {isEditMode && (
                <button
                  onClick={() => removeItem(i)}
                  className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-accent text-white p-1.5 rounded-full"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </motion.div>
          ))}
          {isEditMode && (
            <button
              onClick={addItem}
              className="border border-dashed border-accent/30 rounded-lg aspect-video flex items-center justify-center gap-2 text-accent hover:bg-accent-dim transition-colors"
            >
              <Plus size={16} /> Add Project
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
