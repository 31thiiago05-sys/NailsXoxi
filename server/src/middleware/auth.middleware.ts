import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const SECRET = process.env.JWT_SECRET || 'secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, async (err: any, user: any) => {
        if (err) return res.sendStatus(403);

        try {
            // Verify if user still exists and is not deleted/blocked in DB
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id }
            });

            if (!dbUser || (dbUser as any).deletedAt) {
                return res.status(403).json({ message: 'Cuenta eliminada o inválida' });
            }

            if (dbUser.isBlocked) {
                return res.status(403).json({ message: 'Cuenta bloqueada' });
            }

            // @ts-ignore
            req.user = dbUser; // Attach full DB user
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.sendStatus(500);
        }
    });
};
