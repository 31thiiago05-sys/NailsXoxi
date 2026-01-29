import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appointmentRoutes from './routes/appointment.routes';
import paymentRoutes from './routes/payment.routes';
import serviceRoutes from './routes/service.routes';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import availabilityRoutes from './routes/availability.routes';

import earningsRoutes from './routes/earnings.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: [
        'https://nails-xoxi.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/earnings', earningsRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Nails Xoxi API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
