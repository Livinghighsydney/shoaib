import { useAuth } from '../../context/AuthContext';

export default function AdminBar() {
  const { isAdmin, isEditMode, toggleEditMode, logout } = useAuth();
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-[#1a1a1a] border border-border rounded-full px-5 py-3 shadow-2xl">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-text-secondary text-xs font-medium">Admin Mode</span>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={toggleEditMode}
        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
          isEditMode
            ? 'bg-accent text-white'
            : 'bg-card text-text-secondary hover:text-white'
        }`}
      >
        {isEditMode ? '✏️ Editing' : 'Edit Mode'}
      </button>
      <button
        onClick={logout}
        className="text-xs text-text-muted hover:text-white transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
