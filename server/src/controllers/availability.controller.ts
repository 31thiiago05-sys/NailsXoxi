import { Request, Response } from 'express';
import prisma from '../db';

export const getAvailability = async (req: Request, res: Response) => {
    try {
        // Por simplicidad, traemos todas las configuraciones futuras incluyendo hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availability = await prisma.availability.findMany({
            where: { date: { gte: today } },
            orderBy: { date: 'asc' }
        });

        // Parsear string to JSON
        const parsed = availability.map(a => ({
            ...a,
            slots: JSON.parse(a.slots)
        }));

        res.json(parsed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo disponibilidad' });
    }
};

export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const { date, isBlocked, slots } = req.body; // date string YYYY-MM-DD
        const dateObj = new Date(date);

        const avail = await prisma.availability.upsert({
            where: {
                date: dateObj
            },
            update: {
                isBlocked,
                slots: JSON.stringify(slots)
            },
            create: {
                date: dateObj,
                isBlocked,
                slots: JSON.stringify(slots)
            }
        });
        res.json(avail);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error actualizando disponibilidad' });
    }
};
