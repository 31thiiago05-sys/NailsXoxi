import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { sendEmail } from '../utils/email'; // Importar funcion de envio corregida

const SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response) => {
    try {
        const { password, name, phone } = req.body;
        const email = req.body.email.toLowerCase(); // Normalizar email

        // Verificar si existe
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone
            }
        });

        // Token
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en registro' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        const email = req.body.email.toLowerCase(); // Normalizar email

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verificar si está bloqueado o eliminado (también chequeado en middleware, pero útil aquí para mensaje específico)
        if (user.isBlocked || user.deletedAt) {
            return res.status(403).json({ message: 'Cuenta bloqueada o eliminada' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Auto-Promote Owner to ADMIN if not already
        if (email === 'thiagoagustincoria@gmail.com' && user.role !== 'ADMIN') {
            console.log('👑 Promoviendo usuario dueño a ADMIN:', email);
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            user.role = 'ADMIN'; // Update local variable for token
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en login' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email.toLowerCase();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // No revelar si el usuario existe o no por seguridad, o devolver 404 si prefieres UX sobre seguridad estricta
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const token = uuidv4();
        const expiry = new Date(Date.now() + 3600000); // 1 hora

        await prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry
            }
        });

        const resetLink = `${process.env.PUBLIC_URL || 'https://nailsxoxi-xo1c.onrender.com'}/reset-password?token=${token}`;

        await sendEmail({
            to: email,
            subject: 'Recuperación de contraseña - Nails Xoxi',
            text: `Hola ${user.name},\n\nPara restablecer tu contraseña, hacé click en el siguiente enlace:\n\n${resetLink}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste esto, ignorá este mensaje.`
        });

        res.json({ message: 'Correo de recuperación enviado' });

    } catch (error) {
        console.error('Error forgot password:', error);
        res.status(500).json({ message: 'Error al procesar solicitud' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error('Error reset password:', error);
        res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
};
