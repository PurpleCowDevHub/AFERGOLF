<?php
/**
 * Endpoint de API de Login
 * 
 * Este archivo maneja el login de usuarios.
 * Valida credenciales y devuelve la información del usuario si son correctas.
 * 
 * Operaciones soportadas:
 * - POST /log_in.php: Login de usuario con email y contraseña
 * 
 * Interactúa directamente con log_in.js del frontend.
 */

// Database connection and setup
include_once "../../../config/db_connect.php";
header("Content-Type: application/json; charset=utf-8");

// Login de usuario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Receive and validate input data
    $input = json_decode(file_get_contents("php://input"), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    // Validate required fields
    if (empty($email) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "El correo y contraseña son requeridos"]);
        exit;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "El formato del correo no es válido"]);
        exit;
    }

    // Check if user exists with this email (incluye rol para verificar admin)
    $stmt = $conn->prepare("SELECT id, nombres, apellidos, email, password, rol FROM usuarios WHERE email = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Verify user exists
    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "El correo no está registrado"]);
        $stmt->close();
        exit;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Verify password
    if (!password_verify($password, $user['password'])) {
        echo json_encode(["status" => "error", "message" => "Correo o contraseña incorrectos"]);
        exit;
    }

    // Password is correct, start session and return user data
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_nombre'] = $user['nombres'];
    $_SESSION['user_apellidos'] = $user['apellidos'];
    $_SESSION['user_rol'] = $user['rol'] ?? 'usuario';

    // Return success with user data (excluding password)
    echo json_encode([
        "status" => "success",
        "message" => "Inicio de sesión exitoso",
        "user" => [
            "id" => $user['id'],
            "nombres" => $user['nombres'],
            "apellidos" => $user['apellidos'],
            "email" => $user['email'],
            "rol" => $user['rol'] ?? 'usuario'
        ]
    ]);

    $conn->close();
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Solicitud inválida"]);
    exit;
}
?>
