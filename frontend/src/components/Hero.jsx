import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Download, ArrowUpRight, Move } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage, EditableURL, EditableFile } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { content, updateSection, uploadImage, uploadFile } = useContent();
  const { isEditMode } = useAuth();
  const hero = content?.hero;

  // Cursor-following glow — hooks must come before conditional return
  const mouseX = useMotionValue(0.55);
  const mouseY = useMotionValue(0.3);
  const springX = useSpring(mouseX, { stiffness: 55, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 22 });
  const glowLeft = useTransform(springX, v => `${v * 100}%`);
  const glowTop  = useTransform(springY, v => `${v * 100}%`);

  // Draggable positions — same pattern as Testimonials
  const sectionRef   = useRef();
  const heroRef      = useRef(null);   // tracks latest hero for debounced save
  const debounceRef  = useRef(null);
  const initialized  = useRef(false);

  const [photoPos, setPhotoPos] = useState({ x: 0, y: 0 });
  const [titleY,   setTitleY]   = useState(33);
  const photoPosRef = useRef({ x: 0, y: 0 });
  const titleYRef   = useRef(33);

  useEffect(() => { heroRef.current = hero; }, [hero]);

  // Init from DB once — never re-sync so in-progress drags survive saves
  useEffect(() => {
    if (hero && !initialized.current) {
      const pp = { x: hero.photoX ?? 0, y: hero.photoY ?? 0 };
      const ty = hero.titleY ?? 33;
      photoPosRef.current = pp;
      titleYRef.current   = ty;
      setPhotoPos(pp);
      setTitleY(ty);
      initialized.current = true;
    }
  }, [hero]);

  if (!hero) return null;

  const update = (field, value) => updateSection('hero', { ...hero, [field]: value });

  const handlePhotoUpload = async (file) => {
    const url = await uploadImage(file);
    update('photo', url);
  };
  const handleCVUpload = async (file) => {
    const url = await uploadFile(file);
    update('cta1Link', url);
  };

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  };

  // Debounced DB save — same 700ms window as Testimonials
  const scheduleSave = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!heroRef.current) return;
      updateSection('hero', {
        ...heroRef.current,
        photoX: photoPosRef.current.x,
        photoY: photoPosRef.current.y,
        titleY: titleYRef.current,
      }, true);
    }, 700);
  };

  const handlePhotoDragEnd = (_, info) => {
    if (!sectionRef.current) return;
    const box     = sectionRef.current.getBoundingClientRect();
    const curLeft = (photoPosRef.current.x / 100) * box.width;
    const curTop  = (photoPosRef.current.y / 100) * box.height;
    const newLeft = Math.max(0, Math.min(box.width  - 320, curLeft + info.offset.x));
    const newTop  = Math.max(0, Math.min(box.height,       curTop  + info.offset.y));
    const pp = {
      x: parseFloat(((newLeft / box.width)  * 100).toFixed(2)),
      y: parseFloat(((newTop  / box.height) * 100).toFixed(2)),
    };
    photoPosRef.current = pp;
    setPhotoPos(pp);
    scheduleSave();
  };

  const handleTitleDragEnd = (_, info) => {
    if (!sectionRef.current) return;
    const box    = sectionRef.current.getBoundingClientRect();
    const curTop = (titleYRef.current / 100) * box.height;
    const newTop = Math.max(0, Math.min(box.height - 120, curTop + info.offset.y));
    const ty     = parseFloat(((newTop / box.height) * 100).toFixed(2));
    titleYRef.current = ty;
    setTitleY(ty);
    scheduleSave();
  };

  return (
    <section
      id="home"
      ref={sectionRef}
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

      {/* ─── LAYER 1 · Big draggable title (z-1) ──────────────────────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none select-none">
        <motion.div
          key={`title-y-${Math.round(titleY)}`}
          drag={isEditMode ? 'y' : false}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={sectionRef}
          onDragEnd={handleTitleDragEnd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.2 }}
          whileDrag={{ cursor: 'grabbing' }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${titleY}%`,
            cursor: isEditMode ? 'grab' : 'default',
            touchAction: 'none',
            pointerEvents: isEditMode ? 'auto' : 'none',
          }}
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
          {isEditMode && (
            <p className="text-center text-[10px] text-accent/50 mt-2 tracking-widest pointer-events-none">
              ↕ drag to reposition
            </p>
          )}
        </motion.div>
      </div>

      {/* ─── LAYER 2 · Left gradient shield (z-5) ───────────────────────
          Fades the big title out on the left so the text panel is clean */}
      <div
        className="absolute top-0 left-0 bottom-0 z-[5] pointer-events-none"
        style={{
          width: '40%',
          background:
            'linear-gradient(to right, #0a0a0a 45%, rgba(10,10,10,0.9) 65%, rgba(10,10,10,0.5) 82%, transparent 100%)',
        }}
      />

      {/* ─── LAYER 3 · Draggable photo (z-10) ───────────────────────────
          Key changes after drag saves new coords → remount resets FM transform */}
      <motion.div
        key={`photo-${Math.round(photoPos.x)}-${Math.round(photoPos.y)}`}
        drag={isEditMode}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={sectionRef}
        onDragEnd={handlePhotoDragEnd}
        whileDrag={{ cursor: 'grabbing', zIndex: 99 }}
        className="select-none"
        style={{
          position: 'absolute',
          left: `${photoPos.x}%`,
          top:  `${photoPos.y}%`,
          width: '320px',
          zIndex: 10,
          cursor: isEditMode ? 'grab' : 'default',
          touchAction: 'none',
          pointerEvents: isEditMode ? 'auto' : 'none',
        }}
      >
        <EditableImage
          src={hero.photo}
          alt="Shoaib Zafar"
          className="w-full h-auto block"
          onUpload={handlePhotoUpload}
        />
        {isEditMode && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 pointer-events-none">
            <Move size={12} className="text-white/70" />
          </div>
        )}
      </motion.div>

      {/* Bottom fade — blends photo into section (z-11) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[11] pointer-events-none"
        style={{
          height: '180px',
          background: 'linear-gradient(to top, #0a0a0a 30%, rgba(10,10,10,0.7) 70%, transparent 100%)',
        }}
      />

      {/* ─── LAYER 4 · Left text content (z-20) ──────────────────────── */}
      <div className="absolute top-0 left-0 bottom-0 z-[20] flex items-start pl-10 lg:pl-16 pt-[55vh]">
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
            <div>
              <EditableURL
                href={hero.cta1Link}
                onSaveHref={v => update('cta1Link', v)}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-fit"
              >
                <Download size={14} />
                <EditableText value={hero.cta1} onSave={v => update('cta1', v)} as="span" />
              </EditableURL>
              <EditableFile
                onUpload={handleCVUpload}
                accept=".pdf,.doc,.docx"
                label="Upload New CV"
              />
            </div>
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
