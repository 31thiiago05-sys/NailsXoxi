import { Router } from 'express';
import { getAdjustments, createAdjustment, deleteAdjustment } from '../controllers/earnings.controller';

const router = Router();

router.get('/', getAdjustments);
router.post('/', createAdjustment);
router.delete('/:id', deleteAdjustment);

export default router;
