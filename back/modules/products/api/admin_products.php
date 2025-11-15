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
 * Obtiene la lista de todos los productos de la base de datos
 * 
 * FUNCIONALIDAD ACTUAL:
 * - Retorna TODOS los productos ordenados por fecha de creación (más recientes primero)
 * 
 * FUNCIONALIDAD FUTURA (TODO):
 * - Filtrar por categoría, marca, etc.
 * - Paginación (limit, offset)
 * - Búsqueda por nombre o referencia
 * - Ordenamiento personalizado
 * 
 * RESPUESTA EXITOSA (HTTP 200):
 * {
 *   "success": true,
 *   "productos": [
 *     {
 *       "referencia": "AFG-P001",
 *       "nombre": "Palo de Golf X",
 *       "categoria": "palos",
 *       "marca": "TaylorMade",
 *       "precio": 250000,
 *       "stock": 10,
 *       ...demás campos
 *     },
 *     ...más productos
 *   ]
 * }
 * 
 * RESPUESTA DE ERROR (HTTP 500):
 * {
 *   "success": false,
 *   "message": "Error al obtener productos"
 * }
 * 
 * @return void - Envía respuesta JSON y termina ejecución
 */
function getProducts() {
  global $conn; // Usar conexión global de base de datos
  
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

// ============================================================================
// FUNCIÓN: ACTUALIZAR PRODUCTO (PENDIENTE)
// ============================================================================

/**
 * Actualiza un producto existente en la base de datos
 * 
 * PENDIENTE DE IMPLEMENTAR
 * 
 * Funcionalidad esperada:
 * 1. Recibir referencia del producto a actualizar
 * 2. Recibir campos a actualizar en el body
 * 3. Validar que el producto exista
 * 4. Actualizar solo los campos proporcionados
 * 5. Retornar producto actualizado
 * 
 * @return void
 */
function updateProduct() {
  echo json_encode([
    'success' => false, 
    'message' => 'Funcionalidad en desarrollo'
  ]);
}

// ============================================================================
// FUNCIÓN: ELIMINAR PRODUCTO (PENDIENTE)
// ============================================================================

/**
 * Elimina un producto de la base de datos
 * 
 * PENDIENTE DE IMPLEMENTAR
 * 
 * Funcionalidad esperada:
 * 1. Recibir referencia del producto a eliminar
 * 2. Validar que el producto exista
 * 3. Verificar que no haya dependencias (pedidos, etc.)
 * 4. Eliminar el producto
 * 5. Retornar confirmación
 * 
 * @return void
 */
function deleteProduct() {
  echo json_encode([
    'success' => false, 
    'message' => 'Funcionalidad en desarrollo'
  ]);
}
?>