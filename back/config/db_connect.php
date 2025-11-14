<?php
/**
 * Archivo de Conexión a Base de Datos
 * 
 * Este archivo gestiona la conexión a la base de datos MySQL usando mysqli o PDO.
 * Maneja:
 * - Establecimiento de conexión a la base de datos
 * - Manejo de errores de conexión
 * - Parámetros de conexión (host, usuario, contraseña, nombre de base de datos)
 * - Pruebas y validación de conexión
 * 
 * Utilizado por todos los módulos que necesiten acceso a la base de datos.
 */

// La lógica de conexión a la base de datos se implementará aquí
// Los parámetros de conexión se definirán aquí
// El manejo de errores para conexiones de base de datos se gestionará aquí

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "afergolf_db";

$conn = new mysqli($host, $user, $pass, $dbname);
    
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

?>