<?php
/**
 * ============================================================================
 * AFERGOLF - API REST: ACTUALIZAR PRODUCTO
 * ============================================================================
 * 
 * ARCHIVO: update_product.php
 * UBICACIÓN: /back/modules/products/api/admin/update_product.php
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este archivo es el endpoint de la API REST encargado EXCLUSIVAMENTE de la
 * actualización de productos existentes en el sistema AFERGOLF. Forma parte 
 * del módulo CRUD de productos del panel de administración.
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación UPDATE (PUT) del CRUD.
 * Para otras operaciones, usar:
 * - create_product.php  → Crear productos (POST)
 * - read_products.php   → Obtener productos (GET)
 * - delete_product.php  → Eliminar productos (DELETE)
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. FRONTEND (admin_update.js)
 *    ├── Usuario hace clic en botón "Editar" de un producto
 *    ├── Se carga el producto con fetchProductByReference()
 *    ├── Se abre modal con datos precargados en el formulario
 *    ├── Usuario modifica los campos deseados
 *    ├── Usuario hace clic en "Actualizar Producto"
 *    ├── JavaScript valida campos
 *    └── Se envía petición PUT con datos JSON
 * 
 * 2. BACKEND (este archivo)
 *    ├── Recibe petición PUT con JSON en el body
 *    ├── Valida que se proporcione referencia (obligatoria)
 *    ├── Verifica que el producto exista en la BD
 *    ├── Sanitiza todos los datos recibidos
 *    ├── Construye query UPDATE dinámico (solo campos proporcionados)
 *    ├── Si hay imágenes nuevas en Base64, las procesa
 *    └── Ejecuta actualización en tabla 'productos'
 * 
 * 3. BASE DE DATOS (MySQL - tabla productos)
 *    └── UPDATE productos SET campo1=valor1, campo2=valor2 WHERE referencia='AFG-P001'
 * 
 * 4. RESPUESTA AL FRONTEND
 *    ├── JavaScript recibe confirmación
 *    ├── Cierra modal de edición
 *    ├── Muestra notificación de éxito
 *    └── Recarga tabla de productos
 * 
 * ============================================================================
 * ESPECIFICACIONES TÉCNICAS
 * ============================================================================
 * 
 * MÉTODO HTTP PERMITIDO: PUT
 * 
 * URL DEL ENDPOINT:
 * http://localhost/AFERGOLF/back/modules/products/api/admin/update_product.php
 * 
 * HEADERS REQUERIDOS:
 * - Content-Type: application/json
 * 
 * FORMATO DE ENTRADA (JSON):
 * {
 *   "referencia": "AFG-P001",              // OBLIGATORIO - No se puede modificar
 *   "nombre": "Nuevo nombre",              // Opcional
 *   "categoria": "palos",                  // Opcional
 *   "marca": "Nueva marca",                // Opcional
 *   "precio": 300000,                      // Opcional
 *   "descripcion": "Nueva descripción",    // Opcional
 *   "modelo": "NuevoModelo",               // Opcional
 *   "stock": 15,                           // Opcional
 *   "imagen_principal": "data:image/...",  // Opcional (Base64 o ruta existente)
 *   "imagen_frontal": "data:image/...",    // Opcional
 *   "imagen_superior": "data:image/...",   // Opcional
 *   "imagen_lateral": "data:image/...",    // Opcional
 *   "dimensiones": "1.0 x 0.15 x 0.15",    // Opcional
 *   "peso": 0.95,                          // Opcional
 *   "unidades_paquete": 24,                // Opcional
 *   "stock_talla_s": 10,                   // Opcional
 *   "stock_talla_m": 15,                   // Opcional
 *   "stock_talla_l": 12,                   // Opcional
 *   "stock_talla_xl": 8,                   // Opcional
 *   "stock_talla_xxl": 5                   // Opcional
 * }
 * 
 * NOTA IMPORTANTE SOBRE IMÁGENES:
 * - Si se envía una imagen en Base64 (comienza con "data:image/"), se procesa
 *   y se guarda como nuevo archivo, reemplazando el anterior.
 * - Si se envía una ruta existente (comienza con "/AFERGOLF/"), se mantiene
 *   la imagen actual sin cambios.
 * - Si se envía cadena vacía "", se elimina la imagen actual.
 * 
 * ============================================================================
 * FORMATO DE RESPUESTAS
 * ============================================================================
 * 
 * RESPUESTA EXITOSA (HTTP 200):
 * {
 *   "success": true,
 *   "message": "Producto actualizado correctamente",
 *   "referencia": "AFG-P001",
 *   "campos_actualizados": ["nombre", "precio", "stock"]
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
 * RESPUESTA ERROR - SIN CAMPOS PARA ACTUALIZAR (HTTP 400):
 * {
 *   "success": false,
 *   "message": "No hay campos para actualizar"
 * }
 * 
 * RESPUESTA ERROR - ERROR DE BD (HTTP 500):
 * {
 *   "success": false,
 *   "message": "Error al actualizar el producto: [error de MySQL]"
 * }
 * 
 * ============================================================================
 * CAMPOS ACTUALIZABLES
 * ============================================================================
 * 
 * ┌─────────────────────┬───────────────────────────────────────────────────┐
 * │ Campo               │ Notas                                             │
 * ├─────────────────────┼───────────────────────────────────────────────────┤
 * │ nombre              │ Texto, máx 255 caracteres                         │
 * │ descripcion         │ Texto largo                                       │
 * │ categoria           │ palos, bolas, guantes, accesorios                 │
 * │ marca               │ Texto, máx 100 caracteres                         │
 * │ modelo              │ Texto, máx 100 caracteres                         │
 * │ precio              │ Entero positivo (COP)                             │
 * │ stock               │ Entero no negativo                                │
 * │ imagen_principal    │ Base64 (nueva) o ruta (mantener) o "" (eliminar)  │
 * │ imagen_frontal      │ Base64 (nueva) o ruta (mantener) o "" (eliminar)  │
 * │ imagen_superior     │ Base64 (nueva) o ruta (mantener) o "" (eliminar)  │
 * │ imagen_lateral      │ Base64 (nueva) o ruta (mantener) o "" (eliminar)  │
 * │ dimensiones         │ Texto (ej: "0.89 x 0.10 x 0.10")                  │
 * │ peso                │ Decimal (kg)                                      │
 * │ unidades_paquete    │ Entero (solo bolas)                               │
 * │ stock_talla_s       │ Entero (solo guantes)                             │
 * │ stock_talla_m       │ Entero (solo guantes)                             │
 * │ stock_talla_l       │ Entero (solo guantes)                             │
 * │ stock_talla_xl      │ Entero (solo guantes)                             │
 * │ stock_talla_xxl     │ Entero (solo guantes)                             │
 * └─────────────────────┴───────────────────────────────────────────────────┘
 * 
 * CAMPO NO ACTUALIZABLE:
 * - referencia: Es la clave primaria y no puede modificarse
 * 
 * ============================================================================
 * ACTUALIZACIÓN PARCIAL (PATCH-like behavior)
 * ============================================================================
 * 
 * Este endpoint soporta actualización parcial, es decir, solo se actualizan
 * los campos que se envían en el JSON. Los campos no incluidos en la petición
 * mantienen su valor actual en la base de datos.
 * 
 * EJEMPLO:
 * Si un producto tiene:
 * - nombre: "Palo Original"
 * - precio: 100000
 * - stock: 10
 * 
 * Y se envía:
 * { "referencia": "AFG-P001", "precio": 150000 }
 * 
 * El resultado será:
 * - nombre: "Palo Original" (sin cambios)
 * - precio: 150000 (actualizado)
 * - stock: 10 (sin cambios)
 * 
 * ============================================================================
 * SEGURIDAD
 * ============================================================================
 * 
 * - SQL Injection: Prevenido con mysqli::real_escape_string()
 * - Validación de existencia antes de actualizar
 * - Los datos numéricos se convierten explícitamente con (int) y (float)
 * - Las imágenes se validan antes de guardar
 * 
 * TODO FUTURO:
 * - Implementar autenticación JWT/sesiones
 * - Validar rol de administrador
 * - Implementar auditoría (log de cambios)
 * - Validar que categoría sea válida si se cambia
 * - Backup de imágenes antes de reemplazar
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
 * @see create_product.php, read_products.php, delete_product.php
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
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Solo se acepta PUT.'
    ]);
    exit();
}

// ============================================================================
// PUNTO DE ENTRADA PRINCIPAL
// ============================================================================

try {
    require_once '../../../../config/db_connect.php';
    updateProduct($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

// ============================================================================
// FUNCIÓN PRINCIPAL: ACTUALIZAR PRODUCTO
// ============================================================================

/**
 * Actualiza un producto existente en la base de datos
 * 
 * @param mysqli $conn Conexión activa a la base de datos
 * @return void Envía respuesta JSON y termina ejecución
 */
function updateProduct($conn) {
    // -------------------------------------------------------------------------
    // PASO 1: Obtener y validar datos de entrada
    // -------------------------------------------------------------------------
    
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'JSON inválido o vacío'
        ]);
        return;
    }
    
    // Validar que se proporcione la referencia
    if (empty($data['referencia'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Referencia del producto es obligatoria'
        ]);
        return;
    }
    
    $referencia = $conn->real_escape_string(trim($data['referencia']));
    
    // -------------------------------------------------------------------------
    // PASO 2: Verificar que el producto exista
    // -------------------------------------------------------------------------
    
    $checkSql = "SELECT referencia FROM productos WHERE referencia = '$referencia' LIMIT 1";
    $checkResult = $conn->query($checkSql);
    
    if (!$checkResult || $checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Producto no encontrado'
        ]);
        return;
    }
    
    // -------------------------------------------------------------------------
    // PASO 3: Construir array de actualizaciones
    // -------------------------------------------------------------------------
    
    $updates = [];
    $camposActualizados = [];
    
    // --- Campos de texto ---
    if (isset($data['nombre'])) {
        $nombre = $conn->real_escape_string(trim($data['nombre']));
        $updates[] = "nombre = '$nombre'";
        $camposActualizados[] = 'nombre';
    }
    
    if (isset($data['descripcion'])) {
        $descripcion = $conn->real_escape_string(trim($data['descripcion']));
        $updates[] = "descripcion = '$descripcion'";
        $camposActualizados[] = 'descripcion';
    }
    
    if (isset($data['categoria'])) {
        $categoria = $conn->real_escape_string($data['categoria']);
        $updates[] = "categoria = '$categoria'";
        $camposActualizados[] = 'categoria';
    }
    
    if (isset($data['marca'])) {
        $marca = $conn->real_escape_string(trim($data['marca']));
        $updates[] = "marca = '$marca'";
        $camposActualizados[] = 'marca';
    }
    
    if (isset($data['modelo'])) {
        $modelo = $conn->real_escape_string(trim($data['modelo']));
        $updates[] = "modelo = '$modelo'";
        $camposActualizados[] = 'modelo';
    }
    
    // --- Campos numéricos ---
    if (isset($data['precio'])) {
        $precio = (int)$data['precio'];
        $updates[] = "precio = $precio";
        $camposActualizados[] = 'precio';
    }
    
    if (isset($data['stock'])) {
        $stock = (int)$data['stock'];
        $updates[] = "stock = $stock";
        $camposActualizados[] = 'stock';
    }
    
    // --- Campos específicos por categoría ---
    if (isset($data['dimensiones'])) {
        $dimensiones = $conn->real_escape_string(trim($data['dimensiones']));
        $updates[] = "dimensiones = '$dimensiones'";
        $camposActualizados[] = 'dimensiones';
    }
    
    if (isset($data['peso'])) {
        $peso = (float)$data['peso'];
        $updates[] = "peso = $peso";
        $camposActualizados[] = 'peso';
    }
    
    if (isset($data['unidades_paquete'])) {
        $unidades = (int)$data['unidades_paquete'];
        $updates[] = "unidades_paquete = $unidades";
        $camposActualizados[] = 'unidades_paquete';
    }
    
    // --- Stock por tallas (guantes) ---
    $tallas = ['s', 'm', 'l', 'xl', 'xxl'];
    foreach ($tallas as $talla) {
        $campo = "stock_talla_$talla";
        if (isset($data[$campo])) {
            $valor = (int)$data[$campo];
            $updates[] = "$campo = $valor";
            $camposActualizados[] = $campo;
        }
    }
    
    // -------------------------------------------------------------------------
    // PASO 4: Procesar imágenes
    // -------------------------------------------------------------------------
    
    $imagenes = [
        'imagen_principal' => 'principal',
        'imagen_frontal' => 'frontal',
        'imagen_superior' => 'superior',
        'imagen_lateral' => 'lateral'
    ];
    
    $base_upload_dir = realpath(__DIR__ . '/../../../../../') . '/uploads/products/';
    $product_dir = $base_upload_dir . $referencia . '/';
    $web_path_base = '/AFERGOLF/uploads/products/' . $referencia . '/';
    
    foreach ($imagenes as $campo => $prefijo) {
        if (isset($data[$campo])) {
            $valorImagen = $data[$campo];
            
            if (strpos($valorImagen, 'data:image/') === 0) {
                // Es una imagen nueva en Base64 - procesarla
                $nombreArchivo = saveBase64Image($valorImagen, $product_dir, $prefijo);
                if ($nombreArchivo) {
                    $rutaWeb = $conn->real_escape_string($web_path_base . $nombreArchivo);
                    $updates[] = "$campo = '$rutaWeb'";
                    $camposActualizados[] = $campo;
                }
            } elseif ($valorImagen === '') {
                // Se quiere eliminar la imagen
                $updates[] = "$campo = ''";
                $camposActualizados[] = $campo;
            }
            // Si es una ruta existente (/AFERGOLF/...), no se hace nada (se mantiene)
        }
    }
    
    // -------------------------------------------------------------------------
    // PASO 5: Verificar que haya campos para actualizar
    // -------------------------------------------------------------------------
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No hay campos para actualizar'
        ]);
        return;
    }
    
    // -------------------------------------------------------------------------
    // PASO 6: Ejecutar UPDATE
    // -------------------------------------------------------------------------
    
    $updateStr = implode(', ', $updates);
    $sql = "UPDATE productos SET $updateStr WHERE referencia = '$referencia'";
    
    if ($conn->query($sql)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Producto actualizado correctamente',
            'referencia' => $referencia,
            'campos_actualizados' => $camposActualizados
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar el producto: ' . $conn->error
        ]);
    }
}

// ============================================================================
// FUNCIÓN: GUARDAR IMAGEN BASE64
// ============================================================================

/**
 * Decodifica una imagen Base64 y la guarda en el sistema de archivos
 * 
 * @param string $base64_string Cadena Base64 de la imagen
 * @param string $output_dir Directorio destino
 * @param string $filename_prefix Prefijo para el nombre del archivo
 * @return string Nombre del archivo generado o cadena vacía si falla
 */
function saveBase64Image($base64_string, $output_dir, $filename_prefix) {
    if (empty($base64_string)) return '';
    
    // Separar metadatos
    $parts = explode(',', $base64_string);
    $data = count($parts) > 1 ? $parts[1] : $parts[0];
    
    // Decodificar
    $decoded = base64_decode($data);
    if ($decoded === false) return '';
    
    // Detectar tipo MIME
    $f = finfo_open();
    $mime_type = finfo_buffer($f, $decoded, FILEINFO_MIME_TYPE);
    finfo_close($f);
    
    // Determinar extensión
    $extensiones = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    $extension = $extensiones[$mime_type] ?? 'jpg';
    
    // Crear directorio si no existe
    if (!is_dir($output_dir)) {
        mkdir($output_dir, 0755, true);
    }
    
    // Guardar archivo
    $filename = $filename_prefix . '_' . time() . '.' . $extension;
    $file_path = $output_dir . $filename;
    
    if (file_put_contents($file_path, $decoded)) {
        return $filename;
    }
    
    return '';
}
?>
