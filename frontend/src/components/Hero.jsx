import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Download, ArrowUpRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage, EditableURL } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { content, updateSection, uploadImage } = useContent();
  const { isEditMode } = useAuth();
  const hero = content?.hero;

  // Cursor-following glow — hooks must come before conditional return
  const mouseX = useMotionValue(0.55);
  const mouseY = useMotionValue(0.3);
  const springX = useSpring(mouseX, { stiffness: 55, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 22 });
  const glowLeft = useTransform(springX, v => `${v * 100}%`);
  const glowTop  = useTransform(springY, v => `${v * 100}%`);

  if (!hero) return null;

  const update = (field, value) => updateSection('hero', { ...hero, [field]: value });
  const handlePhotoUpload = async (file) => {
    const url = await uploadImage(file);
    update('photo', url);
  };

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  };

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 55% 30%, #3d1515 0%, #2a1010 22%, #180808 48%, #0d0606 68%, #0a0a0a 100%)' }}
      onMouseMove={handleMouseMove}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Static warm crimson glow — upper center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '25%', width: '55%', height: '65%',
          background: 'radial-gradient(ellipse, rgba(139,26,16,0.40) 0%, rgba(100,18,10,0.18) 45%, transparent 75%)',
          filter: 'blur(55px)',
        }}
      />

      {/* Cursor-following glow blob (z-2) */}
      <motion.div
        className="absolute pointer-events-none z-[2]"
        style={{
          left: glowLeft,
          top: glowTop,
          x: '-50%',
          y: '-50%',
          width: '52%',
          height: '58%',
          background: 'radial-gradient(circle, rgba(139,26,16,0.38) 0%, rgba(100,18,10,0.18) 42%, transparent 70%)',
          filter: 'blur(65px)',
        }}
      />

      {/* ─── LAYER 1 · Big title behind everything (z-1) ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2 }}
        className="absolute inset-0 z-[1] flex flex-col items-center justify-center
                   select-none pointer-events-none"
      >
        <h1
          className="font-display text-white text-center leading-[0.82] tracking-[0.01em]"
          style={{ fontSize: 'clamp(72px, 16vw, 240px)' }}
        >
          <EditableText
            value={hero.titleLine1}
            onSave={v => update('titleLine1', v)}
            as="span"
            className="block"
          />
          <EditableText
            value={hero.titleLine2}
            onSave={v => update('titleLine2', v)}
            as="span"
            className="block"
          />
        </h1>
      </motion.div>

      {/* ─── LAYER 2 · Left gradient shield (z-5) ─────────────────────
          Fades the big title out on the left so the text panel is clean */}
      <div
        className="absolute top-0 left-0 bottom-0 z-[5] pointer-events-none"
        style={{
          width: '40%',
          background:
            'linear-gradient(to right, #0a0a0a 45%, rgba(10,10,10,0.9) 65%, rgba(10,10,10,0.5) 82%, transparent 100%)',
        }}
      />

      {/* ─── LAYER 3 · Photo (z-10) ───────────────────────────────────
          Wrapper div forces width. w-full h-auto on <img> → natural ratio.
          personal.jpeg is 1122×1402 (ratio 0.8), so at 320px wide → 400px tall. */}
      <div
        className="absolute bottom-0 z-[10] pointer-events-none select-none"
        style={{ left: '50%', transform: 'translateX(-50%)', width: '320px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="pointer-events-auto"
        >
          <EditableImage
            src={hero.photo}
            alt="Shoaib Zafar"
            className="w-full h-auto block"
            onUpload={handlePhotoUpload}
          />
        </motion.div>
      </div>

      {/* Bottom fade — blends photo into section (z-11) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[11] pointer-events-none"
        style={{
          height: '180px',
          background: 'linear-gradient(to top, #0a0a0a 30%, rgba(10,10,10,0.7) 70%, transparent 100%)',
        }}
      />

      {/* ─── LAYER 4 · Left text content (z-20) ──────────────────────── */}
      <div className="absolute top-0 left-0 bottom-0 z-[20] flex items-center pl-10 lg:pl-16 pt-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ maxWidth: '270px' }}
        >
          <p className="text-[10px] text-text-muted tracking-[0.28em] uppercase mb-6">
            <EditableText
              value={hero.greeting}
              onSave={v => update('greeting', v)}
              as="span"
            />
          </p>

          <p className="text-text-secondary text-[13px] leading-relaxed mb-10">
            <EditableText
              value={hero.description}
              onSave={v => update('description', v)}
              as="span"
              multiline
            />
          </p>

          <div className="flex flex-col gap-3">
            <EditableURL
              href={hero.cta1Link}
              onSaveHref={v => update('cta1Link', v)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-fit"
            >
              <Download size={14} />
              <EditableText value={hero.cta1} onSave={v => update('cta1', v)} as="span" />
            </EditableURL>
            <EditableURL
              href={hero.cta2Link}
              onSaveHref={v => update('cta2Link', v)}
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white/75 hover:text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-fit"
            >
              <ArrowUpRight size={14} />
              <EditableText value={hero.cta2} onSave={v => update('cta2', v)} as="span" />
            </EditableURL>
          </div>
        </motion.div>
      </div>

      {/* Scroll line (z-20) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 right-10 z-[20] flex flex-col items-center gap-1"
      >
        <div className="w-px h-10 bg-white/10 relative overflow-hidden">
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-1/2 bg-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}
