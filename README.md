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
- [🧩 Funcionalidades Principales](#-funcionalidades-principales)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [💡 Notas](#-notas)
- [👨‍💻 Autor](#-autor)

</details>

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
```

#### Configuración

Crear un archivo `.env` en `backend/` con:

```env
PORT=5000
MONGO_URI=mongodb://
JWT_SECRET=tu_clave_secreta
```

#### Ejecución

```bash
yarn start
```

---

### 💻 Frontend

#### Instalación

```bash
cd ../frontend
yarn install
```

#### Configuración

Crear un archivo `.env` en `frontend/` con:

```env
VITE_BASE_URL=http://localhost:5000/api
```

#### Ejecución

```bash
yarn dev
```

---

## 🧩 Funcionalidades Principales

- 🔐 Login de usuario funcional  
- 👀 Visualización de datos desde la base de datos (frontend conectado al backend)  
- 🌙 Modo oscuro implementado en la interfaz  
- 🧩 Backend completo: rutas, controladores y conexión a MongoDB operativos  
- 📝 Documentación inicial en README

---

## 📁 Estructura del Proyecto

```bash
biblioteca/
├── backend/        # Servidor Express y rutas API
├── frontend/       # Aplicación cliente en React
├── .gitignore
├── README.md
```

---

## 💡 Notas

- El proyecto fue desarrollado usando `yarn` para mantener consistencia entre frontend y backend.
- Se ignoraron los archivos `.env`, `node_modules`, y `dist` para mantener limpio el repositorio.
- Se recomienda usar MongoDB local para pruebas y Postman para validar rutas del backend.

---

## 👨‍💻 Autor

**Daniel Carreño**  
*Este proyecto es parte del trabajo de título 2025.*