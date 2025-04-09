# Sistema de Gestión de Documentación SENA

Sistema web para la gestión y seguimiento de documentación entre aprendices, instructores y jefes del SENA.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- Git

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/JuanInfante122/Plataforma-de-Diligenciamiento-de-Actas.git
cd Plataforma-de-Diligenciamiento-de-Actas
```

### 2. Configuración de la Base de Datos

1. Accede a MySQL:
```bash
mysql -u root -p
```

2. Crea la base de datos:
```sql
CREATE DATABASE documentacion;
USE documentacion;
```

3. Ejecuta el script de la base de datos:
```bash
mysql -u root -p documentacion < database/schema.sql
```

### 3. Configuración del Backend

1. Navega al directorio del servidor:
```bash
cd server
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=documentacion

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_secreto_jwt

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña
SMTP_FROM=no-reply@tusistema.com
```

5. Inicia el servidor:
```bash
npm run dev
```

### 4. Configuración del Frontend

1. Navega al directorio del cliente:
```bash
cd client
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

5. Inicia la aplicación:
```bash
npm start
```

## 📁 Estructura del Proyecto

```
documentacion-sena/
├── client/                 # Frontend (React)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── utils/
├── server/                 # Backend (Node.js)
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── routes/
└── database/              # Scripts SQL
    └── schema.sql
```

## 🔑 Roles y Accesos

El sistema maneja tres tipos de roles:

1. **Aprendiz**
   - Crear documentos
   - Ver historial
   - Gestionar perfil

2. **Instructor**
   - Revisar documentos
   - Gestionar aprendices
   - Ver estadísticas
   - Gestionar firma

3. **Jefe**
   - Aprobar documentos
   - Generar reportes
   - Ver estadísticas globales
   - Gestionar firma

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - React
  - React Router
  - Tailwind CSS
  - Chart.js
  - Axios

- **Backend:**
  - Node.js
  - Express
  - MySQL2
  - PDF-lib
  - Nodemailer

- **Base de Datos:**
  - MySQL

## 📝 Comandos Útiles

### Backend

```bash
# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

# Ejecutar migraciones
npm run migrate

# Ejecutar seeds
npm run seed
```

### Frontend

```bash
# Iniciar en modo desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test
```

## 🔧 Solución de Problemas Comunes

1. **Error de conexión a la base de datos**
   - Verifica que MySQL esté corriendo
   - Confirma las credenciales en el archivo .env
   - Asegúrate de que la base de datos existe

2. **Error al iniciar el frontend**
   - Verifica que el backend esté corriendo
   - Confirma la URL del API en el .env
   - Limpia la caché: `npm cache clean --force`

3. **Error en las dependencias**
   - Elimina node_modules y package-lock.json
   - Ejecuta `npm install` nuevamente


Si tienes alguna duda o problema, puedes:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo
- Consultar la documentación técnica
