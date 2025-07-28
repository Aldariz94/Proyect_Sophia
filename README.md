# 🎓 Proyecto de Título: Biblioteca Escolar CRA - MERN

Este proyecto es parte de la titulación en Ingeniería en Informática.  
Sistema de gestión para bibliotecas escolares CRA, basado en el stack MERN.

---

<details>
<summary>📑 Índice</summary>

- [🌐 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🚀 Instrucciones para ejecutar el proyecto](#-instrucciones-para-ejecutar-el-proyecto)
  - [🔧 Backend](#-backend)
  - [💻 Frontend](#-frontend)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🧩 Funcionalidades Principales](#-funcionalidades-principales)
- [💡 Notas](#-notas)
- [🧪 Guía de Pruebas Postman](#-guía-de-pruebas-postman)
- [👨‍💻 Autor](#-autor)

</details>

---

## 🌐 Tecnologías Utilizadas

### 🛠️ Backend

- express 5.1.0  
- mongoose 8.16.5  
- jsonwebtoken 9.0.2  
- bcryptjs 3.0.2  
- cors 2.8.5  
- dotenv 17.2.1  

### 💻 Frontend

- react 19.1.0  
- react-dom 19.1.0  
- axios 1.11.0  
- jwt-decode 4.0.0  
- tailwindcss 3.4.4  
- autoprefixer 10.4.19  
- postcss 8.4.38  
- react-scripts 5.0.1  
- @testing-library/react, @testing-library/jest-dom, @testing-library/user-event  

---

## 🚀 Instrucciones para ejecutar el proyecto

### 🔧 Backend

```bash
cd backend
yarn install
```

Crear un archivo `.env` en `backend/` con:

```env
PORT=5000
MONGO_URI=mongodb://
JWT_SECRET=tu_clave_secreta
```

```bash
yarn start
```

---

### 💻 Frontend

```bash
cd frontend
yarn install
yarn start
```

---

## 📁 Estructura del Proyecto

```bash
Proyect_Sophia/
├── backend/        # Servidor Express y rutas API
├── frontend/       # Aplicación cliente en React
├── README.md
```

---

## 🧩 Funcionalidades Principales

- 🔐 Login de usuario funcional  
- 👀 Visualización de datos desde la base de datos  
- 🌙 Modo oscuro implementado  
- 🧩 Backend completo: rutas, controladores y conexión a MongoDB  
- 📝 Documentación inicial en README  

---

## 💡 Notas

- El proyecto fue desarrollado usando `yarn`.  
- Se ignoraron los archivos `.env`, `node_modules` y `dist`.  
- Se recomienda usar MongoDB local para pruebas y Postman para validar rutas del backend.  

---

## 🧪 Guía de Pruebas Postman

### ✅ Requisitos Previos

- El servidor backend debe estar corriendo (`yarn node server.js`).  
- Debes tener un token de administrador válido.

### 1. Crear Usuarios

**a) Profesor**  
`POST http://localhost:5000/api/users`  
Headers: `x-auth-token`: tu token  
Body:
```json
{
  "primerNombre": "Ana",
  "primerApellido": "Rojas",
  "rut": "22222222-2",
  "correo": "ana.rojas@sophia.cl",
  "password": "password_profesor",
  "rol": "profesor"
}
```

**b) Alumno**  
`POST http://localhost:5000/api/users`  
Headers: `x-auth-token`: tu token  
Body:
```json
{
  "primerNombre": "Pedro",
  "primerApellido": "Gomez",
  "rut": "33333333-3",
  "correo": "pedro.gomez@sophia.cl",
  "password": "password_alumno",
  "rol": "alumno",
  "curso": "8vo Básico"
}
```

### 2. Añadir Libros

`POST http://localhost:5000/api/books`  
Headers: `x-auth-token`: tu token  
Body:
```json
{
  "libroData": {
    "tipoDocumento": "Novela",
    "titulo": "La Casa de los Espíritus",
    "autor": "Isabel Allende",
    "lugarPublicacion": "Santiago",
    "editorial": "Sudamericana",
    "añoPublicacion": 1982
  },
  "cantidadEjemplares": 4
}
```

### 3. Préstamos de Libros

- Crear préstamo (POST `/api/loans`)  
- Ver préstamos (GET `/api/loans/user/{usuarioId}`)  
- Devolver libro (POST `/api/loans/return/{loanId}`)  

### 4. Recursos CRA

- Crear recurso (POST `/api/resources`)  
- Ver recursos (GET `/api/resources`)  

### 5. Préstamos de Recursos CRA

- Crear préstamo (POST `/api/loans`)  
- Devolver recurso (POST `/api/loans/return/{loanId}`)  

---

## 👨‍💻 Autor

**Daniel Carreño**  
*Este proyecto es parte del trabajo de título 2025.*