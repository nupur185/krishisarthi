import { Router } from 'express';
import {
  getActiveCentersController,
  getCenterByIdController,
} from '../controllers/center.controller.js';

const router = Router();

router.get('/', getActiveCentersController);

router.get('/:centerId', getCenterByIdController);

export default router;