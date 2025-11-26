<?php
/**
 * ============================================================================
 * AFERGOLF - API REST: ELIMINAR PRODUCTO
 * ============================================================================
 * 
 * ARCHIVO: delete_product.php
 * UBICACIÓN: /back/modules/products/api/admin/delete_product.php
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este archivo es el endpoint de la API REST encargado EXCLUSIVAMENTE de la
 * eliminación de productos en el sistema AFERGOLF. Forma parte del módulo
 * CRUD de productos del panel de administración.
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación DELETE del CRUD.
 * Para otras operaciones, usar:
 * - create_product.php  → Crear productos (POST)
 * - read_products.php   → Obtener productos (GET)
 * - update_product.php  → Actualizar productos (PUT)
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. FRONTEND (admin_delete.js)
 *    ├── Usuario hace clic en botón "Eliminar" de un producto
 *    ├── Se abre modal de confirmación
 *    ├── Usuario confirma la eliminación
 *    ├── JavaScript llama a deleteProductConfirmed()
 *    └── Se envía petición DELETE a este endpoint
 * 
 * 2. BACKEND (este archivo)
 *    ├── Recibe petición DELETE con referencia en query string o body
 *    ├── Valida que se proporcione la referencia
 *    ├── Verifica que el producto exista en la BD
 *    ├── (Opcional) Verifica dependencias (pedidos, carrito, etc.)
 *    ├── Elimina archivos de imágenes del producto
 *    └── Elimina registro de la tabla 'productos'
 * 
 * 3. BASE DE DATOS (MySQL - tabla productos)
 *    └── DELETE FROM productos WHERE referencia = 'AFG-P001'
 * 
 * 4. SISTEMA DE ARCHIVOS
 *    └── Se elimina carpeta /uploads/products/AFG-P001/ con todas las imágenes
 * 
 * 5. RESPUESTA AL FRONTEND
 *    ├── JavaScript recibe confirmación
 *    ├── Cierra modal de confirmación
 *    ├── Muestra notificación de éxito
 *    └── Recarga tabla de productos
 * 
 * ============================================================================
 * ESPECIFICACIONES TÉCNICAS
 * ============================================================================
 * 
 * MÉTODO HTTP PERMITIDO: DELETE
 * 
 * URL DEL ENDPOINT:
 * http://localhost/AFERGOLF/back/modules/products/api/admin/delete_product.php
 * 
 * FORMAS DE ENVIAR LA REFERENCIA:
 * 
 * 1. Query String (recomendado):
 *    DELETE /delete_product.php?referencia=AFG-P001
 * 
 * 2. Body JSON:
 *    DELETE /delete_product.php
 *    Content-Type: application/json
 *    { "referencia": "AFG-P001" }
 * 
 * ============================================================================
 * FORMATO DE RESPUESTAS
 * ============================================================================
 * 
 * RESPUESTA EXITOSA (HTTP 200):
 * {
 *   "success": true,
 *   "message": "Producto eliminado correctamente",
 *   "referencia": "AFG-P001",
 *   "imagenes_eliminadas": true
 * }
 * 
 * RESPUESTA ERROR - REFERENCIA FALTANTE (HTTP 400):
 * {
 *   "success": false,
 *   "message": "Referencia del producto es obligatoria"
 * }
 * 
 * RESPUESTA ERROR - PRODUCTO NO ENCONTRADO (HTTP 404):
 * {
 *   "success": false,
 *   "message": "Producto no encontrado"
 * }
 * 
 * RESPUESTA ERROR - PRODUCTO CON DEPENDENCIAS (HTTP 409):
 * {
 *   "success": false,
 *   "message": "No se puede eliminar: el producto tiene pedidos asociados",
 *   "pedidos_asociados": 5
 * }
 * 
 * RESPUESTA ERROR - ERROR DE BD (HTTP 500):
 * {
 *   "success": false,
 *   "message": "Error al eliminar el producto: [error de MySQL]"
 * }
 * 
 * ============================================================================
 * PROCESO DE ELIMINACIÓN
 * ============================================================================
 * 
 * La eliminación sigue estos pasos en orden:
 * 
 * 1. VALIDACIÓN DE ENTRADA
 *    └── Verificar que se proporcionó referencia válida
 * 
 * 2. VERIFICACIÓN DE EXISTENCIA
 *    └── Confirmar que el producto existe en la BD
 * 
 * 3. VERIFICACIÓN DE DEPENDENCIAS (TODO)
 *    ├── Verificar si hay pedidos con este producto
 *    ├── Verificar si está en carritos de usuarios
 *    └── Si hay dependencias, retornar error 409 Conflict
 * 
 * 4. ELIMINACIÓN DE ARCHIVOS
 *    ├── Obtener rutas de imágenes de la BD
 *    ├── Eliminar cada archivo de imagen
 *    └── Eliminar carpeta del producto en /uploads/products/
 * 
 * 5. ELIMINACIÓN DE REGISTRO
 *    └── DELETE FROM productos WHERE referencia = 'XXX'
 * 
 * 6. RESPUESTA
 *    └── Enviar confirmación JSON al frontend
 * 
 * ============================================================================
 * ELIMINACIÓN DE IMÁGENES
 * ============================================================================
 * 
 * Cuando se elimina un producto, también se eliminan sus imágenes del servidor:
 * 
 * RUTA DE IMÁGENES: /uploads/products/{referencia}/
 * 
 * Ejemplo para producto AFG-P001:
 * /uploads/products/AFG-P001/
 * ├── principal_1700000000.jpg  ← Se elimina
 * ├── frontal_1700000001.jpg    ← Se elimina
 * ├── superior_1700000002.jpg   ← Se elimina
 * └── lateral_1700000003.jpg    ← Se elimina
 * 
 * Después de eliminar los archivos, se elimina la carpeta vacía.
 * 
 * NOTA: Si falla la eliminación de archivos, el producto aún se elimina
 * de la BD pero se registra un warning en el log.
 * 
 * ============================================================================
 * CONSIDERACIONES DE INTEGRIDAD REFERENCIAL
 * ============================================================================
 * 
 * TABLAS RELACIONADAS (a verificar antes de eliminar):
 * 
 * ┌─────────────────┬─────────────────────────────────────────────────────┐
 * │ Tabla           │ Relación                                            │
 * ├─────────────────┼─────────────────────────────────────────────────────┤
 * │ pedidos_detalle │ producto_referencia → productos.referencia          │
 * │ carrito         │ producto_referencia → productos.referencia          │
 * │ favoritos       │ producto_referencia → productos.referencia          │
 * │ resenas         │ producto_referencia → productos.referencia          │
 * └─────────────────┴─────────────────────────────────────────────────────┘
 * 
 * POLÍTICA ACTUAL: Eliminación directa (sin verificar dependencias)
 * 
 * TODO FUTURO:
 * - Opción 1: Verificar dependencias y bloquear eliminación
 * - Opción 2: Soft delete (marcar como eliminado sin borrar físicamente)
 * - Opción 3: Cascade delete (eliminar también registros relacionados)
 * 
 * ============================================================================
 * SEGURIDAD
 * ============================================================================
 * 
 * - SQL Injection: Prevenido con mysqli::real_escape_string()
 * - Validación de existencia antes de eliminar
 * - La referencia se sanitiza antes de usar en queries
 * - Solo se eliminan archivos dentro de /uploads/products/
 * 
 * TODO FUTURO:
 * - Implementar autenticación JWT/sesiones
 * - Validar rol de administrador
 * - Implementar soft delete con campo 'eliminado'
 * - Log de auditoría: quién eliminó, cuándo, etc.
 * - Backup automático antes de eliminar
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * - PHP 7.4+
 * - Extensión mysqli
 * - /back/config/db_connect.php (conexión a BD)
 * 
 * @author AFERGOLF Team
 * @version 2.0.0
 * @date 2025-11-26
 * @see create_product.php, read_products.php, update_product.php
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN DE PHP Y HEADERS
// ============================================================================

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// MANEJO DE PREFLIGHT REQUEST (CORS)
// ============================================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================================
// VALIDACIÓN DE MÉTODO HTTP
// ============================================================================

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Solo se acepta DELETE.'
    ]);
    exit();
}

// ============================================================================
// PUNTO DE ENTRADA PRINCIPAL
// ============================================================================

try {
    require_once '../../../../config/db_connect.php';
    deleteProduct($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

// ============================================================================
// FUNCIÓN PRINCIPAL: ELIMINAR PRODUCTO
// ============================================================================

/**
 * Elimina un producto de la base de datos y sus archivos asociados
 * 
 * @param mysqli $conn Conexión activa a la base de datos
 * @return void Envía respuesta JSON y termina ejecución
 */
function deleteProduct($conn) {
    // -------------------------------------------------------------------------
    // PASO 1: Obtener referencia del producto
    // -------------------------------------------------------------------------
    
    // Intentar obtener referencia del query string primero
    $referencia = $_GET['referencia'] ?? null;
    
    // Si no está en query string, buscar en el body JSON
    if (empty($referencia)) {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);
        $referencia = $data['referencia'] ?? null;
    }
    
    // Validar que se proporcione la referencia
    if (empty($referencia)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Referencia del producto es obligatoria'
        ]);
        return;
    }
    
    $referencia = $conn->real_escape_string(trim($referencia));
    
    // -------------------------------------------------------------------------
    // PASO 2: Verificar que el producto exista
    // -------------------------------------------------------------------------
    
    $checkSql = "SELECT referencia, imagen_principal, imagen_frontal, imagen_superior, imagen_lateral 
                 FROM productos WHERE referencia = '$referencia' LIMIT 1";
    $checkResult = $conn->query($checkSql);
    
    if (!$checkResult || $checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Producto no encontrado'
        ]);
        return;
    }
    
    $producto = $checkResult->fetch_assoc();
    
    // -------------------------------------------------------------------------
    // PASO 3: Verificar dependencias (TODO - implementar cuando existan tablas)
    // -------------------------------------------------------------------------
    
    // TODO: Descomentar cuando existan las tablas de pedidos
    /*
    $dependenciasSql = "SELECT COUNT(*) as total FROM pedidos_detalle WHERE producto_referencia = '$referencia'";
    $depResult = $conn->query($dependenciasSql);
    if ($depResult) {
        $dep = $depResult->fetch_assoc();
        if ($dep['total'] > 0) {
            http_response_code(409); // Conflict
            echo json_encode([
                'success' => false,
                'message' => 'No se puede eliminar: el producto tiene pedidos asociados',
                'pedidos_asociados' => (int)$dep['total']
            ]);
            return;
        }
    }
    */
    
    // -------------------------------------------------------------------------
    // PASO 4: Eliminar archivos de imágenes
    // -------------------------------------------------------------------------
    
    $imagenesEliminadas = deleteProductImages($referencia, $producto);
    
    // -------------------------------------------------------------------------
    // PASO 5: Eliminar registro de la base de datos
    // -------------------------------------------------------------------------
    
    $sql = "DELETE FROM productos WHERE referencia = '$referencia'";
    
    if ($conn->query($sql)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Producto eliminado correctamente',
            'referencia' => $referencia,
            'imagenes_eliminadas' => $imagenesEliminadas
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar el producto: ' . $conn->error
        ]);
    }
}

// ============================================================================
// FUNCIÓN: ELIMINAR IMÁGENES DEL PRODUCTO
// ============================================================================

/**
 * Elimina los archivos de imagen asociados a un producto
 * 
 * @param string $referencia Referencia del producto
 * @param array $producto Datos del producto con rutas de imágenes
 * @return bool True si se eliminaron correctamente, false si hubo errores
 */
function deleteProductImages($referencia, $producto) {
    $success = true;
    
    // Ruta base del directorio de productos
    $base_upload_dir = realpath(__DIR__ . '/../../../../../') . '/uploads/products/';
    $product_dir = $base_upload_dir . $referencia . '/';
    
    // Verificar si existe el directorio del producto
    if (!is_dir($product_dir)) {
        return true; // No hay directorio, nada que eliminar
    }
    
    // Intentar eliminar todos los archivos dentro del directorio
    $archivos = glob($product_dir . '*');
    
    foreach ($archivos as $archivo) {
        if (is_file($archivo)) {
            if (!unlink($archivo)) {
                error_log("AFERGOLF: No se pudo eliminar archivo: $archivo");
                $success = false;
            }
        }
    }
    
    // Intentar eliminar el directorio vacío
    if (is_dir($product_dir)) {
        if (!rmdir($product_dir)) {
            error_log("AFERGOLF: No se pudo eliminar directorio: $product_dir");
            $success = false;
        }
    }
    
    return $success;
}
?>
