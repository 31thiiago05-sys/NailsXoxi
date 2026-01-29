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

        // Actualizar estado a cancelado y guardar motivo
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CANCELLED',
                cancellationReason: reason
            }
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

Lamentamos informarte que tu turno para el ${formattedDate} a las ${formattedTime} ha sido cancelado por la administración.

Motivo: ${reason}

Si tienes alguna duda, por favor contáctanos.

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
        const deposit = Number(appointment.service.deposit);
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
            data: {
                status: 'CANCELLED',
                cancellationReason: 'Inasistencia / Demora > 10min'
            }
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

Podés abonar ingresando a tu cuenta en https://www.nailsxoxi.shop o contactándonos.`;

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

// Eliminar turno permanentemente
export const deleteAppointmentAdmin = async (req: Request, res: Response) => {
    const { appointmentId } = req.body;

    try {
        await prisma.appointment.delete({
            where: { id: appointmentId }
        });

        res.json({ success: true, message: 'Turno eliminado permanentemente.' });
    } catch (error) {
        console.error('Error eliminando turno:', error);
        res.status(500).json({ error: 'Error al eliminar turno' });
    }
};
