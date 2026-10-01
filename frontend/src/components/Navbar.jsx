import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { content, updateSection } = useContent();
  const { isEditMode } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = content?.nav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!nav) return null;

  const updateNav = (field, value) => updateSection('nav', { ...nav, [field]: value });
  const updateLink = (i, field, val) => {
    const links = nav.links.map((l, idx) => idx === i ? { ...l, [field]: val } : l);
    updateNav('links', links);
  };
  const addLink = () => updateNav('links', [...nav.links, { label: 'New', href: '#' }]);
  const removeLink = (i) => updateNav('links', nav.links.filter((_, idx) => idx !== i));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary/95 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-col leading-none">
          <EditableText
            value={nav.logo}
            onSave={v => updateNav('logo', v)}
            as="span"
            className="text-white font-semibold text-base tracking-wide"
          />
          <EditableText
            value={nav.tagline}
            onSave={v => updateNav('tagline', v)}
            as="span"
            className="text-text-muted text-[10px] tracking-widest uppercase"
          />
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 flex-wrap">
          {nav.links.map((link, i) => (
            <div key={i} className="relative group flex items-center gap-1">
              {isEditMode ? (
                <div className="flex flex-col items-start gap-0.5">
                  <EditableText value={link.label} onSave={v => updateLink(i, 'label', v)} as="span" className="text-text-secondary text-sm font-medium tracking-wide" />
                  <EditableText value={link.href} onSave={v => updateLink(i, 'href', v)} as="span" className="text-accent/50 text-[9px]" />
                </div>
              ) : (
                <a href={link.href}
                  className="text-text-secondary hover:text-white transition-colors text-sm font-medium tracking-wide"
                  {...(link.href && !link.href.startsWith('#') && link.href !== '/admin'
                    ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {link.label}
                </a>
              )}
              {isEditMode && (
                <button onClick={() => removeLink(i)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <Trash2 size={10} className="text-accent" />
                </button>
              )}
            </div>
          ))}
          {isEditMode && (
            <button onClick={addLink} className="flex items-center gap-1 text-xs text-accent border border-dashed border-accent/40 px-2 py-1 rounded hover:bg-accent-dim transition-colors">
              <Plus size={10} /> Add
            </button>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            className="bg-accent hover:bg-accent-light text-white text-sm font-medium px-5 py-2 rounded transition-colors"
          >
            Contact Us
          </a>
          <a
            href="/admin"
            className="text-text-muted hover:text-white text-xs transition-colors"
          >
            ⚙
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(p => !p)}
        >
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-secondary border-t border-border px-6 py-6 flex flex-col gap-4">
          {nav.links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-text-secondary hover:text-white transition-colors text-sm font-medium"
              {...(link.href && !link.href.startsWith('#') && link.href !== '/admin'
                ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-accent text-white text-sm font-medium px-5 py-2 rounded text-center"
          >
            Contact Us
          </a>
        </div>
      )}
    </motion.header>
  );
}
