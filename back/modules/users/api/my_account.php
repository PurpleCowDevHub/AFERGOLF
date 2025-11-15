<?php
header("Content-Type: application/json; charset=utf-8");
include_once "../../../config/db_connect.php";

// Método obligatorio: GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
    exit;
}

// Recibimos el ID del usuario desde el front
$user_id = $_GET['id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Falta el ID del usuario"]);
    exit;
}

// Consulta de datos del usuario
$stmt = $conn->prepare("SELECT id, nombres, apellidos, email, telefono, ciudad FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
    exit;
}

$user = $result->fetch_assoc();

echo json_encode([
    "status" => "success",
    "message" => "Usuario encontrado",
    "user" => $user
]);
