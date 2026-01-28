/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FDEFF8', // Fondo (Rosa muy pálido)
                primary: '#EA94B9',    // Texto Base "Xoxi" (Rosa Medio)
                secondary: '#F5CCE2',  // Mariposa / Resplandor (Rosa Pastel)
                accent: '#D16292',     // Sombreado / Profundidad (Rosa Fuerte)
                'brand-dark': '#BC4D7B', // Contornos y Detalles (Magenta Oscuro)
                text: '#5D2B3F',       // Darker version of brand-dark for body text readability
            },
            backgroundImage: {
                'glossy': 'linear-gradient(135deg, #D16292 0%, #EA94B9 100%)', // Degradado Glossy
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Usar una fuente moderna si es posible
            }
        },
    },
    plugins: [],
}
