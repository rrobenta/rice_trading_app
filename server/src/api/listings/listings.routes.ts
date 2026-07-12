import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from './listings.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', getListings);
router.get('/:id', getListingById);

router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty(),
    body('pricePerKg').isDecimal({ force_decimal: false }).withMessage('Invalid price'),
    body('quantityKg').isDecimal({ force_decimal: false }).withMessage('Invalid quantity'),
    body('varietyId').notEmpty(),
  ],
  createListing
);

router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);

export default router;
