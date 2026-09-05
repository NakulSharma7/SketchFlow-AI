import { Router } from 'express';
import { BoardController } from '../controllers/boardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// All board routes require JWT verification
router.use(authMiddleware);

router.post('/', BoardController.create);
router.get('/', BoardController.list);
router.get('/:id', BoardController.getById);
router.put('/:id', BoardController.update);
router.delete('/:id', BoardController.delete);

export default router;
