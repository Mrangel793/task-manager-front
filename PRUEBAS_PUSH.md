# Guía de Pruebas - Notificaciones Push

Esta guía te ayudará a probar el sistema de notificaciones push paso a paso.

## Preparación

### 1. Verificar configuración del backend

Asegúrate de que el backend tenga configuradas las claves VAPID en el `.env`:

```env
VAPID_PUBLIC_KEY=BL3FH9rOvoVpTbGHqR1G-DBEUModQ8E-ULqoFvul5eo3QeHRziCygrqxGKbkX2ZjRkVXNYW6qheFwPmrDJL0yNk
VAPID_PRIVATE_KEY=bx6z9etD5JWR8b3_2f_dKMfxEeF_XTRwQxfPjObIzcQ
VAPID_SUBJECT=mailto:rangelmarly@gmail.com
```

### 2. Verificar configuración del frontend

La clave ya está configurada en el `.env` del frontend:

```env
VITE_VAPID_PUBLIC_KEY=BL3FH9rOvoVpTbGHqR1G-DBEUModQ8E-ULqoFvul5eo3QeHRziCygrqxGKbkX2ZjRkVXNYW6qheFwPmrDJL0yNk
```

### 3. Reiniciar servidor de desarrollo

```bash
# En la carpeta del frontend
npm run dev
```

## Prueba 1: Panel de Configuración de Notificaciones

### Paso 1: Acceder al panel
1. Abre el navegador en http://localhost:3000
2. Inicia sesión
3. Ve a la ruta: http://localhost:3000/profile/notifications

### Paso 2: Verificar estado del sistema
Deberías ver 4 tarjetas de estado:

✅ **Soporte del navegador**: Debe mostrar "Compatible" (verde)
✅ **Permiso de notificaciones**: Inicialmente "default" (gris)
✅ **Suscripción**: Debe mostrar "Inactiva" (gris)
✅ **Clave VAPID**: Debe mostrar "Configurada" (verde)

Si alguno falla:
- **No compatible**: Usa Chrome, Firefox o Edge actualizado
- **Clave VAPID no configurada**: Verifica el .env y reinicia el servidor

### Paso 3: Activar notificaciones
1. Haz click en el botón **"Activar"**
2. El navegador te pedirá permiso → Click en **"Permitir"**
3. Deberías ver:
   - Toast de éxito: "Notificaciones activadas correctamente"
   - Estado de **Permiso** cambia a "granted" (verde)
   - Estado de **Suscripción** cambia a "Activa" (verde)
   - Aparece sección de **Información de Depuración** con datos de la suscripción

### Paso 4: Probar notificación local
1. Haz click en el botón **"Probar"**
2. Deberías recibir una notificación del navegador
3. La notificación debe mostrar:
   - Título: "Notificación de Prueba"
   - Mensaje: "Esta es una notificación de prueba desde Task Manager"

✅ **Prueba 1 completada** si recibiste la notificación de prueba.

---

## Prueba 2: Prompt Automático

### Paso 1: Limpiar datos
1. Desactiva las notificaciones desde el panel (si las activaste antes)
2. Abre las DevTools (F12) → Application → Storage
3. Click derecho en localStorage → Clear
4. Cierra la sesión

### Paso 2: Nueva sesión
1. Inicia sesión nuevamente
2. Espera **3 segundos**
3. Debería aparecer un **prompt en la esquina inferior derecha**:
   - Título: "Recibe avisos de tareas"
   - Mensaje: "Te notificaremos cuando te asignen tareas o estén por vencer"
   - Botones: "Activar" / "Ahora no"

### Paso 3: Activar desde el prompt
1. Click en **"Activar"**
2. Acepta el permiso del navegador
3. El prompt desaparece
4. Deberías ver toast de éxito

✅ **Prueba 2 completada** si el prompt apareció y pudiste activar.

---

## Prueba 3: Notificación desde el Backend

### Paso 1: Verificar suscripción en el backend
1. Ve al panel de notificaciones: http://localhost:3000/profile/notifications
2. Verifica que la suscripción esté activa (verde)
3. Copia el **endpoint** de la sección de depuración

### Paso 2: Verificar en base de datos (opcional)
```sql
-- En la base de datos del backend
SELECT * FROM push_subscriptions WHERE user_id = 'tu-user-id';
```

Deberías ver un registro con el endpoint.

### Paso 3: Crear una tarea asignada
Hay dos formas de hacerlo:

#### Opción A: Desde la UI
1. Ve a la lista de tareas
2. Click en el botón flotante "+" (si eres admin/supervisor)
3. Crea una tarea y asígnala a tu usuario
4. Guarda la tarea

#### Opción B: Desde otro usuario
1. Crea otra cuenta de admin/supervisor
2. Desde esa cuenta, crea una tarea asignada a tu usuario principal

### Paso 4: Verificar notificación
Deberías recibir una notificación push que muestre:
- Título: "Nueva tarea asignada" (o similar)
- Mensaje: Nombre/descripción de la tarea
- Al hacer click: Abre la app en la tarea específica

### Paso 5: Verificar logs
Abre la consola del navegador (F12) y busca:
```
[Service Worker] Push recibido: ...
[Service Worker] Datos del push: ...
```

✅ **Prueba 3 completada** si recibiste la notificación desde el backend.

---

## Prueba 4: Notificación con App Cerrada

### Paso 1: Preparar
1. Asegúrate de tener las notificaciones activadas
2. Verifica que el Service Worker esté activo:
   - DevTools → Application → Service Workers
   - Debe mostrar "activated and is running"

### Paso 2: Cerrar la app
1. Cierra la pestaña del navegador (o todo el navegador)
2. Espera unos segundos

### Paso 3: Crear tarea desde otro dispositivo/usuario
1. Desde otro navegador/dispositivo (o usa el backend directamente)
2. Crea una tarea asignada a tu usuario
3. O reasigna una tarea existente a tu usuario

### Paso 4: Verificar notificación
Deberías recibir la notificación **aunque el navegador esté cerrado** (en segundo plano).

Al hacer click en la notificación:
- Se abre el navegador
- Navega a la tarea específica

✅ **Prueba 4 completada** si recibiste la notificación con la app cerrada.

---

## Prueba 5: Desactivar Notificaciones

### Paso 1: Desactivar desde el panel
1. Ve a http://localhost:3000/profile/notifications
2. Click en **"Desactivar"**
3. Deberías ver:
   - Toast de éxito
   - Estado de suscripción cambia a "Inactiva"
   - Desaparece la sección de depuración

### Paso 2: Verificar que no llegan notificaciones
1. Crea una tarea asignada a tu usuario
2. **NO** deberías recibir notificación

### Paso 3: Reactivar
1. Click en **"Activar"** nuevamente
2. Verifica que vuelvan a funcionar

✅ **Prueba 5 completada** si pudiste activar/desactivar correctamente.

---

## Troubleshooting

### No aparece el prompt automático

**Causa:** Ya fue descartado o ya estás suscrito.

**Solución:**
1. Application → localStorage → Eliminar `push_prompt_dismissed` y `push_subscribed`
2. Recargar la página

### Error: "La clave VAPID no está configurada"

**Solución:**
1. Verifica que VITE_VAPID_PUBLIC_KEY esté en .env
2. Reinicia el servidor con `npm run dev`
3. Recarga el navegador (Ctrl + Shift + R)

### Error al suscribirse: "Service Worker not supported"

**Solución:**
- Usa HTTPS o localhost
- Actualiza el navegador
- Usa Chrome, Firefox o Edge

### No llegan notificaciones del backend

**Posibles causas:**
1. **Suscripción no guardada**: Verifica en la tabla `push_subscriptions`
2. **Backend no envía**: Revisa logs del backend Laravel
3. **Evento no disparado**: Verifica que el evento `TaskCreated` se dispare
4. **Listener no ejecutado**: Revisa que el listener esté registrado

**Verificar en backend:**
```bash
# Ver logs
tail -f storage/logs/laravel.log

# Verificar eventos
php artisan event:list
```

### Service Worker no se activa

**Solución:**
1. DevTools → Application → Service Workers → Unregister
2. Recargar (Ctrl + Shift + R)
3. Verificar que aparezca el SW de nuevo

### Click en notificación no abre la app

**Solución:**
- Verifica que el campo `data.url` esté en la notificación
- Revisa logs en la consola del Service Worker:
  - DevTools → Application → Service Workers → Click en "sw.js"

---

## Checklist de Pruebas

- [ ] Panel de configuración muestra estados correctos
- [ ] Puede activar notificaciones desde el panel
- [ ] Notificación de prueba funciona
- [ ] Prompt automático aparece después de 3 segundos
- [ ] Puede activar notificaciones desde el prompt
- [ ] Recibe notificación al crear tarea asignada
- [ ] Click en notificación abre la tarea correcta
- [ ] Recibe notificación con app cerrada (background)
- [ ] Puede desactivar notificaciones
- [ ] Al desactivar, no recibe notificaciones
- [ ] Puede reactivar notificaciones

## Navegadores Recomendados para Pruebas

- ✅ Chrome/Edge (mejor soporte)
- ✅ Firefox
- ⚠️ Safari (requiere iOS 16.4+ / macOS 16+)
- ❌ Navegadores en modo incógnito (Service Workers limitados)

## Logs Útiles

### Frontend (Consola del navegador)
```
[Service Worker] Instalado
[Service Worker] Activado
[Service Worker] Push recibido: {...}
[Service Worker] Click en notificación: {...}
```

### Backend (Laravel)
```bash
tail -f storage/logs/laravel.log | grep "push"
```

---

Si todas las pruebas pasan, el sistema de notificaciones push está funcionando correctamente. 🎉
