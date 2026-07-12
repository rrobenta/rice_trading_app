import { Router } from 'express';
import { body } from 'express-validator';
import { getOrders, getOrderById, createOrder, cancelOrder } from './orders.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

router.post(
  '/',
  authenticate,
  [
    body('type').isIn(['BUY', 'SELL']),
    body('pricePerKg').isDecimal(),
    body('quantityKg').isDecimal(),
    body('varietyId').notEmpty(),
  ],
  createOrder
);

router.patch('/:id/cancel', authenticate, cancelOrder);

export default router;
