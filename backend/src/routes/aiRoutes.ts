import { Router } from 'express';
import { AiController } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// AI diagram generation requires JWT verification
router.use(authMiddleware);

router.post('/generate', AiController.generate);

export default router;
