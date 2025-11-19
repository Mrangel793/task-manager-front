# Task Manager Frontend

Aplicación frontend de gestión de tareas desarrollada con Vue.js 3, Vite, Tailwind CSS y configurada como PWA.

## Tecnologías

- **Vue.js 3** - Framework JavaScript progresivo
- **Vite** - Build tool y dev server
- **Vue Router** - Enrutamiento
- **Pinia** - State management
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **Vee-Validate + Yup** - Validación de formularios
- **VueUse** - Colección de composables
- **Workbox** - Service Worker para PWA

## Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos (imágenes, fuentes, etc.)
├── components/      # Componentes Vue reutilizables
│   ├── common/      # Componentes comunes (botones, inputs, etc.)
│   ├── tasks/       # Componentes específicos de tareas
│   └── auth/        # Componentes de autenticación
├── composables/     # Composables de Vue (lógica reutilizable)
├── layouts/         # Layouts de página
├── router/          # Configuración de Vue Router
├── stores/          # Stores de Pinia
├── services/        # Servicios API y lógica de negocio
├── views/           # Vistas/páginas de la aplicación
└── utils/           # Utilidades y helpers
```

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
VITE_ENV=development
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Características

### PWA (Progressive Web App)

La aplicación está configurada como PWA con las siguientes características:

- Instalable en dispositivos
- Funciona offline
- Actualización automática
- Cache de recursos y API
- Notificaciones push (configuración pendiente)

### Sistema de Autenticación

- Login con email/password
- Registro de nuevos usuarios
- Refresh token automático
- Guards de rutas protegidas
- Persistencia de sesión en localStorage

### Gestión de Estado

Se utiliza Pinia para el manejo del estado global:

- `authStore` - Estado de autenticación
- `taskStore` - Estado de tareas

### Servicios API

- `api.js` - Cliente Axios configurado con interceptores
- `auth.service.js` - Servicios de autenticación
- `task.service.js` - Servicios de tareas

Los interceptores incluyen:

- Agregado automático del token JWT
- Refresh token automático en 401
- Manejo centralizado de errores

### Composables

- `useForm` - Manejo de formularios y validación
- `useToast` - Sistema de notificaciones toast

### Routing

El router incluye:

- Guards de autenticación
- Rutas protegidas
- Lazy loading de componentes
- Redirección según estado de autenticación

## Tema y Estilos

Tailwind CSS está configurado con un tema personalizado que incluye:

- Colores primarios (azul)
- Colores secundarios (morado)
- Componentes predefinidos (botones, inputs, cards)
- Modo responsivo

Clases de utilidad disponibles:

- `.btn-primary` - Botón primario
- `.btn-secondary` - Botón secundario
- `.input-field` - Campo de entrada
- `.card` - Tarjeta

## Despliegue

### Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en el directorio `dist/`

### Variables de Entorno para Producción

Asegúrate de configurar las variables de entorno apropiadas en tu servidor:

```env
VITE_API_URL=https://api.tudominio.com/api
VITE_ENV=production
```

## Próximos Pasos

- [ ] Crear componentes de UI en `components/common/`
- [ ] Implementar vistas en `views/`
- [ ] Configurar layouts en `layouts/`
- [ ] Agregar validaciones de formularios con Yup
- [ ] Implementar tests unitarios
- [ ] Configurar CI/CD

## Licencia

MIT
