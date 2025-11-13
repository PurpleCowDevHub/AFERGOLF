<?php
/**
 * Punto de Entrada Principal del Backend - AFERGOLF
 * 
 * Este es el punto de entrada principal para la aplicación backend de AFERGOLF.
 * Ejecutándose en XAMPP con phpMyAdmin para gestión de base de datos.
 * 
 * Visión General de la Arquitectura:
 * - JavaScript puro para operaciones AJAX del frontend (metodología de 7 pasos)
 * - PHP puro para API del backend e interacciones con base de datos
 * - Estructura modular con separación de responsabilidades
 * 
 * Estructura de Directorios:
 * /config/          - Archivos de configuración y conexión a base de datos
 * /modules/         - Lógica modular de la aplicación
 *   /products/      - Funcionalidad relacionada con productos
 *     /js/          - Archivos JavaScript AJAX
 *     /php/         - Modelos y lógica PHP
 *     /api/         - Endpoints de API
 *   /users/         - Funcionalidad relacionada con usuarios
 *     /js/          - Archivos JavaScript AJAX
 *     /php/         - Modelos y lógica PHP
 *     /api/         - Endpoints de API
 * 
 * Este archivo puede usarse para:
 * - Enrutamiento de API y manejo de solicitudes
 * - Configuración de middleware global
 * - Manejo de errores y registro
 * - Configuración CORS para comunicación con frontend
 * - Validación y saneamiento de solicitudes
 */

// Incluir archivos de configuración
require_once 'config/config.php';
require_once 'config/db_connect.php';

// La lógica principal de la aplicación y enrutamiento se implementará aquí
// El enrutamiento de solicitudes de API se manejará aquí
// El manejo global de errores se gestionará aquí

// Ejemplo de estructura de enrutamiento de API (por implementar):
// GET /api/products - Ruta a modules/products/api/products.php
// POST /api/auth/login - Ruta a modules/users/api/auth.php
// etc.

echo "API Backend AFERGOLF - Listo para desarrollo";

?>