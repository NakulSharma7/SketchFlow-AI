import { Fragment, type ReactNode } from 'react';
import type { Tool } from '../types';

interface ToolItem {
  id: Tool;
  label: string;
  icon: ReactNode;
  shortcut?: string;
}

const tools: ToolItem[] = [
  {
    id: 'select',
    label: 'Select / Move',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3l13 10-6.2 1.4 3.7 6.6-2.6 1.4-3.7-6.6L4 20V3z" />
      </svg>
    ),
    shortcut: '1',
  },
  {
    id: 'hand',
    label: 'Hand (Pan Canvas)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-4 0v5" />
        <path d="M14 10V4a2 2 0 0 0-4 0v6" />
        <path d="M10 10.5V6a2 2 0 0 0-4 0v9" />
        <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.8-6.4-2.8L2 14" />
      </svg>
    ),
    shortcut: '2',
  },
  {
    id: 'draw',
    label: 'Free draw',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    shortcut: '3',
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    shortcut: '4',
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    shortcut: '5',
  },
  {
    id: 'diamond',
    label: 'Decision Diamond',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 22 12 12 22 2 12" />
      </svg>
    ),
    shortcut: '6',
  },
  {
    id: 'arrow',
    label: 'Arrow line',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="19" x2="19" y2="5" />
        <polyline points="12 5 19 5 19 12" />
      </svg>
    ),
    shortcut: '7',
  },
  {
    id: 'eraser',
    label: 'Eraser',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l12-12a1 1 0 0 1 1.4 0l4.3 4.3a1 1 0 0 1 0 1.4L8.4 21" />
        <path d="M22 21H7" />
        <path d="m5 11 6 6" />
      </svg>
    ),
    shortcut: '8',
  },
  {
    id: 'text',
    label: 'Text',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="9" y1="20" x2="15" y2="20" />
      </svg>
    ),
    shortcut: '9',
  },
];

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export default function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  return (
    <div className="tool-rail" role="toolbar" aria-label="Drawing tools">
      {tools.map((t, i) => (
        <Fragment key={t.id}>
          {i === 2 && <div className="rail-divider" />}
          {i === 8 && <div className="rail-divider" />}
          <button
            className={`tool ${activeTool === t.id ? 'active' : ''}`}
            data-tool={t.id}
            title={t.label}
            aria-label={t.label}
            onClick={() => onToolChange(t.id)}
          >
            {t.icon}
            {t.shortcut && <span className="shortcut">{t.shortcut}</span>}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
