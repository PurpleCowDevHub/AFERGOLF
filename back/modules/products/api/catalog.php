<?php
/**
 * API Catálogo de Productos AFERGOLF
 *
 * - GET  /catalog.php                → Lista todos los productos
 * - GET  /catalog.php?referencia=XX  → Devuelve un producto específico
 * - Opcional: ?tipo=palos&marca=callaway (filtros simples desde el backend)
 */

header('Content-Type: application/json; charset=utf-8');

require_once '../../../config/db_connect.php'; // ajustado a tu estructura

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Usa GET.'
    ]);
    exit;
}

try {
    // Si viene ?referencia=XXXX → devolver UN producto
    if (!empty($_GET['referencia'])) {
        $referencia = $conn->real_escape_string($_GET['referencia']);

        $sql = "SELECT * FROM productos WHERE referencia = '$referencia' LIMIT 1";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            $producto = $result->fetch_assoc();

            echo json_encode([
                'success' => true,
                'producto' => $producto
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Producto no encontrado'
            ]);
        }

        exit;
    }

    // Si NO viene referencia, devolver listado completo (con filtros opcionales)
    $where = [];
    if (!empty($_GET['tipo'])) {
        $tipo = $conn->real_escape_string($_GET['tipo']);
        $where[] = "categoria = '$tipo'";
    }

    if (!empty($_GET['marca'])) {
        $marca = $conn->real_escape_string($_GET['marca']);
        $where[] = "marca = '$marca'";
    }

    $whereClause = '';
    if (!empty($where)) {
        $whereClause = 'WHERE ' . implode(' AND ', $where);
    }

    $sql = "SELECT * FROM productos $whereClause ORDER BY fecha_creacion DESC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception('Error al obtener productos: ' . $conn->error);
    }

    $productos = [];
    while ($row = $result->fetch_assoc()) {
        $productos[] = $row;
    }

    echo json_encode([
        'success' => true,
        'productos' => $productos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
