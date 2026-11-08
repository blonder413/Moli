# 🍿 MOLI - Registro de películas Vistas

MOLI es una plataforma de **software libre y código abierto** diseñada para gestionar de manera personalizada un catálogo de películas vistas y pendientes. El sistema interactúa con la API de The Movie Database (TMDb) para descubrir títulos y almacena el historial físico en una base de datos relacional robusta.

Este proyecto cuenta con una arquitectura desacoplada estructurada con un **Backend en NestJS** y un **Frontend en React**.

---

## ✨ Características Principales

### 🔍 Descubrir Películas (Buscador Global)
*   **Consulta en tiempo real:** Conexión directa a los servidores de TMDb a través de Axios de forma asíncrona.
*   **Efecto Cross-fade interactivo:** Intercambio milimétrico de títulos (Español ⇄ Original) al pasar el cursor sobre las tarjetas.
*   **Zoom de carátulas dinámico:** Efecto visual moderno integrado que respeta las proporciones verticales de la grilla.
*   **Filtro de contenido para adultos (🔞):** Interruptor en la cabecera para activar o desactivar restricciones de edad bajo demanda.
*   **Pre-evaluación de estado:** El buscador detecta mediante validación cruzada si una película ya se encuentra en tu biblioteca (Vista o Pendiente), bloqueando la inserción de duplicados.

### 📚 Mi Catálogo Personalizado (MariaDB)
*   **Paginación de alto rendimiento:** Segmentación exacta de a 20 registros por página procesada desde el servidor.
*   **Buscador Global del Historial:** Filtro de texto avanzado que escanea títulos en español, inglés, años de lanzamiento o plataformas a lo largo de todas las páginas de la base de datos.
*   **Autonomía de Datos:** Almacenamiento físico de metadatos clave (`movieTitle`, `originalTitle`, `releaseYear`, `vote_average`) para búsquedas instantáneas libres de dependencia de internet.
*   **Ventana de Detalles Interactiva (Modal):** Panel modular independiente que inyecta de forma segura reproductores embebidos de YouTube para los trailers oficiales y lista plataformas de streaming de JustWatch.
*   **Notificaciones flotantes (Toasts):** Alertas reactivas y estilizadas integradas en el flujo UX que reemplazan las ventanas de alerta nativas.

---

## 🛠️ Tecnologías Utilizadas

### Backend
*   **Framework:** NestJS v10+ (Node.js) con TypeScript estricto.
*   **Base de Datos:** MariaDB / MySQL.
*   **ORM:** TypeORM con QueryBuilder avanzado para optimización SQL.
*   **Cliente HTTP:** Axios / @nestjs/axios con manejo seguro de Observables y promesas.

### Frontend
*   **Biblioteca Principal:** React 18+ con TypeScript.
*   **Empaquetador/Entorno:** Vite (Ultra rápido).
*   **Estilos:** Tailwind CSS v4 (Compilación nativa e inyección de gradientes).
*   **Estado y Peticiones:** Hooks nativos de React (`useState`, `useEffect`) y Axios Client.

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos
*   Node.js (v18 o superior)
*   **pnpm** (Gestor de paquetes recomendado)
*   Instancia activa de MariaDB o MySQL

### 1. Configuración del Backend

1.  Navega a la carpeta del servidor:
    ```bash
    cd movie-tracker-backend
    ```
2.  Instala las dependencias de Node:
    ```bash
    pnpm install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta del backend y configura tus variables de entorno:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=tu_usuario
    DB_PASSWORD=tu_contraseña
    DB_DATABASE=moli_db
    TMDB_API_TOKEN=tu_token_bearer_de_tmdb_api
    ```
4.  Enciende el servidor en modo desarrollo (las tablas se generarán solas en MariaDB mediante TypeORM synchronice):
    ```bash
    pnpm run start:dev
    ```

### 2. Configuración del Frontend

1.  Abre una nueva terminal y navega a la carpeta de la interfaz:
    ```bash
    cd movie-tracker-frontend
    ```
2.  Instala las dependencias y la integración moderna de Tailwind v4:
    ```bash
    pnpm install
    ```
3.  Enciende el entorno local de Vite:
    ```bash
    pnpm run dev
    ```
4.  Abre en tu navegador la URL indicada por la consola (usualmente `http://localhost:5173`).

---

## 📝 Estructura del Repositorio

```text
├── movie-tracker-backend/       # Servidor NestJS & Modelos TypeORM
│   ├── src/
│   │   ├── watched-movies/      # Módulo principal del catálogo
│   │   │   ├── entities/        # Entidad de la tabla en MariaDB
│   │   │   ├── dto/             # Objetos de Transferencia de Datos (DTO)
│   │   │   ├── watched-movies.controller.ts
│   │   │   └── watched-movies.service.ts
│   │   └── main.ts              # Habilitación de CORS & Pipes globales
│   
└── movie-tracker-frontend/      # Interfaz de Usuario en React & Tailwind v4
    ├── src/
    │   ├── components/
    │   │   ├── LibraryCard.tsx  # Componente reactivo del catálogo local
    │   │   └── DetailModal.tsx  # Ventana modular de tráilers de YouTube
    │   ├── interfaces/          # Contratos de tipos estrictos de TypeScript
    │   ├── App.tsx              # Manejo global del estado y lógica de vistas
    │   └── index.css            # Configuración y directivas de Tailwind v4
```

---

## ⚖️ Licencia

Este proyecto está distribuido bajo la **Licencia MIT**. Siéntete libre de clonarlo, modificarlo y adaptarlo a tus necesidades para tus portafolios personales. 

---
🍿 **MOLI** - Desarrollado con pasión priorizando la optimización de código, rendimiento y diseño limpio.
