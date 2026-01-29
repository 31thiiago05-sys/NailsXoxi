import { Request, Response } from 'express';
import prisma from '../db';
// Enum removed

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                service: true,
                user: true,
            },
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching appointments' });
    }
};

export const createAppointment = async (req: Request, res: Response) => {
    const { userId, serviceId, date } = req.body;

    try {
        // 1. Validar disponibilidad (Check if slot is taken)
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                date: new Date(date),
                status: {
                    notIn: ['CANCELLED', 'PENDING']
                }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ error: 'Turno no disponible en este horario.' });
        }

        // 1.5. Validar Deuda del Usuario
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && Number(user.debt) > 0) {
            return res.status(403).json({ error: 'Tienes una deuda pendiente. No puedes reservar hasta regularizar tu situación.' });
        }

        // 2. Crear turno pendiente
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                serviceId,
                date: new Date(date),
                status: 'PENDING'
            }
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating appointment' });
    }
};
// ... existing code ...

export const getMyAppointments = async (req: Request, res: Response) => {
    // @ts-ignore - User attached by auth middleware
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                status: {
                    not: 'PENDING'
                }
            },
            include: {
                service: true,
            },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching my appointments' });
    }
};

import { sendEmail } from '../utils/email';

export const cancelAppointment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { service: true, user: true }
        });

        if (!appointment) return res.status(404).json({ error: 'Turno no encontrado' });
        if (appointment.userId !== userId) return res.status(403).json({ error: 'No autorizado' });
        if (appointment.status === 'CANCELLED') return res.status(400).json({ error: 'Ya está cancelado' });

        const now = new Date();
        const apptDate = new Date(appointment.date);
        const hoursDiff = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        let penalty = 0;
        let deposit = Number(appointment.service.price) * 0.5; // Assuming 50% deposit if not stored differently
        // If you have specific deposit field in Service, use: Number(appointment.service.deposit)

        // Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update Booking
            await tx.appointment.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                    cancellationReason: hoursDiff < 72 ? 'Cancelación Tardía (Usuario)' : 'Cancelación Anticipada (Usuario)'
                }
            });

            if (hoursDiff < 72) {
                // LATE CANCELLATION
                // Generar Deuda (Total Service Price - Deposit Paid)
                // Assuming deposit was paid. If deposit concept exists. 
                // Simplified: Debt = 50% of Price (since 50% was paid as deposit normally)
                // Or Penalty = Price - Deposit. 
                const servicePrice = Number(appointment.service.price);
                penalty = servicePrice - deposit;

                await tx.user.update({
                    where: { id: userId },
                    data: { debt: { increment: penalty } }
                });

                // Send Email
                const emailText = `Has cancelado tu turno del ${apptDate.toLocaleDateString()} a las ${apptDate.toLocaleTimeString()} con menos de 72hs de anticipación.\n\nSe ha generado una deuda de $${penalty} en tu cuenta.\n\nPor favor, contacta al negocio para regularizar tu situación.`;
                await sendEmail({
                    to: appointment.user.email,
                    subject: 'Cancelación Tardía - Deuda Generada',
                    text: emailText
                });

            } else {
                // EARLY CANCELLATION
                // Credit = Deposit
                const credit = deposit;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        creditAmount: { increment: credit },
                        creditExpiry: expiryDate
                    }
                });

                // Send Email
                const emailText = `Has cancelado tu turno con anticipación.\nTienes $${credit} a favor válido por 30 días para tu próxima reserva.`;
                await sendEmail({
                    to: appointment.user.email,
                    subject: 'Cancelación Exitosa - Saldo a Favor',
                    text: emailText
                });
            }
        });

        res.json({ success: true, message: hoursDiff < 72 ? 'Cancelación tardía. Deuda generada.' : 'Cancelación exitosa. Crédito generado.' });

    } catch (error) {
        console.error('Cancel Error:', error);
        res.status(500).json({ error: 'Error al cancelar turno' });
    }
};
