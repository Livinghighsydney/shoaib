import { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Move, Check, X, ImageIcon, MessageSquare } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage, EditableFile } from './admin/EditableField';
import { useAuth } from '../context/AuthContext';

const AVATAR = 'https://i.pravatar.cc/80?img=';
const ACCENT = '#8B1A10';

const BUBBLE_DEFAULTS = [
  { posX: 4,  posY: 4,  size: 270, color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
  { posX: 32, posY: 42, size: 230, color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
  { posX: 62, posY: 6,  size: 255, color: '#c4b5a0', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' },
];

const CARD_DEFAULTS = [
  { posX: 60, posY: 5  },
  { posX: 5,  posY: 8  },
  { posX: 38, posY: 48 },
];

// Slight fixed rotation per card index — alternates direction
const CARD_ROTATIONS = [-2, 1.5, -1.2, 2.3, -1.8, 1.1];

function getBubbleLayout(item, i) {
  const d = BUBBLE_DEFAULTS[i] ?? { posX: 10 + i * 18, posY: 10, size: 220, color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal' };
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

/* ── Bubble (text) ─────────────────────────────────────────────────────────── */
function Bubble({ item, i, isEditMode, isSelected, containerRef, onSelect, onUpdateItem, onPhotoUpload, onRemove }) {
  const { posX, posY, size, color, fontSize, fontWeight, fontStyle } = getBubbleLayout(item, i);
  const [livePos, setLivePos] = useState(null);

  const light     = hexLuma(color) > 128;
  const textColor = light ? '#222222' : '#ffffff';
  const muteColor = light ? '#666666' : 'rgba(255,255,255,0.65)';

  // Drag — only initiated from the Move handle (raw pointer events, no FM drag)
  const startDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const box      = containerRef.current.getBoundingClientRect();
    const startX   = e.clientX;
    const startY   = e.clientY;
    const startLeft = (posX / 100) * box.width;
    const startTop  = (posY / 100) * box.height;
    const onMove = (me) => {
      setLivePos({
        left: Math.max(0, Math.min(box.width  - size, startLeft + (me.clientX - startX))),
        top:  Math.max(0, Math.min(box.height - size, startTop  + (me.clientY - startY))),
      });
    };
    const onUp = (me) => {
      const newLeft = Math.max(0, Math.min(box.width  - size, startLeft + (me.clientX - startX)));
      const newTop  = Math.max(0, Math.min(box.height - size, startTop  + (me.clientY - startY)));
      setLivePos(null);
      onUpdateItem({
        posX: parseFloat(((newLeft / box.width)  * 100).toFixed(2)),
        posY: parseFloat(((newTop  / box.height) * 100).toFixed(2)),
      });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <motion.div
      onClick={() => { if (isEditMode) onSelect(); }}
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, delay: isEditMode ? 0 : i * 0.12 }}
      style={{
        position: 'absolute',
        left: livePos ? livePos.left : `${posX}%`,
        top:  livePos ? livePos.top  : `${posY}%`,
        zIndex: isSelected ? 20 : isEditMode ? 10 : 1,
        cursor: 'default',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size, transition: 'width 0.12s ease, height 0.12s ease' }}>
        <div
          className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative select-none overflow-hidden"
          style={{
            backgroundColor: color,
            padding: `${Math.round(size * 0.09)}px`,
            boxShadow: isSelected && isEditMode
              ? `0 0 0 3px ${ACCENT}, 0 0 0 6px rgba(139,26,16,0.18), 0 12px 40px rgba(0,0,0,0.3)`
              : '0 8px 30px rgba(0,0,0,0.18)',
            transition: 'box-shadow 0.2s, background-color 0.15s',
          }}
        >
          <span className="font-display leading-none mb-1"
            style={{ color: ACCENT, fontSize: `${Math.round(size * 0.09)}px` }}>"</span>
          <EditableText value={item.content} onSave={v => onUpdateItem({ content: v })} as="p"
            className="leading-snug mb-2"
            style={{ color: textColor, fontSize: `${fontSize}px`, fontWeight, fontStyle }}
            multiline />
          <div className="flex flex-col items-center mt-1">
            <div className="rounded-full overflow-hidden border-2 mb-1"
              style={{ width: Math.round(size * 0.13), height: Math.round(size * 0.13), borderColor: `${ACCENT}55` }}>
              <EditableImage src={item.photo || `${AVATAR}${i + 10}`} alt={item.name}
                className="w-full h-full object-cover" onUpload={onPhotoUpload} />
            </div>
            <EditableText value={item.name} onSave={v => onUpdateItem({ name: v })} as="p"
              className="font-semibold"
              style={{ color: textColor, fontSize: `${Math.max(8, fontSize - 1)}px`, fontWeight }} />
            <EditableText value={item.role} onSave={v => onUpdateItem({ role: v })} as="p"
              style={{ color: muteColor, fontSize: `${Math.max(7, fontSize - 2)}px` }} />
          </div>
        </div>

        {isEditMode && (
          <>
            {/* Move handle — ONLY this initiates drag */}
            <div
              className="absolute -top-3 -left-3 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center z-30 cursor-grab active:cursor-grabbing shadow-lg"
              style={{ touchAction: 'none' }}
              onPointerDown={startDrag}
            >
              <Move size={12} className="text-white" />
            </div>
            {/* Trash */}
            <button
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg z-30 transition-colors"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onRemove(); }}
            >
              <Trash2 size={12} className="text-white" />
            </button>
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none">
                <Check size={11} className="text-white" />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── PhotoCard (image testimonial) ─────────────────────────────────────────── */
function PhotoCard({ item, i, isEditMode, isSelected, containerRef, onSelect, onUpdateItem, onPhotoUpload, onRemove }) {
  const [liveSize, setLiveSize] = useState(null);
  const [livePos,  setLivePos]  = useState(null);
  const posX    = typeof item.posX === 'number' ? item.posX : (CARD_DEFAULTS[i % CARD_DEFAULTS.length]?.posX ?? 10 + i * 20);
  const posY    = typeof item.posY === 'number' ? item.posY : (CARD_DEFAULTS[i % CARD_DEFAULTS.length]?.posY ?? 5);
  const size    = liveSize ?? (typeof item.size === 'number' ? item.size : 220);
  const rotation = CARD_ROTATIONS[i % CARD_ROTATIONS.length];

  // Drag — only initiated from the Move handle
  const startDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const box      = containerRef.current.getBoundingClientRect();
    const startX   = e.clientX;
    const startY   = e.clientY;
    const startLeft = (posX / 100) * box.width;
    const startTop  = (posY / 100) * box.height;
    const onMove = (me) => {
      setLivePos({
        left: Math.max(0, Math.min(box.width  - size, startLeft + (me.clientX - startX))),
        top:  Math.max(0, Math.min(box.height - size, startTop  + (me.clientY - startY))),
      });
    };
    const onUp = (me) => {
      const newLeft = Math.max(0, Math.min(box.width  - size, startLeft + (me.clientX - startX)));
      const newTop  = Math.max(0, Math.min(box.height - size, startTop  + (me.clientY - startY)));
      setLivePos(null);
      onUpdateItem({
        posX: parseFloat(((newLeft / box.width)  * 100).toFixed(2)),
        posY: parseFloat(((newTop  / box.height) * 100).toFixed(2)),
      });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Resize — only initiated from SE corner handle
  const startResize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX    = e.clientX;
    const startSize = size;
    const onMove = (me) => {
      setLiveSize(Math.max(120, Math.min(420, startSize + (me.clientX - startX))));
    };
    const onUp = (me) => {
      const final = Math.max(120, Math.min(420, startSize + (me.clientX - startX)));
      setLiveSize(null);
      onUpdateItem({ size: final });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <motion.div
      onClick={() => { if (isEditMode) onSelect(); }}
      initial={isEditMode ? { opacity: 1 } : { opacity: 0, y: 20, rotate: rotation }}
      whileInView={isEditMode ? undefined : { opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true, margin: '-60px' }}
      animate={isEditMode ? { opacity: 1 } : undefined}
      transition={{ duration: 0.6, delay: isEditMode ? 0 : i * 0.15 }}
      style={{
        position: 'absolute',
        left: livePos ? livePos.left : `${posX}%`,
        top:  livePos ? livePos.top  : `${posY}%`,
        width: size,
        zIndex: isSelected ? 20 : isEditMode ? 10 : 1,
        rotate: rotation,
        cursor: 'default',
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Card surface */}
        <div
          className="rounded-xl overflow-hidden select-none"
          style={{
            boxShadow: isSelected && isEditMode
              ? `0 0 0 2px ${ACCENT}, 0 0 0 5px rgba(139,26,16,0.15), 0 16px 48px rgba(0,0,0,0.55)`
              : '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)',
            background: '#141414',
            transition: 'box-shadow 0.2s',
          }}
        >
          {item.photo ? (
            <EditableImage
              src={item.photo}
              alt="Testimonial"
              className="w-full h-auto block"
              onUpload={onPhotoUpload}
            />
          ) : isEditMode ? (
            <div className="w-full h-36 flex flex-col items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <ImageIcon size={20} className="text-white/15" />
              <EditableFile onUpload={onPhotoUpload} accept="image/*" label="Upload screenshot" />
            </div>
          ) : null}
        </div>

        {/* Edit overlays — outside overflow:hidden */}
        {isEditMode && (
          <>
            {/* Move handle — ONLY this initiates drag */}
            <div
              className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-2 z-30 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={startDrag}
            >
              <Move size={12} className="text-white" />
            </div>

            {/* Trash */}
            <button
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg z-30 transition-colors"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onRemove(); }}
            >
              <Trash2 size={12} className="text-white" />
            </button>

            {/* SE resize handle */}
            <div
              className="absolute w-3.5 h-3.5 bg-white border-2 border-red-700 rounded-full z-30 cursor-se-resize"
              style={{ bottom: -6, right: -6, touchAction: 'none' }}
              onPointerDown={startResize}
            />

            {isSelected && (
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none">
                <Check size={11} className="text-white" />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── BubbleControls ─────────────────────────────────────────────────────────── */
function BubbleControls({ item, i, onUpdateItem, onRemove, onDeselect }) {
  const { color, size, fontSize, fontWeight, fontStyle } = getBubbleLayout(item, i);
  const [draftColor, setDraftColor] = useState(color);
  useEffect(() => { setDraftColor(color); }, [color]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
      className="mt-6 mx-auto" style={{ maxWidth: 640 }}>
      <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
          <span className="text-white/40 text-[11px] tracking-widest uppercase">Bubble {i + 1}</span>
          <div className="flex items-center gap-2">
            <button onClick={onRemove}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
              <Trash2 size={11} /> Delete
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={onDeselect} className="text-white/30 hover:text-white/70 p-1 rounded transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Bubble Color</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg border border-white/20 overflow-hidden shadow-inner flex-shrink-0"
                style={{ backgroundColor: draftColor }}>
                <input type="color" value={draftColor}
                  onChange={e => setDraftColor(e.target.value)}
                  onBlur={e => onUpdateItem({ color: e.target.value })}
                  className="opacity-0 w-full h-full cursor-pointer block" />
              </div>
              <span className="text-white/40 text-[11px] font-mono">{draftColor}</span>
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">
              Bubble Size — <span className="text-white/60 normal-case font-mono">{size}px</span>
            </span>
            <input type="range" min="140" max="400" step="10" value={size}
              onChange={e => onUpdateItem({ size: parseInt(e.target.value) })}
              className="w-full h-1.5 cursor-pointer rounded-full" style={{ accentColor: ACCENT }} />
            <div className="flex justify-between text-white/20 text-[9px]"><span>140</span><span>400</span></div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">
              Text Size — <span className="text-white/60 normal-case font-mono">{fontSize}px</span>
            </span>
            <input type="range" min="7" max="18" step="1" value={fontSize}
              onChange={e => onUpdateItem({ fontSize: parseInt(e.target.value) })}
              className="w-full h-1.5 cursor-pointer rounded-full" style={{ accentColor: ACCENT }} />
            <div className="flex justify-between text-white/20 text-[9px]"><span>7</span><span>18</span></div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Text Style</span>
            <div className="flex gap-2">
              <button onClick={() => onUpdateItem({ fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })}
                className="px-3 py-1.5 rounded-lg text-[12px] border transition-colors font-bold"
                style={{
                  borderColor: fontWeight === 'bold' ? ACCENT : 'rgba(255,255,255,0.12)',
                  color: fontWeight === 'bold' ? '#fff' : 'rgba(255,255,255,0.35)',
                  backgroundColor: fontWeight === 'bold' ? `${ACCENT}33` : 'transparent',
                }}>B</button>
              <button onClick={() => onUpdateItem({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
                className="px-3 py-1.5 rounded-lg text-[12px] border transition-colors italic"
                style={{
                  borderColor: fontStyle === 'italic' ? ACCENT : 'rgba(255,255,255,0.12)',
                  color: fontStyle === 'italic' ? '#fff' : 'rgba(255,255,255,0.35)',
                  backgroundColor: fontStyle === 'italic' ? `${ACCENT}33` : 'transparent',
                }}>I</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── PhotoCardControls ──────────────────────────────────────────────────────── */
function PhotoCardControls({ item, i, onUpdateItem, onRemove, onDeselect }) {
  const size = typeof item.size === 'number' ? item.size : 220;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
      className="mt-6 mx-auto" style={{ maxWidth: 420 }}>
      <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
          <span className="text-white/40 text-[11px] tracking-widest uppercase">Photo Card {i + 1}</span>
          <div className="flex items-center gap-2">
            <button onClick={onRemove}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
              <Trash2 size={11} /> Delete
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={onDeselect} className="text-white/30 hover:text-white/70 p-1 rounded transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">
              Card Width — <span className="text-white/60 normal-case font-mono">{size}px</span>
            </span>
            <input type="range" min="140" max="380" step="10" value={size}
              onChange={e => onUpdateItem({ size: parseInt(e.target.value) })}
              className="w-full h-1.5 cursor-pointer rounded-full" style={{ accentColor: ACCENT }} />
            <div className="flex justify-between text-white/20 text-[9px]"><span>140</span><span>380</span></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main section ───────────────────────────────────────────────────────────── */
export default function Testimonials() {
  const { content, updateSection, uploadImage } = useContent();
  const { isEditMode }  = useAuth();
  const containerRef    = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const [localItems, setLocalItems] = useState(null);
  const localItemsRef   = useRef(null);
  const testimonialsRef = useRef(null);
  const debounceRef     = useRef(null);
  const initialized     = useRef(false);

  const testimonials = content?.testimonials;

  useEffect(() => { testimonialsRef.current = testimonials; }, [testimonials]);

  useEffect(() => {
    if (testimonials?.items && !initialized.current) {
      localItemsRef.current = testimonials.items;
      setLocalItems(testimonials.items);
      initialized.current = true;
    }
  }, [testimonials]);

  useEffect(() => { if (!isEditMode) setSelectedIdx(null); }, [isEditMode]);

  // Canvas grows to fit all items — same height in both modes to prevent
  // position shift when toggling edit mode (items use posY% of container height)
  const canvasHeight = useMemo(() => {
    if (!localItems) return 600;
    const PADDING = 100;
    const MIN     = 600;
    let h = MIN;
    for (const t of localItems) {
      const posY  = typeof t.posY  === 'number' ? t.posY  : 10;
      const size  = typeof t.size  === 'number' ? t.size  : 220;
      const itemH = t.type === 'image' ? size * 1.3 : size;
      const frac  = (100 - posY) / 100;
      if (frac > 0.05) h = Math.max(h, Math.ceil(itemH / frac) + PADDING);
    }
    return h;
  }, [localItems]);

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

  const addItem = (type = 'text') => {
    const imageCount = localItemsRef.current.filter(t => t.type === 'image').length;
    const newItem = type === 'image'
      ? {
          id: Date.now(), type: 'image',
          name: 'Name', role: 'Role · Source',
          photo: null,
          posX: CARD_DEFAULTS[imageCount % CARD_DEFAULTS.length].posX,
          posY: CARD_DEFAULTS[imageCount % CARD_DEFAULTS.length].posY,
          size: 220,
        }
      : {
          id: Date.now(), type: 'text',
          name: 'Client Name', role: 'Job Title',
          content: 'A great experience working together.',
          photo: null, posX: 15, posY: 15, size: 220,
          color: '#ffffff', fontSize: 11, fontWeight: 'normal', fontStyle: 'normal',
        };
    const next = [...localItemsRef.current, newItem];
    localItemsRef.current = next;
    clearTimeout(debounceRef.current);
    setLocalItems(next);
    updateSection('testimonials', { ...testimonialsRef.current, items: next });
  };

  const handlePhotoUpload = async (i, file) => {
    const url = await uploadImage(file);
    updateItem(i, { photo: url });
  };

  const selectedItem = selectedIdx !== null ? localItems[selectedIdx] : null;

  return (
    <section
      id="testimonials"
      className={`bg-light-bg py-24 ${isEditMode ? '' : 'overflow-hidden'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">

        {/* Background watermark heading — editable */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="font-display text-[12vw] sm:text-[10vw] leading-none select-none text-center mb-10"
          style={{ color: 'rgba(10,10,10,0.25)' }}
        >
          <EditableText
            value={testimonials.heading ?? 'TESTIMONIALS'}
            onSave={v => updateSection('testimonials', { ...testimonialsRef.current, heading: v })}
            as="span"
          />
        </motion.h2>

        {isEditMode && (
          <p className="text-center text-accent text-[11px] mb-4 tracking-widest uppercase">
            {selectedIdx === null
              ? 'Click a bubble or card to select · Drag to reposition'
              : `${selectedItem?.type === 'image' ? 'Photo card' : 'Bubble'} ${selectedIdx + 1} selected — adjust below`}
          </p>
        )}

        {/* Canvas — height computed from item positions, same in edit & view mode
            so posY% doesn't shift items when toggling. Grows smoothly as needed. */}
        <div
          ref={containerRef}
          className={`relative ${isEditMode ? 'border-2 border-dashed border-accent/15 rounded-2xl' : ''}`}
          style={{ minHeight: canvasHeight, transition: 'min-height 0.35s ease' }}
          onClick={e => { if (e.target === containerRef.current) setSelectedIdx(null); }}
        >
          {localItems.map((t, i) => (
            t.type === 'image' ? (
              <PhotoCard
                key={t.id ?? i}
                item={t}
                i={i}
                isEditMode={isEditMode}
                isSelected={selectedIdx === i}
                containerRef={containerRef}
                onSelect={() => setSelectedIdx(prev => prev === i ? null : i)}
                onUpdateItem={patch => updateItem(i, patch)}
                onPhotoUpload={file => handlePhotoUpload(i, file)}
                onRemove={() => removeItem(i)}
              />
            ) : (
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
                onRemove={() => removeItem(i)}
              />
            )
          ))}
        </div>

        {/* Controls panel for selected item */}
        {isEditMode && selectedIdx !== null && selectedItem && (
          selectedItem.type === 'image' ? (
            <PhotoCardControls
              key={selectedIdx}
              item={selectedItem}
              i={selectedIdx}
              onUpdateItem={patch => updateItem(selectedIdx, patch)}
              onRemove={() => removeItem(selectedIdx)}
              onDeselect={() => setSelectedIdx(null)}
            />
          ) : (
            <BubbleControls
              key={selectedIdx}
              item={selectedItem}
              i={selectedIdx}
              onUpdateItem={patch => updateItem(selectedIdx, patch)}
              onRemove={() => removeItem(selectedIdx)}
              onDeselect={() => setSelectedIdx(null)}
            />
          )
        )}

        {/* Add buttons */}
        {isEditMode && (
          <div className={`flex justify-center gap-3 flex-wrap ${selectedIdx !== null ? 'mt-4' : 'mt-8'}`}>
            <button onClick={() => addItem('text')}
              className="border border-dashed border-accent/30 px-5 py-2.5 rounded-full text-accent hover:bg-accent-dim transition-colors text-sm flex items-center gap-2">
              <MessageSquare size={14} /> Text Bubble
            </button>
            <button onClick={() => addItem('image')}
              className="border border-dashed border-accent/25 px-5 py-2.5 rounded-full text-accent/70 hover:text-accent hover:border-accent/50 hover:bg-accent-dim transition-colors text-sm flex items-center gap-2">
              <ImageIcon size={14} /> Photo Card
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
