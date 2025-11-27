<?php
/**
 * ============================================================================
 * AFERGOLF - API REST: CREAR PRODUCTO
 * ============================================================================
 * 
 * ARCHIVO: create_product.php
 * UBICACIÓN: /back/modules/products/api/admin/create_product.php
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este archivo es el endpoint de la API REST encargado EXCLUSIVAMENTE de la
 * creación de nuevos productos en el sistema AFERGOLF. Forma parte del módulo
 * CRUD de productos del panel de administración.
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación CREATE (POST) del CRUD.
 * Para otras operaciones, usar:
 * - read_products.php   → Obtener productos (GET)
 * - update_product.php  → Actualizar productos (PUT)
 * - delete_product.php  → Eliminar productos (DELETE)
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. FRONTEND (admin_create.js)
 *    ├── Usuario llena formulario de producto en admin_dashboard.html
 *    ├── JavaScript valida campos obligatorios
 *    ├── Imágenes se convierten a Base64
 *    └── Se envía petición POST con datos JSON
 * 
 * 2. BACKEND (este archivo)
 *    ├── Recibe petición POST con JSON en el body
 *    ├── Valida campos obligatorios (nombre, categoría, marca, precio)
 *    ├── Sanitiza datos para prevenir SQL Injection
 *    ├── Genera referencia única automáticamente (AFG-P001, AFG-B001, etc.)
 *    ├── Decodifica imágenes Base64 y las guarda en /uploads/products/
 *    └── Inserta registro en tabla 'productos'
 * 
 * 3. BASE DE DATOS (MySQL - tabla productos)
 *    ├── Primary Key: referencia (VARCHAR 50)
 *    ├── Campos generales: nombre, descripcion, categoria, marca, modelo, precio, stock
 *    ├── Campos imágenes: imagen_principal, imagen_frontal, imagen_superior, imagen_lateral
 *    ├── Campos específicos: dimensiones, peso, unidades_paquete
 *    └── Campos guantes: stock_talla_s, stock_talla_m, stock_talla_l, stock_talla_xl, stock_talla_xxl
 * 
 * ============================================================================
 * ESPECIFICACIONES TÉCNICAS
 * ============================================================================
 * 
 * MÉTODO HTTP PERMITIDO: POST
 * 
 * URL DEL ENDPOINT:
 * http://localhost/AFERGOLF/back/modules/products/api/admin/create_product.php
 * 
 * HEADERS REQUERIDOS:
 * - Content-Type: application/json
 * 
 * FORMATO DE ENTRADA (JSON):
 * {
 *   "nombre": "Nombre del producto",        // OBLIGATORIO
 *   "categoria": "palos",                   // OBLIGATORIO: palos|bolas|guantes
 *   "marca": "TaylorMade",                  // OBLIGATORIO
 *   "precio": 250000,                       // OBLIGATORIO (entero en COP)
 *   "descripcion": "...",                   // Opcional
 *   "modelo": "ABC123",                     // Opcional
 *   "stock": 10,                            // Opcional (default: 0)
 *   "imagen_principal": "data:image/...",   // Opcional (Base64)
 *   "imagen_frontal": "data:image/...",     // Opcional (Base64)
 *   "imagen_superior": "data:image/...",    // Opcional (Base64)
 *   "imagen_lateral": "data:image/...",     // Opcional (Base64)
 *   "dimensiones": "0.89 x 0.10 x 0.10",    // Opcional (palos)
 *   "peso": 0.91,                           // Opcional (palos)
 *   "unidades_paquete": 12,                 // Opcional (bolas)
 *   "stock_talla_s": 5,                     // Opcional (guantes)
 *   "stock_talla_m": 10,                    // Opcional (guantes)
 *   "stock_talla_l": 8,                     // Opcional (guantes)
 *   "stock_talla_xl": 3,                    // Opcional (guantes)
 *   "stock_talla_xxl": 2                    // Opcional (guantes)
 * }
 * 
 * FORMATO DE RESPUESTA EXITOSA (HTTP 201):
 * {
 *   "success": true,
 *   "message": "Producto creado correctamente",
 *   "referencia": "AFG-P001"
 * }
 * 
 * FORMATO DE RESPUESTA ERROR (HTTP 400/405/500):
 * {
 *   "success": false,
 *   "message": "Descripción del error"
 * }
 * 
 * ============================================================================
 * GENERACIÓN AUTOMÁTICA DE REFERENCIAS
 * ============================================================================
 * 
 * El sistema genera automáticamente una referencia única para cada producto
 * basada en su categoría:
 * 
 * - Palos:      AFG-P001, AFG-P002, AFG-P003...
 * - Bolas:      AFG-B001, AFG-B002, AFG-B003...
 * - Guantes:    AFG-G001, AFG-G002, AFG-G003...
 * 
 * El número se incrementa automáticamente consultando la última referencia
 * existente de esa categoría en la base de datos.
 * 
 * ============================================================================
 * MANEJO DE IMÁGENES
 * ============================================================================
 * 
 * Las imágenes se reciben en formato Base64 y se guardan como archivos físicos
 * en el servidor:
 * 
 * RUTA FÍSICA: /uploads/products/{referencia}/
 * Ejemplo:     /uploads/products/AFG-P001/principal_1700000000.jpg
 * 
 * RUTA WEB (guardada en BD): /AFERGOLF/uploads/products/{referencia}/archivo.jpg
 * 
 * TIPOS DE IMAGEN SOPORTADOS:
 * - image/jpeg → .jpg
 * - image/png  → .png
 * - image/gif  → .gif
 * - image/webp → .webp
 * 
 * ============================================================================
 * SEGURIDAD
 * ============================================================================
 * 
 * - SQL Injection: Prevenido con mysqli::real_escape_string()
 * - XSS: Los datos se escapan antes de insertar en BD
 * - Validación de tipos: Se convierten números con (int) y (float)
 * 
 * TODO FUTURO:
 * - Implementar autenticación con JWT o sesiones PHP
 * - Agregar validación de rol (solo admin puede crear)
 * - Implementar prepared statements con PDO
 * - Limitar tamaño máximo de imágenes
 * - Validar dimensiones de imágenes
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * - PHP 7.4+
 * - Extensión mysqli
 * - Extensión fileinfo (para detección de MIME types)
 * - /back/config/db_connect.php (conexión a BD)
 * 
 * @author AFERGOLF Team
 * @version 2.0.0
 * @date 2025-11-26
 * @see read_products.php, update_product.php, delete_product.php
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN DE PHP Y HEADERS
// ============================================================================

// Aumentar límites para recibir imágenes grandes en Base64
ini_set('post_max_size', '200M');
ini_set('upload_max_filesize', '200M');
ini_set('memory_limit', '256M');
ini_set('max_execution_time', '300');

// Reportar todos los errores internamente pero no mostrarlos al cliente
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Headers HTTP
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // CORS - ajustar en producción
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// CONSTANTES DE CONFIGURACIÓN DE IMÁGENES (definidas antes de usarlas)
// ============================================================================

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB en bytes (muy amplio)
const MAX_IMAGE_WIDTH = 10000; // Ancho máximo en píxeles (muy amplio)
const MAX_IMAGE_HEIGHT = 10000; // Alto máximo en píxeles (muy amplio)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Solo se acepta POST.'
    ]);
    exit();
}

// ============================================================================
// PUNTO DE ENTRADA PRINCIPAL
// ============================================================================

try {
    // Incluir archivo de conexión a la base de datos
    require_once '../../../../config/db_connect.php';
    
    // Ejecutar función de creación de producto
    createProduct($conn);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

// ============================================================================
// FUNCIÓN PRINCIPAL: CREAR PRODUCTO
// ============================================================================

/**
 * Crea un nuevo producto en la base de datos
 * 
 * @param mysqli $conn Conexión activa a la base de datos
 * @return void Envía respuesta JSON y termina ejecución
 */
function createProduct($conn) {
    // -------------------------------------------------------------------------
    // PASO 1: Obtener y validar datos de entrada
    // -------------------------------------------------------------------------
    
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE || !$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'JSON inválido o vacío: ' . json_last_error_msg()
        ]);
        $conn->close();
        return;
    }
    
    // Validar campos obligatorios
    $camposObligatorios = ['nombre', 'categoria', 'marca', 'precio'];
    $camposFaltantes = [];
    
    foreach ($camposObligatorios as $campo) {
        if (!isset($data[$campo]) || (is_string($data[$campo]) && trim($data[$campo]) === '')) {
            $camposFaltantes[] = $campo;
        }
    }
    
    if (!empty($camposFaltantes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Campos obligatorios faltantes: ' . implode(', ', $camposFaltantes)
        ]);
        $conn->close();
        return;
    }
    
    // Validar categoría
    $categoriasValidas = ['palos', 'bolas', 'guantes'];
    if (!in_array($data['categoria'], $categoriasValidas)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Categoría inválida. Valores permitidos: ' . implode(', ', $categoriasValidas)
        ]);
        $conn->close();
        return;
    }
    
    // Validar precio positivo
    if (!is_numeric($data['precio']) || (int)$data['precio'] <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El precio debe ser un número mayor a 0'
        ]);
        $conn->close();
        return;
    }
    
    // -------------------------------------------------------------------------
    // PASO 2: Sanitizar datos de entrada
    // -------------------------------------------------------------------------
    
    $nombre = trim($data['nombre']);
    $descripcion = trim($data['descripcion'] ?? '');
    $categoria = $data['categoria'];
    $marca = trim($data['marca']);
    $modelo = trim($data['modelo'] ?? '');
    $precio = (int)$data['precio'];
    $stock = max(0, (int)($data['stock'] ?? 0));
    
    // Campos específicos
    $unidades_paquete = max(0, (int)($data['unidades_paquete'] ?? 0));
    
    // Campos específicos para palos de golf
    $longitud = max(0, (float)($data['longitud'] ?? 0));
    $loft = max(0, (float)($data['loft'] ?? 0));
    $lie = max(0, (float)($data['lie'] ?? 0));
    $peso = max(0, (int)($data['peso'] ?? 0));
    $swingweight = trim($data['swingweight'] ?? '');
    $flex = trim($data['flex'] ?? '');
    
    // Stock por tallas (guantes) - asegurar valores no negativos
    $stock_talla_s = max(0, (int)($data['stock_talla_s'] ?? 0));
    $stock_talla_m = max(0, (int)($data['stock_talla_m'] ?? 0));
    $stock_talla_l = max(0, (int)($data['stock_talla_l'] ?? 0));
    $stock_talla_xl = max(0, (int)($data['stock_talla_xl'] ?? 0));
    $stock_talla_xxl = max(0, (int)($data['stock_talla_xxl'] ?? 0));
    
    // -------------------------------------------------------------------------
    // PASO 3: Generar referencia única
    // -------------------------------------------------------------------------
    
    $referencia = generateProductReference($conn, $categoria);
    
    if (!$referencia) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al generar la referencia del producto'
        ]);
        $conn->close();
        return;
    }
    
    // -------------------------------------------------------------------------
    // PASO 4: Procesar y guardar imágenes
    // -------------------------------------------------------------------------
    
    // Definir rutas de forma más robusta
    $base_upload_dir = dirname(__DIR__, 5) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR;
    $product_dir = $base_upload_dir . $referencia . DIRECTORY_SEPARATOR;
    $web_path_base = '/AFERGOLF/uploads/products/' . $referencia . '/';
    
    // Guardar imágenes y obtener rutas
    $img_principal = saveBase64Image($data['imagen_principal'] ?? '', $product_dir, 'principal');
    $img_frontal = saveBase64Image($data['imagen_frontal'] ?? '', $product_dir, 'frontal');
    $img_superior = saveBase64Image($data['imagen_superior'] ?? '', $product_dir, 'superior');
    $img_lateral = saveBase64Image($data['imagen_lateral'] ?? '', $product_dir, 'lateral');
    
    // Construir rutas completas para BD
    $imagen_principal = $img_principal ? $web_path_base . $img_principal : '';
    $imagen_frontal = $img_frontal ? $web_path_base . $img_frontal : '';
    $imagen_superior = $img_superior ? $web_path_base . $img_superior : '';
    $imagen_lateral = $img_lateral ? $web_path_base . $img_lateral : '';
    
    // -------------------------------------------------------------------------
    // PASO 5: Insertar en base de datos con Prepared Statement
    // -------------------------------------------------------------------------
    
    $sql = "INSERT INTO productos (
        referencia, nombre, descripcion, categoria, marca, modelo, precio, stock,
        imagen_principal, imagen_frontal, imagen_superior, imagen_lateral,
        longitud, loft, lie, peso, swingweight, flex, unidades_paquete,
        stock_talla_s, stock_talla_m, stock_talla_l, stock_talla_xl, stock_talla_xxl
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al preparar la consulta: ' . $conn->error
        ]);
        $conn->close();
        return;
    }
    
    // Bind parameters: s=string, i=integer, d=double
    // 24 parámetros total
    $stmt->bind_param(
        "ssssssii" . "ssss" . "dddiss" . "i" . "iiiii",
        $referencia, $nombre, $descripcion, $categoria, $marca, $modelo,
        $precio, $stock,
        $imagen_principal, $imagen_frontal, $imagen_superior, $imagen_lateral,
        $longitud, $loft, $lie, $peso, $swingweight, $flex,
        $unidades_paquete,
        $stock_talla_s, $stock_talla_m, $stock_talla_l, $stock_talla_xl, $stock_talla_xxl
    );
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Producto creado correctamente',
            'referencia' => $referencia
        ]);
    } else {
        // Si falla la inserción, eliminar las imágenes creadas
        if (is_dir($product_dir)) {
            array_map('unlink', glob($product_dir . '*'));
            rmdir($product_dir);
        }
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear el producto: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
}

// ============================================================================
// FUNCIÓN: GENERAR REFERENCIA AUTOMÁTICA
// ============================================================================

/**
 * Genera una referencia única para el producto basada en su categoría
 * 
 * @param mysqli $conn Conexión a la base de datos
 * @param string $categoria Categoría del producto
 * @return string Referencia generada (ej: AFG-P001)
 */
function generateProductReference($conn, $categoria) {
    $prefijos = [
        'palos' => 'P',
        'bolas' => 'B',
        'guantes' => 'G'
    ];
    
    $prefix = $prefijos[$categoria] ?? 'X';
    $pattern = "AFG-{$prefix}%";
    
    // Usar prepared statement para mayor seguridad
    $sql = "SELECT referencia FROM productos WHERE referencia LIKE ? ORDER BY referencia DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        error_log('Error al preparar consulta de referencia: ' . $conn->error);
        return null;
    }
    
    $stmt->bind_param("s", $pattern);
    
    if (!$stmt->execute()) {
        error_log('Error al ejecutar consulta de referencia: ' . $stmt->error);
        $stmt->close();
        return null;
    }
    
    $result = $stmt->get_result();
    $numero = 1;
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if (preg_match('/AFG-[A-Z](\d+)$/', $row['referencia'], $matches)) {
            $numero = intval($matches[1]) + 1;
        }
    }
    
    $stmt->close();
    
    return sprintf("AFG-%s%03d", $prefix, $numero);
}

// ============================================================================
// FUNCIÓN: GUARDAR IMAGEN BASE64
// ============================================================================

/**
 * Decodifica una imagen Base64 y la guarda en el sistema de archivos
 * Con validaciones de tamaño, tipo y dimensiones
 * 
 * @param string $base64_string Cadena Base64 de la imagen
 * @param string $output_dir Directorio destino
 * @param string $filename_prefix Prefijo para el nombre del archivo
 * @return string|array Nombre del archivo generado, cadena vacía si está vacío, o array con error
 */
function saveBase64Image($base64_string, $output_dir, $filename_prefix) {
    if (empty($base64_string)) return '';
    
    // Separar metadatos
    $parts = explode(',', $base64_string);
    $data = count($parts) > 1 ? $parts[1] : $parts[0];
    
    // Decodificar
    $decoded = base64_decode($data, true);
    if ($decoded === false) {
        error_log("Error: No se pudo decodificar la imagen Base64 para $filename_prefix");
        return '';
    }
    
    // Validar tamaño del archivo decodificado
    $fileSize = strlen($decoded);
    if ($fileSize > MAX_IMAGE_SIZE) {
        $sizeMB = round($fileSize / (1024 * 1024), 2);
        error_log("Error: Imagen $filename_prefix excede el límite ({$sizeMB}MB > 5MB)");
        return '';
    }
    
    // Detectar tipo MIME usando estilo OOP
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->buffer($decoded);
    
    // Validar tipo MIME
    if (!in_array($mime_type, ALLOWED_MIME_TYPES)) {
        error_log("Error: Tipo de imagen no permitido ($mime_type) para $filename_prefix");
        return '';
    }
    
    // Validar dimensiones de la imagen (omitir para SVG ya que no aplica)
    if ($mime_type !== 'image/svg+xml') {
        $imageInfo = getimagesizefromstring($decoded);
        if ($imageInfo !== false) {
            $width = $imageInfo[0];
            $height = $imageInfo[1];
            
            if ($width > MAX_IMAGE_WIDTH || $height > MAX_IMAGE_HEIGHT) {
                error_log("Error: Dimensiones de imagen $filename_prefix exceden el límite ({$width}x{$height} > " . MAX_IMAGE_WIDTH . "x" . MAX_IMAGE_HEIGHT . ")");
                return '';
            }
        }
        // Si no puede obtener info, continuar de todas formas
    }
    
    // Determinar extensión
    $extensiones = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/bmp' => 'bmp',
        'image/svg+xml' => 'svg'
    ];
    $extension = $extensiones[$mime_type] ?? 'jpg';
    
    // Crear directorio si no existe
    if (!is_dir($output_dir)) {
        if (!mkdir($output_dir, 0755, true)) {
            error_log("Error: No se pudo crear el directorio $output_dir");
            return '';
        }
    }
    
    // Guardar archivo con nombre único
    $filename = $filename_prefix . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $file_path = $output_dir . $filename;
    
    if (file_put_contents($file_path, $decoded)) {
        return $filename;
    }
    
    error_log("Error: No se pudo guardar la imagen en $file_path");
    return '';
}
?>
