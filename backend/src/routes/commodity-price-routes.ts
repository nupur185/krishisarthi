import { Router } from 'express';

import {
  getCommodityPricesController,
} from '../controllers/commodity-price-controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getCommodityPricesController);

export default router;