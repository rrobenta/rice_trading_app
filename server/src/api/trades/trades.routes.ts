import { Router } from 'express';
import { getTrades, getTradeById, updateTradeStatus } from './trades.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getTrades);
router.get('/:id', authenticate, getTradeById);
router.patch('/:id/status', authenticate, updateTradeStatus);

export default router;
