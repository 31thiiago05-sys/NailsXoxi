import { Router } from 'express';
import { createService, getServices, updateService, deleteService, getCategories } from '../controllers/service.controller';

const router = Router();

router.get('/', getServices);
router.get('/categories', getCategories);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
