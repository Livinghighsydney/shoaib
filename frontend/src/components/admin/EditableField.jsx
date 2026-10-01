import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Link, Check } from 'lucide-react';

/* ─── EditableText ─────────────────────────────────────────────────────────── */
export function EditableText({ value, onSave, as: Tag = 'span', className = '', style = {}, multiline = false }) {
  const { isEditMode } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef();

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (!isEditMode) return <Tag className={className} style={style}>{value}</Tag>;

  if (editing) {
    const cls = `bg-transparent border-b border-accent text-inherit w-full focus:outline-none resize-none ${className}`;
    const save = () => { setEditing(false); if (draft !== value) onSave(draft); };
    const key = (e) => {
      if (!multiline && e.key === 'Enter') { e.preventDefault(); ref.current?.blur(); }
      if (e.key === 'Escape') { setDraft(value); setEditing(false); }
    };
    return multiline
      ? <textarea ref={ref} value={draft} rows={4} onChange={e => setDraft(e.target.value)} onBlur={save} onKeyDown={key} className={cls} style={style} />
      : <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save} onKeyDown={key} className={cls} style={style} />;
  }

  return (
    <Tag className={`admin-editable cursor-text group relative ${className}`} style={style} onClick={() => setEditing(true)} title="Click to edit">
      {value || <span className="text-accent/50 italic text-xs">click to edit</span>}
      <span className="absolute -top-5 right-0 text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-black/60 px-1 rounded">
        ✏ edit
      </span>
    </Tag>
  );
}

/* ─── EditableImage ────────────────────────────────────────────────────────── */
export function EditableImage({ src, onUpload, className = '', alt = '' }) {
  const { isEditMode } = useAuth();
  const fileRef = useRef();

  if (!isEditMode) return <img src={src} alt={alt} className={className} />;

  return (
    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
      <img src={src} alt={alt} className={className} />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
        <span className="text-white text-sm font-medium">📷 Change Image</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) onUpload(f); }} className="hidden" />
    </div>
  );
}

/* ─── EditableURL ──────────────────────────────────────────────────────────── */
/* Renders children normally; in edit mode shows a small "Edit URL" button.
   onSaveHref(newUrl) is called when the user confirms. */
export function EditableURL({ href, onSaveHref, children, className = '' }) {
  const { isEditMode } = useAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(href);
  const ref = useRef();

  useEffect(() => { setDraft(href); }, [href]);
  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);

  /* Open in new tab for everything except same-page anchors and /admin */
  const newTab = href && !href.startsWith('#') && href !== '/admin' && href !== '/';
  const extProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  if (!isEditMode) return <a href={href} className={className} {...extProps}>{children}</a>;

  return (
    <div className="relative group">
      <a href={href} className={className} {...extProps}>{children}</a>
      {!open && (
        <button
          onClick={e => { e.preventDefault(); setOpen(true); }}
          className="absolute -top-6 right-0 flex items-center gap-1 text-[10px] text-accent bg-black/70 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
          title="Edit URL"
        >
          <Link size={10} /> Edit URL
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a1a] border border-accent/40 rounded p-2 shadow-xl flex items-center gap-2 min-w-[280px]">
          <input
            ref={ref}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { onSaveHref(draft); setOpen(false); }
              if (e.key === 'Escape') { setDraft(href); setOpen(false); }
            }}
            className="flex-1 bg-transparent text-white text-xs border-b border-accent focus:outline-none"
            placeholder="https://..."
          />
          <button onClick={() => { onSaveHref(draft); setOpen(false); }} className="text-accent hover:text-white transition-colors">
            <Check size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── EditableList ─────────────────────────────────────────────────────────── */
export function EditableList({ items, onSave, renderItem, newItemTemplate, className = '' }) {
  const { isEditMode } = useAuth();
  const addItem = () => onSave([...items, { ...newItemTemplate, id: Date.now() }]);
  const removeItem = (id) => onSave(items.filter(i => i.id !== id));
  const updateItem = (id, updated) => onSave(items.map(i => i.id === id ? updated : i));

  return (
    <div className={className}>
      {items.map(item => (
        <div key={item.id} className="relative group">
          {renderItem(item, (updated) => updateItem(item.id, updated))}
          {isEditMode && (
            <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 w-6 h-6 bg-accent text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">×</button>
          )}
        </div>
      ))}
      {isEditMode && (
        <button onClick={addItem} className="mt-4 text-sm text-accent border border-dashed border-accent/40 px-4 py-2 rounded hover:bg-accent-dim transition-colors w-full">
          + Add Item
        </button>
      )}
    </div>
  );
}

/* ─── EditableChips ────────────────────────────────────────────────────────── */
/* For a flat string[] like contact project types */
export function EditableChips({ items, onSave, selectedItem, onSelect, chipClassName, activeChipClassName }) {
  const { isEditMode } = useAuth();
  const [editIdx, setEditIdx] = useState(null);
  const [draft, setDraft] = useState('');
  const ref = useRef();

  useEffect(() => { if (editIdx !== null && ref.current) ref.current.focus(); }, [editIdx]);

  const save = (idx) => {
    if (!draft.trim()) return;
    const next = [...items];
    next[idx] = draft.trim();
    onSave(next);
    setEditIdx(null);
  };

  const remove = (idx) => onSave(items.filter((_, i) => i !== idx));
  const add = () => { onSave([...items, 'New Type']); setEditIdx(items.length); setDraft('New Type'); };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <div key={i} className="relative group">
          {isEditMode && editIdx === i ? (
            <input
              ref={ref}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={() => save(i)}
              onKeyDown={e => { if (e.key === 'Enter') save(i); if (e.key === 'Escape') setEditIdx(null); }}
              className="text-sm px-4 py-2 rounded-full border border-accent bg-transparent text-inherit focus:outline-none"
              style={{ minWidth: `${Math.max(item.length, 8)}ch` }}
            />
          ) : (
            <button
              onClick={() => { if (isEditMode) { setEditIdx(i); setDraft(item); } else onSelect?.(item); }}
              className={selectedItem === item ? activeChipClassName : chipClassName}
            >
              {item}
            </button>
          )}
          {isEditMode && editIdx !== i && (
            <button onClick={() => remove(i)} className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">×</button>
          )}
        </div>
      ))}
      {isEditMode && (
        <button onClick={add} className="flex items-center gap-1 text-sm px-3 py-2 rounded-full border border-dashed border-accent/40 text-accent hover:bg-accent-dim transition-colors">
          <Plus size={12} /> Add
        </button>
      )}
    </div>
  );
}

/* ─── EditableLinkList ─────────────────────────────────────────────────────── */
/* For footer / navbar link arrays: [{label, href}] */
export function EditableLinkList({ links, onSave, renderLink, className = '' }) {
  const { isEditMode } = useAuth();

  const update = (i, field, val) => {
    const next = links.map((l, idx) => idx === i ? { ...l, [field]: val } : l);
    onSave(next);
  };
  const remove = (i) => onSave(links.filter((_, idx) => idx !== i));
  const add = () => onSave([...links, { label: 'New Link', href: '#' }]);

  if (!isEditMode) return <div className={className}>{links.map((l, i) => <div key={i}>{renderLink(l, i)}</div>)}</div>;

  return (
    <div className={className}>
      {links.map((link, i) => (
        <div key={i} className="group relative flex items-start gap-2 py-1">
          <div className="flex-1 space-y-1">
            <EditableText value={link.label} onSave={v => update(i, 'label', v)} as="span" className="block text-sm" />
            <EditableText value={link.href} onSave={v => update(i, 'href', v)} as="span" className="block text-[10px] text-accent/60" />
          </div>
          <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <Trash2 size={12} className="text-accent" />
          </button>
        </div>
      ))}
      <button onClick={add} className="mt-2 flex items-center gap-1 text-xs text-accent border border-dashed border-accent/40 px-3 py-1.5 rounded hover:bg-accent-dim transition-colors">
        <Plus size={12} /> Add Link
      </button>
    </div>
  );
}
