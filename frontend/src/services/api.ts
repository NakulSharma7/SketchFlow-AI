import { Shape, User, Board } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('sketchflow_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth APIs
  async register(email: string, password: string, name?: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  // Board APIs
  async getBoards(): Promise<Board[]> {
    const res = await fetch(`${API_BASE}/boards`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch boards');
    return data;
  },

  async createBoard(title?: string): Promise<Board> {
    const res = await fetch(`${API_BASE}/boards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create board');
    return data;
  },

  async getBoardById(id: string): Promise<Board> {
    const res = await fetch(`${API_BASE}/boards/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch board');
    return data;
  },

  async updateBoard(id: string, payload: { title?: string; elements?: Shape[] }): Promise<Board> {
    const res = await fetch(`${API_BASE}/boards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save board');
    return data;
  },

  async deleteBoard(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/boards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete board');
    return data;
  },

  // AI Diagram API
  async generateAiDiagram(prompt: string): Promise<{ elements: Shape[]; prompt: string }> {
    const res = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate AI diagram');
    return data;
  },
};
