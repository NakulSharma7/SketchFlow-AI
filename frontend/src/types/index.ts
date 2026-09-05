export type Tool = 'select' | 'hand' | 'draw' | 'rectangle' | 'ellipse' | 'diamond' | 'arrow' | 'eraser' | 'text';

export type Point = { x: number; y: number };

export type Shape = {
  id: string;
  kind: 'draw' | 'rectangle' | 'ellipse' | 'diamond' | 'arrow' | 'text';
  start: Point;
  end: Point;
  points?: Point[];
  color: string;
  width: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
};

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  elements?: Shape[];
}
