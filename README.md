# Plataforma de Diligenciamiento de Actas

## Descripción

La **Plataforma de Diligenciamiento de Actas** es un sistema desarrollado para el Servicio Nacional de Aprendizaje (SENA) que facilita la gestión y validación de documentos para la etapa productiva de los aprendices. La plataforma permite a los aprendices e instructores diligenciar actas en línea, y a las empresas firmarlas digitalmente. Una vez completados y validados los documentos, se envían automáticamente por correo electrónico a todas las partes involucradas.

## Ejecutar Proyecto

- Ejecutar 'npm install' para instalar las dependencias.
- - Ejecutar el servidor backend con 'node server.js'.
  - - Ejecutar el frontend con 'npm start'.

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

