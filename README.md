# 🎓 Proyecto de Título: Biblioteca Escolar CRA - Project Sophia

Este proyecto es parte de la titulación en Ingeniería en Informática.  
Sistema de Gestión de Biblioteca completo, desarrollado con el stack MERN (MongoDB, Express, React, Node.js), diseñado para administrar los préstamos de libros y recursos del Centro de Recursos para el Aprendizaje (CRA).

---

## 📑 Índice

- [✨ Características y Funcionalidades](#-características-y-funcionalidades)
- [🌐 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🚀 Guía de Instalación y Ejecución](#-guía-de-instalación-y-ejecución)
  - [Configuración del Backend](#configuración-del-backend)
  - [Configuración del Frontend](#configuración-del-frontend)
- [🧪 Guía de Pruebas Postman](#-guía-de-pruebas-postman)
- [👨‍💻 Autor](#-autor)

---

## ✨ Características y Funcionalidades

### 🔐 Sistema Central
- **Autenticación por Roles**: Administrador, Profesor, Alumno (JWT).  
- **Sesión Activa Visible**: Muestra nombre y correo del usuario logueado.  
- **Interfaz Moderna y Adaptable**: React + Tailwind CSS.  
- **Modo Oscuro/Claro**: Botón para cambiar tema (predeterminado: oscuro).

### 👤 Gestión de Usuarios
- **CRUD Completo** con modal.  
- **Búsqueda Inteligente** en tiempo real por nombre, RUT, correo o curso.  
- **Formulario Detallado**: todos los campos obligatorios y opcionales.  
- **Vista de Detalles** en modal de solo lectura.

### 📚 Gestión de Libros
- **CRUD de libros y ejemplares**.  
- **Gestión de Inventario**: creación de múltiples ejemplares.  
- **Estado individual por ejemplar** (Disponible, Deteriorado, etc.).  
- **Búsqueda y Filtros**: título, autor, ISBN, sede.  
- **Campo “Sede”** (Media o Básica).

### 💻 Gestión de Recursos CRA
- Igual que libros, pero para recursos (notebooks, proyectores, etc.).

### 🔄 Gestión de Préstamos
- **Creación Interactiva** con búsqueda en tiempo real.  
- **Historial Completo** con estado (enCurso, devuelto, atrasado).  
- **Acciones**: Devolución y Renovación de días hábiles.  
- **Búsqueda y Filtros** por usuario, ítem o estado.

### 🚫 Gestión de Sanciones
- **Sección dedicada** a usuarios sancionados.  
- **Botón “Perdonar Sanción”** para levantar restricciones.

---

## 🌐 Tecnologías Utilizadas

- **Backend**  
  - Node.js & Express (5.1.0)  
  - MongoDB & Mongoose (8.16.5)  
  - JWT (9.0.2), bcrypt.js (3.0.2)  
  - cors (2.8.5), dotenv (17.2.1)

- **Frontend**  
  - React (19.1.0) & React DOM (19.1.0)  
  - Tailwind CSS (3.4.4)  
  - Axios (1.11.0), jwt-decode (4.0.0)  
  - PostCSS (8.4.38) & Autoprefixer (10.4.19)

---

## 🚀 Guía de Instalación y Ejecución

### Configuración del Backend

1. Clona el repositorio  
   ```bash
   git clone https://github.com/Aldariz94/Proyect_Sophia.git
   cd Proyect_Sophia/backend
   ```

2. Instala dependencias  
   ```bash
   yarn install
   ```

3. Crea un archivo `.env` con:
   ```
   PORT=5000
   MONGODB_URI=tu_cadena_de_conexion_a_mongodb
   JWT_SECRET=un_secreto_muy_largo_y_dificil_de_adivinar
   ```

4. Inicia el servidor  
   ```bash
   yarn start
   ```

### Configuración del Frontend

1. Abre nueva terminal en la carpeta `frontend`  
   ```bash
   cd ../frontend
   yarn install
   yarn start
   ```

---

## 🧪 Guía de Pruebas Postman

> **Requisito previo:** El backend debe estar corriendo en `http://localhost:5000` y contar con un token de administrador.

1. **Iniciar Sesión**  
   ```http
   POST http://localhost:5000/api/auth/login
   Body:
   {
     "correo": "admin@sophia.cl",
     "password": "password_seguro"
   }
   ```

2. **Crear Usuarios**  
   ```http
   POST http://localhost:5000/api/users
   Headers: x-auth-token: <tu_token>
   Body:
   {
     "primerNombre": "Ana",
     "primerApellido": "Rojas",
     "rut": "22222222-2",
     "correo": "ana.rojas@sophia.cl",
     "password": "password_profesor",
     "rol": "profesor"
   }
   ```

3. **Añadir Libros**  
   ```http
   POST http://localhost:5000/api/books
   Headers: x-auth-token: <tu_token>
   Body:
   {
     "libroData": {
       "titulo": "La Casa de los Espíritus",
       "autor": "Isabel Allende",
       "editorial": "Sudamericana",
       "lugarPublicacion": "Santiago",
       "añoPublicacion": 1982,
       "sede": "Media"
     },
     "cantidadEjemplares": 4
   }
   ```

4. **Crear Préstamos**  
   ```http
   POST http://localhost:5000/api/loans
   Headers: x-auth-token: <tu_token>
   Body:
   {
     "usuarioId": "id_del_usuario",
     "itemId": "id_del_ejemplar_o_instancia",
     "itemModel": "Exemplar"
   }
   ```

---

## 👨‍💻 Autor

**Daniel Carreño**  
Proyecto de título 2025.  
