import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['TRADER', 'BUYER', 'SUPPLIER']),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.get('/me', authenticate, getMe);

export default router;
