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

// Verificar si la columna foto_perfil existe
$checkColumn = $conn->query("
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='usuarios' AND COLUMN_NAME='foto_perfil'
");

$fotoPerfilExists = $checkColumn && $checkColumn->num_rows > 0;

// Construir query dinámicamente según si existe la columna
if ($fotoPerfilExists) {
    $stmt = $conn->prepare("SELECT id, nombres, apellidos, email, telefono, ciudad, foto_perfil FROM usuarios WHERE id = ?");
} else {
    $stmt = $conn->prepare("SELECT id, nombres, apellidos, email, telefono, ciudad FROM usuarios WHERE id = ?");
}

$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
    exit;
}

$user = $result->fetch_assoc();

// Agregar foto_perfil como null si no existe la columna
if (!$fotoPerfilExists) {
    $user['foto_perfil'] = null;
} else if ($user['foto_perfil']) {
    // Asegurar que la ruta esté correctamente formateada
    // La BD almacena: assets/img/profiles/profile_X_Y.jpg
    // Desde el HTML (front/views) necesitamos: ../assets/img/profiles/profile_X_Y.jpg
    // Pero el JS ya agrega el ../ así que dejamos solo: assets/img/profiles/...
    $user['foto_perfil'] = trim($user['foto_perfil']);
}

echo json_encode([
    "status" => "success",
    "message" => "Usuario encontrado",
    "user" => $user
]);

$stmt->close();
$conn->close();
?>
