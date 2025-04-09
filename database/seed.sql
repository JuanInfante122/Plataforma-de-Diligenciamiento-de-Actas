-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES
('INSTRUCTOR', 'Instructor que puede crear y revisar documentos'),
('COORDINADOR', 'Coordinador que puede aprobar documentos'),
('APRENDIZ', 'Aprendiz que puede llenar y enviar documentos');

-- Insertar usuarios
INSERT INTO usuarios (tipo_documento, numero_documento, nombres, apellidos, email, telefono, rol_id) VALUES
-- Instructores
('CÉDULA DE CIUDADANÍA', '123456789', 'Juan', 'Pérez', 'juan.perez@instructor.edu.co', '3001234567', 1),
('CÉDULA DE CIUDADANÍA', '234567890', 'María', 'González', 'maria.gonzalez@instructor.edu.co', '3002345678', 1),
-- Coordinadores
('CÉDULA DE CIUDADANÍA', '345678901', 'Carlos', 'Rodríguez', 'carlos.rodriguez@coordinador.edu.co', '3003456789', 2),
('CÉDULA DE CIUDADANÍA', '456789012', 'Ana', 'Martínez', 'ana.martinez@coordinador.edu.co', '3004567890', 2),
-- Aprendices
('TARJETA DE IDENTIDAD', '567890123', 'Pedro', 'López', 'pedro.lopez@aprendiz.edu.co', '3005678901', 3),
('TARJETA DE IDENTIDAD', '678901234', 'Laura', 'Sánchez', 'laura.sanchez@aprendiz.edu.co', '3006789012', 3),
('TARJETA DE IDENTIDAD', '789012345', 'Diego', 'Ramírez', 'diego.ramirez@aprendiz.edu.co', '3007890123', 3);

-- Insertar programas de formación
INSERT INTO programas_formacion (nombre, codigo) VALUES
('Desarrollo de Software', 'DS001'),
('Análisis y Desarrollo de Sistemas de Información', 'ADSI001'),
('Programación de Software', 'PS001');

-- Insertar fichas
INSERT INTO fichas (numero, programa_id, fecha_inicio, fecha_fin, instructor_id) VALUES
('2023-1', 1, '2023-01-15', '2024-01-15', 1),
('2023-2', 2, '2023-02-15', '2024-02-15', 2),
('2023-3', 3, '2023-03-15', '2024-03-15', 1);

-- Insertar aprendices en fichas
INSERT INTO aprendices_ficha (ficha_id, aprendiz_id, fecha_ingreso) VALUES
(1, 5, '2023-01-15'),
(1, 6, '2023-01-15'),
(2, 7, '2023-02-15');

-- Insertar plantillas de documento
INSERT INTO plantillas_documento (titulo, descripcion, estructura, creado_por) VALUES
('Formato de Asistencia', 'Formato para registrar la asistencia a sesiones de formación', 
'{
    "campos": [
        {"tipo": "fecha", "nombre": "fecha_sesion", "etiqueta": "Fecha de Sesión", "requerido": true},
        {"tipo": "texto", "nombre": "tema", "etiqueta": "Tema Tratado", "requerido": true},
        {"tipo": "numero", "nombre": "duracion", "etiqueta": "Duración (horas)", "requerido": true},
        {"tipo": "textarea", "nombre": "observaciones", "etiqueta": "Observaciones", "requerido": false}
    ]
}', 1),
('Evaluación de Competencias', 'Formato para evaluar competencias del aprendiz',
'{
    "campos": [
        {"tipo": "select", "nombre": "competencia", "etiqueta": "Competencia", "opciones": ["Técnica", "Blanda", "Específica"]},
        {"tipo": "radio", "nombre": "nivel", "etiqueta": "Nivel Alcanzado", "opciones": ["Básico", "Intermedio", "Avanzado"]},
        {"tipo": "textarea", "nombre": "evidencias", "etiqueta": "Evidencias", "requerido": true}
    ]
}', 2);

-- Insertar documentos
INSERT INTO documentos (plantilla_id, ficha_id, aprendiz_id, contenido, estado) VALUES
(1, 1, 5, 
'{
    "fecha_sesion": "2024-01-10",
    "tema": "Introducción a Bases de Datos",
    "duracion": 4,
    "observaciones": "Sesión completada exitosamente"
}', 'ENVIADO'),
(2, 1, 6,
'{
    "competencia": "Técnica",
    "nivel": "Intermedio",
    "evidencias": "El aprendiz demuestra dominio en las competencias evaluadas"
}', 'EN_REVISION');

-- Insertar firmas
INSERT INTO firmas (documento_id, usuario_id, tipo_firma) VALUES
(1, 1, 'INSTRUCTOR'),
(1, 3, 'COORDINADOR'),
(2, 2, 'INSTRUCTOR');

-- Insertar notificaciones
INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, documento_id) VALUES
(1, 'FIRMA_REQUERIDA', 'Documento Requiere Firma', 'Hay un nuevo documento que requiere su firma', 1),
(3, 'FIRMA_REQUERIDA', 'Documento Requiere Firma', 'Hay un nuevo documento que requiere su aprobación', 1),
(5, 'DOCUMENTO_ENVIADO', 'Documento Enviado', 'Su documento ha sido enviado para revisión', 1);

-- Insertar historial de cambios
INSERT INTO historial_cambios (documento_id, usuario_id, tipo_cambio, descripcion) VALUES
(1, 5, 'CREACION', 'Documento creado por el aprendiz'),
(1, 1, 'FIRMA', 'Documento firmado por el instructor'),
(2, 6, 'CREACION', 'Documento creado por el aprendiz');