import { Request, Response } from 'express';
import prisma from '../db';

export const getAdjustments = async (req: Request, res: Response) => {
    try {
        const adjustments = await prisma.earningsAdjustment.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(adjustments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching adjustments' });
    }
};

export const createAdjustment = async (req: Request, res: Response) => {
    try {
        const { description, amount, date } = req.body;
        const adjustment = await prisma.earningsAdjustment.create({
            data: {
                description,
                amount,
                date: new Date(date)
            }
        });
        res.json(adjustment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating adjustment' });
    }
};

export const deleteAdjustment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.earningsAdjustment.delete({ where: { id } });
        res.json({ message: 'Adjustment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting adjustment' });
    }
};
