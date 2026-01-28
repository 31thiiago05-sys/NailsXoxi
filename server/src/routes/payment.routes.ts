import { Router } from 'express';
import { createPreference, receiveWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/create-preference', createPreference);
router.post('/webhook', receiveWebhook);

export default router;
