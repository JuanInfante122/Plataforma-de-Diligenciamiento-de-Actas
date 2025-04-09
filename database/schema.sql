-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS sistema_documentacion;
USE documentacion;

-- Tabla de roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_documento ENUM('CÉDULA DE CIUDADANÍA', 'TARJETA DE IDENTIDAD', 'PASAPORTE') NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de programas de formación
CREATE TABLE programas_formacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de fichas
CREATE TABLE fichas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) NOT NULL UNIQUE,
    programa_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    instructor_id INT NOT NULL,
    estado ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA') DEFAULT 'ACTIVA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (programa_id) REFERENCES programas_formacion(id),
    FOREIGN KEY (instructor_id) REFERENCES usuarios(id)
);

-- Tabla de aprendices por ficha
CREATE TABLE aprendices_ficha (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ficha_id INT NOT NULL,
    aprendiz_id INT NOT NULL,
    estado ENUM('ACTIVO', 'DESERTOR', 'FINALIZADO') DEFAULT 'ACTIVO',
    fecha_ingreso DATE NOT NULL,
    fecha_fin DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id) REFERENCES fichas(id),
    FOREIGN KEY (aprendiz_id) REFERENCES usuarios(id)
);

-- Tabla de plantillas de documentos
CREATE TABLE plantillas_documento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estructura JSON NOT NULL, -- Almacena la estructura del formulario en formato JSON
    requiere_firma_instructor BOOLEAN DEFAULT true,
    requiere_firma_coordinador BOOLEAN DEFAULT false,
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    creado_por INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Tabla de documentos
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plantilla_id INT NOT NULL,
    ficha_id INT NOT NULL,
    aprendiz_id INT NOT NULL,
    contenido JSON NOT NULL, -- Almacena el contenido del documento en formato JSON
    estado ENUM('BORRADOR', 'ENVIADO', 'EN_REVISION', 'RECHAZADO', 'APROBADO', 'ARCHIVADO') DEFAULT 'BORRADOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_documento(id),
    FOREIGN KEY (ficha_id) REFERENCES fichas(id),
    FOREIGN KEY (aprendiz_id) REFERENCES usuarios(id)
);

-- Tabla de firmas
CREATE TABLE firmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    documento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_firma ENUM('INSTRUCTOR', 'COORDINADOR', 'APRENDIZ') NOT NULL,
    estado ENUM('PENDIENTE', 'FIRMADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    fecha_firma TIMESTAMP NULL,
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documento_id) REFERENCES documentos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('DOCUMENTO_CREADO', 'DOCUMENTO_ENVIADO', 'FIRMA_REQUERIDA', 'DOCUMENTO_FIRMADO', 'DOCUMENTO_RECHAZADO') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    documento_id INT,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (documento_id) REFERENCES documentos(id)
);

-- Tabla de historial de cambios
CREATE TABLE historial_cambios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    documento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_cambio ENUM('CREACION', 'MODIFICACION', 'FIRMA', 'RECHAZO', 'APROBACION') NOT NULL,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documento_id) REFERENCES documentos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);