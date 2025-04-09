-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-04-2025 a las 08:35:07
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `documentacion`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `calcular_estadisticas_instructor` (IN `p_instructor_id` INT)   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `calcular_todas_estadisticas` ()   BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE curr_instructor_id INT;
    DECLARE cur CURSOR FOR SELECT id FROM usuarios WHERE rol_id = 1;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO curr_instructor_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        CALL calcular_estadisticas_instructor(curr_instructor_id);
    END LOOP;
    CLOSE cur;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GenerarReporte` (IN `p_tipo` VARCHAR(50), IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_usuario_id` INT)   BEGIN
    INSERT INTO reportes (tipo, fecha_inicio, fecha_fin, generado_por)
    VALUES (p_tipo, p_fecha_inicio, p_fecha_fin, p_usuario_id);
    
    SELECT LAST_INSERT_ID() as reporte_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aprendices_ficha`
--

CREATE TABLE `aprendices_ficha` (
  `id` int(11) NOT NULL,
  `ficha_id` int(11) NOT NULL,
  `aprendiz_id` int(11) NOT NULL,
  `estado` enum('ACTIVO','DESERTOR','FINALIZADO') DEFAULT 'ACTIVO',
  `fecha_ingreso` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aprendices_ficha`
--

INSERT INTO `aprendices_ficha` (`id`, `ficha_id`, `aprendiz_id`, `estado`, `fecha_ingreso`, `fecha_fin`, `created_at`) VALUES
(1, 1, 5, 'ACTIVO', '2023-01-15', NULL, '2025-04-09 02:36:33'),
(2, 1, 6, 'ACTIVO', '2023-01-15', NULL, '2025-04-09 02:36:33'),
(3, 2, 7, 'ACTIVO', '2023-02-15', NULL, '2025-04-09 02:36:33'),
(4, 1, 8, 'ACTIVO', '2023-01-15', NULL, '2025-04-09 03:52:47'),
(5, 2, 9, 'ACTIVO', '2023-02-15', NULL, '2025-04-09 03:52:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coordinadores_programa`
--

CREATE TABLE `coordinadores_programa` (
  `id` int(11) NOT NULL,
  `coordinador_id` int(11) NOT NULL,
  `programa_id` int(11) NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `coordinadores_programa`
--

INSERT INTO `coordinadores_programa` (`id`, `coordinador_id`, `programa_id`, `fecha_asignacion`, `estado`, `created_at`) VALUES
(1, 3, 1, '2025-04-08', 'ACTIVO', '2025-04-09 03:52:46'),
(2, 3, 2, '2025-04-08', 'ACTIVO', '2025-04-09 03:52:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos`
--

CREATE TABLE `documentos` (
  `id` int(11) NOT NULL,
  `plantilla_id` int(11) NOT NULL,
  `ficha_id` int(11) NOT NULL,
  `aprendiz_id` int(11) NOT NULL,
  `contenido` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`contenido`)),
  `estado` enum('BORRADOR','ENVIADO','EN_REVISION','RECHAZADO','APROBADO','ARCHIVADO') DEFAULT 'BORRADOR',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `documentos`
--

INSERT INTO `documentos` (`id`, `plantilla_id`, `ficha_id`, `aprendiz_id`, `contenido`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 5, '{\n    \"fecha_sesion\": \"2024-01-10\",\n    \"tema\": \"Introducción a Bases de Datos\",\n    \"duracion\": 4,\n    \"observaciones\": \"Sesión completada exitosamente\"\n}', 'APROBADO', '2025-04-09 02:36:33', '2025-04-09 05:28:58'),
(2, 2, 1, 6, '{\r\n    \"competencia\": \"Técnica\",\r\n    \"nivel\": \"Intermedio\",\r\n    \"evidencias\": \"El aprendiz demuestra dominio en las competencias evaluadas\"\r\n}', 'EN_REVISION', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(3, 2, 2, 7, '{\"competencia\":\"Blanda\",\"nivel\":\"\",\"evidencias\":\"Pruebas\"}', 'ENVIADO', '2025-04-09 03:27:54', '2025-04-09 03:27:54'),
(4, 1, 1, 5, '{\"fecha_sesion\":\"2024-01-10\",\"tema\":\"Introducción a Bases de Datos\",\"duracion\":4,\"observaciones\":\"Sesión completada exitosamente\"}', 'ENVIADO', '2025-04-09 03:36:42', '2025-04-09 03:36:42'),
(5, 1, 1, 5, '{\"fecha_sesion\":\"2024-01-10\",\"tema\":\"Estadistica\",\"duracion\":4,\"observaciones\":\"Pruebas\"}', 'ENVIADO', '2025-04-09 03:48:58', '2025-04-09 03:48:58'),
(6, 2, 2, 7, '{\"competencia\":\"Específica\",\"nivel\":\"\",\"evidencias\":\"Pruebas 2\"}', 'ENVIADO', '2025-04-09 03:54:13', '2025-04-09 03:54:13');

--
-- Disparadores `documentos`
--
DELIMITER $$
CREATE TRIGGER `actualizar_estadisticas_after_documento` AFTER UPDATE ON `documentos` FOR EACH ROW BEGIN
    DECLARE v_instructor_id INT;
    
    -- Obtener el instructor_id de la ficha
    SELECT instructor_id INTO v_instructor_id
    FROM fichas
    WHERE id = NEW.ficha_id;
    
    -- Llamar al procedimiento para actualizar estadísticas
    IF v_instructor_id IS NOT NULL THEN
        CALL calcular_estadisticas_instructor(v_instructor_id);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadisticas_ficha`
--

CREATE TABLE `estadisticas_ficha` (
  `id` int(11) NOT NULL,
  `ficha_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `fecha_calculo` date NOT NULL,
  `total_documentos` int(11) DEFAULT 0,
  `documentos_aprobados` int(11) DEFAULT 0,
  `documentos_rechazados` int(11) DEFAULT 0,
  `documentos_pendientes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estadisticas_ficha`
--

INSERT INTO `estadisticas_ficha` (`id`, `ficha_id`, `instructor_id`, `fecha_calculo`, `total_documentos`, `documentos_aprobados`, `documentos_rechazados`, `documentos_pendientes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-04-08', 4, 0, 0, 4, '2025-04-09 04:25:45', '2025-04-09 04:25:45'),
(2, 3, 1, '2025-04-08', 0, 0, 0, 0, '2025-04-09 04:25:45', '2025-04-09 04:25:45'),
(5, 2, 2, '2025-04-08', 2, 0, 0, 2, '2025-04-09 04:29:15', '2025-04-09 04:29:15'),
(6, 2, 2, '2025-04-09', 2, 0, 0, 2, '2025-04-09 05:05:28', '2025-04-09 05:05:28'),
(14, 1, 1, '2025-04-09', 4, 1, 0, 3, '2025-04-09 05:28:58', '2025-04-09 05:28:58'),
(15, 3, 1, '2025-04-09', 0, 0, 0, 0, '2025-04-09 05:28:58', '2025-04-09 05:28:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadisticas_instructor`
--

CREATE TABLE `estadisticas_instructor` (
  `id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `fecha_calculo` date NOT NULL,
  `total_documentos` int(11) DEFAULT 0,
  `documentos_aprobados` int(11) DEFAULT 0,
  `documentos_rechazados` int(11) DEFAULT 0,
  `documentos_pendientes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estadisticas_instructor`
--

INSERT INTO `estadisticas_instructor` (`id`, `instructor_id`, `fecha_calculo`, `total_documentos`, `documentos_aprobados`, `documentos_rechazados`, `documentos_pendientes`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-04-08', 4, 0, 0, 4, '2025-04-09 04:23:07', '2025-04-09 04:25:45'),
(2, 2, '2025-04-08', 2, 0, 0, 2, '2025-04-09 04:23:07', '2025-04-09 04:29:15'),
(8, 2, '2025-04-09', 2, 0, 0, 2, '2025-04-09 05:05:28', '2025-04-09 05:05:28'),
(12, 1, '2025-04-09', 4, 1, 0, 3, '2025-04-09 05:28:58', '2025-04-09 05:28:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichas`
--

CREATE TABLE `fichas` (
  `id` int(11) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `programa_id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `estado` enum('ACTIVA','FINALIZADA','CANCELADA') DEFAULT 'ACTIVA',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fichas`
--

INSERT INTO `fichas` (`id`, `numero`, `programa_id`, `fecha_inicio`, `fecha_fin`, `instructor_id`, `estado`, `created_at`) VALUES
(1, '2023-1', 1, '2023-01-15', '2024-01-15', 1, 'ACTIVA', '2025-04-09 02:36:33'),
(2, '2023-2', 2, '2023-02-15', '2024-02-15', 2, 'ACTIVA', '2025-04-09 02:36:33'),
(3, '2023-3', 3, '2023-03-15', '2024-03-15', 1, 'ACTIVA', '2025-04-09 02:36:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `firmas`
--

CREATE TABLE `firmas` (
  `id` int(11) NOT NULL,
  `documento_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo_firma` enum('INSTRUCTOR','APRENDIZ','COORDINADOR') NOT NULL,
  `firma_data` longtext NOT NULL,
  `estado` enum('PENDIENTE','FIRMADO') DEFAULT 'PENDIENTE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `firmas`
--

INSERT INTO `firmas` (`id`, `documento_id`, `usuario_id`, `tipo_firma`, `firma_data`, `estado`, `created_at`) VALUES
(1, 1, 1, 'INSTRUCTOR', 'data:image/png;base64,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', 'FIRMADO', '2025-04-09 05:28:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `firmas_instructores`
--

CREATE TABLE `firmas_instructores` (
  `id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `firma` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `firmas_instructores`
--

INSERT INTO `firmas_instructores` (`id`, `instructor_id`, `firma`, `created_at`) VALUES
(1, 1, 'data:image/png;base64,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', '2025-04-09 05:18:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_cambios`
--

CREATE TABLE `historial_cambios` (
  `id` int(11) NOT NULL,
  `documento_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo_cambio` enum('CREACION','MODIFICACION','FIRMA','RECHAZO','APROBACION') NOT NULL,
  `descripcion` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_cambios`
--

INSERT INTO `historial_cambios` (`id`, `documento_id`, `usuario_id`, `tipo_cambio`, `descripcion`, `created_at`) VALUES
(1, 1, 5, 'CREACION', 'Documento creado por el aprendiz', '2025-04-09 02:36:33'),
(2, 1, 1, 'FIRMA', 'Documento firmado por el instructor', '2025-04-09 02:36:33'),
(3, 2, 6, 'CREACION', 'Documento creado por el aprendiz', '2025-04-09 02:36:33'),
(4, 1, 1, 'APROBACION', 'Si', '2025-04-09 05:28:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jefes_ficha`
--

CREATE TABLE `jefes_ficha` (
  `id` int(11) NOT NULL,
  `jefe_id` int(11) NOT NULL,
  `ficha_id` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_asignacion` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jefes_ficha`
--

INSERT INTO `jefes_ficha` (`id`, `jefe_id`, `ficha_id`, `estado`, `fecha_asignacion`, `created_at`) VALUES
(1, 3, 1, 'ACTIVO', '2025-04-08', '2025-04-09 03:58:33'),
(2, 3, 2, 'ACTIVO', '0000-00-00', '2025-04-09 04:01:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `documento_id` int(11) DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantillas_documento`
--

CREATE TABLE `plantillas_documento` (
  `id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estructura` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`estructura`)),
  `requiere_firma_instructor` tinyint(1) DEFAULT 1,
  `requiere_firma_coordinador` tinyint(1) DEFAULT 0,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `creado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plantillas_documento`
--

INSERT INTO `plantillas_documento` (`id`, `titulo`, `descripcion`, `estructura`, `requiere_firma_instructor`, `requiere_firma_coordinador`, `estado`, `creado_por`, `created_at`, `updated_at`) VALUES
(1, 'Formato de Asistencia', 'Formato para registrar la asistencia a sesiones de formación', '{\n    \"campos\": [\n        {\"tipo\": \"fecha\", \"nombre\": \"fecha_sesion\", \"etiqueta\": \"Fecha de Sesión\", \"requerido\": true},\n        {\"tipo\": \"texto\", \"nombre\": \"tema\", \"etiqueta\": \"Tema Tratado\", \"requerido\": true},\n        {\"tipo\": \"numero\", \"nombre\": \"duracion\", \"etiqueta\": \"Duración (horas)\", \"requerido\": true},\n        {\"tipo\": \"textarea\", \"nombre\": \"observaciones\", \"etiqueta\": \"Observaciones\", \"requerido\": false}\n    ]\n}', 1, 0, 'ACTIVO', 1, '2025-04-09 02:36:33', '2025-04-09 03:09:27'),
(2, 'Evaluación de Competencias', 'Formato para evaluar competencias del aprendiz', '{\r\n    \"campos\": [\r\n        {\"tipo\": \"select\", \"nombre\": \"competencia\", \"etiqueta\": \"Competencia\", \"opciones\": [\"Técnica\", \"Blanda\", \"Específica\"]},\r\n        {\"tipo\": \"radio\", \"nombre\": \"nivel\", \"etiqueta\": \"Nivel Alcanzado\", \"opciones\": [\"Básico\", \"Intermedio\", \"Avanzado\"]},\r\n        {\"tipo\": \"textarea\", \"nombre\": \"evidencias\", \"etiqueta\": \"Evidencias\", \"requerido\": true}\r\n    ]\r\n}', 1, 0, 'ACTIVO', 2, '2025-04-09 02:36:33', '2025-04-09 02:36:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas_formacion`
--

CREATE TABLE `programas_formacion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programas_formacion`
--

INSERT INTO `programas_formacion` (`id`, `nombre`, `codigo`, `estado`, `created_at`) VALUES
(1, 'Desarrollo de Software', 'DS001', 'ACTIVO', '2025-04-09 02:36:33'),
(2, 'Análisis y Desarrollo de Sistemas de Información', 'ADSI001', 'ACTIVO', '2025-04-09 02:36:33'),
(3, 'Programación de Software', 'PS001', 'ACTIVO', '2025-04-09 02:36:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `archivo_url` text NOT NULL,
  `generado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id`, `tipo`, `fecha_inicio`, `fecha_fin`, `archivo_url`, `generado_por`, `created_at`) VALUES
(1, 'general', '2024-01-01', '2024-01-31', '', 1, '2024-01-31 19:30:00'),
(2, 'aprobados', '2024-01-01', '2024-01-31', '', 1, '2024-01-31 20:00:00'),
(3, 'rechazados', '2024-01-01', '2024-01-31', '', 1, '2024-01-31 20:30:00'),
(4, 'pendientes', '2024-01-01', '2024-01-31', '', 1, '2024-01-31 21:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 'INSTRUCTOR', 'Instructor que puede crear y revisar documentos', '2025-04-09 02:36:33'),
(2, 'JEFE', 'Coordinador que puede aprobar Jefe que firma documentos', '2025-04-09 02:36:33'),
(3, 'APRENDIZ', 'Aprendiz que puede llenar y enviar documentos', '2025-04-09 02:36:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_documentos`
--

CREATE TABLE `seguimiento_documentos` (
  `id` int(11) NOT NULL,
  `aprendiz_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `ficha_id` int(11) NOT NULL,
  `documentos_pendientes` int(11) DEFAULT 0,
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `seguimiento_documentos`
--

INSERT INTO `seguimiento_documentos` (`id`, `aprendiz_id`, `instructor_id`, `ficha_id`, `documentos_pendientes`, `ultima_actualizacion`) VALUES
(1, 5, 1, 1, 2, '2025-04-09 05:28:58'),
(2, 6, 1, 1, 1, '2025-04-09 04:25:45'),
(5, 7, 2, 2, 2, '2025-04-09 04:29:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `tipo_documento` enum('CÉDULA DE CIUDADANÍA','TARJETA DE IDENTIDAD','PASAPORTE') NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol_id` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `email`, `telefono`, `rol_id`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'CÉDULA DE CIUDADANÍA', '123456789', 'Juan', 'Pérez', 'juan.perez@instructor.edu.co', '3001234567', 1, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(2, 'CÉDULA DE CIUDADANÍA', '234567890', 'María', 'González', 'maria.gonzalez@instructor.edu.co', '3002345678', 1, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(3, 'CÉDULA DE CIUDADANÍA', '345678901', 'Carlos', 'Rodríguez', 'carlos.rodriguez@coordinador.edu.co', '3003456789', 2, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(4, 'CÉDULA DE CIUDADANÍA', '456789012', 'Ana', 'Martínez', 'ana.martinez@coordinador.edu.co', '3004567890', 2, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(5, 'TARJETA DE IDENTIDAD', '567890123', 'Pedro', 'López', 'pedro.lopez@aprendiz.edu.co', '3005678901', 3, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(6, 'TARJETA DE IDENTIDAD', '678901234', 'Laura', 'Sánchez', 'laura.sanchez@aprendiz.edu.co', '3006789012', 3, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(7, 'TARJETA DE IDENTIDAD', '789012345', 'Diego', 'Ramírez', 'diego.ramirez@aprendiz.edu.co', '3007890123', 3, 'ACTIVO', '2025-04-09 02:36:33', '2025-04-09 02:36:33'),
(8, 'TARJETA DE IDENTIDAD', '789012346', 'Ana', 'García', 'ana.garcia@aprendiz.edu.co', '3007890124', 3, 'ACTIVO', '2025-04-09 03:52:46', '2025-04-09 03:52:46'),
(9, 'TARJETA DE IDENTIDAD', '789012347', 'Luis', 'Martínez', 'luis.martinez@aprendiz.edu.co', '3007890125', 3, 'ACTIVO', '2025-04-09 03:52:46', '2025-04-09 03:52:46');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_documentos_completa`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_documentos_completa` (
`id` int(11)
,`plantilla_id` int(11)
,`ficha_id` int(11)
,`aprendiz_id` int(11)
,`contenido` longtext
,`estado` enum('BORRADOR','ENVIADO','EN_REVISION','RECHAZADO','APROBADO','ARCHIVADO')
,`created_at` timestamp
,`updated_at` timestamp
,`titulo` varchar(200)
,`descripcion` text
,`instructor_nombre` varchar(201)
,`jefe_nombre` varchar(201)
,`numero_ficha` varchar(20)
,`programa_formacion` varchar(200)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_documentos_completa`
--
DROP TABLE IF EXISTS `vista_documentos_completa`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_documentos_completa`  AS SELECT `d`.`id` AS `id`, `d`.`plantilla_id` AS `plantilla_id`, `d`.`ficha_id` AS `ficha_id`, `d`.`aprendiz_id` AS `aprendiz_id`, `d`.`contenido` AS `contenido`, `d`.`estado` AS `estado`, `d`.`created_at` AS `created_at`, `d`.`updated_at` AS `updated_at`, `pd`.`titulo` AS `titulo`, `pd`.`descripcion` AS `descripcion`, concat(`ui`.`nombres`,' ',`ui`.`apellidos`) AS `instructor_nombre`, concat(`uj`.`nombres`,' ',`uj`.`apellidos`) AS `jefe_nombre`, `f`.`numero` AS `numero_ficha`, `pf`.`nombre` AS `programa_formacion` FROM ((((((`documentos` `d` join `plantillas_documento` `pd` on(`d`.`plantilla_id` = `pd`.`id`)) join `fichas` `f` on(`d`.`ficha_id` = `f`.`id`)) join `usuarios` `ui` on(`f`.`instructor_id` = `ui`.`id`)) join `programas_formacion` `pf` on(`f`.`programa_id` = `pf`.`id`)) join `jefes_ficha` `jf` on(`f`.`id` = `jf`.`ficha_id` and `jf`.`estado` = 'ACTIVO')) join `usuarios` `uj` on(`jf`.`jefe_id` = `uj`.`id`)) WHERE `d`.`estado` <> 'ELIMINADO' ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aprendices_ficha`
--
ALTER TABLE `aprendices_ficha`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ficha_id` (`ficha_id`),
  ADD KEY `aprendiz_id` (`aprendiz_id`);

--
-- Indices de la tabla `coordinadores_programa`
--
ALTER TABLE `coordinadores_programa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_coordinador_programa` (`coordinador_id`,`programa_id`,`estado`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plantilla_id` (`plantilla_id`),
  ADD KEY `ficha_id` (`ficha_id`),
  ADD KEY `aprendiz_id` (`aprendiz_id`);

--
-- Indices de la tabla `estadisticas_ficha`
--
ALTER TABLE `estadisticas_ficha`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ficha_fecha` (`ficha_id`,`fecha_calculo`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indices de la tabla `estadisticas_instructor`
--
ALTER TABLE `estadisticas_instructor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_instructor_fecha` (`instructor_id`,`fecha_calculo`);

--
-- Indices de la tabla `fichas`
--
ALTER TABLE `fichas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `programa_id` (`programa_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indices de la tabla `firmas`
--
ALTER TABLE `firmas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documento_id` (`documento_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `firmas_instructores`
--
ALTER TABLE `firmas_instructores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indices de la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documento_id` (`documento_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `jefes_ficha`
--
ALTER TABLE `jefes_ficha`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_jefe_ficha` (`jefe_id`,`ficha_id`),
  ADD KEY `ficha_id` (`ficha_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `documento_id` (`documento_id`);

--
-- Indices de la tabla `plantillas_documento`
--
ALTER TABLE `plantillas_documento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `programas_formacion`
--
ALTER TABLE `programas_formacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `generado_por` (`generado_por`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `seguimiento_documentos`
--
ALTER TABLE `seguimiento_documentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_aprendiz_instructor` (`aprendiz_id`,`instructor_id`),
  ADD KEY `instructor_id` (`instructor_id`),
  ADD KEY `ficha_id` (`ficha_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_documento` (`numero_documento`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aprendices_ficha`
--
ALTER TABLE `aprendices_ficha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `coordinadores_programa`
--
ALTER TABLE `coordinadores_programa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `documentos`
--
ALTER TABLE `documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `estadisticas_ficha`
--
ALTER TABLE `estadisticas_ficha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `estadisticas_instructor`
--
ALTER TABLE `estadisticas_instructor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `fichas`
--
ALTER TABLE `fichas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `firmas`
--
ALTER TABLE `firmas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `firmas_instructores`
--
ALTER TABLE `firmas_instructores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `jefes_ficha`
--
ALTER TABLE `jefes_ficha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plantillas_documento`
--
ALTER TABLE `plantillas_documento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `programas_formacion`
--
ALTER TABLE `programas_formacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `seguimiento_documentos`
--
ALTER TABLE `seguimiento_documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aprendices_ficha`
--
ALTER TABLE `aprendices_ficha`
  ADD CONSTRAINT `aprendices_ficha_ibfk_1` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`),
  ADD CONSTRAINT `aprendices_ficha_ibfk_2` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `coordinadores_programa`
--
ALTER TABLE `coordinadores_programa`
  ADD CONSTRAINT `coordinadores_programa_ibfk_1` FOREIGN KEY (`coordinador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `coordinadores_programa_ibfk_2` FOREIGN KEY (`programa_id`) REFERENCES `programas_formacion` (`id`);

--
-- Filtros para la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_documento` (`id`),
  ADD CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`),
  ADD CONSTRAINT `documentos_ibfk_3` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `estadisticas_ficha`
--
ALTER TABLE `estadisticas_ficha`
  ADD CONSTRAINT `estadisticas_ficha_ibfk_1` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`),
  ADD CONSTRAINT `estadisticas_ficha_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `estadisticas_instructor`
--
ALTER TABLE `estadisticas_instructor`
  ADD CONSTRAINT `estadisticas_instructor_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `fichas`
--
ALTER TABLE `fichas`
  ADD CONSTRAINT `fichas_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programas_formacion` (`id`),
  ADD CONSTRAINT `fichas_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `firmas`
--
ALTER TABLE `firmas`
  ADD CONSTRAINT `firmas_ibfk_1` FOREIGN KEY (`documento_id`) REFERENCES `documentos` (`id`),
  ADD CONSTRAINT `firmas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `firmas_instructores`
--
ALTER TABLE `firmas_instructores`
  ADD CONSTRAINT `firmas_instructores_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  ADD CONSTRAINT `historial_cambios_ibfk_1` FOREIGN KEY (`documento_id`) REFERENCES `documentos` (`id`),
  ADD CONSTRAINT `historial_cambios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `jefes_ficha`
--
ALTER TABLE `jefes_ficha`
  ADD CONSTRAINT `jefes_ficha_ibfk_1` FOREIGN KEY (`jefe_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `jefes_ficha_ibfk_2` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`documento_id`) REFERENCES `documentos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `plantillas_documento`
--
ALTER TABLE `plantillas_documento`
  ADD CONSTRAINT `plantillas_documento_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`generado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `seguimiento_documentos`
--
ALTER TABLE `seguimiento_documentos`
  ADD CONSTRAINT `seguimiento_documentos_ibfk_1` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `seguimiento_documentos_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `seguimiento_documentos_ibfk_3` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
