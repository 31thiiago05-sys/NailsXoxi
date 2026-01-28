import { Router } from 'express';
import { getAvailability, updateAvailability } from '../controllers/availability.controller';

const router = Router();

router.get('/', getAvailability);
router.post('/', updateAvailability);

export default router;
