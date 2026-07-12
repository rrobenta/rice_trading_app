import { Router } from 'express';
import { getPriceHistory, getMarketSummary, getVarieties } from './market.controller';

const router = Router();

router.get('/varieties', getVarieties);
router.get('/prices', getPriceHistory);
router.get('/summary', getMarketSummary);

export default router;
