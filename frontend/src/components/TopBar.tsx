import { Link } from 'react-router-dom';

interface TopBarProps {
  boardName: string;
  onBoardNameChange: (name: string) => void;
  onSave: () => void;
  onExport: () => void;
  onOpenAiModal: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export default function TopBar({
  boardName,
  onBoardNameChange,
  onSave,
  onExport,
  onOpenAiModal,
  isSaving,
  hasUnsavedChanges,
}: TopBarProps) {
  return (
    <header className="topbar">
      <Link className="brand" to="/dashboard" aria-label="Back to Dashboard">
        <span className="brand-mark">⚡</span>
        <span>sketchflow</span>
      </Link>

      <div className="file-title">
        <span className={`cloud-dot ${hasUnsavedChanges ? 'bg-amber-400' : 'bg-emerald-500'}`} />
        <input
          value={boardName}
          onChange={(e) => onBoardNameChange(e.target.value)}
          aria-label="Board title"
          placeholder="Untitled Whiteboard"
        />
        <span className="saved">
          {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'Saved to PostgreSQL'}
        </span>
      </div>

      <div className="top-actions">
        <button
          className="button border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          onClick={onOpenAiModal}
          title="Generate flowchart or architecture with AI"
        >
          <span>✨</span>
          <span>AI Diagram</span>
        </button>

        <button
          className="button primary px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
          onClick={onSave}
          disabled={isSaving}
        >
          <span>💾</span>
          <span>{isSaving ? 'Saving...' : 'Save Board'}</span>
        </button>

        <button
          className="button ghost text-xs px-3 py-1.5 rounded-xl cursor-pointer"
          title="Export SVG"
          onClick={onExport}
        >
          <span>⇩</span> Export
        </button>
      </div>
    </header>
  );
}
