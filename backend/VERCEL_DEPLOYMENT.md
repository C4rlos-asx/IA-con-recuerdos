# Vercel Deployment Guide - Prisma Migrations

## Variables de Entorno Requeridas en Vercel

Configura estas variables en tu proyecto de Vercel (Settings → Environment Variables):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Redis (si usas Upstash o similar)
REDIS_URL=redis://...

# API Keys (opcional - pueden ser configuradas por usuarios)
GEMINI_API_KEY=tu_clave_opcional
OPENAI_API_KEY=tu_clave_opcional
```

## Configuración de Base de Datos para Vercel

### Opción 1: Vercel Postgres (Recomendado)

1. En tu proyecto de Vercel, ve a **Storage** → **Create Database**
2. Selecciona **Postgres**
3. Vercel automáticamente añadirá `DATABASE_URL` a tus variables de entorno
4. **¡Listo!** No necesitas configurar nada más

### Opción 2: Supabase (Gratis, más storage)

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Settings** → **Database**
4. Copia la **Connection String** (modo "Transaction")
5. Añádela como `DATABASE_URL` en Vercel

### Opción 3: Neon.tech (Serverless Postgres)

1. Crea cuenta en [neon.tech](https://neon.tech)
2. Crea un proyecto
3. Copia la connection string
4. Añádela como `DATABASE_URL` en Vercel

## Cómo Funciona la Migración en Vercel

Cuando hagas `git push` y Vercel haga el deploy:

1. **`postinstall`**: Genera el Prisma Client
2. **`build`**: Ejecuta `prisma db push` (aplica el schema) y luego `next build`
3. Tus cambios de schema se aplicarán automáticamente

## Comandos de NPM Actualizados

- `npm run build` - Build para producción (incluye migración)
- `npm run dev` - Desarrollo local
- `npm run vercel-build` - Build específico para Vercel (si lo necesitas)

## ⚠️ Importante

> **`prisma db push` vs `prisma migrate deploy`**:
> - Usamos `db push` porque es más simple para desarrollo/staging
> - Para producción real con datos críticos, considera usar `prisma migrate deploy`
> - `db push` puede causar pérdida de datos si cambias columnas

## Verificar que Funciona

Después del deploy:
1. Ve a los logs de Vercel
2. Busca: `"Applying migration..."` o `"The database is already in sync with the Prisma schema"`
3. Si ves errores, verifica que `DATABASE_URL` esté configurado correctamente

## Troubleshooting

### Error: "Can't reach database server"
- Verifica que `DATABASE_URL` esté en las variables de entorno de Vercel
- Asegúrate de que la DB acepta conexiones desde cualquier IP (o desde IPs de Vercel)

### Error: "Prisma schema validation failed"
- Revisa `schema.prisma` - asegúrate que no tenga errores de sintaxis
- Haz commit y push de nuevo

### Los cambios no se aplican
- Vercel cachea builds. Ve a **Settings** → **Clear Cache** y redeploy

## Rollback de Migraciones

Si algo sale mal, puedes:
1. Revertir el commit con los cambios de schema
2. Push y redeploy
3. O manualmente ejecutar SQL para deshacer cambios en tu DB

---

**✅ Todo listo para Vercel**: Solo haz `git push` y Vercel manejará las migraciones automáticamente.
