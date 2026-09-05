import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Shape, Point } from '../types';

interface CanvasProps {
  shapes: Shape[];
  preview: Shape | null;
  zoom: number;
  panOffset: Point;
  editingShapeId: string | null;
  updateShapeText: (id: string, text: string) => void;
  stopEditing: () => void;
  selectedShapeId: string | null;
  tool: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: () => void;
  boardRef: RefObject<HTMLDivElement | null>;
  toolCursor: string;
}

// Precise fit-to-content text width calculator
function getTextWidth(text: string, fontSize: number): number {
  if (!text || text.length === 0) return 30;
  let width = 0;
  for (const char of text) {
    if ('ijlI1|!,.:; '.includes(char)) {
      width += fontSize * 0.28;
    } else if ('fkt-()[]{}'.includes(char)) {
      width += fontSize * 0.38;
    } else if ('mwMW_@#%&'.includes(char)) {
      width += fontSize * 0.78;
    } else if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      width += fontSize * 0.62;
    } else {
      width += fontSize * 0.52;
    }
  }
  return width;
}

// Bounding box calculator for shapes (fit-to-content)
function getBoundingBox(shape: Shape): { x: number; y: number; width: number; height: number } {
  if (shape.kind === 'text') {
    const fSize = shape.fontSize || 24;
    const computedWidth = getTextWidth(shape.text || 'Text', fSize);
    return {
      x: shape.start.x - 4,
      y: shape.start.y - fSize * 0.9,
      width: Math.max(computedWidth + 8, 28),
      height: fSize * 1.15,
    };
  }

  if (shape.kind === 'draw' && shape.points && shape.points.length > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of shape.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return {
      x: minX - 6,
      y: minY - 6,
      width: Math.max(maxX - minX + 12, 16),
      height: Math.max(maxY - minY + 12, 16),
    };
  }

  const minX = Math.min(shape.start.x, shape.end.x);
  const minY = Math.min(shape.start.y, shape.end.y);
  const maxX = Math.max(shape.start.x, shape.end.x);
  const maxY = Math.max(shape.start.y, shape.end.y);

  return {
    x: minX - 6,
    y: minY - 6,
    width: Math.max(maxX - minX + 12, 16),
    height: Math.max(maxY - minY + 12, 16),
  };
}

function renderShape(shape: Shape, isSelected: boolean, isEditing: boolean) {
  if (shape.kind === 'text') {
    return (
      <g key={shape.id}>
        {/* Hide SVG text while editing to prevent double text rendering */}
        <text
          data-id={shape.id}
          className="sketch-shape"
          x={shape.start.x}
          y={shape.start.y}
          fill={shape.color}
          fontFamily={shape.fontFamily || 'Poppins'}
          fontSize={shape.fontSize || 24}
          style={{ userSelect: 'none', cursor: 'move', opacity: isEditing ? 0 : 1 }}
        >
          {shape.text}
        </text>
        {isSelected && renderSelectionBox(shape)}
      </g>
    );
  }

  const common = {
    'data-id': shape.id,
    className: 'sketch-shape',
    stroke: shape.color,
    strokeWidth: shape.width,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { cursor: 'move' },
  };

  const hitArea = {
    'data-id': shape.id,
    stroke: 'transparent',
    strokeWidth: Math.max(shape.width, 16),
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { cursor: 'move' },
  };

  const dx = shape.end.x - shape.start.x;
  const dy = shape.end.y - shape.start.y;

  let elem: React.ReactNode = null;

  switch (shape.kind) {
    case 'draw':
      elem = (
        <>
          <path {...hitArea} d={`M ${shape.points!.map((p) => `${p.x} ${p.y}`).join(' L ')}`} />
          <path {...common} d={`M ${shape.points!.map((p) => `${p.x} ${p.y}`).join(' L ')}`} />
        </>
      );
      break;
    case 'rectangle':
      elem = (
        <>
          <rect
            {...hitArea}
            x={Math.min(shape.start.x, shape.end.x)}
            y={Math.min(shape.start.y, shape.end.y)}
            width={Math.abs(dx)}
            height={Math.abs(dy)}
            rx={6}
          />
          <rect
            {...common}
            x={Math.min(shape.start.x, shape.end.x)}
            y={Math.min(shape.start.y, shape.end.y)}
            width={Math.abs(dx)}
            height={Math.abs(dy)}
            rx={6}
          />
        </>
      );
      break;
    case 'ellipse':
      elem = (
        <>
          <ellipse
            {...hitArea}
            cx={(shape.start.x + shape.end.x) / 2}
            cy={(shape.start.y + shape.end.y) / 2}
            rx={Math.abs(dx) / 2}
            ry={Math.abs(dy) / 2}
          />
          <ellipse
            {...common}
            cx={(shape.start.x + shape.end.x) / 2}
            cy={(shape.start.y + shape.end.y) / 2}
            rx={Math.abs(dx) / 2}
            ry={Math.abs(dy) / 2}
          />
        </>
      );
      break;
    case 'diamond':
      {
        const midX = (shape.start.x + shape.end.x) / 2;
        const midY = (shape.start.y + shape.end.y) / 2;
        const minX = Math.min(shape.start.x, shape.end.x);
        const maxX = Math.max(shape.start.x, shape.end.x);
        const minY = Math.min(shape.start.y, shape.end.y);
        const maxY = Math.max(shape.start.y, shape.end.y);
        const pointsStr = `${midX},${minY} ${maxX},${midY} ${midX},${maxY} ${minX},${midY}`;
        elem = (
          <>
            <polygon {...hitArea} points={pointsStr} />
            <polygon {...common} points={pointsStr} />
          </>
        );
      }
      break;
    case 'arrow':
      elem = (
        <>
          <line
            {...hitArea}
            x1={shape.start.x}
            y1={shape.start.y}
            x2={shape.end.x}
            y2={shape.end.y}
          />
          <line
            {...common}
            x1={shape.start.x}
            y1={shape.start.y}
            x2={shape.end.x}
            y2={shape.end.y}
            markerEnd="url(#arrowhead)"
          />
        </>
      );
      break;
  }

  // Render centered text label inside rectangle/ellipse/diamond if specified
  const labelX = (shape.start.x + shape.end.x) / 2;
  const labelY = (shape.start.y + shape.end.y) / 2;

  return (
    <g key={shape.id}>
      {elem}
      {shape.text && (
        <text
          x={labelX}
          y={labelY}
          fill={shape.color}
          fontSize={shape.fontSize || 13}
          fontFamily={shape.fontFamily || 'Poppins'}
          fontWeight="500"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {shape.text}
        </text>
      )}
      {isSelected && renderSelectionBox(shape)}
    </g>
  );
}

function renderSelectionBox(shape: Shape) {
  const box = getBoundingBox(shape);
  const handleSize = 10;
  const hs = handleSize / 2;
  const midX = box.x + box.width / 2;
  const midY = box.y + box.height / 2;
  const themeColor = '#705df2';

  return (
    <g className="selection-overlay" pointerEvents="all">
      {/* Bounding Box Border */}
      <rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        fill="none"
        stroke={themeColor}
        strokeWidth="1.8"
        rx="4"
        pointerEvents="none"
      />

      {/* Top Rotation Circle Line & Handle */}
      <line
        x1={midX}
        y1={box.y}
        x2={midX}
        y2={box.y - 16}
        stroke={themeColor}
        strokeWidth="1.5"
        pointerEvents="none"
      />
      <circle
        data-handle="rotate"
        cx={midX}
        cy={box.y - 20}
        r="6"
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        style={{ cursor: 'grab' }}
      />

      {/* 4 Corner Resize Handles */}
      <rect
        data-handle="resize-nw"
        x={box.x - hs}
        y={box.y - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'nwse-resize' }}
      />
      <rect
        data-handle="resize-ne"
        x={box.x + box.width - hs}
        y={box.y - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'nesw-resize' }}
      />
      <rect
        data-handle="resize-se"
        x={box.x + box.width - hs}
        y={box.y + box.height - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'nwse-resize' }}
      />
      <rect
        data-handle="resize-sw"
        x={box.x - hs}
        y={box.y + box.height - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'nesw-resize' }}
      />

      {/* 4 Side Middle Handles */}
      <rect
        data-handle="resize-n"
        x={midX - hs}
        y={box.y - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'ns-resize' }}
      />
      <rect
        data-handle="resize-s"
        x={midX - hs}
        y={box.y + box.height - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'ns-resize' }}
      />
      <rect
        data-handle="resize-w"
        x={box.x - hs}
        y={midY - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'ew-resize' }}
      />
      <rect
        data-handle="resize-e"
        x={box.x + box.width - hs}
        y={midY - hs}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke={themeColor}
        strokeWidth="2"
        rx="3"
        style={{ cursor: 'ew-resize' }}
      />
    </g>
  );
}

// Svg Inline Transparent Text Input (Direct Canvas SVG coordinates)
function SvgInlineTextInput({
  shape,
  updateShapeText,
  stopEditing,
}: {
  shape: Shape;
  updateShapeText: (id: string, text: string) => void;
  stopEditing: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 20);
  }, []);

  const fSize = shape.fontSize || 24;
  const computedWidth = getTextWidth(shape.text || '', fSize);
  const inputWidth = Math.max(computedWidth + 40, 80);

  return (
    <foreignObject
      x={shape.start.x - 4}
      y={shape.start.y - fSize}
      width={inputWidth}
      height={fSize * 1.5}
      style={{ overflow: 'visible' }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="text"
        value={shape.text || ''}
        autoFocus
        onChange={(e) => updateShapeText(shape.id, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            stopEditing();
          }
          e.stopPropagation();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: 0,
          margin: 0,
          fontFamily: shape.fontFamily || 'Poppins',
          fontSize: `${fSize}px`,
          color: shape.color || '#2d2a26',
          fontWeight: 600,
          width: '100%',
          height: '100%',
          caretColor: '#705df2',
        }}
      />
    </foreignObject>
  );
}

export default function Canvas({
  shapes,
  preview,
  zoom,
  panOffset,
  editingShapeId,
  updateShapeText,
  stopEditing,
  selectedShapeId,
  tool,
  fontFamily,
  fontSize,
  color,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  boardRef,
  toolCursor,
}: CanvasProps) {
  const editingShape = shapes.find((s) => s.id === editingShapeId);

  return (
    <div
      className={`board ${toolCursor}`}
      id="board"
      ref={boardRef}
      style={{
        backgroundPosition: `${panOffset.x * zoom}px ${panOffset.y * zoom}px`,
      }}
    >
      <div className="canvas-glow" />
      <svg
        id="canvas"
        viewBox="0 0 1200 700"
        aria-label="Drawing canvas"
        role="img"
        style={{ transform: `scale(${zoom})` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#2d2a26" />
          </marker>
        </defs>

        <g id="shapes" transform={`translate(${panOffset.x}, ${panOffset.y})`}>
          {shapes.map((s) => renderShape(s, s.id === selectedShapeId, s.id === editingShapeId))}
          {editingShape && (
            <SvgInlineTextInput
              shape={editingShape}
              updateShapeText={updateShapeText}
              stopEditing={stopEditing}
            />
          )}
        </g>

        <g id="preview" transform={`translate(${panOffset.x}, ${panOffset.y})`}>
          {preview && renderShape(preview, false, false)}
        </g>
      </svg>
    </div>
  );
}
