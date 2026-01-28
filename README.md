# Nails Xoxi Platform

Plataforma profesional para gestión de turnos de manicuría con pagos integrados (Mercado Pago).

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (Base de datos local o en la nube)
- Cuenta de Mercado Pago (para obtener credenciales de prueba)

## Estructura del Proyecto

- `/server`: Backend API (Node.js, Express, Prisma)
- `/client`: Frontend (React, Vite, Tailwind CSS)

## Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo.

### 1. Configuración del Backend

Navega a la carpeta del servidor e instala las dependencias:

```bash
cd server
npm install
```

Crea un archivo `.env` en `/server` con las siguientes variables:

```env
PORT=3001
DATABASE_URL="postgresql://usuario:password@localhost:5432/nails_xoxi?schema=public"
MP_ACCESS_TOKEN="TU_ACCESS_TOKEN_DE_MERCADO_PAGO"
CLIENT_URL="http://localhost:5173"
SERVER_URL="http://localhost:3001"
```

Inicializa la base de datos con Prisma:

```bash
npx prisma migrate dev --name init
```

Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

El servidor correrá en `http://localhost:3001`.

### 2. Configuración del Frontend

Abre una nueva terminal, navega a la carpeta del cliente e instala dependencias:

```bash
cd client
npm install
```

Inicia la aplicación React:

```bash
npm run dev
```

La app se abrirá en `http://localhost:5173`.

## Funcionalidades Principales

- **Reserva de Turnos**: Flujo paso a paso para elegir categoría, servicio y fecha.
- **Pagos**: Integración con Mercado Pago para cobro de seña (50%).
- **Panel Administrativo**: (Lógica de backend lista en `schema.prisma` y controladores base).
- **Diseño**: Estilo "Mobile First" con paleta de colores nude/pastel.

## Desarrollo

- **Base de Datos**: Si haces cambios en `server/prisma/schema.prisma`, corre `npx prisma migrate dev` para actualizar la DB.
- **Estilos**: Los colores se configuran en `client/tailwind.config.js`.

---
Desarrollado con ❤️ para Nails Xoxi.
