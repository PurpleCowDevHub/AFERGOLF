<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');
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
  } elseif (!empty($userId)) {
    $verifiedUserId = $userId;
  } else {
    echo json_encode(["status" => "error", "message" => "Método de verificación no válido"]);
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
