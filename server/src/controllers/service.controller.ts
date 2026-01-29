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
        console.error('Error in getServices:', error);
        res.status(500).json({ error: 'Error fetching services' });
    }
};

import { uploadToCloudinary } from '../utils/cloudinary';

const processImages = async (images: string[]): Promise<string[]> => {
    if (!images || !Array.isArray(images)) return [];

    const processedImages = await Promise.all(images.map(async (img) => {
        // Check if it's base64
        if (img.startsWith('data:image')) {
            try {
                return await uploadToCloudinary(img);
            } catch (error) {
                console.error("Error uploading image to Cloudinary, skipping:", error);
                return img; // Fallback? Or null? Returning original crashes DB if giant.
            }
        }
        return img; // Already a URL
    }));

    return processedImages;
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

        // Process images (Upload Base64 to Cloudinary)
        let imagesToProcess = images || [];
        if (!imagesToProcess.length && imageUrl) imagesToProcess = [imageUrl];

        const processedImages = await processImages(imagesToProcess);
        const imagesJSON = JSON.stringify(processedImages);
        const mainImageUrl = processedImages.length > 0 ? processedImages[0] : null;

        const service = await prisma.service.create({
            data: {
                name,
                price,
                durationMin: parseInt(durationMin),
                categoryId: finalCategoryId,
                imageUrl: mainImageUrl, // Save Cloudinary URL
                images: imagesJSON,     // Save array of Cloudinary URLs
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

        const updateData: any = {
            name,
            price,
            durationMin: parseInt(durationMin),
            categoryId: finalCategoryId,
            deposit: deposit || 0,
            removalPriceOwn: removalPriceOwn || 0,
            removalPriceForeign: removalPriceForeign || 0,
            description
        };

        // Handle Images Update
        if (images !== undefined) {
            const processedImages = await processImages(images);
            updateData.images = JSON.stringify(processedImages);

            // Update main image url if images changed
            if (processedImages.length > 0) {
                updateData.imageUrl = processedImages[0];
            }
        } else if (imageUrl) {
            // Legacy fallback
            // If only imageUrl sent, treat as single image array
            // But check if it's base64
            if (imageUrl.startsWith('data:image')) {
                const newUrl = await uploadToCloudinary(imageUrl);
                updateData.imageUrl = newUrl;
                updateData.images = JSON.stringify([newUrl]);
            } else {
                updateData.imageUrl = imageUrl;
                updateData.images = JSON.stringify([imageUrl]);
            }
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
        console.error('Error in getCategories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
}
