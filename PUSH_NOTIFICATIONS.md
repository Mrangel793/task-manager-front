# Configuración de Notificaciones Push

Este documento explica cómo configurar y usar el sistema de notificaciones push en Task Manager.

## Requisitos

- Backend con Laravel configurado y endpoint de push notifications
- Navegador compatible con Push API y Service Workers
- Conexión HTTPS (excepto en localhost)

## Configuración

### 1. Obtener la clave pública VAPID del backend

En el backend Laravel, ejecutar:

```bash
php artisan vapid:generate
```

Esto generará o mostrará la clave pública VAPID configurada.

### 2. Configurar la clave en el frontend

Editar el archivo `.env` y agregar la clave pública VAPID:

```env
VITE_VAPID_PUBLIC_KEY=TU_CLAVE_PUBLICA_VAPID_AQUI
```

**Importante:** Reiniciar el servidor de desarrollo después de modificar el `.env`.

### 3. Verificar la configuración

1. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abrir la aplicación en el navegador (debe ser HTTPS o localhost)

3. Después de 3 segundos, debería aparecer un prompt solicitando activar las notificaciones

## Funcionamiento

### Flujo de suscripción

1. **Prompt inicial:** Aparece 3 segundos después de cargar la aplicación
2. **Permiso del navegador:** El usuario debe aceptar las notificaciones
3. **Suscripción:** Se genera una suscripción única y se envía al backend
4. **Almacenamiento:** El backend guarda la suscripción asociada al usuario

### Eventos que generan notificaciones

El backend enviará notificaciones push en los siguientes casos:

1. **Tarea asignada:** Cuando se asigna una nueva tarea al usuario
2. **Tarea reasignada:** Cuando una tarea es reasignada al usuario
3. **Recordatorio de vencimiento:** 30 minutos antes de que venza una tarea
4. **Cambio de estado:** Cuando cambia el estado de una tarea asignada

### Estructura de una notificación

```javascript
{
  title: "Nueva tarea asignada",
  body: "Descripción de la tarea",
  icon: "/pwa-192x192.png",
  badge: "/pwa-192x192.png",
  data: {
    taskId: "uuid-de-la-tarea",
    url: "/tasks/uuid-de-la-tarea"
  }
}
```

### Click en notificación

Al hacer click en una notificación:

1. La aplicación se enfoca (si ya está abierta)
2. Navega a la tarea específica
3. Si la aplicación está cerrada, se abre en la tarea

## Archivos del sistema

### Frontend

- **src/services/push.service.js** - Servicio para manejar suscripciones
- **src/composables/usePushNotifications.js** - Composable de Vue para usar push
- **src/components/notifications/PushPermissionPrompt.vue** - Prompt de permisos
- **src/sw.js** - Service Worker personalizado para push
- **src/layouts/AppLayout.vue** - Integración del componente

### Backend

- **app/Http/Controllers/Api/PushNotificationController.php** - Endpoints de suscripción
- **app/Notifications/TaskAssignedNotification.php** - Notificación de tarea asignada
- **app/Listeners/SendTaskCreatedNotification.php** - Listener de eventos

## API Endpoints

### Suscribirse

```http
POST /api/v1/push/subscribe
Content-Type: application/json
Authorization: Bearer {token}

{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### Cancelar suscripción

```http
POST /api/v1/push/unsubscribe
Content-Type: application/json
Authorization: Bearer {token}

{
  "endpoint": "https://..."
}
```

## Desactivar notificaciones

El usuario puede desactivar las notificaciones de dos formas:

1. **Desde el prompt:** Hacer click en "Ahora no" (se volverá a mostrar en 7 días)
2. **Desde el navegador:** Configuración > Permisos > Notificaciones
3. **Desde la configuración del perfil** (próximamente)

## Desarrollo y pruebas

### Probar en local

1. Asegurarse de que el backend esté ejecutándose
2. Configurar VITE_VAPID_PUBLIC_KEY en .env
3. Reiniciar el servidor de desarrollo
4. Abrir http://localhost:3000
5. Aceptar el permiso de notificaciones
6. Crear una tarea asignada al usuario actual
7. Verificar que se recibe la notificación

### Inspeccionar Service Worker

En Chrome DevTools:
1. Application > Service Workers
2. Ver el estado del service worker
3. Push > Send push notification (para pruebas)

### Ver suscripciones

En Chrome DevTools:
1. Application > Storage > IndexedDB
2. Buscar la base de datos de Push

## Troubleshooting

### No aparece el prompt

- Verificar que VITE_VAPID_PUBLIC_KEY esté configurado
- Verificar que el Service Worker esté registrado
- Revisar la consola del navegador por errores
- Verificar que no se haya descartado antes (localStorage)

### Error de suscripción

- Verificar que la clave VAPID sea correcta
- Verificar que el backend esté ejecutándose
- Revisar logs del backend
- Verificar que el endpoint /api/v1/push/subscribe exista

### No se reciben notificaciones

- Verificar que el usuario tenga permisos de notificaciones
- Verificar que la suscripción esté guardada en el backend
- Revisar logs del backend al enviar notificación
- Verificar que el Service Worker esté activo

## Navegadores compatibles

- ✅ Chrome/Edge (Desktop y Android)
- ✅ Firefox (Desktop y Android)
- ✅ Safari (macOS 16+, iOS 16.4+)
- ❌ Opera Mini
- ❌ Navegadores antiguos sin soporte de Service Workers

## Seguridad

- Las claves VAPID deben mantenerse privadas
- Las suscripciones están asociadas a usuarios autenticados
- El backend valida el token JWT antes de enviar notificaciones
- Las notificaciones solo se envían a suscriptores activos

## Próximas mejoras

- [ ] Panel de configuración de notificaciones en perfil
- [ ] Silenciar notificaciones por período de tiempo
- [ ] Filtrar tipos de notificaciones (solo tareas urgentes, etc.)
- [ ] Sonidos personalizados por tipo de notificación
- [ ] Notificaciones agrupadas
