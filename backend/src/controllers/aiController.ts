import { Response, NextFunction } from 'express';
import { AiService } from '../services/aiService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class AiController {
  static async generate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({ error: 'A non-empty prompt is required for AI diagram generation' });
        return;
      }

      const elements = await AiService.generateDiagram(prompt.trim());
      res.status(200).json({ elements, prompt });
    } catch (err: any) {
      console.error('Error generating AI diagram:', err);
      res.status(500).json({ error: 'Failed to generate AI diagram. Please try again.' });
    }
  }
}
