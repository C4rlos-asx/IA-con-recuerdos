# Deployment Guide - Vercel

Este proyecto está compuesto por dos aplicaciones separadas:
- **Backend**: Next.js API con Prisma (PostgreSQL) y Redis
- **Frontend**: React con Vite

## Estructura del Proyecto

```
Chat gpt con memoria/
├── backend/    # Next.js API
└── frontend/   # React + Vite
```

## Prerequisitos

- Cuenta de Vercel
- Base de datos PostgreSQL (recomendado: Vercel Postgres o Neon)
- Redis (recomendado: Upstash Redis)

---

## Paso 1: Configurar la Base de Datos

### Opción A: Vercel Postgres (Recomendado)

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Storage** → **Create Database** → **Postgres**
3. Copia la variable `DATABASE_URL` que se genera automáticamente

### Opción B: Neon (Alternativa gratuita)

1. Crea una cuenta en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia el **Connection String** (DATABASE_URL)

---

## Paso 2: Configurar Redis

### Usar Upstash Redis (Recomendado - Gratis)

1. Crea una cuenta en [upstash.com](https://upstash.com)
2. Crea una nueva base de datos Redis
3. Copia la **REST URL** como `REDIS_URL`

---

## Paso 3: Deployar el Backend en Vercel

### A. Desde la interfaz de Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio
3. **Root Directory**: Selecciona `backend`
4. **Framework Preset**: Next.js
5. Configura las **Environment Variables**:

   ```
   DATABASE_URL=<tu-postgres-connection-string>
   REDIS_URL=<tu-upstash-redis-url>
   NODE_ENV=production
   ```

6. Click en **Deploy**
7. **Importante**: Copia la URL del backend desplegado (ej: `https://tu-backend.vercel.app`)

### B. Desde CLI (Alternativa)

```bash
cd backend
npm install -g vercel
vercel
# Sigue las instrucciones
# Configura las env variables cuando te lo solicite
```

---

## Paso 4: Configurar Prisma en Producción

Una vez desplegado el backend, necesitas ejecutar las migraciones:

```bash
# Desde tu proyecto backend
npx prisma migrate deploy
```

**Nota**: Vercel ejecutará `prisma generate` automáticamente durante el build si tienes el script `postinstall` configurado.

### Agregar script a package.json (backend)

Asegúrate de que `backend/package.json` tenga:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## Paso 5: Deployar el Frontend en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new) nuevamente
2. **Importa el mismo repositorio** (pero crea un **nuevo proyecto**)
3. **Root Directory**: Selecciona `frontend`
4. **Framework Preset**: Vite
5. Configura las **Environment Variables**:

   ```
   VITE_API_URL=https://tu-backend.vercel.app
   ```

   (Reemplaza con tu URL real del backend)

6. Click en **Deploy**

---

## Paso 6: Configurar CORS en el Backend

El backend necesita permitir requests del frontend. Edita `backend/next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Luego, en las **Environment Variables** del backend en Vercel, agrega:

```
FRONTEND_URL=https://tu-frontend.vercel.app
```

---

## Paso 7: Actualizar el Frontend

Asegúrate de que `frontend/src/components/ChatArea.jsx` use la variable de entorno:

```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
  // ...
});
```

---

## Resumen de Variables de Entorno

### Backend (Vercel)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
FRONTEND_URL=https://tu-frontend.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)

```
VITE_API_URL=https://tu-backend.vercel.app
```

---

## Testing en Producción

1. Visita tu frontend: `https://tu-frontend.vercel.app`
2. Envía un mensaje
3. Verifica que la respuesta llega desde el backend
4. Revisa los logs en Vercel Dashboard si hay errores

---

## Solución de Problemas

### Error: "Module '@prisma/client' has no exported member 'PrismaClient'"

**Solución**: Asegúrate de que el script `postinstall` en `package.json` ejecute `prisma generate`.

### Error de CORS

**Solución**: Verifica que `FRONTEND_URL` en el backend esté configurada correctamente y que el `next.config.ts` tenga la configuración de headers.

### Error de Conexión a Base de Datos

**Solución**: Verifica que `DATABASE_URL` sea correcta y que la base de datos esté accesible desde Vercel.

---

## Comandos Útiles

```bash
# Ver logs del backend
vercel logs <backend-url>

# Redeploy
vercel --prod

# Ejecutar migraciones (local con producción DB)
DATABASE_URL=<prod-url> npx prisma migrate deploy
```

---

## Costos Estimados (Tier Gratuito)

- **Vercel**: Hosting gratuito (Frontend + Backend)
- **Neon/Vercel Postgres**: 0.5GB gratis
- **Upstash Redis**: 10,000 comandos/día gratis

---

## Próximos Pasos (Post-Deployment)

1. Integrar autenticación de usuarios real (NextAuth.js)
2. Implementar el modelo de memoria con embeddings (OpenAI/Gemini)
3. Configurar webhooks para actualizaciones en tiempo real
4. Agregar monitoreo (Sentry, LogRocket)

---

¡Tu aplicación está lista para producción! 🚀
