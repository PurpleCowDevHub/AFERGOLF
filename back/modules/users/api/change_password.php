<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');
session_start(); // Iniciar sesión para acceder a $_SESSION
include_once __DIR__ . "/../../../config/db_connect.php";
header("Content-Type: application/json; charset=utf-8");

try {
  if (!isset($conn) || !$conn) {
    throw new Exception("No se pudo conectar a la base de datos");
  }

  $input = json_decode(file_get_contents("php://input"), true);
  if (!$input) {
    throw new Exception("Datos inválidos");
  }

  $token = $input['token'] ?? '';
  $userId = $input['userId'] ?? '';
  $newPassword = $input['newPassword'] ?? '';

  if (empty($newPassword)) {
    echo json_encode(["status" => "error", "message" => "La contraseña es requerida"]);
    exit;
  }

  if (strlen($newPassword) < 8) {
    echo json_encode(["status" => "error", "message" => "La contraseña debe tener al menos 8 caracteres"]);
    exit;
  }

  $verifiedUserId = null;

  if (!empty($token)) {
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE recovery_token = ? AND token_expires_at > NOW()");
    if (!$stmt) {
      throw new Exception("Error en la consulta: " . $conn->error);
    }

    $stmt->bind_param("s", $token);
    if (!$stmt->execute()) {
      throw new Exception("Error al ejecutar consulta: " . $stmt->error);
    }

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
      echo json_encode(["status" => "error", "message" => "Token inválido o expirado"]);
      $stmt->close();
      exit;
    }

    $user = $result->fetch_assoc();
    $verifiedUserId = $user['id'];
    $stmt->close();
  } elseif (isset($_SESSION['user_id'])) {
    // Si hay sesión activa, usamos el ID de la sesión (más seguro)
    $verifiedUserId = $_SESSION['user_id'];
  } elseif (!empty($userId)) {
    // Fallback inseguro: usamos el ID enviado por el cliente (comportamiento original)
    // TODO: Considerar eliminar esto en producción para mayor seguridad
    $verifiedUserId = $userId;
  } else {
    echo json_encode(["status" => "error", "message" => "No se pudo identificar al usuario. Por favor inicia sesión nuevamente."]);
    exit;
  }

  $hashed_password = password_hash($newPassword, PASSWORD_DEFAULT);

  $stmt = $conn->prepare("UPDATE usuarios SET password = ?, recovery_token = NULL, token_expires_at = NULL WHERE id = ?");

  if (!$stmt) {
    throw new Exception("Error en la consulta: " . $conn->error);
  }

  $stmt->bind_param("si", $hashed_password, $verifiedUserId);

  if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Contraseña cambiada exitosamente"]);
  } else {
    throw new Exception("Error al cambiar la contraseña: " . $stmt->error);
  }

  $stmt->close();
  $conn->close();

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
