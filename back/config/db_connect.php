<?php
/**
 * Conexión a Base de Datos con PDO - AFERGOLF
 */

require_once __DIR__ . '/config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // Mostrar errores
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,   // Fetch en array asociativo
        PDO::ATTR_EMULATE_PREPARES => false                 // Preparación real
    ]);

} catch (PDOException $e) {
    die("Error al conectar a la Base de Datos: " . $e->getMessage());
}

?>
