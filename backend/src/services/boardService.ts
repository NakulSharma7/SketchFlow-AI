import { prisma } from '../lib/prisma.js';

export class BoardService {
  static async createBoard(userId: string, title?: string) {
    const defaultTitle = title && title.trim() ? title.trim() : 'Untitled Whiteboard';
    return await prisma.board.create({
      data: {
        title: defaultTitle,
        canvasData: JSON.stringify([]),
        userId,
      },
    });
  }

  static async getUserBoards(userId: string) {
    return await prisma.board.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw new Error('Board not found or access denied');
    }

    return {
      ...board,
      elements: JSON.parse(board.canvasData || '[]'),
    };
  }

  static async updateBoard(boardId: string, userId: string, data: { title?: string; canvasData?: any }) {
    const existing = await prisma.board.findFirst({
      where: { id: boardId, userId },
    });

    if (!existing) {
      throw new Error('Board not found or access denied');
    }

    const updatePayload: { title?: string; canvasData?: string } = {};

    if (data.title !== undefined) {
      updatePayload.title = data.title;
    }

    if (data.canvasData !== undefined) {
      updatePayload.canvasData = typeof data.canvasData === 'string' ? data.canvasData : JSON.stringify(data.canvasData);
    }

    return await prisma.board.update({
      where: { id: boardId },
      data: updatePayload,
    });
  }

  static async deleteBoard(boardId: string, userId: string) {
    const existing = await prisma.board.findFirst({
      where: { id: boardId, userId },
    });

    if (!existing) {
      throw new Error('Board not found or access denied');
    }

    return await prisma.board.delete({
      where: { id: boardId },
    });
  }
}
