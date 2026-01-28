import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        // Log all users before update
        const usersBefore = await prisma.user.findMany();
        console.log('Users found:', usersBefore.map(u => `${u.email} (${u.role})`));

        const { count } = await prisma.user.updateMany({
            data: {
                role: 'ADMIN'
            }
        });
        console.log(`Updated ${count} users to ADMIN role.`);

        // Log after
        const usersAfter = await prisma.user.findMany();
        console.log('Users status:', usersAfter.map(u => `${u.email} (${u.role})`));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
