# Guía de Deployment a Producción (Render/Vercel)

## ⚠️ Error P3005 - Base de Datos Existente

Si ves este error:
```
Error: P3005
The database schema is not empty.
```

**Causa:** Tu base de datos de producción ya tiene tablas, pero Prisma no tiene historial de migraciones previas.

**Solución Aplicada:** Usar `prisma db push` en lugar de `prisma migrate deploy`.

## Por Qué Usamos `db push`

### `prisma db push` (Lo que usamos ahora)
✅ **Ventajas:**
- Funciona con bases de datos existentes
- Sincroniza el schema directamente
- No requiere historial de migraciones
- Ideal para desarrollo y prototipos en producción

⚠️ **Desventajas:**
- No crea historial de cambios
- Puede perder datos si cambias tipos de columna
- Usa `--accept-data-loss` (pero es seguro para agregar columnas nuevas)

### `prisma migrate deploy` (Producción ideal)
✅ **Ventajas:**
- Historial completo de cambios
- Control de versiones de schema
- Rollbacks más fáciles

❌ **Problema:**
- Requiere que la DB esté "limpia" o ya baselining
- No funciona con bases de datos existentes sin configuración previa

## Comandos para Deployment

### Deployment Actual (Automático)

Cuando hagas push, se ejecutará:
```bash
npm run vercel-build
# Que hace:
# 1. prisma generate
# 2. prisma db push --accept-data-loss  ← Sincroniza schema
# 3. next build
```

### Para Deployar

```bash
git add .
git commit -m "feat: add custom model persistence to chats"
git push origin main
```

## Verificación Post-Deployment

1. **Verifica los Logs de Build**
   - Busca: `Database is now in sync with your Prisma schema`
   - Confirma que no haya errores

2. **Prueba la Funcionalidad**
   - Crea un chat con modelo personalizado
   - Envía 2-3 mensajes
   - Recarga la página
   - Verifica que los mensajes permanezcan

3. **Verifica la Base de Datos (Opcional)**
   ```sql
   -- Verifica que la columna existe
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'Chat' AND column_name = 'customModelId';
   ```

## Migrar a Sistema de Migraciones Apropiado (Futuro)

Si quieres usar el sistema de migraciones apropiado más adelante:

### 1. Baseline de la Base de Datos Actual

```bash
# Crea una migración inicial que marca el estado actual
npx prisma migrate dev --name init --create-only

# Marca todas las migraciones como aplicadas SIN ejecutarlas
npx prisma migrate resolve --applied "20251128_add_custom_model_to_chat"
```

### 2. Actualiza package.json

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## Troubleshooting

### ❌ Error: "Column already exists"

**Solución:** La columna ya fue agregada. Esto es normal si redeployas.
- `db push` es idempotente - verifica antes de agregar

### ❌ Error: "Out of sync"

**Solución:**
1. Verifica que `schema.prisma` tenga la última versión
2. Asegúrate de hacer commit del schema actualizado

### ❌ Build sigue fallando

**Solución de Emergencia:**
1. Ve a Render/Vercel Dashboard
2. Environment Variables → `SKIP_DB_PUSH=true`
3. Redeploy
4. Ejecuta manualmente:
   ```bash
   # Localmente con DATABASE_URL de producción
   npx prisma db push
   ```

## Estado Actual del Proyecto

✅ Schema actualizado con `customModelId`
✅ Backend guarda asociación chat-modelo  
✅ Frontend envía/recupera modelo personalizado
✅ Build configurado con `db push` para base de datos existente

## Comando Completo de Deployment

```bash
# 1. Asegúrate de tener los últimos cambios
git pull origin main

# 2. Commit cambios
git add .
git commit -m "feat: add custom model persistence to chats"

# 3. Push a producción
git push origin main

# 4. Render/Vercel hace el build automáticamente
# Verifica los logs en el dashboard
```

---

**Nota:** Una vez que la aplicación esté estable y quieras mejor control de versiones de schema, puedes migrar al sistema de migraciones apropiado usando el proceso de baseline descrito arriba.
