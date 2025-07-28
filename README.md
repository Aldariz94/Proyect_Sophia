# 🎓 Proyecto de Título: Biblioteca Escolar CRA - MERN

Este proyecto es parte de la titulación en Ingeniería en Informática.  
Sistema de gestión para bibliotecas escolares CRA, basado en el stack MERN.

---

## 📑 Índice

- [🌐 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🚀 Instrucciones para ejecutar el proyecto](#-instrucciones-para-ejecutar-el-proyecto)
  - [🔧 Backend](#-backend)
  - [💻 Frontend](#-frontend)
- [🧩 Funcionalidades Principales](#-funcionalidades-principales)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [💡 Notas](#-notas)
- [👨‍💻 Autor](#-autor)

---

## 🌐 Tecnologías Utilizadas

- **Frontend**: React + Vite + Axios + React Router DOM  
- **Backend**: Node.js + Express + MongoDB (Mongoose)  
- **Control de versiones**: Git + GitHub

---

## 🚀 Instrucciones para ejecutar el proyecto

### 🔧 Backend

#### Instalación

```bash
cd backend
yarn install
Configuración
Crear un archivo .env en backend/ con:

env
Copy
Edit
PORT=5000
MONGO_URI=mongodb://
JWT_SECRET=tu_clave_secreta
Ejecución
bash
Copy
Edit
yarn start
💻 Frontend
Instalación
bash
Copy
Edit
cd ../frontend
yarn install
Configuración
Crear un archivo .env en frontend/ con:

env
Copy
Edit
VITE_BASE_URL=http://localhost:5000/api
Ejecución
bash
Copy
Edit
yarn dev
🧩 Funcionalidades Principales
🔐 Login de usuario

📚 Visualización y creación de libros con clasificación Dewey

📦 Gestión de recursos de la biblioteca (En Proceso)

👥 Listado y eliminación de usuarios

🔄 Gestión de préstamos (En Proceso)

👤 Visualización del perfil según el rol

📁 Estructura del Proyecto
bash
Copy
Edit
biblioteca/
├── backend/        # Servidor Express y rutas API
├── frontend/       # Aplicación cliente en React
├── .gitignore
├── README.md
💡 Notas
El proyecto fue desarrollado usando yarn para mantener consistencia entre frontend y backend.

Se ignoraron los archivos .env, node_modules, y dist para mantener limpio el repositorio.

Se recomienda usar MongoDB local para pruebas y Postman para validar rutas del backend.

👨‍💻 Autor
Daniel Carreño
Este proyecto es parte del trabajo de título 2025.