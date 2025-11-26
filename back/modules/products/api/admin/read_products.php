<?php
/**
 * ============================================================================
 * AFERGOLF - API REST: LEER/LISTAR PRODUCTOS
 * ============================================================================
 * 
 * ARCHIVO: read_products.php
 * UBICACIÓN: /back/modules/products/api/admin/read_products.php
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este archivo es el endpoint de la API REST encargado EXCLUSIVAMENTE de la
 * lectura y listado de productos en el sistema AFERGOLF. Forma parte del módulo
 * CRUD de productos del panel de administración.
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación READ (GET) del CRUD.
 * Para otras operaciones, usar:
 * - create_product.php  → Crear productos (POST)
 * - update_product.php  → Actualizar productos (PUT)
 * - delete_product.php  → Eliminar productos (DELETE)
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. FRONTEND (admin_read.js)
 *    ├── Página admin_dashboard.html carga al iniciar
 *    ├── Se dispara evento DOMContentLoaded
 *    ├── JavaScript llama a loadProducts()
 *    └── Se envía petición GET a este endpoint
 * 
 * 2. BACKEND (este archivo)
 *    ├── Recibe petición GET
 *    ├── Verifica si hay parámetro ?referencia=XXX
 *    ├── Si hay referencia: busca UN producto específico
 *    ├── Si NO hay referencia: busca TODOS los productos
 *    └── Retorna JSON con resultado(s)
 * 
 * 3. BASE DE DATOS (MySQL - tabla productos)
 *    ├── SELECT * FROM productos WHERE referencia = 'XXX' (un producto)
 *    └── SELECT * FROM productos ORDER BY fecha_creacion DESC (todos)
 * 
 * 4. RESPUESTA AL FRONTEND
 *    ├── JavaScript recibe JSON con productos
 *    ├── Renderiza tabla con renderProductsTable()
 *    └── Muestra datos al usuario
 * 
 * ============================================================================
 * ESPECIFICACIONES TÉCNICAS
 * ============================================================================
 * 
 * MÉTODO HTTP PERMITIDO: GET
 * 
 * URL DEL ENDPOINT:
 * http://localhost/AFERGOLF/back/modules/products/api/admin/read_products.php
 * 
 * PARÁMETROS DE URL (Query String):
 * 
 * ┌──────────────┬──────────┬─────────────────────────────────────────────┐
 * │ Parámetro    │ Tipo     │ Descripción                                 │
 * ├──────────────┼──────────┼─────────────────────────────────────────────┤
 * │ referencia   │ String   │ Opcional. Si se proporciona, retorna solo   │
 * │              │          │ el producto con esa referencia.             │
 * ├──────────────┼──────────┼─────────────────────────────────────────────┤
 * │ categoria    │ String   │ Opcional. Filtrar por categoría.            │
 * │              │          │ Valores: palos, bolas, guantes, accesorios  │
 * ├──────────────┼──────────┼─────────────────────────────────────────────┤
 * │ marca        │ String   │ Opcional. Filtrar por marca.                │
 * ├──────────────┼──────────┼─────────────────────────────────────────────┤
 * │ buscar       │ String   │ Opcional. Búsqueda por nombre o referencia. │
 * ├──────────────┼──────────┼─────────────────────────────────────────────┤
 * │ limit        │ Integer  │ Opcional. Límite de resultados (paginación).│
 * ├──────────────┼──────────┼─────────────────────────────────────────────┤
 * │ offset       │ Integer  │ Opcional. Desplazamiento (paginación).      │
 * └──────────────┴──────────┴─────────────────────────────────────────────┘
 * 
 * EJEMPLOS DE USO:
 * 
 * - Todos los productos:
 *   GET /read_products.php
 * 
 * - Un producto específico:
 *   GET /read_products.php?referencia=AFG-P001
 * 
 * - Filtrar por categoría:
 *   GET /read_products.php?categoria=palos
 * 
 * - Filtrar por marca:
 *   GET /read_products.php?marca=TaylorMade
 * 
 * - Buscar por texto:
 *   GET /read_products.php?buscar=golf
 * 
 * - Combinación de filtros:
 *   GET /read_products.php?categoria=palos&marca=Callaway
 * 
 * - Con paginación:
 *   GET /read_products.php?limit=10&offset=20
 * 
 * ============================================================================
 * FORMATO DE RESPUESTAS
 * ============================================================================
 * 
 * RESPUESTA EXITOSA - UN PRODUCTO (HTTP 200):
 * {
 *   "success": true,
 *   "producto": {
 *     "referencia": "AFG-P001",
 *     "nombre": "Driver TaylorMade M5",
 *     "descripcion": "Driver profesional...",
 *     "categoria": "palos",
 *     "marca": "TaylorMade",
 *     "modelo": "M5",
 *     "precio": 1500000,
 *     "stock": 5,
 *     "imagen_principal": "/AFERGOLF/uploads/products/AFG-P001/principal.jpg",
 *     "imagen_frontal": "/AFERGOLF/uploads/products/AFG-P001/frontal.jpg",
 *     "imagen_superior": "",
 *     "imagen_lateral": "",
 *     "dimensiones": "1.15 x 0.12 x 0.12",
 *     "peso": 0.45,
 *     "unidades_paquete": 0,
 *     "stock_talla_s": 0,
 *     "stock_talla_m": 0,
 *     "stock_talla_l": 0,
 *     "stock_talla_xl": 0,
 *     "stock_talla_xxl": 0,
 *     "fecha_creacion": "2025-11-26 10:30:00"
 *   }
 * }
 * 
 * RESPUESTA EXITOSA - MÚLTIPLES PRODUCTOS (HTTP 200):
 * {
 *   "success": true,
 *   "total": 25,
 *   "productos": [
 *     { ...producto 1... },
 *     { ...producto 2... },
 *     ...
 *   ]
 * }
 * 
 * RESPUESTA ERROR - PRODUCTO NO ENCONTRADO (HTTP 404):
 * {
 *   "success": false,
 *   "message": "Producto no encontrado"
 * }
 * 
 * RESPUESTA ERROR - ERROR DEL SERVIDOR (HTTP 500):
 * {
 *   "success": false,
 *   "message": "Error al obtener productos"
 * }
 * 
 * ============================================================================
 * CAMPOS DE LA TABLA PRODUCTOS
 * ============================================================================
 * 
 * ┌────────────────────┬──────────────┬─────────────────────────────────────┐
 * │ Campo              │ Tipo         │ Descripción                         │
 * ├────────────────────┼──────────────┼─────────────────────────────────────┤
 * │ referencia         │ VARCHAR(50)  │ PK. Identificador único             │
 * │ nombre             │ VARCHAR(255) │ Nombre del producto                 │
 * │ descripcion        │ TEXT         │ Descripción detallada               │
 * │ categoria          │ VARCHAR(50)  │ palos, bolas, guantes, accesorios   │
 * │ marca              │ VARCHAR(100) │ Marca del producto                  │
 * │ modelo             │ VARCHAR(100) │ Modelo/SKU del fabricante           │
 * │ precio             │ INT          │ Precio en pesos colombianos (COP)   │
 * │ stock              │ INT          │ Cantidad disponible                 │
 * │ imagen_principal   │ TEXT         │ Ruta a imagen principal             │
 * │ imagen_frontal     │ TEXT         │ Ruta a imagen frontal               │
 * │ imagen_superior    │ TEXT         │ Ruta a imagen superior              │
 * │ imagen_lateral     │ TEXT         │ Ruta a imagen lateral               │
 * │ dimensiones        │ VARCHAR(100) │ Dimensiones (palos/accesorios)      │
 * │ peso               │ DECIMAL(5,2) │ Peso en kg (palos/accesorios)       │
 * │ unidades_paquete   │ INT          │ Unidades por caja (bolas)           │
 * │ stock_talla_s      │ INT          │ Stock talla S (guantes)             │
 * │ stock_talla_m      │ INT          │ Stock talla M (guantes)             │
 * │ stock_talla_l      │ INT          │ Stock talla L (guantes)             │
 * │ stock_talla_xl     │ INT          │ Stock talla XL (guantes)            │
 * │ stock_talla_xxl    │ INT          │ Stock talla XXL (guantes)           │
 * │ fecha_creacion     │ TIMESTAMP    │ Fecha/hora de creación              │
 * └────────────────────┴──────────────┴─────────────────────────────────────┘
 * 
 * ============================================================================
 * SEGURIDAD
 * ============================================================================
 * 
 * - SQL Injection: Prevenido con mysqli::real_escape_string()
 * - Los parámetros de URL se sanitizan antes de usar en queries
 * - No se exponen datos sensibles en las respuestas
 * 
 * TODO FUTURO:
 * - Implementar autenticación con JWT o sesiones
 * - Agregar caché para mejorar rendimiento
 * - Implementar rate limiting
 * - Agregar logging de accesos
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
 * @see create_product.php, update_product.php, delete_product.php
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Solo se acepta GET.'
    ]);
    exit();
}

// ============================================================================
// PUNTO DE ENTRADA PRINCIPAL
// ============================================================================

try {
    require_once '../../../../config/db_connect.php';
    
    // Determinar tipo de consulta
    if (isset($_GET['referencia']) && !empty($_GET['referencia'])) {
        getProductByReference($conn, $_GET['referencia']);
    } else {
        getAllProducts($conn);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

// ============================================================================
// FUNCIÓN: OBTENER UN PRODUCTO POR REFERENCIA
// ============================================================================

/**
 * Obtiene un producto específico por su referencia única
 * 
 * @param mysqli $conn Conexión a la base de datos
 * @param string $referencia Referencia del producto (ej: AFG-P001)
 * @return void Envía respuesta JSON
 */
function getProductByReference($conn, $referencia) {
    // Sanitizar entrada
    $referencia = $conn->real_escape_string(trim($referencia));
    
    // Query para obtener el producto
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
}

// ============================================================================
// FUNCIÓN: OBTENER TODOS LOS PRODUCTOS (CON FILTROS OPCIONALES)
// ============================================================================

/**
 * Obtiene todos los productos con filtros opcionales
 * 
 * @param mysqli $conn Conexión a la base de datos
 * @return void Envía respuesta JSON
 */
function getAllProducts($conn) {
    // Construir query base
    $sql = "SELECT * FROM productos WHERE 1=1";
    $conditions = [];
    
    // -------------------------------------------------------------------------
    // Aplicar filtros opcionales
    // -------------------------------------------------------------------------
    
    // Filtro por categoría
    if (isset($_GET['categoria']) && !empty($_GET['categoria'])) {
        $categoria = $conn->real_escape_string($_GET['categoria']);
        $conditions[] = "categoria = '$categoria'";
    }
    
    // Filtro por marca
    if (isset($_GET['marca']) && !empty($_GET['marca'])) {
        $marca = $conn->real_escape_string($_GET['marca']);
        $conditions[] = "marca = '$marca'";
    }
    
    // Búsqueda por texto (nombre o referencia)
    if (isset($_GET['buscar']) && !empty($_GET['buscar'])) {
        $buscar = $conn->real_escape_string($_GET['buscar']);
        $conditions[] = "(nombre LIKE '%$buscar%' OR referencia LIKE '%$buscar%')";
    }
    
    // Agregar condiciones a la query
    if (!empty($conditions)) {
        $sql .= " AND " . implode(" AND ", $conditions);
    }
    
    // Ordenamiento
    $sql .= " ORDER BY fecha_creacion DESC";
    
    // -------------------------------------------------------------------------
    // Paginación opcional
    // -------------------------------------------------------------------------
    
    if (isset($_GET['limit'])) {
        $limit = (int)$_GET['limit'];
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $sql .= " LIMIT $offset, $limit";
    }
    
    // -------------------------------------------------------------------------
    // Ejecutar query
    // -------------------------------------------------------------------------
    
    $result = $conn->query($sql);
    
    if ($result) {
        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }
        
        // Obtener total de productos (sin paginación) para información adicional
        $countSql = "SELECT COUNT(*) as total FROM productos WHERE 1=1";
        if (!empty($conditions)) {
            $countSql .= " AND " . implode(" AND ", $conditions);
        }
        $countResult = $conn->query($countSql);
        $total = $countResult ? $countResult->fetch_assoc()['total'] : count($productos);
        
        echo json_encode([
            'success' => true,
            'total' => (int)$total,
            'productos' => $productos
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener productos: ' . $conn->error
        ]);
    }
}
?>
