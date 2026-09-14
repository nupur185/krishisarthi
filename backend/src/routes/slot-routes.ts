import { Router } from 'express';
import { getAvailableSlotsController } from '../controllers/slot-controller.js';

const router = Router();

router.get('/center/:centerId', getAvailableSlotsController);

export default router;