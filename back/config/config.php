<?php
/**
 * Archivo de Configuración Global - AFERGOLF
 */

// ================================
// CONFIGURACIÓN DE BASE DE DATOS
// ================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'afergolf_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// ================================
// CONFIGURACIONES GENERALES
// ================================
define('BASE_URL', 'http://localhost/AFERGOLF/');
define('DEBUG_MODE', true); // cambiar a false en producción

// ================================
// CONFIGURACIÓN DE ERRORES
// ================================
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

?>
