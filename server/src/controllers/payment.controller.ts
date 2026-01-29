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
    try {
        // Log para debugging
        console.log('Webhook recibido:', JSON.stringify(req.body, null, 2));

        const { type, data, action } = req.body;

        // Mercado Pago siempre envía un tipo de notificación
        // Respondemos 200 OK primero para que MP no reintente
        // Luego procesamos en background

        if (!data || !data.id) {
            console.log('Webhook sin data.id, ignorando');
            return res.sendStatus(200);
        }

        // Solo procesar notificaciones de pago
        if (type === 'payment') {
            // Procesar en background para no hacer esperar a MP
            setImmediate(async () => {
                try {
                    const paymentClient = new Payment(client);
                    const paymentInfo = await paymentClient.get({ id: data.id });

                    console.log('Payment info:', {
                        id: paymentInfo.id,
                        status: paymentInfo.status,
                        metadata: paymentInfo.metadata
                    });

                    // Obtener appointmentId del metadata
                    const appointmentId = paymentInfo.metadata?.appointment_id as string | undefined;

                    if (!appointmentId) {
                        console.error('No appointment_id en metadata');
                        return;
                    }

                    if (paymentInfo.status === 'approved') {
                        // 1. Verificar si el pago ya existe
                        const existingPayment = await prisma.payment.findUnique({
                            where: { mpPaymentId: paymentInfo.id!.toString() }
                        });

                        if (!existingPayment) {
                            // 2. Guardar el pago en DB
                            await prisma.payment.create({
                                data: {
                                    mpPaymentId: paymentInfo.id!.toString(),
                                    mpStatus: paymentInfo.status,
                                    amount: paymentInfo.transaction_amount!,
                                    appointmentId: appointmentId
                                }
                            });
                            console.log('Pago guardado en BD');
                        }

                        // 3. Confirmar el turno
                        const updatedAppointment = await prisma.appointment.update({
                            where: { id: appointmentId },
                            data: { status: 'CONFIRMED' },
                            include: {
                                user: true,
                                service: true
                            }
                        });
                        console.log('Turno confirmado:', appointmentId);

                        // 4. Enviar emails de confirmación
                        try {
                            const { sendEmail } = await import('../utils/email');

                            const apptDate = new Date(updatedAppointment.date);
                            const formattedDate = apptDate.toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                            const formattedTime = apptDate.toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            });

                            const servicePrice = Number(updatedAppointment.service.price);
                            const deposit = servicePrice * 0.5;
                            const remaining = servicePrice - deposit;

                            // Email al Cliente
                            const clientEmailText = `✨Te espero el ${formattedDate} a las ${formattedTime} hs. Dirección: San Ramón 1168, depto y timbre 4, Villa Bosch.

🕣El tiempo de espera son 10 min. Pasado ese tiempo se cobrará $4000 adicionales (según disponibilidad), o se cancela el turno debiendo abonar el restante.

⚠️ IMPORTANTE: El precio final puede variar. Si el diseño realizado es más complejo que el reservado, se cobrará la diferencia. Si es más sencillo, se ajustará el precio a favor.

🦋Venir sin acompañantes 🫶🏼

(Servicio: ${updatedAppointment.service.name})
💰 Seña abonada: $${deposit}
💵 Resta abonar en el local: $${remaining}

🚨 Si necesitas reagendar o cancelar, hazlo desde la Aplicación (Sección Mis Turnos):
✅ +72 hs antes: Tu seña queda como saldo a favor (validez 30 días) para reagendar.
⚠️ -72 hs antes: Perdés la seña y se genera deuda por el total del servicio.`;

                            await sendEmail({
                                to: updatedAppointment.user.email,
                                subject: 'Turno Confirmado - Nails Xoxi',
                                text: clientEmailText
                            });

                            // Email al Dueño
                            const ownerEmailText = `NUEVA RESERVA CONFIRMADA

CLIENTE: ${updatedAppointment.user.name}
TELÉFONO: ${updatedAppointment.user.phone || 'No especificado'}
EMAIL: ${updatedAppointment.user.email}

TURNO: ${formattedDate} a las ${formattedTime}
SERVICIO: ${updatedAppointment.service.name}

SEÑA: $${deposit}
RESTA: $${remaining}`;

                            await sendEmail({
                                to: 'negocioxoxi@gmail.com',
                                subject: `Nueva Reserva: ${updatedAppointment.user.name}`,
                                text: ownerEmailText
                            });

                            console.log('✅ Emails de confirmación enviados');
                        } catch (emailError) {
                            console.error('❌ Error enviando emails de confirmación:', emailError);
                        }
                    } else if (paymentInfo.status === 'rejected') {
                        console.log('Pago rechazado:', paymentInfo.id);
                        // Podrías actualizar el turno a CANCELLED si querés
                    } else if (paymentInfo.status === 'in_process') {
                        console.log('Pago en proceso:', paymentInfo.id);
                        // El turno queda PENDING hasta que se apruebe
                    }
                } catch (error) {
                    console.error('Error procesando pago en background:', error);
                }
            });
        }

        // SIEMPRE responder 200 OK a Mercado Pago
        return res.sendStatus(200);
    } catch (error) {
        console.error('Error en webhook:', error);
        // Incluso con error, responder 200 para que MP no reintente
        return res.sendStatus(200);
    }
};
