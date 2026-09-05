import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Board } from '../types';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await api.getBoards();
      setBoards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const newBoard = await api.createBoard(newTitle || 'Untitled Whiteboard');
      navigate(`/board/${newBoard.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create board');
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteBoard(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete board');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-[#e2ddd5] px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center text-xl font-serif shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e293b]">SketchFlow AI</h1>
            <p className="text-xs text-[#64748b]">Whiteboard Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#1e293b]">{user?.name || user?.email}</p>
            <p className="text-xs text-[#64748b]">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-[#cbd5e1] text-xs font-medium text-[#475569] hover:bg-gray-100 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Create Board Banner */}
        <section className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">Create a New Intelligent Canvas</h2>
            <p className="text-blue-100 text-sm">
              Draw manually or ask Gemini AI to generate architecture flowcharts instantly.
            </p>
          </div>

          <form onSubmit={handleCreateBoard} className="flex gap-2.5 w-full md:w-auto">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Board Name (e.g. System Architecture)"
              className="px-4 py-2.5 rounded-xl text-sm bg-white text-[#1e293b] placeholder-gray-400 focus:outline-none w-full md:w-72 shadow-sm font-medium"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-white text-[#2563eb] hover:bg-blue-50 font-semibold text-sm rounded-xl transition shadow-sm whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {creating ? 'Creating...' : '+ New Board'}
            </button>
          </form>
        </section>

        {/* Saved Boards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1e293b]">Your Whiteboards</h3>
            <span className="text-xs text-[#64748b]">{boards.length} board(s)</span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-white border border-gray-200 animate-pulse p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-2xl mx-auto">
                📐
              </div>
              <h4 className="text-lg font-semibold text-[#1e293b]">No whiteboards created yet</h4>
              <p className="text-sm text-[#64748b] max-w-sm mx-auto">
                Start your first diagram by typing a title above and clicking New Board.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="group bg-white rounded-2xl border border-[#e2ddd5] p-5 shadow-xs hover:shadow-md hover:border-[#2563eb] transition cursor-pointer flex flex-col justify-between h-44 relative overflow-hidden"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-[#1e293b] group-hover:text-[#2563eb] transition line-clamp-1">
                        {board.title}
                      </h4>
                      <button
                        onClick={(e) => handleDeleteBoard(board.id, board.title, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition text-sm p-1 rounded-md hover:bg-red-50"
                        title="Delete Board"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-xs text-[#64748b]">
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      ID: {board.id.slice(0, 8)}...
                    </span>
                    <span className="text-[#2563eb] font-medium group-hover:underline">Open Whiteboard →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
