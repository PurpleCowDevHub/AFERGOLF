<?php
/**
 * ============================================================================
 * AFERGOLF - API REST de Gestión de Productos
 * ============================================================================
 * 
 * Este archivo es el punto de entrada (endpoint) para todas las operaciones
 * CRUD (Create, Read, Update, Delete) de productos en el sistema.
 * 
 * MÉTODOS HTTP SOPORTADOS:
 * - POST   : Crear un nuevo producto
 * - GET    : Obtener lista de productos o un producto específico
 * - PUT    : Actualizar un producto existente (pendiente)
 * - DELETE : Eliminar un producto (pendiente)
 * 
 * FORMATO DE COMUNICACIÓN:
 * - Entrada: JSON en el body de la petición
 * - Salida: JSON con estructura { success: boolean, message: string, data: object }
 * 
 * BASE DE DATOS:
 * - Tabla: productos
 * - Primary Key: referencia (VARCHAR 50) - Generada automáticamente
 * - Formato referencia: AFG-P001, AFG-B001, AFG-G001, AFG-A001
 * 
 * @author AFERGOLF Team
 * @version 1.0.0
 * @date 2025-11-15
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN DE PHP Y HEADERS
// ============================================================================

// Reportar todos los errores pero no mostrarlos al cliente
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en la respuesta
ini_set('log_errors', 1);     // Guardar errores en el log de Apache

// Header para indicar que la respuesta es JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// ============================================================================
// PUNTO DE ENTRADA PRINCIPAL
// ============================================================================

try {
  // Incluir archivo de conexión a la base de datos
  // Esto crea la variable global $conn con la conexión mysqli
  require_once '../../../config/db_connect.php';
  
  // Obtener el método HTTP de la petición (POST, GET, PUT, DELETE)
  $method = $_SERVER['REQUEST_METHOD'];

  // Enrutar la petición según el método HTTP
  switch ($method) {
    case 'POST':
      // Crear un nuevo producto
      createProduct();
      break;
      
    case 'GET':
      // Obtener productos (todos o uno específico)
      getProducts();
      break;
      
    case 'PUT':
      // Actualizar un producto existente (pendiente de implementar)
      updateProduct();
      break;
      
    case 'DELETE':
      // Eliminar un producto (pendiente de implementar)
      deleteProduct();
      break;
      
    default:
      // Método HTTP no soportado
      http_response_code(405); // 405 = Method Not Allowed
      echo json_encode([
        'success' => false, 
        'message' => 'Método no permitido'
      ]);
  }
  
} catch (Exception $e) {
  // Capturar cualquier error inesperado
  http_response_code(500); // 500 = Internal Server Error
  echo json_encode([
    'success' => false, 
    'message' => 'Error del servidor: ' . $e->getMessage()
  ]);
}

// ============================================================================
// FUNCIÓN: CREAR PRODUCTO
// ============================================================================

/**
 * Crea un nuevo producto en la base de datos
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Recibe datos JSON del body de la petición
 * 2. Valida que los campos obligatorios estén presentes
 * 3. Escapa datos para prevenir SQL Injection
 * 4. Genera referencia automática si no se proporciona
 * 5. Inserta el producto en la base de datos
 * 6. Retorna respuesta JSON con éxito o error
 * 
 * CAMPOS OBLIGATORIOS:
 * - nombre: Nombre del producto
 * - categoria: palos | bolas | guantes | accesorios
 * - marca: Marca del producto
 * - precio: Precio en COP (número entero)
 * 
 * CAMPOS OPCIONALES:
 * - descripcion, modelo, stock, imágenes, dimensiones, peso, etc.
 * 
 * RESPUESTA EXITOSA (HTTP 201):
 * {
 *   "success": true,
 *   "message": "Producto creado correctamente",
 *   "referencia": "AFG-P001"
 * }
 * 
 * RESPUESTA DE ERROR (HTTP 400 o 500):
 * {
 *   "success": false,
 *   "message": "Descripción del error"
 * }
 * 
 * @return void - Envía respuesta JSON y termina ejecución
 */
function createProduct() {
  global $conn; // Usar conexión global de base de datos
  
  // -------------------------------------------------------------------------
  // PASO 1: Obtener y validar datos de entrada
  // -------------------------------------------------------------------------
  
  // Leer el body de la petición y convertir JSON a array asociativo
  $data = json_decode(file_get_contents("php://input"), true);
  
  // Verificar que el JSON sea válido
  if (!$data) {
    http_response_code(400); // 400 = Bad Request
    echo json_encode([
      'success' => false, 
      'message' => 'JSON inválido'
    ]);
    return;
  }
  
  // Validar que todos los campos obligatorios estén presentes
  if (empty($data['nombre']) || 
      empty($data['categoria']) || 
      empty($data['marca']) || 
      !isset($data['precio'])) {
    http_response_code(400);
    echo json_encode([
      'success' => false, 
      'message' => 'Campos obligatorios faltantes: nombre, categoria, marca, precio'
    ]);
    return;
  }

  // -------------------------------------------------------------------------
  // PASO 2: Escapar y preparar datos generales
  // -------------------------------------------------------------------------
  
  // Escapar strings para prevenir SQL Injection
  $nombre = $conn->real_escape_string($data['nombre']);
  $descripcion = $conn->real_escape_string($data['descripcion'] ?? '');
  $categoria = $conn->real_escape_string($data['categoria']);
  $marca = $conn->real_escape_string($data['marca']);
  $modelo = $conn->real_escape_string($data['modelo'] ?? '');
  
  // Convertir precio y stock a enteros (sanitización)
  $precio = (int)$data['precio'];
  $stock = (int)($data['stock'] ?? 0);
  
  // -------------------------------------------------------------------------
  // PASO 3: Generar referencia automática
  // -------------------------------------------------------------------------
  
  // Verificar si se proporcionó una referencia manual
  $referencia = $data['referencia'] ?? '';
  
  if (empty($referencia)) {
    // Si NO hay referencia, generarla automáticamente
    // Formato: AFG-P001 (Palos), AFG-B001 (Bolas), etc.
    $referencia = generateProductReference($conn, $categoria);
  } else {
    // Si hay referencia manual, escaparla
    $referencia = $conn->real_escape_string($referencia);
  }
  
  // -------------------------------------------------------------------------
  // PASO 4: Preparar imágenes (base64)
  // -------------------------------------------------------------------------
  
  // Escapar imágenes en base64 (pueden ser strings muy largos)
  $imagen_principal = $conn->real_escape_string($data['imagen_principal'] ?? '');
  $imagen_frontal = $conn->real_escape_string($data['imagen_frontal'] ?? '');
  $imagen_superior = $conn->real_escape_string($data['imagen_superior'] ?? '');
  $imagen_lateral = $conn->real_escape_string($data['imagen_lateral'] ?? '');
  
  // -------------------------------------------------------------------------
  // PASO 5: Preparar campos específicos por categoría
  // -------------------------------------------------------------------------
  
  // Campos para PALOS y ACCESORIOS
  $dimensiones = $conn->real_escape_string($data['dimensiones'] ?? '');
  $peso = (float)($data['peso'] ?? 0);
  
  // Campos para BOLAS
  $unidades_paquete = (int)($data['unidades_paquete'] ?? 0);

  // Campos para GUANTES (stock por tallas)
  $stock_talla_s = (int)($data['stock_talla_s'] ?? 0);
  $stock_talla_m = (int)($data['stock_talla_m'] ?? 0);
  $stock_talla_l = (int)($data['stock_talla_l'] ?? 0);
  $stock_talla_xl = (int)($data['stock_talla_xl'] ?? 0);
  $stock_talla_xxl = (int)($data['stock_talla_xxl'] ?? 0);

  // -------------------------------------------------------------------------
  // PASO 6: Construir y ejecutar query SQL
  // -------------------------------------------------------------------------
  
  // Query INSERT con todos los campos
  // NOTA: referencia es PRIMARY KEY, por eso va primero
  $sql = "INSERT INTO productos (
    referencia, nombre, descripcion, categoria, marca, modelo, precio, stock,
    imagen_principal, imagen_frontal, imagen_superior, imagen_lateral,
    dimensiones, peso, unidades_paquete,
    stock_talla_s, stock_talla_m, stock_talla_l, stock_talla_xl, stock_talla_xxl
  ) VALUES (
    '$referencia', '$nombre', '$descripcion', '$categoria', '$marca', '$modelo', 
    $precio, $stock, '$imagen_principal', '$imagen_frontal', '$imagen_superior', '$imagen_lateral',
    '$dimensiones', $peso, $unidades_paquete,
    $stock_talla_s, $stock_talla_m, $stock_talla_l, $stock_talla_xl, $stock_talla_xxl
  )";

  // Ejecutar query
  if ($conn->query($sql)) {
    // ✅ ÉXITO: Producto creado correctamente
    http_response_code(201); // 201 = Created
    echo json_encode([
      'success' => true,
      'message' => 'Producto creado correctamente',
      'referencia' => $referencia // Devolver la referencia generada
    ]);
    
  } else {
    // ❌ ERROR: No se pudo insertar en la base de datos
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Error al crear el producto: ' . $conn->error
    ]);
  }
}

// ============================================================================
// FUNCIÓN: GENERAR REFERENCIA AUTOMÁTICA
// ============================================================================

/**
 * Genera una referencia única para un producto basada en su categoría
 * 
 * FORMATO DE REFERENCIA:
 * AFG-{LETRA_CATEGORIA}{NUMERO_SECUENCIAL}
 * 
 * LETRAS POR CATEGORÍA:
 * - P = Palos       → AFG-P001, AFG-P002, AFG-P003...
 * - B = Bolas       → AFG-B001, AFG-B002, AFG-B003...
 * - G = Guantes     → AFG-G001, AFG-G002, AFG-G003...
 * - A = Accesorios  → AFG-A001, AFG-A002, AFG-A003...
 * - X = Desconocida → AFG-X001 (fallback)
 * 
 * FUNCIONAMIENTO:
 * 1. Determina la letra según la categoría
 * 2. Busca la última referencia de esa categoría en la BD
 * 3. Extrae el número y lo incrementa en 1
 * 4. Genera nueva referencia con formato de 3 dígitos (001, 002, etc.)
 * 
 * EJEMPLO:
 * Si la última referencia de palos es "AFG-P005"
 * La nueva será "AFG-P006"
 * 
 * Si no existe ninguna referencia de esa categoría
 * La primera será "AFG-P001"
 * 
 * @param mysqli $conn - Conexión a la base de datos
 * @param string $categoria - Categoría del producto (palos, bolas, guantes, accesorios)
 * @return string - Referencia generada (ej: "AFG-P001")
 */
function generateProductReference($conn, $categoria) {
  // Mapeo de categorías a letras
  $prefijos = [
    'palos' => 'P',
    'bolas' => 'B',
    'guantes' => 'G',
    'accesorios' => 'A'
  ];
  
  // Obtener letra de la categoría (X si no existe)
  $prefix = $prefijos[$categoria] ?? 'X';
  
  // Patrón para buscar referencias de esta categoría
  // Ejemplo: Si prefix='P', pattern='AFG-P%'
  $pattern = "AFG-{$prefix}%";
  
  // -------------------------------------------------------------------------
  // Buscar la última referencia de esta categoría
  // -------------------------------------------------------------------------
  
  // Query para obtener la referencia más reciente (ORDER BY DESC LIMIT 1)
  $sql = "SELECT referencia 
          FROM productos 
          WHERE referencia LIKE '$pattern' 
          ORDER BY referencia DESC 
          LIMIT 1";
  
  $result = $conn->query($sql);
  
  // Inicializar número en 1 (primera referencia de esta categoría)
  $numero = 1;
  
  // Si existe al menos una referencia de esta categoría
  if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $lastRef = $row['referencia'];
    
    // Extraer el número de la referencia usando expresión regular
    // Patrón: AFG-{LETRA}{DIGITOS}
    // Ejemplo: "AFG-P003" → captura "003"
    if (preg_match('/AFG-[A-Z](\d+)$/', $lastRef, $matches)) {
      // Convertir a entero y sumar 1
      $numero = intval($matches[1]) + 1;
    }
  }
  
  // -------------------------------------------------------------------------
  // Formatear y retornar referencia
  // -------------------------------------------------------------------------
  
  // sprintf con %03d formatea el número con 3 dígitos
  // Ejemplos: 1→001, 25→025, 150→150
  return sprintf("AFG-%s%03d", $prefix, $numero);
}

// ============================================================================
// FUNCIÓN: OBTENER PRODUCTOS
// ============================================================================

/**
 * Obtiene productos de la base de datos
 * 
 * FUNCIONALIDAD ACTUAL:
 * - Si se proporciona parámetro ?referencia=XXX en la URL, retorna UN producto específico
 * - Si NO se proporciona parámetro, retorna TODOS los productos
 * 
 * FUNCIONALIDAD FUTURA (TODO):
 * - Filtrar por categoría, marca, etc.
 * - Paginación (limit, offset)
 * - Búsqueda por nombre o referencia
 * - Ordenamiento personalizado
 * 
 * RESPUESTA EXITOSA - UN PRODUCTO (HTTP 200):
 * {
 *   "success": true,
 *   "producto": {
 *     "referencia": "AFG-P001",
 *     "nombre": "Palo de Golf X",
 *     "categoria": "palos",
 *     "marca": "TaylorMade",
 *     "precio": 250000,
 *     "stock": 10,
 *     ...demás campos
 *   }
 * }
 * 
 * RESPUESTA EXITOSA - TODOS LOS PRODUCTOS (HTTP 200):
 * {
 *   "success": true,
 *   "productos": [
 *     {...producto 1...},
 *     {...producto 2...}
 *   ]
 * }
 * 
 * RESPUESTA DE ERROR (HTTP 404 o 500):
 * {
 *   "success": false,
 *   "message": "Descripción del error"
 * }
 * 
 * @return void - Envía respuesta JSON y termina ejecución
 */
function getProducts() {
  global $conn; // Usar conexión global de base de datos
  
  // Verificar si se solicita un producto específico por referencia
  $referencia = $_GET['referencia'] ?? null;
  
  if ($referencia) {
    // -------------------------------------------------------------------------
    // OBTENER UN PRODUCTO ESPECÍFICO POR REFERENCIA
    // -------------------------------------------------------------------------
    
    // Escapar referencia para prevenir SQL Injection
    $referencia = $conn->real_escape_string($referencia);
    
    // Query para obtener un producto específico
    $sql = "SELECT * FROM productos WHERE referencia = '$referencia' LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
      // ✅ ÉXITO: Producto encontrado
      $producto = $result->fetch_assoc();
      
      echo json_encode([
        'success' => true,
        'producto' => $producto
      ]);
      
    } else {
      // ❌ ERROR: Producto no encontrado
      http_response_code(404); // 404 = Not Found
      echo json_encode([
        'success' => false,
        'message' => 'Producto no encontrado'
      ]);
    }
    
  } else {
    // -------------------------------------------------------------------------
    // OBTENER TODOS LOS PRODUCTOS
    // -------------------------------------------------------------------------
    
    // Query para obtener todos los productos ordenados por fecha de creación
    $sql = "SELECT * FROM productos ORDER BY fecha_creacion DESC";
    $result = $conn->query($sql);

    if ($result) {
      // ✅ ÉXITO: Query ejecutada correctamente
      $productos = [];
      
      // Iterar sobre todos los resultados y agregarlos al array
      while ($row = $result->fetch_assoc()) {
        $productos[] = $row;
      }
      
      // Retornar array de productos
      echo json_encode([
        'success' => true, 
        'productos' => $productos
      ]);
      
    } else {
      // ❌ ERROR: No se pudo ejecutar la query
      http_response_code(500);
      echo json_encode([
        'success' => false, 
        'message' => 'Error al obtener productos'
      ]);
    }
  }
}

// ============================================================================
// FUNCIÓN: ACTUALIZAR PRODUCTO (PENDIENTE)
// ============================================================================

/**
 * Actualiza un producto existente en la base de datos
 * 
 * FLUJO:
 * 1. Recibe referencia del producto a actualizar en el body JSON
 * 2. Recibe campos a actualizar en el body
 * 3. Valida que el producto exista
 * 4. Actualiza los campos proporcionados
 * 5. Retorna confirmación
 * 
 * CAMPOS REQUERIDOS:
 * - referencia: Referencia del producto a actualizar (no se puede cambiar)
 * 
 * CAMPOS ACTUALIZABLES:
 * - nombre, descripcion, categoria, marca, modelo, precio, stock
 * - imagen_principal, imagen_frontal, imagen_superior, imagen_lateral
 * - dimensiones, peso, unidades_paquete
 * - stock_talla_s, stock_talla_m, stock_talla_l, stock_talla_xl, stock_talla_xxl
 * 
 * RESPUESTA EXITOSA (HTTP 200):
 * {
 *   "success": true,
 *   "message": "Producto actualizado correctamente",
 *   "referencia": "AFG-P001"
 * }
 * 
 * RESPUESTA DE ERROR (HTTP 400 o 404 o 500):
 * {
 *   "success": false,
 *   "message": "Descripción del error"
 * }
 * 
 * @return void
 */
function updateProduct() {
  global $conn;
  
  // Obtener datos del body
  $data = json_decode(file_get_contents("php://input"), true);
  
  // Verificar que el JSON sea válido
  if (!$data) {
    http_response_code(400);
    echo json_encode([
      'success' => false, 
      'message' => 'JSON inválido'
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
  
  $referencia = $conn->real_escape_string($data['referencia']);
  
  // Verificar que el producto exista
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
  
  // Construir array de campos a actualizar
  $updates = [];
  
  // Campos de texto
  if (isset($data['nombre'])) {
    $nombre = $conn->real_escape_string($data['nombre']);
    $updates[] = "nombre = '$nombre'";
  }
  
  if (isset($data['descripcion'])) {
    $descripcion = $conn->real_escape_string($data['descripcion']);
    $updates[] = "descripcion = '$descripcion'";
  }
  
  if (isset($data['categoria'])) {
    $categoria = $conn->real_escape_string($data['categoria']);
    $updates[] = "categoria = '$categoria'";
  }
  
  if (isset($data['marca'])) {
    $marca = $conn->real_escape_string($data['marca']);
    $updates[] = "marca = '$marca'";
  }
  
  if (isset($data['modelo'])) {
    $modelo = $conn->real_escape_string($data['modelo']);
    $updates[] = "modelo = '$modelo'";
  }
  
  // Campos numéricos
  if (isset($data['precio'])) {
    $precio = (int)$data['precio'];
    $updates[] = "precio = $precio";
  }
  
  if (isset($data['stock'])) {
    $stock = (int)$data['stock'];
    $updates[] = "stock = $stock";
  }
  
  // Imágenes
  if (isset($data['imagen_principal'])) {
    $imagen_principal = $conn->real_escape_string($data['imagen_principal']);
    $updates[] = "imagen_principal = '$imagen_principal'";
  }
  
  if (isset($data['imagen_frontal'])) {
    $imagen_frontal = $conn->real_escape_string($data['imagen_frontal']);
    $updates[] = "imagen_frontal = '$imagen_frontal'";
  }
  
  if (isset($data['imagen_superior'])) {
    $imagen_superior = $conn->real_escape_string($data['imagen_superior']);
    $updates[] = "imagen_superior = '$imagen_superior'";
  }
  
  if (isset($data['imagen_lateral'])) {
    $imagen_lateral = $conn->real_escape_string($data['imagen_lateral']);
    $updates[] = "imagen_lateral = '$imagen_lateral'";
  }
  
  // Campos específicos por categoría
  if (isset($data['dimensiones'])) {
    $dimensiones = $conn->real_escape_string($data['dimensiones']);
    $updates[] = "dimensiones = '$dimensiones'";
  }
  
  if (isset($data['peso'])) {
    $peso = (float)$data['peso'];
    $updates[] = "peso = $peso";
  }
  
  if (isset($data['unidades_paquete'])) {
    $unidades_paquete = (int)$data['unidades_paquete'];
    $updates[] = "unidades_paquete = $unidades_paquete";
  }
  
  // Stock por tallas (guantes)
  if (isset($data['stock_talla_s'])) {
    $stock_talla_s = (int)$data['stock_talla_s'];
    $updates[] = "stock_talla_s = $stock_talla_s";
  }
  
  if (isset($data['stock_talla_m'])) {
    $stock_talla_m = (int)$data['stock_talla_m'];
    $updates[] = "stock_talla_m = $stock_talla_m";
  }
  
  if (isset($data['stock_talla_l'])) {
    $stock_talla_l = (int)$data['stock_talla_l'];
    $updates[] = "stock_talla_l = $stock_talla_l";
  }
  
  if (isset($data['stock_talla_xl'])) {
    $stock_talla_xl = (int)$data['stock_talla_xl'];
    $updates[] = "stock_talla_xl = $stock_talla_xl";
  }
  
  if (isset($data['stock_talla_xxl'])) {
    $stock_talla_xxl = (int)$data['stock_talla_xxl'];
    $updates[] = "stock_talla_xxl = $stock_talla_xxl";
  }
  
  // Si no hay campos a actualizar
  if (empty($updates)) {
    http_response_code(400);
    echo json_encode([
      'success' => false, 
      'message' => 'No hay campos para actualizar'
    ]);
    return;
  }
  
  // Construir y ejecutar query UPDATE
  $updateStr = implode(', ', $updates);
  $sql = "UPDATE productos SET $updateStr WHERE referencia = '$referencia'";
  
  if ($conn->query($sql)) {
    http_response_code(200);
    echo json_encode([
      'success' => true,
      'message' => 'Producto actualizado correctamente',
      'referencia' => $referencia
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
// FUNCIÓN: ELIMINAR PRODUCTO (PENDIENTE)
// ============================================================================

/**
 * Elimina un producto de la base de datos
 * 
 * FLUJO:
 * 1. Recibe referencia del producto a eliminar desde parámetro GET o body JSON
 * 2. Valida que el producto exista
 * 3. Elimina el producto
 * 4. Retorna confirmación
 * 
 * NOTA: En el futuro se debería verificar que no haya dependencias
 * (pedidos relacionados, etc.) antes de eliminar
 * 
 * RESPUESTA EXITOSA (HTTP 200):
 * {
 *   "success": true,
 *   "message": "Producto eliminado correctamente",
 *   "referencia": "AFG-P001"
 * }
 * 
 * RESPUESTA DE ERROR (HTTP 400 o 404 o 500):
 * {
 *   "success": false,
 *   "message": "Descripción del error"
 * }
 * 
 * @return void
 */
function deleteProduct() {
  global $conn;
  
  // Intentar obtener referencia del query string o del body
  $referencia = $_GET['referencia'] ?? null;
  
  if (!$referencia) {
    // Si no está en query string, buscar en el body
    $data = json_decode(file_get_contents("php://input"), true);
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
  
  $referencia = $conn->real_escape_string($referencia);
  
  // Verificar que el producto exista
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
  
  // TODO: En el futuro, verificar dependencias (pedidos, etc.)
  
  // Eliminar el producto
  $sql = "DELETE FROM productos WHERE referencia = '$referencia'";
  
  if ($conn->query($sql)) {
    http_response_code(200);
    echo json_encode([
      'success' => true,
      'message' => 'Producto eliminado correctamente',
      'referencia' => $referencia
    ]);
  } else {
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Error al eliminar el producto: ' . $conn->error
    ]);
  }
}
?>