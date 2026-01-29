import { Request, Response } from 'express';
import prisma from '../db';
import { sendEmail } from '../utils/email';

// Cancelar turno manualmente desde el admin
export const cancelAppointmentAdmin = async (req: Request, res: Response) => {
    const { appointmentId, reason } = req.body;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                user: true,
                service: true
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        // Actualizar estado a cancelado
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CANCELLED',
                // Podrías agregar un campo 'cancellationReason' al schema si querés guardarlo
            }
        });

        // Calcular diferencia de tiempo
        const apptDate = new Date(appointment.date);
        const now = new Date();
        const diffHours = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Determinar política según tiempo
        let policyText = '';
        if (diffHours >= 72) {
            policyText = '✅ Has cancelado con más de 72 horas de anticipación.\nSi ya abonaste la seña, esta quedará como crédito a tu favor para un próximo turno. Por favor contáctanos para reprogramar.';
        } else {
            policyText = '⚠️ Has cancelado con menos de 72 horas de anticipación.\nSegún nuestra política de cancelación, la seña abonada no es reembolsable ni transferible. Deberás abonar una nueva seña para volver a reservar.';
        }

        // Email al cliente
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

        const clientEmailText = `Hola ${appointment.user.name},

Lamentamos informarte que tu turno para el ${formattedDate} a las ${formattedTime} ha sido cancelado.

Motivo: ${reason}

${policyText}

Saludos,
Nails Xoxi`;

        await sendEmail({
            to: appointment.user.email,
            subject: 'Turno Cancelado - Nails Xoxi',
            text: clientEmailText
        });

        res.json({
            success: true,
            clientPhone: appointment.user.phone,
            clientName: appointment.user.name
        });

    } catch (error) {
        console.error('Error cancelando turno:', error);
        res.status(500).json({ error: 'Error al cancelar turno' });
    }
};

// Marcar inasistencia o demora
export const markNoShow = async (req: Request, res: Response) => {
    const { appointmentId } = req.body;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                user: true,
                service: true
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        const servicePrice = Number(appointment.service.price);
        const deposit = servicePrice * 0.5;
        const penalty = servicePrice - deposit;

        // Actualizar deuda del usuario
        await prisma.user.update({
            where: { id: appointment.user.id },
            data: {
                debt: { increment: penalty }
            }
        });

        // Cancelar el turno
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CANCELLED' }
        });

        // Email al cliente
        const apptDate = new Date(appointment.date);
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

        const clientEmailText = `Hola ${appointment.user.name},

Te informamos que tu turno del ${formattedDate} a las ${formattedTime} ha sido cancelado automáticamente debido a una demora mayor a 10 minutos.

Deuda generada: $${penalty}.

Podés abonar ingresando a tu cuenta en https://nailsxoxi-xo1c.onrender.com o contactándonos.`;

        await sendEmail({
            to: appointment.user.email,
            subject: 'Turno Cancelado - Inasistencia',
            text: clientEmailText
        });

        // Email al dueño
        const ownerEmailText = `Inasistencia/Demora Registrada
------------------
Cliente: ${appointment.user.name}
Teléfono: ${appointment.user.phone || 'No especificado'}
Email: ${appointment.user.email}

Fecha: ${formattedDate}
Hora: ${formattedTime}
Servicio: ${appointment.service.name}

Deuda Generada: $${penalty}`;

        await sendEmail({
            to: 'negocioxoxi@gmail.com',
            subject: `Inasistencia-Demora: ${appointment.user.name} - ${formattedDate}`,
            text: ownerEmailText
        });

        res.json({
            success: true,
            message: 'Inasistencia registrada y deuda generada.'
        });

    } catch (error) {
        console.error('Error marcando inasistencia:', error);
        res.status(500).json({ error: 'Error al marcar inasistencia' });
    }
};
