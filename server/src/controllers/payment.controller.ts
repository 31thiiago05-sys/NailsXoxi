import { Request, Response } from 'express';
import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';
import prisma from '../db';
// Enum removed

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export const createPreference = async (req: Request, res: Response) => {
    const { appointmentId, title, price } = req.body;

    try {
        const preference = new Preference(client);

        // El precio debe ser el 50% de seña, según requerimiento
        const depositAmount = Number(price) * 0.5;

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: appointmentId,
                        title: `Seña: ${title}`,
                        quantity: 1,
                        unit_price: depositAmount,
                        currency_id: 'ARS',
                    },
                ],
                back_urls: {
                    success: `${process.env.CLIENT_URL}/payment/success`,
                    failure: `${process.env.CLIENT_URL}/payment/failure`,
                    pending: `${process.env.CLIENT_URL}/payment/pending`,
                },
                auto_return: 'approved',
                notification_url: `${process.env.SERVER_URL}/api/payments/webhook`,
                metadata: {
                    appointment_id: appointmentId,
                },
            }
        });

        res.json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating payment preference' });
    }
};

export const receiveWebhook = async (req: Request, res: Response) => {
    const { type, data } = req.body;

    try {
        if (type === 'payment') {
            const paymentClient = new Payment(client);
            const paymentInfo = await paymentClient.get({ id: data.id });

            if (paymentInfo.status === 'approved') {
                const appointmentId = paymentInfo.metadata.appointment_id;

                // 1. Guardar el pago en DB
                await prisma.payment.create({
                    data: {
                        mpPaymentId: paymentInfo.id!.toString(),
                        mpStatus: paymentInfo.status,
                        amount: paymentInfo.transaction_amount!,
                        appointmentId: appointmentId
                    }
                });

                // 2. Confirmar el turno
                await prisma.appointment.update({
                    where: { id: appointmentId },
                    data: { status: 'CONFIRMED' }
                });
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};
