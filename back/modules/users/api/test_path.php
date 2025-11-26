<?php
// Archivo de prueba para verificar la ruta de db_connect.php
header("Content-Type: application/json; charset=utf-8");

$basePath = __DIR__;
echo json_encode([
    "current_file" => __FILE__,
    "current_dir" => $basePath,
    "db_connect_path" => $basePath . "/../../../../config/db_connect.php",
    "file_exists" => file_exists($basePath . "/../../../../config/db_connect.php") ? "SÍ" : "NO"
]);
?>
