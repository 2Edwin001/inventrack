# InvenTrack

Sistema de gestión de inventario desarrollado con React, Vite y Supabase.

## Descripción

InvenTrack es una aplicación web para el control y seguimiento de inventario. Permite registrar productos, gestionar stock, visualizar métricas y generar reportes en tiempo real gracias a la integración con Supabase como backend.

## Stack tecnológico

- **React 18** — interfaz de usuario
- **Vite** — bundler y servidor de desarrollo
- **Tailwind CSS** — estilos utilitarios
- **Supabase** — base de datos, autenticación y API en tiempo real
- **React Router DOM** — enrutamiento del cliente
- **Recharts** — gráficos y visualizaciones
- **React Hook Form** — manejo de formularios

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

2. Edita `.env` y agrega tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Estructura del proyecto

```
src/
├── components/   # Componentes reutilizables
├── pages/        # Páginas de la aplicación
├── hooks/        # Custom hooks
├── lib/          # Configuración de librerías (Supabase, etc.)
└── context/      # Contextos de React (estado global)
```
