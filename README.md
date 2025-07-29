🎓 Proyecto de Título: Biblioteca Escolar CRA - Proyect SophiaEste proyecto es parte de la titulación en Ingeniería en Informática. Es un Sistema de Gestión de Biblioteca completo, desarrollado con el stack MERN (MongoDB, Express, React, Node.js), diseñado para administrar los préstamos de libros y recursos del Centro de Recursos para el Aprendizaje (CRA).<details><summary>📑 Índice</summary>✨ Características y Funcionalidades🌐 Tecnologías Utilizadas🚀 Guía de Instalación y Ejecución🧪 Guía de Pruebas Postman👨‍💻 Autor</details>✨ Características y Funcionalidades🔐 Sistema CentralAutenticación por Roles: Sistema de usuarios con roles (Administrador, Profesor, Alumno) y permisos específicos, utilizando JSON Web Tokens (JWT).Sesión Activa Visible: La interfaz muestra el nombre y correo del usuario con la sesión activa.Interfaz Moderna y Adaptable: Frontend desarrollado en React con Tailwind CSS.Modo Oscuro/Claro: Botón para cambiar el tema de la aplicación, que inicia en modo oscuro por defecto.👤 Gestión de UsuariosCRUD Completo: Funcionalidades para Crear, Ver, Editar y Eliminar usuarios a través de un modal.Búsqueda Inteligente: Barra de búsqueda para filtrar usuarios en tiempo real por nombre, RUT, correo o curso.Formulario Detallado: Formulario de creación/edición con todos los campos obligatorios y opcionales, incluyendo una lista desplegable para los cursos.Vista de Detalles: Botón "Ver" para mostrar toda la información de un usuario en un modal de solo lectura.📚 Gestión de LibrosCRUD Completo: Funcionalidades para Crear, Ver, Editar y Eliminar libros y sus ejemplares.Gestión de Inventario:Creación de múltiples ejemplares al registrar un nuevo libro.Posibilidad de añadir más ejemplares a un libro existente.Gestión del estado individual de cada ejemplar (Disponible, Deteriorado, Extraviado, etc.) desde la vista de detalles.Búsqueda y Filtros: Barra de búsqueda para filtrar el catálogo por título, autor, editorial, ISBN o sede.Catálogo Unificado: Campo "Sede" (Media o Básica) para identificar la ubicación de cada libro.💻 Gestión de Recursos CRACRUD Completo: Funcionalidades para Crear, Ver, Editar y Eliminar recursos y sus instancias.Gestión de Inventario:Creación de múltiples instancias al registrar un nuevo recurso.Posibilidad de añadir más instancias a un recurso existente.Gestión del estado individual de cada instancia (Disponible, Mantenimiento, etc.).Búsqueda y Filtros: Barra de búsqueda para filtrar recursos por nombre, código o sede.Catálogo Unificado: Campo "Sede" (Media o Básica) para los recursos.🔄 Gestión de PréstamosCreación Interactiva: Formulario modal para crear préstamos con búsqueda en tiempo real de usuarios y de ítems disponibles (libros o recursos).Historial Completo: Tabla que muestra todos los préstamos con su estado (enCurso, devuelto, atrasado).Acciones Directas:Devolución: Botón para marcar un préstamo como devuelto, liberando el ítem.Renovación Flexible: Botón para renovar un préstamo, permitiendo al bibliotecario elegir la cantidad de días hábiles a extender.Búsqueda y Filtros: Barra de búsqueda para filtrar el historial por usuario, ítem o estado.🚫 Gestión de SancionesPágina Dedicada: Sección para visualizar únicamente a los usuarios con sanciones activas.Control Administrativo: Botón para "Perdonar Sanción" y levantar la restricción a un usuario.🌐 Tecnologías Utilizadas🛠️ BackendNode.js & Express (5.1.0): Entorno y framework para la API REST.MongoDB & Mongoose (8.16.5): Base de datos NoSQL y ODM.JSON Web Token (9.0.2): Para autenticación.bcrypt.js (3.0.2): Para hasheo de contraseñas.cors (2.8.5) y dotenv (17.2.1): Para configuración del servidor.💻 FrontendReact (19.1.0) & React DOM (19.1.0): Para la interfaz de usuario.Tailwind CSS (3.4.4): Framework de CSS.Axios (1.11.0): Cliente HTTP.jwt-decode (4.0.0): Para decodificar tokens.PostCSS (8.4.38) & Autoprefixer (10.4.19): Para procesamiento de CSS.🚀 Guía de Instalación y Ejecución1. Clonar el Repositoriogit clone https://github.com/Aldariz94/Proyect_Sophia.git
cd Proyect_Sophia
2. Configurar el BackendNavega a la carpeta: cd backendInstala dependencias: yarn installCrea un archivo .env en backend/ con el siguiente contenido:PORT=5000
MONGODB_URI=tu_cadena_de_conexion_a_mongodb
JWT_SECRET=un_secreto_muy_largo_y_dificil_de_adivinar
Inicia el servidor: yarn start (o yarn node server.js)3. Configurar el FrontendAbre una nueva terminal.Navega a la carpeta: cd frontendInstala dependencias: yarn installInicia la aplicación: yarn start🧪 Guía de Pruebas Postman✅ Requisitos PreviosEl servidor backend debe estar corriendo en http://localhost:5000.Debes tener un token de administrador válido obtenido tras iniciar sesión.1. Iniciar SesiónPOST http://localhost:5000/api/auth/loginBody:{
  "correo": "admin@sophia.cl",
  "password": "password_seguro"
}
2. Crear UsuariosPOST http://localhost:5000/api/usersHeaders: x-auth-token: (tu token)Body:{
  "primerNombre": "Ana",
  "primerApellido": "Rojas",
  "rut": "22222222-2",
  "correo": "ana.rojas@sophia.cl",
  "password": "password_profesor",
  "rol": "profesor"
}
3. Añadir LibrosPOST http://localhost:5000/api/booksHeaders: x-auth-token: (tu token)Body:{
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
4. Crear PréstamosPOST http://localhost:5000/api/loansHeaders: x-auth-token: (tu token)Body:{
    "usuarioId": "id_del_usuario",
    "itemId": "id_del_ejemplar_o_instancia",
    "itemModel": "Exemplar"
}
👨‍💻 AutorDaniel CarreñoEste proyecto es parte del trabajo de título 2025.