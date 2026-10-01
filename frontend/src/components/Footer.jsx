import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableLinkList } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { content, updateSection } = useContent();
  const { isEditMode } = useAuth();
  const marqueeRef = useRef();
  const footer = content?.footer;

  useEffect(() => {
    if (!marqueeRef.current || !footer) return;
    const el = marqueeRef.current;
    const text = el.innerHTML;
    el.innerHTML = text + text;
    const totalWidth = el.scrollWidth / 2;
    gsap.to(el, {
      x: -totalWidth,
      duration: 25,
      ease: 'none',
      repeat: -1,
    });
  }, [footer]);

  if (!footer) return null;

  const update = (field, value) => updateSection('footer', { ...footer, [field]: value });
  const updateMarquee = (v) => update('marqueeText', v);

  return (
    <footer className="bg-secondary border-t border-border">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">Quick Links</h4>
            <EditableLinkList
              links={footer.quickLinks}
              onSave={v => update('quickLinks', v)}
              renderLink={(link) => {
                const newTab = link.href && !link.href.startsWith('#') && link.href !== '/admin';
                return (
                  <a href={link.href} className="text-text-secondary hover:text-white transition-colors text-sm"
                    {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {link.label}
                  </a>
                );
              }}
              className="space-y-3"
            />
          </div>

          {/* Brand + Social */}
          <div className="text-center">
            <div className="font-display text-3xl text-white tracking-wider mb-1">Shoaib Zafar</div>
            <EditableText
              value={footer.brandName}
              onSave={v => update('brandName', v)}
              as="p"
              className="text-text-muted text-sm"
            />
            <div className="flex items-center justify-center gap-4 mt-6">
              {(footer.socialLinks ?? []).map((s, idx) => (
                <a key={idx} href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-white hover:border-white/40 transition-colors text-xs"
                  title={s.label}>
                  {s.label[0]}
                </a>
              ))}
            </div>
            {isEditMode && (
              <div className="mt-3">
                <EditableLinkList
                  links={footer.socialLinks ?? []}
                  onSave={v => update('socialLinks', v)}
                  renderLink={(link) => (
                    <a href={link.href} target="_blank" rel="noopener noreferrer"
                      className="text-text-secondary hover:text-white transition-colors text-xs">
                      {link.label}
                    </a>
                  )}
                  className="space-y-1"
                />
              </div>
            )}
          </div>

          {/* Email */}
          <div className="text-right">
            <h4 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">Email Address</h4>
            <EditableText
              value={footer.email}
              onSave={v => update('email', v)}
              as="a"
              className="text-text-secondary hover:text-accent transition-colors text-sm"
            />
            <p className="text-text-muted text-xs mt-3">Available for collaborations</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">© {new Date().getFullYear()} Shoaib Zafar. All rights reserved.</p>
          <a href="/admin" className="text-text-muted hover:text-white text-xs transition-colors">Admin</a>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="border-t border-border py-4 overflow-hidden bg-primary">
        {isEditMode ? (
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
            <span className="text-text-muted text-xs whitespace-nowrap">Marquee text:</span>
            <EditableText value={footer.marqueeText} onSave={updateMarquee} as="span" className="text-white/40 text-xs font-display tracking-widest flex-1" />
          </div>
        ) : (
          <div className="overflow-hidden">
            <div ref={marqueeRef} className="inline-flex gap-8 whitespace-nowrap">
              {Array(6).fill(footer.marqueeText).map((t, i) => (
                <span key={i} className="font-display text-base tracking-[0.2em] text-white/20">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
