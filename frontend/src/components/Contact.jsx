import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableChips } from './admin/EditableField';
import toast from 'react-hot-toast';

export default function Contact() {
  const { content, updateSection } = useContent();
  const contact = content?.contact;
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  if (!contact) return null;

  const update = (field, value) => updateSection('contact', { ...contact, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Message sent! I\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSelected('');
    setSending(false);
  };

  return (
    <section id="contact" className="bg-light-bg py-24 section-divider">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs tracking-widest uppercase">Contact</span>
            </div>
            <EditableText
              value={contact.title}
              onSave={v => update('title', v)}
              as="h2"
              className="text-light-text text-4xl font-semibold leading-tight mb-3"
              multiline
            />
            <EditableText
              value={contact.subtitle}
              onSave={v => update('subtitle', v)}
              as="p"
              className="text-[#555] text-lg"
            />

            {/* Project type chips */}
            <div className="mt-10">
              <p className="text-[#888] text-xs tracking-widest uppercase mb-4">Project Type</p>
              <EditableChips
                items={contact.projectTypes}
                onSave={v => update('projectTypes', v)}
                selectedItem={selected}
                onSelect={setSelected}
                chipClassName="text-sm px-4 py-2 rounded-full border border-[#ccc] text-[#555] hover:border-accent hover:text-accent transition-all"
                activeChipClassName="text-sm px-4 py-2 rounded-full border bg-accent border-accent text-white transition-all"
              />
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="bg-white border border-[#ddd] text-light-text placeholder-[#aaa] px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors text-sm"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="bg-white border border-[#ddd] text-light-text placeholder-[#aaa] px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full bg-white border border-[#ddd] text-light-text placeholder-[#aaa] px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors text-sm"
              />
              <textarea
                placeholder="Your Message"
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
                className="w-full bg-white border border-[#ddd] text-light-text placeholder-[#aaa] px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors text-sm resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-accent hover:bg-accent-light text-white font-medium py-3.5 rounded transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sending ? 'Sending...' : (<><Send size={15} /> Send Message</>)}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
