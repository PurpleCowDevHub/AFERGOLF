<?php
/**
 * User Registration API Endpoint
 * Handles user registration with secure password hashing and validation
 */

// Database connection and setup
include_once "../../../../config/db_connect.php";
header("Content-Type: application/json");

// Receive and validate input data
$input = json_decode(file_get_contents("php://input"), true);
$nombre = $input['nombre'] ?? '';
$apellidos = $input['apellidos'] ?? '';
$correo = $input['correo'] ?? '';
$password = $input['password'] ?? '';

// Validate required fields
if (empty($nombre) || empty($apellidos) || empty($correo) || empty($password)) {
  echo json_encode(["status" => "error", "message" => "Todos los campos son requeridos"]);
  exit;
}

// Validate email format
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(["status" => "error", "message" => "El formato del correo no es válido"]);
  exit;
}

// Check if email already exists
$stmt = $conn->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count > 0) {
  echo json_encode(["status" => "error", "message" => "El correo ya está registrado"]);
  exit;
}

// Hash password and insert user
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO usuarios (nombres, apellidos, email, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nombre, $apellidos, $correo, $hashed_password);

// Return response
if ($stmt->execute()) {
  echo json_encode(["status" => "success", "message" => "Usuario registrado exitosamente"]);
} else {
  echo json_encode(["status" => "error", "message" => "Error al registrar usuario"]);
}

$stmt->close();
$conn->close();
?>
