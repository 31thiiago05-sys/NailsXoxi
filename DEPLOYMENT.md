# Guía de Despliegue de Nails Xoxi

Esta guía te ayudará a subir tu aplicación a internet y conectar tu dominio `nailsxoxi.shop`.

## 1. Subir Código a GitHub

1. Ve a [GitHub](https://github.com/new) y crea un nuevo repositorio llamado `nails-xoxi` (o el nombre que prefieras).
2. **No** inicialices el repositorio con README, .gitignore o licencia (ya tienes eso localmente).
3. Copia la URL del repositorio (termina en `.git`, ej: `https://github.com/tu-usuario/nails-xoxi.git`).
4. Desde la terminal de cursor, ejecuta:

    ```bash
    git remote add origin <URL_DEL_REPOSITORIO>
    git branch -M main
    git push -u origin main
    ```

    *(Reemplaza `<URL_DEL_REPOSITORIO>` con la URL que copiaste)*.

## 2. Base de Datos (PostgreSQL)

Necesitas una base de datos en la nube. Recomiendo **Neon.tech** (es gratis y fácil).

1. Ve a [Neon.tech](https://neon.tech/) y regístrate.
2. Crea un nuevo proyecto.
3. Copia la "Connection String" (te la dará en el dashboard). Se verá como: `postgresql://user:password@endpoint.neon.tech/neondb...`

## 3. Desplegar Servidor (Backend) en Render

1. Ve a [Render.com](https://render.com/) y regístrate.
2. Haz clic en "New +", selecciona "Web Service".
3. Conecta tu cuenta de GitHub y selecciona el repositorio `nails-xoxi`.
4. Configura lo siguiente:
    - **Root Directory**: `server`
    - **Environment**: `Node`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
5. **Environment Variables** (sección Advanced):
    - Agrega `DATABASE_URL` y pega el valor que obtuviste de Neon.tech.
    - Agrega `JWT_SECRET` y pon una clave secreta inventada.
    - Agrega `MERCADOPAGO_ACCESS_TOKEN` si tienes la integración de pagos.
6. Haz clic en "Create Web Service".
7. Espera a que termine el despliegue. Copia la URL que te da Render (ej: `https://nails-xoxi-server.onrender.com`).

## 4. Desplegar Cliente (Frontend) en Vercel

1. Ve a [Vercel.com](https://vercel.com/) y regístrate.
2. Haz clic en "Add New...", selecciona "Project".
3. Importa tu repositorio `nails-xoxi`.
4. Configura lo siguiente:
    - **Framework Preset**: Vite
    - **Root Directory**: `client` (haz clic en Edit y selecciona la carpeta `client`).
5. **Environment Variables**:
    - Nombre: `VITE_API_URL`
    - Valor: Pegar la URL de Render del paso 3 + `/api`.
        - Ejemplo: `https://nails-xoxi-server.onrender.com/api`
6. Haz clic en "Deploy".

---

## 5. Configuración de Mercado Pago

### 5.1. Configurar Credenciales en el Servidor (Render)

1. **Ve a tu servicio en Render** → Settings → Environment
2. **Agrega las siguientes variables de entorno**:

```bash
# Mercado Pago - Usar credenciales de PRODUCCIÓN
MP_ACCESS_TOKEN=APP_USR-8861941003350621-012911-1f019ddea5313252ea76d3ba9a5febf8-734013766
MP_PUBLIC_KEY=APP_USR-2893d188-1d9a-416d-b35b-470b1e077538

# URLs para producción
CLIENT_URL=https://nails-xoxi.vercel.app
SERVER_URL=[URL_DE_TU_SERVIDOR_EN_RENDER]
```

> **Nota**: Reemplaza `[URL_DE_TU_SERVIDOR_EN_RENDER]` con la URL real de tu backend en Render (ej: `https://nails-xoxi-api.onrender.com`)

### 5.2. Configurar Webhook en Mercado Pago

Para que Mercado Pago notifique los cambios de estado de pago:

1. **Ve a** <https://www.mercadopago.com.ar/developers>
2. **Selecciona** tu aplicación "Nails Xoxi Pagos"
3. **Ve a** la sección "Webhooks"
4. **Agrega** la siguiente URL:

   ```bash
   https://[TU_SERVIDOR_EN_RENDER]/api/payments/webhook
   ```

5. **Selecciona** el evento "Payments"
6. **Guarda** los cambios

### 5.3. Verificar Integración

**Para probar en LOCAL primero (con credenciales de TEST):**

```bash
# En server/.env usar credenciales de TEST:
MP_ACCESS_TOKEN=APP_USR-678604488675011-012911-87c84a9bb1b7f18be51c9d1420f627e7-2992706522
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3001
```

**Tarjetas de prueba:**

- ✅ Aprobada: `5031 7557 3453 0604` / CVV: `123` / Venc: `11/25`
- ❌ Rechazada: `5031 4332 1540 6351` / CVV: `123` / Venc: `11/25`

**Flujo de prueba:**

1. Ir a `/booking` y crear una reserva
2. Confirmar y pagar con Mercado Pago
3. Usar tarjeta de prueba
4. Verificar redirección a `/payment/success`
5. Confirmar que la cita cambió a estado CONFIRMED en la base de datos

---

## 6. Configurar Dominio Personalizado (nailsxoxi.shop) en Vercel

1. Una vez desplegado el proyecto en Vercel, ve a "Settings" -> "Domains".
2. Escribe `nailsxoxi.shop` y haz clic en "Add".
3. Vercel te dará unos registros DNS (tipo A o CNAME).
4. Ve a donde compraste tu dominio (ej: Namecheap, GoDaddy, DonWeb) y configura esos registros DNS como te indica Vercel.
5. Espera unos minutos (puede tardar hasta 48hs, pero suele ser rápido) y tu sitio estará online.

## Resumen

- **Base de Datos**: Neon.tech
- **Backend**: Render (conectado a Neon)
- **Frontend**: Vercel (conectado a Render)
- **Dominio**: Configurado en Vercel
