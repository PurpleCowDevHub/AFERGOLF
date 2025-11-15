<?php
/**
 * Endpoint API de Productos
 * 
 * Maneja operaciones CRUD de productos:
 * - POST: Crear producto
 * - GET: Obtener productos
 * - PUT: Actualizar producto
 * - DELETE: Eliminar producto
 */

// Desactivar display de errores y solo registrarlos
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');

try {
  require_once '../../../config/db_connect.php';
  
  $method = $_SERVER['REQUEST_METHOD'];

  switch ($method) {
    case 'POST':
      createProduct();
      break;
    case 'GET':
      getProducts();
      break;
    case 'PUT':
      updateProduct();
      break;
    case 'DELETE':
      deleteProduct();
      break;
    default:
      http_response_code(405);
      echo json_encode(['success' => false, 'message' => 'Método no permitido']);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}

/**
 * Crea un nuevo producto
 */
function createProduct() {
  global $conn;
  
  $data = json_decode(file_get_contents("php://input"), true);
  
  if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    return;
  }
  
  // Validar campos obligatorios
  if (empty($data['nombre']) || empty($data['categoria']) || empty($data['marca']) || !isset($data['precio'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Campos obligatorios faltantes: nombre, categoria, marca, precio']);
    return;
  }

  // Escapar y preparar datos
  $nombre = $conn->real_escape_string($data['nombre']);
  $descripcion = $conn->real_escape_string($data['descripcion'] ?? '');
  $categoria = $conn->real_escape_string($data['categoria']);
  $marca = $conn->real_escape_string($data['marca']);
  $modelo = $conn->real_escape_string($data['modelo'] ?? '');
  $precio = (int)$data['precio'];
  $stock = (int)($data['stock'] ?? 0);
  
  // Generar referencia automática si no se proporciona (híbrido - editable)
  $referencia = $data['referencia'] ?? '';
  if (empty($referencia)) {
    $referencia = generateProductReference($conn, $categoria);
  } else {
    $referencia = $conn->real_escape_string($referencia);
  }
  $imagen_principal = $conn->real_escape_string($data['imagen_principal'] ?? '');
  $imagen_frontal = $conn->real_escape_string($data['imagen_frontal'] ?? '');
  $imagen_superior = $conn->real_escape_string($data['imagen_superior'] ?? '');
  $imagen_lateral = $conn->real_escape_string($data['imagen_lateral'] ?? '');
  $dimensiones = $conn->real_escape_string($data['dimensiones'] ?? '');
  $peso = (float)($data['peso'] ?? 0);
  $unidades_paquete = (int)($data['unidades_paquete'] ?? 0);

  // Stock por tallas (guantes)
  $stock_talla_s = (int)($data['stock_talla_s'] ?? 0);
  $stock_talla_m = (int)($data['stock_talla_m'] ?? 0);
  $stock_talla_l = (int)($data['stock_talla_l'] ?? 0);
  $stock_talla_xl = (int)($data['stock_talla_xl'] ?? 0);
  $stock_talla_xxl = (int)($data['stock_talla_xxl'] ?? 0);

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

  if ($conn->query($sql)) {
    http_response_code(201);
    echo json_encode([
      'success' => true,
      'message' => 'Producto creado correctamente',
      'referencia' => $referencia
    ]);
  } else {
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Error al crear el producto: ' . $conn->error
    ]);
  }
}

/**
 * Genera una referencia única para un producto
 * Formato: AFG-{P|B|G|A}{NUMERO}
 * P=Palos, B=Bolas, G=Guantes, A=Accesorios
 */
function generateProductReference($conn, $categoria) {
  $prefijos = [
    'palos' => 'P',
    'bolas' => 'B',
    'guantes' => 'G',
    'accesorios' => 'A'
  ];
  
  $prefix = $prefijos[$categoria] ?? 'X';
  $pattern = "AFG-{$prefix}%";
  
  // Obtener el último número usado para esta categoría
  $sql = "SELECT referencia FROM productos WHERE referencia LIKE '$pattern' ORDER BY referencia DESC LIMIT 1";
  $result = $conn->query($sql);
  
  $numero = 1;
  if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $lastRef = $row['referencia'];
    // Extraer el número de la referencia (ej: "AFG-P003" -> 3)
    if (preg_match('/AFG-[A-Z](\d+)$/', $lastRef, $matches)) {
      $numero = intval($matches[1]) + 1;
    }
  }
  
  // Formato: AFG-P001, AFG-B002, etc.
  return sprintf("AFG-%s%03d", $prefix, $numero);
}

/**
 * Obtiene todos los productos
 */
function getProducts() {
  global $conn;
  
  $sql = "SELECT * FROM productos ORDER BY fecha_creacion DESC";
  $result = $conn->query($sql);

  if ($result) {
    $productos = [];
    while ($row = $result->fetch_assoc()) {
      $productos[] = $row;
    }
    echo json_encode(['success' => true, 'productos' => $productos]);
  } else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al obtener productos']);
  }
}

/**
 * Actualiza un producto (placeholder para futuro)
 */
function updateProduct() {
  echo json_encode(['success' => false, 'message' => 'Funcionalidad en desarrollo']);
}

/**
 * Elimina un producto (placeholder para futuro)
 */
function deleteProduct() {
  echo json_encode(['success' => false, 'message' => 'Funcionalidad en desarrollo']);
}
?>