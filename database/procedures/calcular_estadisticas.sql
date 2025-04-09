DELIMITER //

DROP PROCEDURE IF EXISTS calcular_estadisticas_instructor//

CREATE PROCEDURE calcular_estadisticas_instructor(IN p_instructor_id INT)
BEGIN
    DECLARE v_fecha DATE;
    SET v_fecha = CURDATE();

    -- Calcular estadísticas generales del instructor
    INSERT INTO estadisticas_instructor (
        instructor_id, 
        fecha_calculo, 
        total_documentos, 
        documentos_aprobados, 
        documentos_rechazados, 
        documentos_pendientes
    )
    SELECT 
        f.instructor_id,
        v_fecha,
        COUNT(d.id) as total_documentos,
        SUM(CASE WHEN d.estado = 'APROBADO' THEN 1 ELSE 0 END) as documentos_aprobados,
        SUM(CASE WHEN d.estado = 'RECHAZADO' THEN 1 ELSE 0 END) as documentos_rechazados,
        SUM(CASE WHEN d.estado IN ('ENVIADO', 'EN_REVISION') THEN 1 ELSE 0 END) as documentos_pendientes
    FROM fichas f
    LEFT JOIN documentos d ON f.id = d.ficha_id
    WHERE f.instructor_id = p_instructor_id
    GROUP BY f.instructor_id
    ON DUPLICATE KEY UPDATE
        total_documentos = VALUES(total_documentos),
        documentos_aprobados = VALUES(documentos_aprobados),
        documentos_rechazados = VALUES(documentos_rechazados),
        documentos_pendientes = VALUES(documentos_pendientes);

    -- Calcular estadísticas por ficha
    INSERT INTO estadisticas_ficha (
        ficha_id,
        instructor_id,
        fecha_calculo,
        total_documentos,
        documentos_aprobados,
        documentos_rechazados,
        documentos_pendientes
    )
    SELECT 
        f.id as ficha_id,
        f.instructor_id,
        v_fecha,
        COUNT(d.id) as total_documentos,
        SUM(CASE WHEN d.estado = 'APROBADO' THEN 1 ELSE 0 END) as documentos_aprobados,
        SUM(CASE WHEN d.estado = 'RECHAZADO' THEN 1 ELSE 0 END) as documentos_rechazados,
        SUM(CASE WHEN d.estado IN ('ENVIADO', 'EN_REVISION') THEN 1 ELSE 0 END) as documentos_pendientes
    FROM fichas f
    LEFT JOIN documentos d ON f.id = d.ficha_id
    WHERE f.instructor_id = p_instructor_id
    GROUP BY f.id
    ON DUPLICATE KEY UPDATE
        total_documentos = VALUES(total_documentos),
        documentos_aprobados = VALUES(documentos_aprobados),
        documentos_rechazados = VALUES(documentos_rechazados),
        documentos_pendientes = VALUES(documentos_pendientes);

    -- Actualizar seguimiento de documentos pendientes
    INSERT INTO seguimiento_documentos (
        aprendiz_id,
        instructor_id,
        ficha_id,
        documentos_pendientes
    )
    SELECT 
        d.aprendiz_id,
        f.instructor_id,
        f.id as ficha_id,
        COUNT(d.id) as documentos_pendientes
    FROM documentos d
    JOIN fichas f ON d.ficha_id = f.id
    WHERE f.instructor_id = p_instructor_id
    AND d.estado IN ('ENVIADO', 'EN_REVISION')
    GROUP BY d.aprendiz_id, f.instructor_id, f.id
    ON DUPLICATE KEY UPDATE
        documentos_pendientes = VALUES(documentos_pendientes);

END //

DELIMITER ;