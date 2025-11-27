<?php
/**
 * Conexión a Base de Datos MySQL
 * Configuración para XAMPP con mysqli
 */

$host = "sql113.infinityfree.com";
$user = "if0_40532299";
$pass = "AFER20GOLF25";
$dbname = "if0_40532299_afergolf_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos: ' . $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8mb4");

?>
