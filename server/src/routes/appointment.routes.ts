import { Router } from 'express';
// @ts-ignore
import { authenticateToken } from '../middleware/auth.middleware';
import { createAppointment, getAppointments, getMyAppointments, cancelAppointment } from '../controllers/appointment.controller';

const router = Router();

router.get('/my-appointments', authenticateToken, getMyAppointments);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.post('/:id/cancel', authenticateToken, cancelAppointment);

export default router;
