import { Request, Response } from 'express';
import prisma from '../db';

export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            include: { category: true }
        });

        // Parse 'images' JSON string back to array
        const formattedServices = services.map(s => {
            let imagesArray: string[] = [];
            if (s.images) {
                try {
                    imagesArray = JSON.parse(s.images);
                } catch (e) {
                    console.error("Error parsing images JSON", e);
                    imagesArray = [];
                }
            } else if (s.imageUrl) {
                // Fallback for old records
                imagesArray = [s.imageUrl];
            }

            return {
                ...s,
                images: imagesArray
            };
        });

        res.json(formattedServices);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching services' });
    }
};

export const createService = async (req: Request, res: Response) => {
    try {
        const { name, price, description, durationMin, categoryId, categoryName, imageUrl, deposit, removalPriceOwn, removalPriceForeign, images } = req.body;

        let finalCategoryId = categoryId;

        // If categoryName provided (for new category), find or create it
        if (categoryName) {
            const existingCat = await prisma.category.findUnique({
                where: { name: categoryName }
            });
            if (existingCat) {
                finalCategoryId = existingCat.id;
            } else {
                const newCat = await prisma.category.create({
                    data: { name: categoryName }
                });
                finalCategoryId = newCat.id;
            }
        }

        // Handle images array -> JSON string
        let imagesJSON = null;
        if (images && Array.isArray(images)) {
            imagesJSON = JSON.stringify(images);
        } else if (imageUrl) {
            // Fallback: if only imageUrl provided, make it an array of 1
            imagesJSON = JSON.stringify([imageUrl]);
        }

        const service = await prisma.service.create({
            data: {
                name,
                price,
                durationMin: parseInt(durationMin),
                categoryId: finalCategoryId,
                imageUrl, // Keep for backward compat if needed, or just standard
                images: imagesJSON,
                deposit: deposit || 0,
                removalPriceOwn: removalPriceOwn || 0,
                removalPriceForeign: removalPriceForeign || 0,
                description
            }
        });
        res.status(201).json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating service' });
    }
}

export const updateService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, description, durationMin, categoryId, categoryName, imageUrl, deposit, removalPriceOwn, removalPriceForeign, images } = req.body;

        let finalCategoryId = categoryId;

        if (categoryName) {
            const existingCat = await prisma.category.findUnique({
                where: { name: categoryName }
            });
            if (existingCat) {
                finalCategoryId = existingCat.id;
            } else {
                const newCat = await prisma.category.create({
                    data: { name: categoryName }
                });
                finalCategoryId = newCat.id;
            }
        }

        let imagesJSON = null;
        if (images && Array.isArray(images)) {
            imagesJSON = JSON.stringify(images);
        } else if (imageUrl) {
            // Fallback if legacy update logic sends imageUrl but no images array
            // Ideally frontend sends images array always. 
            // If images is explicit undefined, we might not want to overwrite? 
            // With Prisma update, undefined fields are ignored. 
            // But here we destructured. If images is undefined, imagesJSON is null.
            // Be careful not to wipe existing images if user didn't send them.
            // Actually standard PUT usually replaces.
            imagesJSON = JSON.stringify([imageUrl]);
        }

        // Construct data object to only include fields present
        const updateData: any = {
            name,
            price,
            durationMin: parseInt(durationMin),
            categoryId: finalCategoryId,
            imageUrl,
            deposit: deposit || 0,
            removalPriceOwn: removalPriceOwn || 0,
            removalPriceForeign: removalPriceForeign || 0,
            description
        };

        if (images !== undefined) {
            updateData.images = JSON.stringify(images);
        }

        const service = await prisma.service.update({
            where: { id },
            data: updateData
        });
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating service' });
    }
}

export const deleteService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.service.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting service' });
    }
}

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
}
