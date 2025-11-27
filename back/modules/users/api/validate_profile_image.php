<?php
/**
 * Script de validación: Verifica si las imágenes están siendo guardadas correctamente
 */

header("Content-Type: application/json; charset=utf-8");
include_once "../config/db_connect.php";

$user_id = $_GET['id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Parámetro 'id' requerido",
        "ejemplo" => "?id=1"
    ]);
    exit;
}

try {
    // 1. Verificar que la columna existe
    $checkColumn = $conn->query("
        SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='usuarios' AND COLUMN_NAME='foto_perfil'
    ");
    
    $columnExists = $checkColumn && $checkColumn->num_rows > 0;
    $columnInfo = null;
    
    if ($columnExists) {
        $columnInfo = $checkColumn->fetch_assoc();
    }

    // 2. Obtener datos del usuario
    $stmt = $conn->prepare("SELECT id, nombres, apellidos, email, foto_perfil FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Usuario no encontrado",
            "user_id" => $user_id
        ]);
        $stmt->close();
        exit;
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();

    // 3. Validar la ruta si existe
    $fileExists = false;
    $fileInfo = null;
    
    if ($user['foto_perfil'] && $user['foto_perfil'] !== "") {
        $filePath = realpath(__DIR__ . '/../../../../') . '/front/' . $user['foto_perfil'];
        $fileExists = file_exists($filePath);
        
        if ($fileExists) {
            $fileInfo = [
                "exists" => true,
                "path" => $filePath,
                "size" => filesize($filePath),
                "size_mb" => round(filesize($filePath) / (1024 * 1024), 2),
                "type" => mime_content_type($filePath),
                "modified" => date("Y-m-d H:i:s", filemtime($filePath))
            ];
        }
    }

    // 4. Construir respuesta
    echo json_encode([
        "status" => "success",
        "database" => [
            "column_exists" => $columnExists,
            "column_type" => $columnInfo ? $columnInfo['COLUMN_TYPE'] : null,
            "user" => [
                "id" => $user['id'],
                "nombres" => $user['nombres'],
                "apellidos" => $user['apellidos'],
                "email" => $user['email'],
                "foto_perfil" => $user['foto_perfil'] ?: null
            ]
        ],
        "file_system" => [
            "path_in_db" => $user['foto_perfil'],
            "file_exists" => $fileExists,
            "file_info" => $fileInfo,
            "expected_path" => $user['foto_perfil'] ? "AFERGOLF/front/" . $user['foto_perfil'] : null
        ],
        "paths_for_frontend" => [
            "from_my_account_html" => $user['foto_perfil'] ? "../" . $user['foto_perfil'] : null,
            "from_root_absolute" => $user['foto_perfil'] ? "/AFERGOLF/" . $user['foto_perfil'] : null
        ],
        "diagnostics" => [
            "column_created" => $columnExists ? "Si" : "No",
            "ruta_en_bd" => $user['foto_perfil'] ? "Si" : "Vacia o NULL",
            "archivo_existe" => $fileExists ? "Si" : "No (verifica la ruta)",
            "listo_para_usar" => ($columnExists && $user['foto_perfil'] && $fileExists) ? "Si" : "No"
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
