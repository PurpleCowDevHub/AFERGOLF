<?php
/**
 * User Profile Update API Endpoint
 * Handles user profile updates with validation and image upload
 */

// Database connection and setup
include_once "../../../config/db_connect.php";
header("Content-Type: application/json; charset=utf-8");

// Método obligatorio: POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
    exit;
}

// Recibimos los datos desde el frontend
$user_id = $_POST['id'] ?? null;
$nombres = $_POST['nombres'] ?? null;
$apellidos = $_POST['apellidos'] ?? null;
$email = $_POST['email'] ?? null;
$telefono = $_POST['telefono'] ?? null;
$ciudad = $_POST['ciudad'] ?? null;

// Validar que se envíe el ID del usuario
if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Falta el ID del usuario"]);
    exit;
}

// Validar que al menos haya campos para actualizar
if (!$nombres && !$apellidos && !$email && !$telefono && !$ciudad && empty($_FILES['profileImage'])) {
    echo json_encode(["status" => "error", "message" => "No hay datos para actualizar"]);
    exit;
}

// Validar campos requeridos
if (empty($nombres) || empty($apellidos) || empty($email)) {
    echo json_encode(["status" => "error", "message" => "Nombre, apellidos y correo son requeridos"]);
    exit;
}

// Validar formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "El formato del correo no es válido"]);
    exit;
}

// Verificar que el email no esté siendo usado por otro usuario
$stmt = $conn->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ? AND id != ?");
$stmt->bind_param("si", $email, $user_id);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count > 0) {
    echo json_encode(["status" => "error", "message" => "Este correo ya está registrado por otro usuario"]);
    exit;
}

// Procesar imagen si existe
$profileImage = null;
if (!empty($_FILES['profileImage']) && $_FILES['profileImage']['error'] === UPLOAD_ERR_OK) {
    // Validar tipo de archivo
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $file_type = $_FILES['profileImage']['type'];
    
    if (!in_array($file_type, $allowed_types)) {
        echo json_encode(["status" => "error", "message" => "Tipo de archivo no permitido. Solo JPEG, PNG, GIF o WEBP"]);
        exit;
    }
    
    // Validar tamaño de archivo (máximo 5MB)
    if ($_FILES['profileImage']['size'] > 5 * 1024 * 1024) {
        echo json_encode(["status" => "error", "message" => "El archivo es muy grande. Máximo 5MB"]);
        exit;
    }
    
    // Crear directorio si no existe
    $upload_dir = realpath(__DIR__ . '/../../../../') . '/front/assets/img/profiles/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generar nombre único para la imagen
    $file_extension = strtolower(pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION));
    $filename = 'profile_' . $user_id . '_' . time() . '.' . $file_extension;
    $file_path = $upload_dir . $filename;
    
    // Mover archivo
    if (!move_uploaded_file($_FILES['profileImage']['tmp_name'], $file_path)) {
        echo json_encode(["status" => "error", "message" => "Error al guardar la imagen"]);
        exit;
    }
    
    // Guardar ruta relativa para la BD
    $profileImage = 'assets/img/profiles/' . $filename;
    
    // Eliminar imagen anterior si existe
    $stmt = $conn->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['foto_perfil']) {
            $old_file = realpath(__DIR__ . '/../../../../') . '/front/' . $row['foto_perfil'];
            if (file_exists($old_file) && strpos($old_file, 'profiles') !== false) {
                unlink($old_file);
            }
        }
    }
    $stmt->close();
}

// Verificar que la columna foto_perfil existe en la tabla
$checkColumn = $conn->query("
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='usuarios' AND COLUMN_NAME='foto_perfil'
");

$fotoPerfilExists = $checkColumn && $checkColumn->num_rows > 0;

// Si no existe la columna pero hay imagen, crear la columna
if ($profileImage && !$fotoPerfilExists) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL DEFAULT NULL AFTER ciudad");
    $fotoPerfilExists = true;
}

// Actualizar el perfil del usuario
if ($profileImage && $fotoPerfilExists) {
    $stmt = $conn->prepare("UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, telefono = ?, ciudad = ?, foto_perfil = ? WHERE id = ?");
    $stmt->bind_param("ssssssi", $nombres, $apellidos, $email, $telefono, $ciudad, $profileImage, $user_id);
} else {
    $stmt = $conn->prepare("UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, telefono = ?, ciudad = ? WHERE id = ?");
    $stmt->bind_param("sssssi", $nombres, $apellidos, $email, $telefono, $ciudad, $user_id);
}

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $conn->error]);
    exit;
}

if ($stmt->execute()) {
    // Obtener datos actualizados
    $stmt_get = $conn->prepare("SELECT id, nombres, apellidos, email, telefono, ciudad, foto_perfil FROM usuarios WHERE id = ?");
    $stmt_get->bind_param("i", $user_id);
    $stmt_get->execute();
    $result_get = $stmt_get->get_result();
    $user_data = $result_get->fetch_assoc();
    $stmt_get->close();
    
    // Asegurar que foto_perfil esté bien formateada
    $fotoPerfilResponse = $user_data['foto_perfil'] ? trim($user_data['foto_perfil']) : null;
    
    echo json_encode([
        "status" => "success",
        "message" => "Perfil actualizado correctamente",
        "user" => [
            "id" => $user_data['id'],
            "nombres" => $user_data['nombres'],
            "apellidos" => $user_data['apellidos'],
            "email" => $user_data['email'],
            "telefono" => $user_data['telefono'],
            "ciudad" => $user_data['ciudad'],
            "foto_perfil" => $fotoPerfilResponse
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error al actualizar el perfil: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
