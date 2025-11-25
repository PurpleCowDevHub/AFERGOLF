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

  $email = $input['email'] ?? '';
  $telefono = $input['telefono'] ?? '';

  if (empty($email) && empty($telefono)) {
    echo json_encode(["status" => "error", "message" => "Por favor ingresa un correo o teléfono"]);
    exit;
  }

  if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "El formato del correo no es válido"]);
    exit;
  }

  if (!empty($email)) {
    $stmt = $conn->prepare("SELECT id, email FROM usuarios WHERE email = ?");
    if (!$stmt) {
      throw new Exception("Error en la consulta: " . $conn->error);
    }
    $stmt->bind_param("s", $email);
  } else {
    $stmt = $conn->prepare("SELECT id, email FROM usuarios WHERE telefono = ?");
    if (!$stmt) {
      throw new Exception("Error en la consulta: " . $conn->error);
    }
    $stmt->bind_param("s", $telefono);
  }

  if (!$stmt->execute()) {
    throw new Exception("Error al ejecutar consulta: " . $stmt->error);
  }

  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
    $stmt->close();
    exit;
  }

  $user = $result->fetch_assoc();
  $stmt->close();

  $token = bin2hex(random_bytes(32));
  $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

  $checkColumn = $conn->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='usuarios' AND COLUMN_NAME='recovery_token'");

  if (!$checkColumn || $checkColumn->num_rows === 0) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN recovery_token VARCHAR(64) DEFAULT NULL");
    $conn->query("ALTER TABLE usuarios ADD COLUMN token_expires_at DATETIME DEFAULT NULL");
  }

  $stmt = $conn->prepare("UPDATE usuarios SET recovery_token = ?, token_expires_at = ? WHERE id = ?");
  if (!$stmt) {
    throw new Exception("Error en la consulta: " . $conn->error);
  }

  $stmt->bind_param("ssi", $token, $expires_at, $user['id']);

  if (!$stmt->execute()) {
    throw new Exception("Error al actualizar usuario: " . $stmt->error);
  }

  $stmt->close();

  $recovery_link = "http://localhost/AFERGOLF/front/views/change_password.html?token=" . $token;

  if (!empty($user['email'])) {
    $to = $user['email'];
    $subject = "Recuperación de contraseña - AFERGOLF";
    $htmlBody = "<html><body style='font-family: Arial, sans-serif;'><h2>Recuperación de Contraseña</h2><p>Hemos recibido una solicitud para recuperar tu contraseña.</p><p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p><p><a href='{$recovery_link}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Cambiar Contraseña</a></p><p>Este enlace expirará en 1 hora.</p><p>Si no solicitaste esto, ignora este correo.</p><p>Saludos,<br>Equipo de AFERGOLF</p></body></html>";
    $headers = "MIME-Version: 1.0\r\nContent-type: text/html; charset=UTF-8\r\nFrom: noreply@afergolf.com\r\n";
    $mailSent = mail($to, $subject, $htmlBody, $headers);
    if ($mailSent) {
      echo json_encode(["status" => "success", "message" => "Se ha enviado un enlace de recuperación a tu correo"]);
    } else {
      echo json_encode(["status" => "success", "message" => "Tu solicitud fue procesada. Revisa tu correo para continuar."]);
    }
  } else {
    echo json_encode(["status" => "success", "message" => "Se ha enviado un código a tu teléfono"]);
  }

  $conn->close();

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
