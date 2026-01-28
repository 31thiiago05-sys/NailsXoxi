import { Router } from 'express';
import { getAllClients, deleteUser, toggleBlockUser, toggleAdmin, clearDebt } from '../controllers/client.controller';

const router = Router();

router.get('/', getAllClients);
router.delete('/:id', deleteUser);
router.post('/:id/toggle-block', toggleBlockUser);
router.post('/:id/toggle-admin', toggleAdmin);
router.post('/:id/clear-debt', clearDebt);

export default router;
