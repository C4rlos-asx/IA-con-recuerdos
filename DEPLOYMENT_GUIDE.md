# Guía de Deployment a Vercel con Migración

## Pre-requisitos

✅ Asegúrate de que estos archivos estén en tu repo:
- `backend/prisma/migrations/20251128_add_custom_model_to_chat/migration.sql`
- `backend/prisma/migrations/migration_lock.toml`
- `backend/package.json` (con `vercel-build` actualizado)

## Pasos para Deployment

### 1. Commit y Push de los Cambios

```bash
git add .
git commit -m "feat: add custom model persistence to chats"
git push origin main
```

### 2. Vercel Detectará los Cambios Automáticamente

Vercel ejecutará:
```bash
npm run vercel-build
```

Que hace:
1. `prisma generate` - Genera el cliente de Prisma
2. `prisma migrate deploy` - **Aplica la migración pendiente**
3. `next build` - Construye la aplicación

### 3. Verificación Post-Deployment

Una vez que el deployment esté completo:

**A. Verifica los Logs de Build**
- Ve a Vercel Dashboard → Tu proyecto → Deployments → [Latest]
- Busca en los logs: `Running migrate deploy ...`
- Debería mostrar: `1 migration applied: 20251128_add_custom_model_to_chat`

**B. Prueba la Funcionalidad**
1. Abre tu app en producción
2. Crea un chat con un modelo personalizado
3. Envía 2-3 mensajes
4. **Recarga la página**
5. Verifica que:
   - Los mensajes sigan ahí
   - El modelo personalizado siga seleccionado
   - El título muestre el nombre del modelo

**C. Verifica la Base de Datos (Opcional)**

Si tienes acceso a la DB de Vercel Postgres:
```sql
-- Ver que la columna existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Chat' AND column_name = 'customModelId';

-- Ver chats con modelo personalizado
SELECT id, title, "customModelId"
FROM "Chat"
WHERE "customModelId" IS NOT NULL;
```

## Comandos Útiles

### Si Necesitas Ejecutar la Migración Manualmente

**SOLO EN CASO DE EMERGENCIA** (si el build automático falla):

```bash
# En tu terminal local (con acceso a la DB de producción)
cd backend
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

> ⚠️ **ADVERTENCIA**: Asegúrate de tener `DATABASE_URL` apuntando a la base de datos de producción en Vercel.

### Rollback (Si Algo Sale Mal)

Si necesitas revertir:

1. **Revertir el código:**
```bash
git revert HEAD
git push origin main
```

2. **Revertir la migración en la DB:**
```sql
-- Eliminar la foreign key
ALTER TABLE "Chat" DROP CONSTRAINT IF EXISTS "Chat_customModelId_fkey";

-- Eliminar la columna
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "customModelId";
```

## Troubleshooting

### Error: "Migration failed to apply"

**Causa:** La migración podría estar duplicada o mal formateada.

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que `DATABASE_URL` esté configurado
3. Revisa los logs de build para el error específico

### Error: "Prisma Client not generated"

**Causa:** `prisma generate` falló.

**Solución:**
- El `postinstall` script debería ejecutarse automáticamente
- Verifica que `@prisma/client` y `prisma` tengan la misma versión en `package.json`

### Chats Antiguos No Muestran el Modelo

**Esto es normal:**
- Los chats creados antes de la migración tendrán `customModelId = null`
- Seguirán funcionando como chats normales
- Solo los **nuevos** chats con modelos personalizados tendrán la asociación

## Resumen de Comandos

```bash
# 1. Commit cambios
git add .
git commit -m "feat: add custom model persistence to chats"
git push origin main

# 2. Vercel hace el build automáticamente
# (No necesitas ejecutar nada)

# 3. Verifica en Vercel Dashboard
# - Ve a Deployments → Latest → Build Logs
# - Busca "Running migrate deploy"
# - Debería mostrar "1 migration applied"
```

## Estado Final

Después del deployment exitoso:

✅ Base de datos actualizada con `customModelId`
✅ Backend guardando la asociación chat-modelo
✅ Frontend recuperando la configuración del modelo
✅ Chats de modelos personalizados mantienen contexto

---

**¡Listo para producción!** 🚀
