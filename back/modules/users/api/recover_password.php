<?php
/**
 * Recover Password API Endpoint
 * 
 * Cambia la contraseña de un usuario a partir de:
 *  - correo
 *  - nueva contraseña
 */

include_once __DIR__ . "/../../../config/db_connect.php";
header("Content-Type: application/json; charset=UTF-8");

// Leer cuerpo JSON
$input = json_decode(file_get_contents("php://input"), true);

$correo   = $input['correo']  ?? '';
$password = $input['password'] ?? '';

// Validar campos requeridos
if (empty($correo) || empty($password)) {
  echo json_encode([
    "status"  => "error",
    "message" => "El correo y la nueva contraseña son requeridos."
  ]);
  exit;
}

// Validar formato de correo
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  echo json_encode([
    "status"  => "error",
    "message" => "El formato del correo no es válido."
  ]);
  exit;
}

// Validar longitud mínima de contraseña
if (strlen($password) < 8) {
  echo json_encode([
    "status"  => "error",
    "message" => "La contraseña debe tener al menos 8 caracteres."
  ]);
  exit;
}

// Verificar que el usuario exista
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
if (!$stmt) {
  echo json_encode([
    "status"  => "error",
    "message" => "Error interno del servidor (prepare)."
  ]);
  exit;
}

$stmt->bind_param("s", $correo);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
  $stmt->close();
  echo json_encode([
    "status"  => "error",
    "message" => "No existe un usuario registrado con este correo."
  ]);
  $conn->close();
  exit;
}

$stmt->close();

// Hashear nueva contraseña
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Actualizar contraseña
$update = $conn->prepare("UPDATE usuarios SET password = ? WHERE email = ?");
if (!$update) {
  echo json_encode([
    "status"  => "error",
    "message" => "Error interno del servidor (prepare update)."
  ]);
  $conn->close();
  exit;
}

$update->bind_param("ss", $hashed_password, $correo);

if ($update->execute()) {
  echo json_encode([
    "status"  => "success",
    "message" => "Contraseña actualizada correctamente. Ahora puedes iniciar sesión."
  ]);
} else {
  echo json_encode([
    "status"  => "error",
    "message" => "Error al actualizar la contraseña."
  ]);
}

$update->close();
$conn->close();
