<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# Plataforma de Diligenciamiento de Actas

## Descripción

La **Plataforma de Diligenciamiento de Actas** es un sistema desarrollado para el Servicio Nacional de Aprendizaje (SENA) que facilita la gestión y validación de documentos para la etapa productiva de los aprendices. La plataforma permite a los aprendices e instructores diligenciar actas en línea, y a las empresas firmarlas digitalmente. Una vez completados y validados los documentos, se envían automáticamente por correo electrónico a todas las partes involucradas.

## Tecnologías Utilizadas

- **Frontend**: HTML, CSS
- **Backend**: PHP
- **Base de Datos**: MySQL

## Características

- **Diligenciamiento de Actas**:
  - **Acta del Aprendiz**: Diligenciada por el aprendiz.
  - **Acta del Instructor**: Diligenciada por el instructor.
- **Firma Digital**:
  - Las empresas pueden firmar digitalmente los documentos.
- **Validación de Firma**:
  - Envío de validación por correo electrónico a la empresa para verificar la firma.
- **Notificaciones**:
  - Envío automático de los documentos firmados a la empresa, el aprendiz y el instructor.

## Requisitos

- **Servidor Web**: Apache o similar
- **PHP**: Versión 7.4 o superior
- **Base de Datos**: MySQL 5.7 o superior
- **Navegador**: Compatible con los navegadores más comunes (Chrome, Firefox, Edge)

## Instalación

### Configurar el Entorno

1. Copia el archivo `config.example.php` a `config.php` y ajusta las configuraciones de la base de datos.
2. Configura el servidor web para apuntar a la carpeta del proyecto.

### Importar la Base de Datos

- Importa el archivo `database.sql` a tu base de datos MySQL.

### Instalar Dependencias

- Asegúrate de tener todas las dependencias necesarias instaladas en tu servidor.

## Uso

### Acceder al Sistema

- Navega a la URL de tu servidor para acceder a la plataforma.

### Diligenciar Actas

- Los aprendices e instructores pueden completar los formularios en línea.

### Firma Digital

- Las empresas pueden firmar los documentos digitalmente.

### Validación y Envío

- El sistema enviará automáticamente las validaciones y los documentos firmados por correo electrónico.

## Diagrama de Entidades

A continuación, se muestran los diagramas de Entidades-Relación (ER) y Extendido (MER) para la estructura de la base de datos:

### Diagrama ER

![Diagrama ER](ruta/a/diagrama-er.png)

### Diagrama MER

![Diagrama MER](ruta/a/diagrama-mer.png)

## Cronograma

**Mes 1**:
- Definición de requisitos y planificación.
- Diseño del modelo de datos.
- Configuración del entorno de desarrollo.

**Mes 2**:
- Desarrollo del frontend y backend.
- Integración de la base de datos.
- Implementación de la funcionalidad de firma digital y validación.

**Mes 3**:
- Pruebas y corrección de errores.
- Despliegue en el servidor de producción.
- Documentación y capacitación.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección.
3. Realiza tus cambios y haz un commit.
4. Envía un pull request describiendo tus cambios.

## Contacto

Para cualquier consulta o soporte, puedes contactar a Juan Manuel en [tu-email@example.com](mailto:tu-email@example.com).

---

**Confidencialidad**: Este documento y el código asociado son propiedad del Servicio Nacional de Aprendizaje (SENA) y están sujetos a condiciones de confidencialidad.

>>>>>>> 00e4edede15e64ad0be911855012d90b642fc3f7
