<?php
/**
 * Migración: Agregar columna foto_perfil a tabla usuarios
 * Este script verifica si la columna existe y la crea si no está presente
 */

include_once "../../../config/db_connect.php";

try {
    // Verificar si la columna foto_perfil ya existe
    $checkColumn = $conn->query("
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='usuarios' AND COLUMN_NAME='foto_perfil'
    ");

    if ($checkColumn && $checkColumn->num_rows === 0) {
        // La columna no existe, crearla
        $result = $conn->query("
            ALTER TABLE usuarios 
            ADD COLUMN foto_perfil VARCHAR(255) NULL DEFAULT NULL 
            AFTER ciudad
        ");

        if ($result) {
            echo json_encode([
                "status" => "success",
                "message" => "Columna 'foto_perfil' agregada exitosamente a la tabla usuarios"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al crear la columna: " . $conn->error
            ]);
        }
    } else {
        echo json_encode([
            "status" => "info",
            "message" => "La columna 'foto_perfil' ya existe en la tabla usuarios"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
