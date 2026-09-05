import { useState, useCallback, useRef, useEffect } from 'react';
import { Tool, Point, Shape } from '../types';

// Distance from point p to line segment v -> w
function distToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

// Ultra-fast geometric hit test for eraser
function isShapeHitByEraser(shape: Shape, p: Point, r: number = 18): boolean {
  if (shape.kind === 'draw' && shape.points && shape.points.length > 0) {
    if (shape.points.length === 1) {
      return Math.hypot(p.x - shape.points[0].x, p.y - shape.points[0].y) <= r + shape.width / 2;
    }
    for (let i = 0; i < shape.points.length - 1; i++) {
      if (distToSegment(p, shape.points[i], shape.points[i + 1]) <= r + shape.width / 2) {
        return true;
      }
    }
    return false;
  }

  if (shape.kind === 'arrow') {
    return distToSegment(p, shape.start, shape.end) <= r + shape.width / 2;
  }

  if (shape.kind === 'rectangle' || shape.kind === 'diamond') {
    const minX = Math.min(shape.start.x, shape.end.x);
    const maxX = Math.max(shape.start.x, shape.end.x);
    const minY = Math.min(shape.start.y, shape.end.y);
    const maxY = Math.max(shape.start.y, shape.end.y);
    const top = distToSegment(p, { x: minX, y: minY }, { x: maxX, y: minY });
    const right = distToSegment(p, { x: maxX, y: minY }, { x: maxX, y: maxY });
    const bottom = distToSegment(p, { x: minX, y: maxY }, { x: maxX, y: maxY });
    const left = distToSegment(p, { x: minX, y: minY }, { x: minX, y: maxY });
    return Math.min(top, right, bottom, left) <= r + shape.width / 2;
  }

  if (shape.kind === 'ellipse') {
    const cx = (shape.start.x + shape.end.x) / 2;
    const cy = (shape.start.y + shape.end.y) / 2;
    const rx = Math.abs(shape.end.x - shape.start.x) / 2;
    const ry = Math.abs(shape.end.y - shape.start.y) / 2;
    if (rx === 0 || ry === 0) return false;
    const normDist = ((p.x - cx) ** 2) / (rx ** 2) + ((p.y - cy) ** 2) / (ry ** 2);
    return Math.abs(Math.sqrt(normDist) - 1) * Math.min(rx, ry) <= r + shape.width / 2;
  }

  if (shape.kind === 'text') {
    const fSize = shape.fontSize || 24;
    const w = Math.max((shape.text?.length || 4) * fSize * 0.55, 30);
    const h = fSize * 1.2;
    const minX = shape.start.x - 4;
    const minY = shape.start.y - fSize;
    return p.x >= minX - r && p.x <= minX + w + r && p.y >= minY - r && p.y <= minY + h + r;
  }

  return false;
}

export function useCanvas() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [tool, setTool] = useState<Tool>('select');
  const [color, setColor] = useState('#2d2a26');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState(24);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

  const drawingRef = useRef<Shape | null>(null);
  const [preview, setPreview] = useState<Shape | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const erasingRef = useRef(false);

  // Hand tool panning state
  const handPanningRef = useRef(false);
  const handStartRef = useRef<Point>({ x: 0, y: 0 });
  const panStartRef = useRef<Point>({ x: 0, y: 0 });

  // Performance refs
  const cachedInverseCtmRef = useRef<DOMMatrix | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingShapeRef = useRef<Shape | null>(null);

  // Selection & Transform state
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);

  const transformActionRef = useRef<{
    type: 'move' | 'resize-nw' | 'resize-n' | 'resize-ne' | 'resize-e' | 'resize-se' | 'resize-s' | 'resize-sw' | 'resize-w' | 'rotate';
    shapeId: string;
    startPoint: Point;
    initialStart: Point;
    initialEnd: Point;
    initialPoints?: Point[];
    initialFontSize?: number;
  } | null>(null);

  // Customizers that also update selected shapes
  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    if (selectedShapeId) {
      setShapes((prev) => prev.map((s) => (s.id === selectedShapeId ? { ...s, color: newColor } : s)));
    }
  }, [selectedShapeId]);

  const handleWidthChange = useCallback((newWidth: number) => {
    setStrokeWidth(newWidth);
    if (selectedShapeId) {
      setShapes((prev) => prev.map((s) => (s.id === selectedShapeId ? { ...s, width: newWidth } : s)));
    }
  }, [selectedShapeId]);

  const handleFontFamilyChange = useCallback((newFont: string) => {
    setFontFamily(newFont);
    if (selectedShapeId) {
      setShapes((prev) => prev.map((s) => (s.id === selectedShapeId ? { ...s, fontFamily: newFont } : s)));
    }
  }, [selectedShapeId]);

  const handleFontSizeChange = useCallback((newSize: number) => {
    setFontSize(newSize);
    if (selectedShapeId) {
      setShapes((prev) => prev.map((s) => (s.id === selectedShapeId ? { ...s, fontSize: newSize } : s)));
    }
  }, [selectedShapeId]);

  // Fast SVG coordinate calculation using cached matrix (0 DOM reflows)
  const getPointFast = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, svg: SVGSVGElement): Point => {
      if (cachedInverseCtmRef.current) {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(cachedInverseCtmRef.current);
        return { x: svgPt.x - panOffset.x, y: svgPt.y - panOffset.y };
      }
      const r = svg.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * 1200 - panOffset.x,
        y: ((e.clientY - r.top) / r.height) * 700 - panOffset.y,
      };
    },
    [panOffset]
  );

  // Smooth, instantaneous geometric eraser
  const eraseAtPoint = useCallback((p: Point) => {
    setShapes((prev) => {
      const remaining = prev.filter((s) => !isShapeHitByEraser(s, p));
      if (remaining.length !== prev.length) {
        return remaining;
      }
      return prev;
    });
  }, []);

  const startTransform = useCallback((
    type: 'move' | 'resize-nw' | 'resize-n' | 'resize-ne' | 'resize-e' | 'resize-se' | 'resize-s' | 'resize-sw' | 'resize-w' | 'rotate',
    shape: Shape,
    startPoint: Point
  ) => {
    transformActionRef.current = {
      type,
      shapeId: shape.id,
      startPoint,
      initialStart: { ...shape.start },
      initialEnd: { ...shape.end },
      initialPoints: shape.points ? shape.points.map((p) => ({ ...p })) : undefined,
      initialFontSize: shape.fontSize || 24,
    };
  }, []);

  const updateShapeText = useCallback((id: string, text: string) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    );
  }, []);

  const stopEditing = useCallback(() => {
    setEditingShapeId(null);
    setTool('select');
    setShapes((prev) => prev.filter((s) => s.kind !== 'text' || (s.text && s.text.trim().length > 0)));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;

      const ctm = svg.getScreenCTM();
      if (ctm) {
        cachedInverseCtmRef.current = ctm.inverse();
      }

      const p = getPointFast(e, svg);
      const target = e.target as SVGElement;

      if (editingShapeId) {
        stopEditing();
      }

      // Hand tool: manual drag canvas left / right / up / down
      if (tool === 'hand') {
        svg.setPointerCapture(e.pointerId);
        handPanningRef.current = true;
        handStartRef.current = { x: e.clientX, y: e.clientY };
        panStartRef.current = { ...panOffset };
        return;
      }

      // Eraser tool: start erasing
      if (tool === 'eraser') {
        svg.setPointerCapture(e.pointerId);
        erasingRef.current = true;
        eraseAtPoint(p);
        return;
      }

      // Check handle click for transform (8 handles + rotation circle)
      const handleType = target.getAttribute('data-handle') as any;
      if (handleType && selectedShapeId) {
        const selShape = shapes.find((s) => s.id === selectedShapeId);
        if (selShape) {
          svg.setPointerCapture(e.pointerId);
          startTransform(handleType, selShape, p);
          return;
        }
      }

      // Direct Inline Text Tool: click to place text directly on canvas
      if (tool === 'text') {
        const newTextShape: Shape = {
          id: crypto.randomUUID(),
          kind: 'text',
          start: p,
          end: p,
          color,
          width: strokeWidth,
          text: 'Text',
          fontFamily,
          fontSize,
        };
        setShapes((prev) => [...prev, newTextShape]);
        setSelectedShapeId(newTextShape.id);
        setEditingShapeId(newTextShape.id);
        return;
      }

      // Select / Arrow tool: select and move shapes
      if (tool === 'select') {
        const shapeEl = target.closest('[data-id]');
        if (shapeEl) {
          const id = shapeEl.getAttribute('data-id')!;
          setSelectedShapeId(id);
          const selShape = shapes.find((s) => s.id === id);
          if (selShape) {
            if (selShape.color) setColor(selShape.color);
            if (selShape.width) setStrokeWidth(selShape.width);
            if (selShape.fontFamily) setFontFamily(selShape.fontFamily);
            if (selShape.fontSize) setFontSize(selShape.fontSize);

            if (selShape.kind === 'text' && e.detail === 2) {
              setEditingShapeId(id);
              return;
            }
            svg.setPointerCapture(e.pointerId);
            startTransform('move', selShape, p);
          }
        } else {
          setSelectedShapeId(null);
          setEditingShapeId(null);
        }
        return;
      }

      // Drawing tools (draw, rectangle, ellipse, arrow)
      svg.setPointerCapture(e.pointerId);
      setSelectedShapeId(null);
      setEditingShapeId(null);
      const newShape: Shape = {
        id: crypto.randomUUID(),
        kind: tool as Shape['kind'],
        start: p,
        end: p,
        points: tool === 'draw' ? [p] : undefined,
        color,
        width: strokeWidth,
      };
      drawingRef.current = newShape;
      setPreview(newShape);
    },
    [tool, color, strokeWidth, fontFamily, fontSize, getPointFast, eraseAtPoint, selectedShapeId, shapes, startTransform, editingShapeId, stopEditing, panOffset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;

      // Eraser dragging: ultra-smooth geometric erasure
      if (tool === 'eraser' && erasingRef.current) {
        const p = getPointFast(e, svg);
        eraseAtPoint(p);
        return;
      }

      // Hand tool manual canvas panning
      if (handPanningRef.current) {
        const dx = e.clientX - handStartRef.current.x;
        const dy = e.clientY - handStartRef.current.y;
        const r = svg.getBoundingClientRect();
        const scaleX = 1200 / r.width;
        const scaleY = 700 / r.height;
        setPanOffset({
          x: panStartRef.current.x + dx * scaleX,
          y: panStartRef.current.y + dy * scaleY,
        });
        return;
      }

      // Transform (Move/Resize shape)
      if (transformActionRef.current) {
        const p = getPointFast(e, svg);
        const action = transformActionRef.current;
        const dx = p.x - action.startPoint.x;
        const dy = p.y - action.startPoint.y;

        setShapes((prev) =>
          prev.map((s) => {
            if (s.id !== action.shapeId) return s;

            if (action.type === 'move') {
              const newStart = { x: action.initialStart.x + dx, y: action.initialStart.y + dy };
              const newEnd = { x: action.initialEnd.x + dx, y: action.initialEnd.y + dy };
              const newPoints = action.initialPoints
                ? action.initialPoints.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }))
                : undefined;
              return { ...s, start: newStart, end: newEnd, points: newPoints };
            }

            if (s.kind === 'text') {
              const initF = action.initialFontSize || 24;
              let scale = 1;
              if (action.type === 'resize-se' || action.type === 'resize-s' || action.type === 'resize-e') {
                scale = 1 + (dx + dy) / 100;
              } else if (action.type === 'resize-nw' || action.type === 'resize-n' || action.type === 'resize-w') {
                scale = 1 - (dx + dy) / 100;
              } else if (action.type === 'resize-ne') {
                scale = 1 + (dx - dy) / 100;
              } else if (action.type === 'resize-sw') {
                scale = 1 + (-dx + dy) / 100;
              }
              const newFontSize = Math.max(12, Math.min(120, Math.round(initF * scale)));
              setFontSize(newFontSize);
              return { ...s, fontSize: newFontSize };
            }

            if (action.type === 'resize-n') {
              return { ...s, start: { ...s.start, y: action.initialStart.y + dy } };
            }

            if (action.type === 'resize-s') {
              return { ...s, end: { ...s.end, y: action.initialEnd.y + dy } };
            }

            if (action.type === 'resize-w') {
              return { ...s, start: { ...s.start, x: action.initialStart.x + dx } };
            }

            if (action.type === 'resize-e') {
              return { ...s, end: { ...s.end, x: action.initialEnd.x + dx } };
            }

            if (action.type === 'resize-se') {
              return { ...s, end: { x: action.initialEnd.x + dx, y: action.initialEnd.y + dy } };
            }

            if (action.type === 'resize-nw') {
              return { ...s, start: { x: action.initialStart.x + dx, y: action.initialStart.y + dy } };
            }

            if (action.type === 'resize-ne') {
              return {
                ...s,
                start: { ...s.start, y: action.initialStart.y + dy },
                end: { ...s.end, x: action.initialEnd.x + dx },
              };
            }

            if (action.type === 'resize-sw') {
              return {
                ...s,
                start: { ...s.start, x: action.initialStart.x + dx },
                end: { ...s.end, y: action.initialEnd.y + dy },
              };
            }

            return s;
          })
        );
        return;
      }

      // Drawing shape preview optimization
      if (!drawingRef.current) return;
      const p = getPointFast(e, svg);
      const current = drawingRef.current;
      const updated = { ...current, end: p };

      if (updated.points && updated.points.length > 0) {
        const lastPt = updated.points[updated.points.length - 1];
        const distSq = (p.x - lastPt.x) ** 2 + (p.y - lastPt.y) ** 2;
        if (distSq > 6) {
          updated.points = [...updated.points, p];
        }
      }

      drawingRef.current = updated;
      pendingShapeRef.current = updated;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (pendingShapeRef.current) {
            setPreview(pendingShapeRef.current);
          }
        });
      }
    },
    [getPointFast, eraseAtPoint, tool]
  );

  const handlePointerUp = useCallback(() => {
    cachedInverseCtmRef.current = null;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (handPanningRef.current) {
      handPanningRef.current = false;
      return;
    }

    if (transformActionRef.current) {
      transformActionRef.current = null;
      return;
    }
    if (erasingRef.current) {
      erasingRef.current = false;
      return;
    }

    const shape = drawingRef.current;
    drawingRef.current = null;
    pendingShapeRef.current = null;
    setPreview(null);
    if (!shape) return;
    const dx = Math.abs(shape.end.x - shape.start.x);
    const dy = Math.abs(shape.end.y - shape.start.y);
    if (dx + dy > 5 || (shape.kind === 'draw' && shape.points && shape.points.length > 1)) {
      setShapes((prev) => [...prev, shape]);
      setSelectedShapeId(shape.id);
    }
  }, []);

  // Keyboard Delete key to delete selected shape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        setShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
        setSelectedShapeId(null);
        setEditingShapeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId]);

  const undo = useCallback(() => {
    setShapes((prev) => prev.slice(0, -1));
    setSelectedShapeId(null);
    setEditingShapeId(null);
  }, []);

  const clearAll = useCallback(() => {
    setShapes([]);
    setSelectedShapeId(null);
    setEditingShapeId(null);
  }, []);

  // Manual zoom in and zoom out controls
  const changeZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(0.4, Math.min(2.0, Math.round((prev + delta) * 100) / 100)));
  }, []);

  return {
    shapes,
    tool,
    setTool,
    color,
    setColor: handleColorChange,
    strokeWidth,
    setStrokeWidth: handleWidthChange,
    fontFamily,
    setFontFamily: handleFontFamilyChange,
    fontSize,
    setFontSize: handleFontSizeChange,
    zoom,
    changeZoom,
    panOffset,
    preview,
    editingShapeId,
    updateShapeText,
    stopEditing,
    selectedShapeId,
    setSelectedShapeId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    boardRef,
    undo,
    clearAll,
    setShapes,
    loadElements: (newShapes: Shape[]) => setShapes(newShapes),
    addElements: (newShapes: Shape[]) => setShapes((prev) => [...prev, ...newShapes]),
  };
}
