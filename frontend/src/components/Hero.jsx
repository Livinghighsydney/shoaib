import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Download, ArrowUpRight, Move, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage, EditableURL, EditableFile } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

// Resize cursors per corner
const CURSORS = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' };
const CORNER_CLS = {
  tl: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  tr: 'top-0 right-0  translate-x-1/2 -translate-y-1/2',
  bl: 'bottom-0 left-0 -translate-x-1/2  translate-y-1/2',
  br: 'bottom-0 right-0  translate-x-1/2  translate-y-1/2',
};

function RightPhotoSlider({ photos, isEditMode, onAddPhotos, onRemoveCurrent }) {
  const [idx, setIdx] = useState(0);
  const safeIdx = photos.length > 0 ? Math.min(idx, photos.length - 1) : 0;

  // Auto-advance every 2.5s, paused in edit mode
  useEffect(() => {
    if (photos.length <= 1 || isEditMode) return;
    const id = setInterval(() => setIdx(i => (i + 1) % photos.length), 2500);
    return () => clearInterval(id);
  }, [photos.length, isEditMode]);

  useEffect(() => {
    if (idx >= photos.length && photos.length > 0) setIdx(photos.length - 1);
  }, [photos.length, idx]);

  const fileInput = (
    <label
      className="w-7 h-7 rounded-lg bg-accent/15 border border-dashed border-accent/50 text-accent hover:bg-accent/25 text-[15px] cursor-pointer flex items-center justify-center transition-colors"
      title="Add images — select multiple at once"
    >
      +
      <input type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) { onAddPhotos(Array.from(e.target.files)); e.target.value = ''; } }}
      />
    </label>
  );

  if (photos.length === 0) {
    return (
      <div
        className="w-full border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/[0.03]"
        style={{ aspectRatio: '4/3', minHeight: 200 }}
        onPointerDown={e => e.stopPropagation()}
      >
        <p className="text-white/30 text-xs pointer-events-none">Add images for slider</p>
        <label
          className="flex items-center gap-1 text-[10px] text-accent border border-dashed border-accent/40 px-3 py-1.5 rounded hover:bg-accent-dim transition-colors cursor-pointer"
        >
          ↑ Add Images
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={e => { if (e.target.files?.length) { onAddPhotos(Array.from(e.target.files)); e.target.value = ''; } }}
          />
        </label>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: '4/3',
        backgroundColor: '#0a0a0a',
        boxShadow: '0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,26,16,0.12)',
      }}
    >
      {/* Crossfade + Ken Burns — snappier */}
      <AnimatePresence mode="sync">
        <motion.img
          key={safeIdx}
          src={photos[safeIdx]}
          alt=""
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }}
          transition={{ opacity: { duration: 0.4, ease: 'easeOut' }, scale: { duration: 3, ease: 'linear' } }}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ pointerEvents: 'none' }}
        />
      </AnimatePresence>

      {/* Edge blending overlays */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{ height: '40%', background: 'linear-gradient(to top, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.2) 50%, transparent 100%)' }} />
      <div className="absolute inset-y-0 left-0 pointer-events-none z-10"
        style={{ width: '18%', background: 'linear-gradient(to right, rgba(10,6,6,0.32), transparent)' }} />

      {/* Edit mode: numbered row at top + trash on active + add button */}
      {isEditMode && (
        <div
          className="absolute top-2 left-0 right-0 flex justify-center gap-1.5 z-30 px-2"
          onPointerDown={e => e.stopPropagation()}
        >
          {photos.map((_, i) => (
            <div key={i} className="relative">
              <button
                onClick={() => setIdx(i)}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center ${
                  i === safeIdx
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-black/60 text-white/60 border border-white/15 hover:bg-white/20 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
              {/* Trash at top-right of the active number only */}
              {i === safeIdx && (
                <button
                  onClick={() => onRemoveCurrent(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-colors z-40"
                >
                  <Trash2 size={8} className="text-white" />
                </button>
              )}
            </div>
          ))}
          {fileInput}
        </div>
      )}

      {/* View mode: pill dots at bottom */}
      {!isEditMode && photos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
          {photos.map((_, i) => (
            <div key={i}
              className={`rounded-full transition-all duration-500 ${i === safeIdx ? 'w-5 h-1.5 bg-white/90' : 'w-1.5 h-1.5 bg-white/35'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  const { content, updateSection, uploadImage, uploadFile } = useContent();
  const { isEditMode } = useAuth();
  const hero = content?.hero;

  const mouseX = useMotionValue(0.55);
  const mouseY = useMotionValue(0.3);
  const springX = useSpring(mouseX, { stiffness: 55, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 22 });
  const glowLeft = useTransform(springX, v => `${v * 100}%`);
  const glowTop  = useTransform(springY, v => `${v * 100}%`);

  const sectionRef  = useRef();
  const heroRef     = useRef(null);
  const saveTimer   = useRef(null);
  const initialized = useRef(false);

  // Title
  const titleYRef        = useRef(33);
  const titleH1Ref       = useRef();
  const titleSizeLabelRef = useRef();

  // Profile photo — all motion values, zero React re-renders during drag/resize
  const photoX    = useMotionValue(0);
  const photoY    = useMotionValue(0);
  const photoSize = useMotionValue(320);

  // Right image box
  const rightX    = useMotionValue(0);
  const rightY    = useMotionValue(0);
  const rightSize = useMotionValue(300);

  useEffect(() => { heroRef.current = hero; }, [hero]);

  useLayoutEffect(() => {
    if (!hero || !sectionRef.current || initialized.current) return;
    const box = sectionRef.current.getBoundingClientRect();
    if (box.width === 0) return;

    const pSize = hero.photoSize ?? 320;
    photoSize.set(pSize);
    photoX.set(clamp((hero.photoX ?? 0) / 100 * box.width,  0, box.width  - pSize));
    photoY.set(clamp((hero.photoY ?? 0) / 100 * box.height, 0, box.height - 80));

    const rSize = hero.rightPhotoSize ?? 300;
    rightSize.set(rSize);
    // Default right box to 55% from left, clamped so it never starts off-screen
    rightX.set(clamp((hero.rightPhotoX ?? 55) / 100 * box.width,  0, box.width  - rSize));
    rightY.set(clamp((hero.rightPhotoY ?? 8)  / 100 * box.height, 0, box.height - 80));

    titleYRef.current = hero.titleY ?? 33;
    initialized.current = true;
  }, [hero]);

  if (!hero) return null;

  const update = (field, value) => updateSection('hero', { ...hero, [field]: value });

  // Migrate single rightPhoto → rightPhotos array
  const rightPhotos = hero.rightPhotos ?? (hero.rightPhoto ? [hero.rightPhoto] : []);

  // Reads all motion values and persists everything in one shot (used by drag end + resize end)
  const persistAll = () => {
    if (!heroRef.current || !sectionRef.current) return;
    const box = sectionRef.current.getBoundingClientRect();
    if (!box.width) return;
    clearTimeout(saveTimer.current);
    updateSection('hero', {
      ...heroRef.current,
      photoX:         parseFloat(((photoX.get()   / box.width)  * 100).toFixed(2)),
      photoY:         parseFloat(((photoY.get()   / box.height) * 100).toFixed(2)),
      photoSize:      Math.round(photoSize.get()),
      rightPhotoX:    parseFloat(((rightX.get()   / box.width)  * 100).toFixed(2)),
      rightPhotoY:    parseFloat(((rightY.get()   / box.height) * 100).toFixed(2)),
      rightPhotoSize: Math.round(rightSize.get()),
      titleY:         titleYRef.current,
    }, true);
  };

  const schedulePersist = () => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persistAll, 700);
  };

  // ── Drag handlers — raw pointer events (same pattern as resize handles) ──────
  // Using raw pointermove/pointerup instead of FM drag so:
  // 1. Only the Move handle starts drag (no conflict with clicking the image)
  // 2. Reliable in production (FM's drag prop has known prod build issues)
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const startPhotoDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    const x0 = e.clientX, y0 = e.clientY, px0 = photoX.get(), py0 = photoY.get();
    const onMove = (me) => {
      const { width: W, height: H } = sectionRef.current.getBoundingClientRect();
      const sz = photoSize.get();
      photoX.set(clamp(px0 + (me.clientX - x0), 0, W - sz));
      photoY.set(clamp(py0 + (me.clientY - y0), 0, H - 80));
    };
    const onUp = () => { persistAll(); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startRightDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    const x0 = e.clientX, y0 = e.clientY, px0 = rightX.get(), py0 = rightY.get();
    const onMove = (me) => {
      const { width: W, height: H } = sectionRef.current.getBoundingClientRect();
      const sz = rightSize.get();
      rightX.set(clamp(px0 + (me.clientX - x0), 0, W - sz));
      rightY.set(clamp(py0 + (me.clientY - y0), 0, H - 80));
    };
    const onUp = () => { persistAll(); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onTitleDragEnd = (_, info) => {
    if (!sectionRef.current) return;
    const { height: H } = sectionRef.current.getBoundingClientRect();
    const cur = (titleYRef.current / 100) * H;
    titleYRef.current = parseFloat((clamp(cur + info.offset.y, 0, H - 120) / H * 100).toFixed(2));
    schedulePersist();
  };

  // ── Corner resize — raw pointer events, pure motion-value updates, zero re-renders ──
  const startResize = (e, corner, sizeMV, xMV, yMV) => {
    e.preventDefault();
    e.stopPropagation();
    const x0    = e.clientX;
    const y0    = e.clientY;
    const size0 = sizeMV.get();
    const px0   = xMV.get();
    const py0   = yMV.get();

    const onMove = (me) => {
      const dx = me.clientX - x0;
      const dy = me.clientY - y0;
      // Delta sign per corner: drag away from corner = grow
      let d;
      if      (corner === 'br') d =  Math.max(dx,  dy);
      else if (corner === 'bl') d =  Math.max(-dx, dy);
      else if (corner === 'tr') d =  Math.max(dx, -dy);
      else                      d =  Math.max(-dx, -dy); // tl

      const newSize = clamp(size0 + d, 80, 700);
      const diff    = newSize - size0;
      sizeMV.set(newSize);
      // Move origin for handles that expand left or up
      if (corner === 'bl' || corner === 'tl') xMV.set(px0 - diff);
      if (corner === 'tr' || corner === 'tl') yMV.set(py0 - diff);
    };

    const onUp = () => {
      persistAll();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  };

  // Renders the 4 corner handles for a draggable/resizable element
  const ResizeHandles = ({ sizeMV, xMV, yMV }) => (
    <>
      {['tl', 'tr', 'bl', 'br'].map(corner => (
        <div
          key={corner}
          className={`absolute w-3 h-3 bg-white border-2 border-red-700 rounded-full z-10 ${CORNER_CLS[corner]}`}
          style={{ cursor: CURSORS[corner], touchAction: 'none' }}
          onPointerDown={e => startResize(e, corner, sizeMV, xMV, yMV)}
        />
      ))}
    </>
  );

  const handlePhotoUpload = async (f) => {
    const url = await uploadImage(f);
    update('photo', url);
  };

  const handleRightPhotosUpload = async (files) => {
    const urls = await Promise.all(files.map(f => uploadImage(f)));
    const current = heroRef.current?.rightPhotos ?? (heroRef.current?.rightPhoto ? [heroRef.current.rightPhoto] : []);
    update('rightPhotos', [...current, ...urls]);
  };

  const handleRemoveRightPhoto = (i) => {
    const current = heroRef.current?.rightPhotos ?? (heroRef.current?.rightPhoto ? [heroRef.current.rightPhoto] : []);
    update('rightPhotos', current.filter((_, idx) => idx !== i));
  };
  const handleCVUpload         = async (f) => { const url = await uploadFile(f);  update('cta1Link', url); };

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  };

  const titleFontSize = hero.titleFontSize ?? 16;

  const bgStyle = {
    background: 'radial-gradient(ellipse at 55% 30%, #3d1515 0%, #2a1010 22%, #180808 48%, #0d0606 68%, #0a0a0a 100%)',
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={bgStyle}
      onMouseMove={handleMouseMove}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      {/* Static glow */}
      <div className="absolute pointer-events-none" style={{ top: '-10%', left: '25%', width: '55%', height: '65%', background: 'radial-gradient(ellipse, rgba(139,26,16,0.40) 0%, rgba(100,18,10,0.18) 45%, transparent 75%)', filter: 'blur(55px)' }} />
      {/* Mouse glow */}
      <motion.div className="absolute pointer-events-none z-[2]" style={{ left: glowLeft, top: glowTop, x: '-50%', y: '-50%', width: '52%', height: '58%', background: 'radial-gradient(circle, rgba(139,26,16,0.38) 0%, rgba(100,18,10,0.18) 42%, transparent 70%)', filter: 'blur(65px)' }} />

      {/* ─── MOBILE ─────────────────────────────────────────────────────── */}
      <div className="lg:hidden relative z-10 flex flex-col items-center min-h-screen pt-20 pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mt-6 mb-6" style={{ width: 'min(220px, 55vw)' }}>
          <EditableImage src={hero.photo} alt="Shoaib Zafar" className="w-full h-auto block" onUpload={handlePhotoUpload} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="font-display text-white text-center leading-[0.85] tracking-wide mb-6" style={{ fontSize: 'clamp(60px, 20vw, 100px)' }}>
          <EditableText value={hero.titleLine1} onSave={v => update('titleLine1', v)} as="span" className="block" />
          <EditableText value={hero.titleLine2} onSave={v => update('titleLine2', v)} as="span" className="block" />
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex flex-col items-center w-full">
          <p className="text-[10px] text-text-muted tracking-[0.28em] uppercase mb-4"><EditableText value={hero.greeting} onSave={v => update('greeting', v)} as="span" /></p>
          <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm"><EditableText value={hero.description} onSave={v => update('description', v)} as="span" multiline /></p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div>
              <EditableURL href={hero.cta1Link} onSaveHref={v => update('cta1Link', v)} className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-full">
                <Download size={14} /><EditableText value={hero.cta1} onSave={v => update('cta1', v)} as="span" />
              </EditableURL>
              <EditableFile onUpload={handleCVUpload} accept=".pdf,.doc,.docx" label="Upload New CV" />
            </div>
            <EditableURL href={hero.cta2Link} onSaveHref={v => update('cta2Link', v)} className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 text-white/75 hover:text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-full">
              <ArrowUpRight size={14} /><EditableText value={hero.cta2} onSave={v => update('cta2', v)} as="span" />
            </EditableURL>
          </div>
        </motion.div>
      </div>

      {/* ─── DESKTOP ────────────────────────────────────────────────────── */}
      <div className="hidden lg:block" style={{ minHeight: '100vh' }}>

        {/* Layer 1 · Big draggable title (z-1) */}
        <div className="absolute inset-0 z-[1] pointer-events-none select-none">
          <motion.div
            key={`ty-${Math.round(hero.titleY ?? 33)}`}
            drag={isEditMode ? 'y' : false}
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={sectionRef}
            onDragEnd={onTitleDragEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.2 }}
            style={{
              position: 'absolute', left: 0, right: 0,
              top: `${hero.titleY ?? 33}%`,
              cursor: isEditMode ? 'grab' : 'default',
              touchAction: 'none',
              pointerEvents: isEditMode ? 'auto' : 'none',
            }}
          >
            <h1
              ref={titleH1Ref}
              className="font-display text-white text-center leading-[0.82] tracking-[0.01em]"
              style={{ fontSize: `clamp(40px, ${titleFontSize}vw, 300px)` }}
            >
              <EditableText value={hero.titleLine1} onSave={v => update('titleLine1', v)} as="span" className="block" />
              <EditableText value={hero.titleLine2} onSave={v => update('titleLine2', v)} as="span" className="block" />
            </h1>

            {isEditMode && (
              <div className="flex flex-col items-center gap-2 mt-3 pointer-events-auto select-none">
                <p className="text-[10px] text-accent/50 tracking-widest pointer-events-none">↕ drag to reposition</p>
                {/* Font-size slider — updates h1 via DOM ref, zero re-renders */}
                <div
                  className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5"
                  onPointerDown={e => e.stopPropagation()}
                >
                  <span className="text-[9px] text-white/40 shrink-0">Font size</span>
                  <input
                    type="range" min="4" max="28" step="0.5"
                    defaultValue={titleFontSize}
                    onChange={e => {
                      if (titleH1Ref.current)
                        titleH1Ref.current.style.fontSize = `clamp(40px, ${e.target.value}vw, 300px)`;
                      if (titleSizeLabelRef.current)
                        titleSizeLabelRef.current.textContent = `${e.target.value}vw`;
                    }}
                    onPointerUp={e => update('titleFontSize', Number(e.target.value))}
                    className="w-32 h-1 accent-red-700 cursor-pointer"
                  />
                  <span ref={titleSizeLabelRef} className="text-[9px] text-white/40 w-10 shrink-0">
                    {titleFontSize}vw
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Layer 2 · Left gradient shield (z-5) */}
        <div className="absolute top-0 left-0 bottom-0 z-[5] pointer-events-none" style={{ width: '40%', background: 'linear-gradient(to right, #0a0a0a 45%, rgba(10,10,10,0.9) 65%, rgba(10,10,10,0.5) 82%, transparent 100%)' }} />

        {/* Layer 3 · Profile photo
            Standard drag on motion.div — image area blocks propagation so clicking
            the photo opens file picker; Move handle lets events through to start drag.
            Width/x/y are motion values → all updates bypass React reconciler. */}
        <motion.div
          className="select-none"
          style={{
            position: 'absolute', left: 0, top: 0,
            x: photoX, y: photoY, width: photoSize,
            zIndex: isEditMode ? 30 : 10,
            touchAction: 'none',
            pointerEvents: isEditMode ? 'auto' : 'none',
          }}
        >
          <EditableImage src={hero.photo} alt="Shoaib Zafar" className="w-full h-auto block" onUpload={handlePhotoUpload} />

          {isEditMode && (
            <>
              {/* Move handle — raw pointermove drag, only this handle moves the photo */}
              <div
                className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-2 cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
                onPointerDown={startPhotoDrag}
              >
                <Move size={14} className="text-white" />
              </div>
              <ResizeHandles sizeMV={photoSize} xMV={photoX} yMV={photoY} />
            </>
          )}
        </motion.div>

        {/* Layer 3b · Right photo slider — hidden when empty and not in edit mode */}
        {(rightPhotos.length > 0 || isEditMode) && (
          <motion.div
            className="select-none"
            style={{
              position: 'absolute', left: 0, top: 0,
              x: rightX, y: rightY, width: rightSize,
              zIndex: isEditMode ? 30 : 15,
              touchAction: 'none',
              pointerEvents: isEditMode ? 'auto' : 'none',
            }}
          >
            <RightPhotoSlider
              photos={rightPhotos}
              isEditMode={isEditMode}
              onAddPhotos={handleRightPhotosUpload}
              onRemoveCurrent={handleRemoveRightPhoto}
            />

            {isEditMode && (
              <>
                {/* Move handle — z-[50] beats the z-30 numbered indicators inside the slider */}
                <div
                  className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-2 cursor-grab active:cursor-grabbing"
                  style={{ touchAction: 'none', zIndex: 50 }}
                  onPointerDown={startRightDrag}
                >
                  <Move size={14} className="text-white" />
                </div>
                <ResizeHandles sizeMV={rightSize} xMV={rightX} yMV={rightY} />
              </>
            )}
          </motion.div>
        )}

        {/* Bottom fade (z-11) */}
        <div className="absolute bottom-0 left-0 right-0 z-[11] pointer-events-none" style={{ height: '180px', background: 'linear-gradient(to top, #0a0a0a 30%, rgba(10,10,10,0.7) 70%, transparent 100%)' }} />

        {/* Layer 4 · Left text content (z-20) — outer div pointer-events-none, inner content auto */}
        <div className="absolute top-0 left-0 bottom-0 z-[20] flex items-start pl-10 lg:pl-16 pt-[55vh] pointer-events-none">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.7 }} style={{ maxWidth: '270px' }} className="pointer-events-auto">
            <p className="text-[10px] text-text-muted tracking-[0.28em] uppercase mb-6"><EditableText value={hero.greeting} onSave={v => update('greeting', v)} as="span" /></p>
            <p className="text-text-secondary text-[13px] leading-relaxed mb-10"><EditableText value={hero.description} onSave={v => update('description', v)} as="span" multiline /></p>
            <div className="flex flex-col gap-3">
              <div>
                <EditableURL href={hero.cta1Link} onSaveHref={v => update('cta1Link', v)} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-fit">
                  <Download size={14} /><EditableText value={hero.cta1} onSave={v => update('cta1', v)} as="span" />
                </EditableURL>
                <EditableFile onUpload={handleCVUpload} accept=".pdf,.doc,.docx" label="Upload New CV" />
              </div>
              <EditableURL href={hero.cta2Link} onSaveHref={v => update('cta2Link', v)} className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white/75 hover:text-white text-sm font-medium px-5 py-2.5 rounded transition-colors w-fit">
                <ArrowUpRight size={14} /><EditableText value={hero.cta2} onSave={v => update('cta2', v)} as="span" />
              </EditableURL>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-8 right-10 z-[20] pointer-events-none flex flex-col items-center gap-1">
          <div className="w-px h-10 bg-white/10 relative overflow-hidden">
            <motion.div animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-0 w-full h-1/2 bg-accent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
