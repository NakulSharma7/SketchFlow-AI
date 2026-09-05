import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import TopBar from '../components/TopBar';
import StylePanel from '../components/StylePanel';
import { api } from '../services/api';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const {
    shapes, tool, setTool, color, setColor,
    strokeWidth, setStrokeWidth, fontFamily, setFontFamily,
    fontSize, setFontSize, zoom, changeZoom, panOffset,
    preview, editingShapeId, updateShapeText, stopEditing,
    selectedShapeId, handlePointerDown, handlePointerMove,
    handlePointerUp, boardRef, undo, clearAll, loadElements, addElements,
  } = useCanvas();

  const [boardName, setBoardName] = useState('Untitled Whiteboard');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [showStarter, setShowStarter] = useState(true);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Create a login flowchart');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // 1. Fetch saved board on mount (GET /boards/:id -> Prisma -> PostgreSQL)
  useEffect(() => {
    async function loadBoard() {
      if (!boardId) return;
      try {
        setIsLoadingBoard(true);
        const board = await api.getBoardById(boardId);
        setBoardName(board.title || 'Untitled Whiteboard');
        if (board.elements && Array.isArray(board.elements)) {
          loadElements(board.elements);
          if (board.elements.length > 0) setShowStarter(false);
        }
      } catch (err: any) {
        console.error('Failed to load board:', err);
      } finally {
        setIsLoadingBoard(false);
      }
    }
    loadBoard();
  }, [boardId]);

  // Track canvas changes
  useEffect(() => {
    if (!isLoadingBoard) {
      setHasUnsavedChanges(true);
      if (shapes.length > 0) setShowStarter(false);
    }
  }, [shapes, boardName]);

  // 2. Save Drawing (PUT /boards/:id -> Prisma -> PostgreSQL)
  const handleSaveBoard = useCallback(async () => {
    if (!boardId) return;
    try {
      setIsSaving(true);
      await api.updateBoard(boardId, {
        title: boardName,
        elements: shapes,
      });
      setHasUnsavedChanges(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save whiteboard');
    } finally {
      setIsSaving(false);
    }
  }, [boardId, boardName, shapes]);

  // 3. AI Diagram Generation (POST /ai/generate -> Gemini API -> Structured JSON)
  const handleGenerateAiDiagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    try {
      setIsGeneratingAi(true);
      setAiError('');
      const res = await api.generateAiDiagram(aiPrompt.trim());

      if (res.elements && res.elements.length > 0) {
        addElements(res.elements);
        setIsAiModalOpen(false);
        setShowStarter(false);
        setHasUnsavedChanges(true);
      } else {
        setAiError('No diagram elements were returned. Please try another prompt.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate diagram. Please check server logs.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveBoard();
      }
      const toolKeys = ['select', 'hand', 'draw', 'rectangle', 'ellipse', 'diamond', 'arrow', 'eraser', 'text'] as const;
      const idx = '123456789'.indexOf(e.key);
      if (idx !== -1 && document.activeElement?.tagName !== 'INPUT') {
        setTool(toolKeys[idx]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, setTool, handleSaveBoard]);

  const handleExport = useCallback(() => {
    const svg = document.querySelector('#canvas');
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${boardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [boardName]);

  const toolCursor =
    tool === 'select' ? 'tool-select' :
    tool === 'hand' ? 'tool-hand' :
    tool === 'eraser' ? 'tool-eraser' :
    tool === 'text' ? 'tool-text' :
    `tool-${tool}`;

  if (isLoadingBoard) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-[#475569]">Loading Whiteboard from Database...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="studio">
      <TopBar
        boardName={boardName}
        onBoardNameChange={setBoardName}
        onSave={handleSaveBoard}
        onExport={handleExport}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <section className="board-wrap">
        <Toolbar activeTool={tool} onToolChange={setTool} />

        <Canvas
          shapes={shapes}
          preview={preview}
          zoom={zoom}
          panOffset={panOffset}
          editingShapeId={editingShapeId}
          updateShapeText={updateShapeText}
          stopEditing={stopEditing}
          selectedShapeId={selectedShapeId}
          tool={tool}
          fontFamily={fontFamily}
          fontSize={fontSize}
          color={color}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          boardRef={boardRef}
          toolCursor={toolCursor}
        />

        {showStarter && (
          <div className="starter-card" id="starter">
            <span className="spark">✦</span>
            <b>Interactive Whiteboard Ready</b>
            <p>Use tools to draw or click <strong>✨ AI Diagram</strong> to auto-generate flowcharts.</p>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-3 py-1 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                ✨ Try AI Generator
              </button>
              <button
                onClick={() => setShowStarter(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <StylePanel
          color={color}
          strokeWidth={strokeWidth}
          fontFamily={fontFamily}
          fontSize={fontSize}
          onColorChange={setColor}
          onWidthChange={setStrokeWidth}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          onClear={clearAll}
        />

        <div className="zoom">
          <button onClick={() => changeZoom(-0.1)} aria-label="Zoom out">−</button>
          <span id="zoomLevel">{Math.round(zoom * 100)}%</span>
          <button onClick={() => changeZoom(0.1)} aria-label="Zoom in">+</button>
        </div>

        <div className="hint">
          <kbd>Ctrl/⌘</kbd> + <kbd>S</kbd> save | <kbd>Ctrl/⌘</kbd> + <kbd>Z</kbd> undo
        </div>
      </section>

      {/* AI Diagram Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2ddd5] space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-bold text-[#1e293b]">Generate AI Diagram</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748b]">
              Describe any process, flowchart, microservice architecture, or sequence chart. Gemini AI will structure and render nodes on your canvas.
            </p>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {aiError}
              </div>
            )}

            <form onSubmit={handleGenerateAiDiagram} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                  Diagram Prompt
                </label>
                <textarea
                  required
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create a login flowchart with email validation and JWT token issuance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm text-[#1e293b]"
                />
              </div>

              {/* Quick Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#64748b] uppercase">Quick Examples:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Create a login flowchart',
                    'Express API request lifecycle',
                    'User signup & database flow',
                    'Payment gateway sequence',
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setAiPrompt(sample)}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Generating Nodes...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Generate Diagram</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
