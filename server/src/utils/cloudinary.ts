import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Sube una imagen en Base64 a Cloudinary
 * @param base64Image String base64 completo (data:image/...) o path
 * @param folder Carpeta opcional en Cloudinary (default: 'nails-xoxi')
 * @returns URL segura de la imagen (https)
 */
export const uploadToCloudinary = async (base64Image: string, folder: string = 'nails-xoxi'): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder,
            resource_type: 'auto', // Detecta si es imagen, video, etc.
            transformation: [
                { width: 1000, crop: "limit" }, // Reducir tamaño máx para optimizar
                { quality: "auto" }, // Optimizar calidad
                { fetch_format: "auto" } // Usar WebP si el navegador soporta
            ]
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Error subiendo imagen a Cloudinary');
    }
};

/**
 * Elimina una imagen de Cloudinary usando su URL pública
 * @param imageUrl URL completa de la imagen
 */
export const deleteFromCloudinary = async (imageUrl: string) => {
    try {
        if (!imageUrl.includes('cloudinary')) return;

        // Extraer public_id de la URL
        // Ejemplo: https://res.cloudinary.com/.../nails-xoxi/k2j4h2k4.jpg
        const splitUrl = imageUrl.split('/');
        const filename = splitUrl[splitUrl.length - 1];
        const publicId = `nails-xoxi/${filename.split('.')[0]}`; // Ajustar según folder

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
};
