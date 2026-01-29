import { Router } from 'express';
// @ts-ignore
import { authenticateToken } from '../middleware/auth.middleware';
import { createAppointment, getAppointments, getMyAppointments, cancelAppointment } from '../controllers/appointment.controller';
import { cancelAppointmentAdmin, markNoShow, deleteAppointmentAdmin } from '../controllers/admin.controller';

const router = Router();

router.get('/my-appointments', authenticateToken, getMyAppointments);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.post('/:id/cancel', authenticateToken, cancelAppointment);

// Admin routes
router.post('/admin/cancel', authenticateToken, cancelAppointmentAdmin);
router.post('/admin/mark-noshow', authenticateToken, markNoShow);
router.post('/admin/delete', authenticateToken, deleteAppointmentAdmin);

export default router;
