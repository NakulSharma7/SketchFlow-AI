import { Response, NextFunction } from 'express';
import { BoardService } from '../services/boardService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class BoardController {
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { title } = req.body;
      const board = await BoardService.createBoard(userId, title);
      res.status(201).json(board);
    } catch (err: any) {
      next(err);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const boards = await BoardService.getUserBoards(userId);
      res.status(200).json(boards);
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const board = await BoardService.getBoardById(id, userId);
      res.status(200).json(board);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { title, elements, canvasData } = req.body;

      const dataToSave = canvasData !== undefined ? canvasData : elements;

      const updated = await BoardService.updateBoard(id, userId, {
        title,
        canvasData: dataToSave,
      });

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await BoardService.deleteBoard(id, userId);
      res.status(200).json({ message: 'Board deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
