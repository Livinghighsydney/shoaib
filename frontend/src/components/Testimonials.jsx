import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Move, Check, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

const AVATAR = 'https://i.pravatar.cc/80?img=';

const DEFAULTS = [
  { posX: 4,  posY: 4,  size: 270, color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
  { posX: 32, posY: 42, size: 230, color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
  { posX: 62, posY: 6,  size: 255, color: '#c4b5a0', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
];

function getLayout(item, i) {
  const d = DEFAULTS[i] ?? { posX: 10 + i * 18, posY: 10, size: 220, color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' };
  return {
    posX:       typeof item.posX       === 'number' ? item.posX       : d.posX,
    posY:       typeof item.posY       === 'number' ? item.posY       : d.posY,
    size:       typeof item.size       === 'number' ? item.size       : d.size,
    color:      item.color      || d.color,
    fontSize:   typeof item.fontSize   === 'number' ? item.fontSize   : d.fontSize,
    fontWeight: item.fontWeight || d.fontWeight,
    fontStyle:  item.fontStyle  || d.fontStyle,
  };
}

function hexLuma(hex) {
  if (!hex || hex.length < 7) return 255;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/* ── Bubble ────────────────────────────────────────────────────────────────
   Position: CSS left/top percentage — always visible from first paint.
   After drag ends we save new posX/posY; the KEY changes (includes rounded
   position) so the motion.div remounts fresh, resetting Framer Motion's
   internal transform to 0.  This prevents the "teleport on second drag" bug
   without any useMotionValue / useLayoutEffect complexity.               */
function Bubble({ item, i, isEditMode, isSelected, containerRef, onSelect, onUpdateItem, onPhotoUpload }) {
  const { posX, posY, size, color, fontSize, fontWeight, fontStyle } = getLayout(item, i);
  const didMove = useRef(false);

  const light     = hexLuma(color) > 128;
  const textColor = light ? '#222222' : '#ffffff';
  const muteColor = light ? '#666666' : 'rgba(255,255,255,0.65)';
  const accent    = '#8B1A10';

  const handleDragEnd = (e, info) => {
    if (!containerRef.current || !didMove.current) return;
    const box     = containerRef.current.getBoundingClientRect();
    const curLeft = (posX / 100) * box.width;
    const curTop  = (posY / 100) * box.height;
    const newLeft = Math.max(0, Math.min(box.width  - size, curLeft + info.offset.x));
    const newTop  = Math.max(0, Math.min(box.height - size, curTop  + info.offset.y));
    onUpdateItem({
      posX: parseFloat(((newLeft / box.width)  * 100).toFixed(2)),
      posY: parseFloat(((newTop  / box.height) * 100).toFixed(2)),
    });
    /* key changes after state update → remount resets FM transform to 0 */
  };

  return (
    /* Key includes position so remount happens after drag saves new coords */
    <motion.div
      key={`b${i}-${Math.round(posX)}-${Math.round(posY)}`}
      drag={isEditMode}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={containerRef}
      onDragStart={() => { didMove.current = false; }}
      onDrag={() => { didMove.current = true; }}
      onDragEnd={handleDragEnd}
      onTap={() => { if (isEditMode && !didMove.current) onSelect(); }}
      whileDrag={{ scale: 1.04, zIndex: 99 }}
      /* entrance animation only outside edit mode */
      initial={isEditMode ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75 }}
      whileInView={isEditMode ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      animate={isEditMode ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.55, delay: isEditMode ? 0 : i * 0.18 }}
      style={{
        position: 'absolute',
        left: `${posX}%`,
        top:  `${posY}%`,
        zIndex: isSelected ? 20 : isEditMode ? 10 : 1,
        cursor: isEditMode ? 'grab' : 'default',
        touchAction: 'none',
      }}
    >
      {/* Wrapper handles width/height with a CSS transition so resizing is smooth */}
      <div style={{ width: size, height: size, transition: 'width 0.12s ease, height 0.12s ease' }}>
        {/* Circle */}
        <div
          className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative select-none overflow-hidden"
          style={{
            backgroundColor: color,
            padding: `${Math.round(size * 0.09)}px`,
            boxShadow: isSelected && isEditMode
              ? `0 0 0 3px ${accent}, 0 0 0 6px rgba(139,26,16,0.18), 0 12px 40px rgba(0,0,0,0.3)`
              : '0 8px 30px rgba(0,0,0,0.18)',
            transition: 'box-shadow 0.2s, background-color 0.15s',
          }}
        >
          <span className="font-display leading-none mb-1"
            style={{ color: accent, fontSize: `${Math.round(size * 0.09)}px` }}>"</span>

          <EditableText
            value={item.content}
            onSave={v => onUpdateItem({ content: v })}
            as="p"
            className="leading-snug mb-2"
            style={{ color: textColor, fontSize: `${fontSize}px`, fontWeight, fontStyle }}
            multiline
          />

          <div className="flex flex-col items-center mt-1">
            <div className="rounded-full overflow-hidden border-2 mb-1"
              style={{ width: Math.round(size * 0.13), height: Math.round(size * 0.13), borderColor: `${accent}55` }}>
              <EditableImage
                src={item.photo || `${AVATAR}${i + 10}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onUpload={onPhotoUpload}
              />
            </div>
            <EditableText value={item.name} onSave={v => onUpdateItem({ name: v })} as="p" className="font-semibold"
              style={{ color: textColor, fontSize: `${Math.max(8, fontSize - 1)}px`, fontWeight }} />
            <EditableText value={item.role} onSave={v => onUpdateItem({ role: v })} as="p"
              style={{ color: muteColor, fontSize: `${Math.max(7, fontSize - 2)}px` }} />
          </div>
        </div>

        {/* Selection badge */}
        {isEditMode && isSelected && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none">
            <Check size={11} className="text-white" />
          </div>
        )}
        {/* Drag hint on unselected bubbles */}
        {isEditMode && !isSelected && (
          <div className="absolute top-2 right-2 bg-black/35 backdrop-blur-sm rounded-full p-1.5 z-20 pointer-events-none">
            <Move size={10} className="text-white/70" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── BubbleControls ─────────────────────────────────────────────────────── */
function BubbleControls({ item, i, onUpdateItem, onRemove, onDeselect }) {
  const { color, size, fontSize, fontWeight, fontStyle } = getLayout(item, i);
  const [draftColor, setDraftColor] = useState(color);
  useEffect(() => { setDraftColor(color); }, [color]);
  const accent = '#8B1A10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="mt-6 mx-auto"
      style={{ maxWidth: 640 }}
    >
      <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
          <span className="text-white/40 text-[11px] tracking-widest uppercase">Bubble {i + 1}</span>
          <div className="flex items-center gap-2">
            <button onClick={onRemove}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
              <Trash2 size={11} /> Delete bubble
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={onDeselect} className="text-white/30 hover:text-white/70 p-1 rounded transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          {/* Color */}
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Bubble Color</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg border border-white/20 overflow-hidden shadow-inner flex-shrink-0"
                style={{ backgroundColor: draftColor }}>
                <input type="color" value={draftColor}
                  onChange={e  => setDraftColor(e.target.value)}
                  onBlur={e    => onUpdateItem({ color: e.target.value })}
                  className="opacity-0 w-full h-full cursor-pointer block" />
              </div>
              <span className="text-white/40 text-[11px] font-mono">{draftColor}</span>
            </label>
          </div>

          {/* Bubble size */}
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">
              Bubble Size — <span className="text-white/60 normal-case font-mono">{size}px</span>
            </span>
            <input type="range" min="140" max="400" step="10" value={size}
              onChange={e => onUpdateItem({ size: parseInt(e.target.value) })}
              className="w-full h-1.5 cursor-pointer rounded-full" style={{ accentColor: accent }} />
            <div className="flex justify-between text-white/20 text-[9px]"><span>140</span><span>400</span></div>
          </div>

          {/* Font size */}
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">
              Text Size — <span className="text-white/60 normal-case font-mono">{fontSize}px</span>
            </span>
            <input type="range" min="7" max="18" step="1" value={fontSize}
              onChange={e => onUpdateItem({ fontSize: parseInt(e.target.value) })}
              className="w-full h-1.5 cursor-pointer rounded-full" style={{ accentColor: accent }} />
            <div className="flex justify-between text-white/20 text-[9px]"><span>7</span><span>18</span></div>
          </div>

          {/* Font style */}
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Text Style</span>
            <div className="flex gap-2">
              <button onClick={() => onUpdateItem({ fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })}
                className="px-3 py-1.5 rounded-lg text-[12px] border transition-colors font-bold"
                style={{
                  borderColor: fontWeight === 'bold' ? accent : 'rgba(255,255,255,0.12)',
                  color: fontWeight === 'bold' ? '#fff' : 'rgba(255,255,255,0.35)',
                  backgroundColor: fontWeight === 'bold' ? `${accent}33` : 'transparent',
                }}>B</button>
              <button onClick={() => onUpdateItem({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
                className="px-3 py-1.5 rounded-lg text-[12px] border transition-colors italic"
                style={{
                  borderColor: fontStyle === 'italic' ? accent : 'rgba(255,255,255,0.12)',
                  color: fontStyle === 'italic' ? '#fff' : 'rgba(255,255,255,0.35)',
                  backgroundColor: fontStyle === 'italic' ? `${accent}33` : 'transparent',
                }}>I</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
export default function Testimonials() {
  const { content, updateSection, uploadImage } = useContent();
  const { isEditMode }  = useAuth();
  const containerRef    = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  /* localItems: single source of truth. DB writes debounced via ref. */
  const [localItems, setLocalItems]   = useState(null);
  const localItemsRef   = useRef(null);
  const testimonialsRef = useRef(null);
  const debounceRef     = useRef(null);
  const initialized     = useRef(false);

  const testimonials = content?.testimonials;

  useEffect(() => { testimonialsRef.current = testimonials; }, [testimonials]);

  /* Init once from DB — never re-sync after that so in-progress edits survive saves */
  useEffect(() => {
    if (testimonials?.items && !initialized.current) {
      localItemsRef.current = testimonials.items;
      setLocalItems(testimonials.items);
      initialized.current = true;
    }
  }, [testimonials]);

  useEffect(() => { if (!isEditMode) setSelectedIdx(null); }, [isEditMode]);

  if (!testimonials || !localItems) return null;

  const scheduleSave = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!testimonialsRef.current || !localItemsRef.current) return;
      updateSection('testimonials', { ...testimonialsRef.current, items: localItemsRef.current }, true);
    }, 700);
  };

  const updateItem = (i, patch) => {
    const next = localItemsRef.current.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    localItemsRef.current = next;
    setLocalItems(next);
    scheduleSave();
  };

  const removeItem = (i) => {
    setSelectedIdx(null);
    const next = localItemsRef.current.filter((_, idx) => idx !== i);
    localItemsRef.current = next;
    clearTimeout(debounceRef.current);
    setLocalItems(next);
    updateSection('testimonials', { ...testimonialsRef.current, items: next });
  };

  const addItem = () => {
    const next = [
      ...localItemsRef.current,
      { id: Date.now(), name: 'Client Name', role: 'Job Title',
        content: 'A great experience working together.',
        photo: null, posX: 15, posY: 15, size: 220,
        color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
    ];
    localItemsRef.current = next;
    setLocalItems(next);
    scheduleSave();
  };

  const handlePhotoUpload = async (i, file) => {
    const url = await uploadImage(file);
    updateItem(i, { photo: url });
  };

  return (
    <section
      id="testimonials"
      className={`bg-light-bg py-24 ${isEditMode ? '' : 'overflow-hidden'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">

        {/* Background watermark — visible at 0.25 opacity on light cream background */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="font-display text-[12vw] sm:text-[10vw] leading-none select-none text-center mb-10"
          style={{ color: 'rgba(10,10,10,0.25)' }}
        >
          TESTIMONIALS
        </motion.h2>

        {isEditMode && (
          <p className="text-center text-accent text-[11px] mb-4 tracking-widest uppercase">
            {selectedIdx === null
              ? 'Click a bubble to select · Drag to reposition'
              : `Bubble ${selectedIdx + 1} selected — adjust below · click canvas to deselect`}
          </p>
        )}

        {/* Canvas */}
        <div
          ref={containerRef}
          className={`relative ${isEditMode
            ? 'min-h-[700px] border-2 border-dashed border-accent/15 rounded-2xl'
            : 'min-h-[540px]'}`}
          onClick={e => { if (e.target === containerRef.current) setSelectedIdx(null); }}
        >
          {localItems.map((t, i) => (
            <Bubble
              key={t.id ?? i}
              item={t}
              i={i}
              isEditMode={isEditMode}
              isSelected={selectedIdx === i}
              containerRef={containerRef}
              onSelect={() => setSelectedIdx(prev => prev === i ? null : i)}
              onUpdateItem={patch => updateItem(i, patch)}
              onPhotoUpload={file => handlePhotoUpload(i, file)}
            />
          ))}
        </div>

        {/* Persistent controls for selected bubble */}
        {isEditMode && selectedIdx !== null && localItems[selectedIdx] && (
          <BubbleControls
            key={selectedIdx}
            item={localItems[selectedIdx]}
            i={selectedIdx}
            onUpdateItem={patch => updateItem(selectedIdx, patch)}
            onRemove={() => removeItem(selectedIdx)}
            onDeselect={() => setSelectedIdx(null)}
          />
        )}

        {isEditMode && (
          <div className={`text-center ${selectedIdx !== null ? 'mt-4' : 'mt-8'}`}>
            <button onClick={addItem}
              className="border border-dashed border-accent/30 px-6 py-3 rounded-full text-accent hover:bg-accent-dim transition-colors text-sm flex items-center gap-2 mx-auto">
              <Plus size={16} /> Add Testimonial
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
