Sistema de Gestión de Biblioteca CRA - Proyecto Sophia
Este proyecto es un Sistema de Gestión de Biblioteca completo, desarrollado con el stack MERN (MongoDB, Express, React, Node.js). Está diseñado para administrar los préstamos de libros y recursos del Centro de Recursos para el Aprendizaje (CRA) del Colegio Inmaculada de Lourdes.

✨ Características Principales:
Autenticación por Roles: Sistema de usuarios con roles (Administrador, Profesor, Alumno) y permisos específicos para cada uno, utilizando JSON Web Tokens (JWT) para la gestión de sesiones.

Gestión de Catálogo: Funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar) para libros, ejemplares y recursos CRA.

Ciclo de Préstamos: Lógica de negocio para solicitar, devolver y renovar préstamos, aplicando sanciones por atrasos.

Interfaz Moderna: Frontend desarrollado en React con Tailwind CSS, incluyendo un modo oscuro para una mejor experiencia de usuario.

🚀 Tecnologías Utilizadas
Backend
Node.js: Entorno de ejecución para JavaScript.

Express: Framework para construir la API REST.

MongoDB: Base de datos NoSQL para almacenar toda la información.

Mongoose: ODM para modelar los datos de la aplicación y conectarse a MongoDB.

JSON Web Token (JWT): Para la autenticación y protección de rutas.

bcrypt.js: Para el hasheo seguro de contraseñas.

Frontend
React: Librería para construir la interfaz de usuario.

Tailwind CSS: Framework de CSS para un diseño rápido y moderno.

Axios: Cliente HTTP para realizar peticiones al backend.

jwt-decode: Para decodificar los tokens en el lado del cliente.

Herramientas de Desarrollo
Yarn: Gestor de paquetes.

Git y GitHub: Para el control de versiones y respaldo del código.

🛠️ Guía de Instalación y Ejecución
Sigue estos pasos para poner en marcha el proyecto en un entorno local.

Prerrequisitos
Tener instalado Node.js (versión 16 o superior).

Tener instalado Yarn.

Tener instalado Git.

Tener acceso a una base de datos de MongoDB (se recomienda MongoDB Atlas para obtener una URL de conexión).

1. Clonar el Repositorio
git clone https://github.com/Aldariz94/Proyect_Sophia.git
cd Proyect_Sophia

2. Configurar el Backend
Navega a la carpeta del backend:

cd backend   

Instala las dependencias :

yarn install

Crea el archivo de entorno:

Crea un archivo llamado .env en la raíz de la carpeta backend.

Añade las siguientes variables, reemplazando los valores:

PORT=5001
MONGODB_URI=tu_cadena_de_conexion_a_mongodb
JWT_SECRET=un_secreto_muy_largo_y_dificil_de_adivinar

Inicia el servidor del backend:

yarn start

El servidor debería estar corriendo en http://localhost:5001.

3. Configurar el Frontend
Abre una nueva terminal.

Navega a la carpeta del frontend:

cd frontend

Instala las dependencias:

yarn install

Inicia la aplicación de React:

yarn start

La aplicación se abrirá automáticamente en tu navegador en http://localhost:3000.

📜 Scripts Disponibles
En el directorio del proyecto, puedes ejecutar:

En la carpeta backend/
yarn start: Inicia el servidor del backend.

En la carpeta frontend/
yarn start: Inicia la aplicación de React en modo de desarrollo.

yarn build: Compila la aplicación para producción.


## Proyecto Sophia

Última modificación: 2025-07-28