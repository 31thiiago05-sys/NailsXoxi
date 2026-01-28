import { Request, Response } from 'express';
import prisma from '../db';

export const getAllClients = async (req: Request, res: Response) => {
    try {
        const clients = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isBlocked: true,
                debt: true,
                creditAmount: true,
                createdAt: true,
                appointments: {
                    select: { id: true, date: true, status: true },
                    orderBy: { date: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo clientes' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando usuario' });
    }
};

export const toggleBlockUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const updated = await prisma.user.update({
            where: { id },
            data: { isBlocked: !user.isBlocked }
        });
        res.json({ message: `Usuario ${updated.isBlocked ? 'bloqueado' : 'desbloqueado'}`, isBlocked: updated.isBlocked });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando estado' });
    }
};

export const toggleAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const newRole = user.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';
        await prisma.user.update({
            where: { id },
            data: { role: newRole }
        });
        res.json({ message: `Rol actualizado a ${newRole}` });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando rol' });
    }
};

export const clearDebt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.update({
            where: { id },
            data: { debt: 0 }
        });
        res.json({ message: 'Deuda eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando deuda' });
    }
};
