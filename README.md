
# 🌐 AFERGOLF - Sitio Web Oficial

Este proyecto corresponde al **diseño y desarrollo del sitio web oficial de AFERGOLF**, empresa especializada en venta, reparación y fitting profesional de palos de golf, con más de 15 años de trayectoria.

El objetivo del proyecto es ofrecer una **experiencia digital integral**, que permita a los clientes actuales y potenciales:

- Conocer la marca y su oferta de valor.
- Explorar el catálogo de productos y servicios.
- Realizar reservas y solicitudes en línea.
- Contactar de forma ágil al negocio.
- Posicionar la marca en buscadores y redes sociales.

---

## Tabla de contenidos

1. [Equipo de Desarrollo](#-equipo-de-desarrollo)
2. [Características principales](#-características-principales)
3. [Tecnologías](#️-tecnologías)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Configuración del entorno local con XAMPP](#️-configuración-del-entorno-local-con-xampp)
6. [Desarrollo Local](#-desarrollo-local)
7. [Documentación](#-documentación)

---

## 👨‍💻 Equipo de Desarrollo

- **Simón Tomás Paipa Bravo**
- **Isabella Díaz Polo**
- **Samuel David Fernández Urrea**

Cliente: **Alex Arcadio Fernández Hernández**
Empresa: **AFERGOLF**
Ubicación: **Bogotá, Colombia**

---

## 📌 Características principales

- Catálogo de productos con filtros por categoría, marca y promociones.
- Catálogo de servicios especializados (fitting, calibración, clases personalizadas, etc.).
- Reserva de citas y agendamiento con confirmación automática.
- Carrito de compras y cotización (integración con pagos en futuras fases).
- Diseño responsive (móvil, tablet, escritorio).
- Página institucional: historia, alianzas, equipo y galería.
- Sección de testimonios y noticias (fase 2).
- Integración con redes sociales e Instagram feed.
- Cumplimiento normativo (cookies, privacidad, newsletter).

---

## 🛠️ Tecnologías

**Frontend:**

- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**

**Backend:**

- **PHP** (con XAMPP)
- **MySQL** (integrado en XAMPP)
- **Apache Server** (integrado en XAMPP)

**Herramientas de desarrollo:**

- **XAMPP** (servidor local con Apache, MySQL, PHP)
- **phpMyAdmin** (gestión de base de datos)

**Futuras integraciones:**

- **Autenticación de usuarios** (PHP Sessions, JWT)
- **Integración de pasarelas de pago** (PayU, Mercado Pago)
- **API REST** para comunicación frontend-backend

---

## 📂 Estructura del Proyecto

```plaintext
AFERGOLF/
├── index.html                    # Página principal
├── README.md                     # Documentación del proyecto
│
├── front/                        # Frontend del sitio web
│   ├── views/                    # Páginas HTML del sitio
│   │   ├── catalog.html          # Catálogo de productos
│   │   ├── services.html         # Servicios especializados
│   │   ├── cart.html             # Carrito de compras
│   │   └── ...
│   │
│   ├── assets/                   # Recursos estáticos
│   │   ├── css/                  # Hojas de estilo
│   │   │   ├── style.css         # Estilos generales
│   │   │   ├── index.css         # Estilos del home
│   │   │   ├── pages/            # Estilos por página
│   │   │   └── ...
│   │   │
│   │   ├── js/                   # Scripts JavaScript
│   │   │   ├── main.js           # Script principal
│   │   │   ├── views/            # Scripts por vista
│   │   │   └── partials/         # Scripts de componentes
│   │   │
│   │   ├── img/                  # Imágenes del sitio
│   │   │   ├── services/         # Imágenes de servicios
│   │   │   └── ...
│   │   │
│   │   └── icon/                 # Iconos y favicon
│   │
│   └── partials/                 # Componentes reutilizables
│       ├── header.html           # Cabecera del sitio
│       ├── footer.html           # Pie de página
│       └── ...
│
├── back/                         # Backend PHP
│   ├── index.php                 # Punto de entrada del backend
│   ├── config/                   # Configuración del sistema
│   │   ├── config.php            # Configuración general
│   │   └── db_connect.php        # Conexión a base de datos
│   │
│   └── modules/                  # Módulos del backend
│       ├── products/             # Módulo de productos
│       │   ├── api/              # APIs REST de productos
│       │   │   ├── catalog.php   # API del catálogo
│       │   │   └── products.php  # API de productos
│       │   ├── js/               # Scripts AJAX de productos
│       │   │   └── product_ajax.js
│       │   └── php/              # Lógica de negocio de productos
│       │       ├── Product.php   # Modelo de producto
│       │       ├── ProductDAO.php# Acceso a datos
│       │       └── ProductLogic.php# Lógica de negocio
│       │
│       └── users/                # Módulo de usuarios
│           ├── api/              # APIs REST de usuarios
│           │   ├── auth.php      # API de autenticación
│           │   └── profile.php   # API de perfil
│           ├── js/               # Scripts AJAX de usuarios
│           │   └── user_ajax.js
│           └── php/              # Lógica de negocio de usuarios
│               ├── User.php      # Modelo de usuario
│               ├── UserDAO.php   # Acceso a datos
│               ├── AuthLogic.php # Lógica de autenticación
│               └── ProfileLogic.php# Lógica de perfil
│
└── docs/                         # Documentación técnica
    └── Documento técnico de AFERGOLF.pdf
    
```

---

## ⚙️ Configuración del entorno local con XAMPP

A continuación se explica cómo preparar el entorno local para ejecutar el backend del proyecto **AFERGOLF** usando **XAMPP**, **PHP** y **phpMyAdmin**.

---

### 1️⃣ Instalación y configuración básica de XAMPP

1. Descarga e instala **XAMPP** en la ruta por defecto `C:\xampp\`.
2. Abre el **XAMPP Control Panel** como administrador.
3. Inicia los servicios:
   - **Apache**
   - **MySQL**
4. Verifica el funcionamiento:
   - <http://localhost/> → Página inicial de XAMPP
   - <http://localhost/phpmyadmin/> → Interfaz de administración de bases de datos
5. Si alguno no inicia:
   - Revisa conflictos de puerto (80/443 para Apache, 3306 para MySQL).
   - Cambia el puerto desde el botón **Config** → *Service and Port Settings*.

### 2️⃣ Agregar el proyecto al servidor local

1. Clona o copia el repositorio en tu máquina:

```bash
git clone https://github.com/PurpleCowDevHub/AFERGOLF.git
```

O copia la carpeta del proyecto dentro del directorio de XAMPP:

```plaintext
C:\xampp\htdocs\AFERGOLF
```

### 3️⃣ Configuración de la base de datos

1. **Accede a phpMyAdmin:**
   - Abre tu navegador y ve a: <http://localhost/phpmyadmin/>
   - Usuario: `root` (sin contraseña por defecto)

2. **Crear la base de datos:**
   - Haz clic en **"Nueva"** en el panel izquierdo
   - Nombre de la base de datos: `afergolf_db`
   - Cotejamiento: `utf8mb4_spanish_ci`
   - Haz clic en **"Crear"**

3. **Crear la tabla de usuarios:**
   - Selecciona la base de datos `afergolf_db` que acabas de crear
   - Haz clic en la pestaña **"SQL"**
   - Copia y pega el siguiente código SQL (si no, crea la tabla como nos enseñó el profe, desde la interfaz):

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    foto_perfil VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Explicación de las columnas de usuarios:**

- `id`: Identificador único de cada usuario (clave primaria)
- `nombres`: Nombre(s) del usuario (máximo 50 caracteres)
- `apellidos`: Apellido(s) del usuario (máximo 50 caracteres)
- `email`: Correo electrónico único del usuario (máximo 100 caracteres)
- `telefono`: Teléfono de contacto (máximo 20 caracteres, puede ser nulo)
- `password`: Contraseña encriptada del usuario (máximo 255 caracteres para mayor seguridad con hash)
- `foto_perfil`: **URL de la foto de perfil del usuario** (máximo 255 caracteres, puede ser nulo)
- `fecha_registro`: Fecha y hora automática de cuando se registró el usuario

- Haz clic en **"Continuar"**

1. **Crear la tabla de productos:**
   - Selecciona la base de datos `afergolf_db` en el panel izquierdo
   - Haz clic en la pestaña **"SQL"**
   - Copia y pega el siguiente código SQL:

```sql
CREATE TABLE productos (
    referencia VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100),
    precio INT NOT NULL,
    stock INT NOT NULL,
    imagen_principal MEDIUMTEXT,
    imagen_lateral MEDIUMTEXT,
    imagen_superior MEDIUMTEXT,
    imagen_frontal MEDIUMTEXT,
    dimensiones VARCHAR(100),
    peso DECIMAL(8, 2),
    unidades_paquete INT,
    stock_talla_s INT,
    stock_talla_m INT,
    stock_talla_l INT,
    stock_talla_xl INT,
    stock_talla_xxl INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Explicación de las columnas de productos:**

- `referencia`: **Referencia única del producto (clave primaria, máximo 50 caracteres)** - Se genera automáticamente en formato `AFG-{CATEGORIA_INICIAL}{NUMERO}` pero es editable ⭐ **Campo requerido**
- `nombre`: Nombre del producto (máximo 150 caracteres) ⭐ **Campo requerido**
- `descripcion`: Descripción completa del producto (texto largo, puede ser nulo)
- `categoria`: Categoría del producto: palos, bolas, guantes, accesorios (máximo 50 caracteres) ⭐ **Campo requerido**
- `marca`: Marca del producto: Footjoy, Callaway, Titleist, Srixon, Cobra, TaylorMade, PING, Hammer X, etc. (máximo 100 caracteres) ⭐ **Campo requerido**
- `modelo`: Modelo del producto (ej: B0D562R3XQ) (máximo 100 caracteres)
- `precio`: Precio del producto en COP (en pesos colombianos, sin decimales) ⭐ **Campo requerido**
- `stock`: Cantidad total en stock ⭐ **Campo requerido**
- `imagen_principal`: **Imagen principal del producto en base64** (MEDIUMTEXT hasta 16MB)
- `imagen_lateral`: **Vista lateral del producto en base64** (MEDIUMTEXT hasta 16MB)
- `imagen_superior`: **Vista superior del producto en base64** (MEDIUMTEXT hasta 16MB)
- `imagen_frontal`: **Vista frontal del producto en base64** (MEDIUMTEXT hasta 16MB)
- `dimensiones`: Dimensiones del producto (ej: "0.89 x 0.10 x 0.10 m") (máximo 100 caracteres)
- `peso`: Peso del producto en kg (número decimal con hasta 2 decimales)
- `unidades_paquete`: Para bolas de golf, cantidad de unidades por paquete (ej: 12)
- `stock_talla_s`: Stock disponible en talla S (solo para guantes)
- `stock_talla_m`: Stock disponible en talla M (solo para guantes)
- `stock_talla_l`: Stock disponible en talla L (solo para guantes)
- `stock_talla_xl`: Stock disponible en talla XL (solo para guantes)
- `stock_talla_xxl`: Stock disponible en talla XXL (solo para guantes)
- `fecha_creacion`: Fecha y hora automática de cuando se creó el producto
- `fecha_actualizacion`: Fecha y hora que se actualiza automáticamente cada vez que se modifica el producto

- Haz clic en **"Continuar"**

1. **Verificar las tablas creadas:**
   - En el panel izquierdo, expande `afergolf_db`
   - Deberías ver las tablas `usuarios` y `productos`
   - Haz clic en cada una para ver su estructura

### 4️⃣ Verifica el acceso al proyecto desde el navegador

👉 <http://localhost/AFERGOLF/>

Si la interfaz se carga correctamente y la base de datos está creada, el entorno local está listo para el desarrollo.

## 🔧 Desarrollo Local

**Estructura de trabajo:**

- Frontend: Editar archivos en `front/`
- Backend: Desarrollar APIs en `back/`
- Base de datos: Gestionar desde phpMyAdmin

**Comandos útiles:**

```powershell
# Ver logs de Apache (errores PHP) — muestra últimas 50 líneas y sigue el archivo
Get-Content C:\xampp\apache\logs\error.log -Tail 50 -Wait

# Ver logs de acceso de Apache (últimas 50 líneas)
Get-Content C:\xampp\apache\logs\access.log -Tail 50 -Wait

# Ver logs de MySQL (ruta típica en XAMPP)
Get-Content C:\xampp\mysql\data\mysql_error.log -Tail 50 -Wait

# Listar puertos en uso (buscar conflictos con 80/443/3306)
netstat -ano | Select-String ":80|:443|:3306"

# Mostrar versión de PHP (si php está en PATH)
php -v

# Ver archivo php.ini cargado por PHP (si php está en PATH)
php -i | Select-String "Loaded Configuration File"

# Abrir el proyecto en el navegador por defecto
Start-Process "http://localhost/AFERGOLF/"

# Abrir phpMyAdmin en el navegador
Start-Process "http://localhost/phpmyadmin/"

# Conectarse a MySQL (si mysql.exe está en PATH)
mysql -u root -p

# Exportar una base de datos (backup) — ajusta nombre_bd y ruta
mysqldump -u root -p nombre_bd > C:\ruta\backup_nombre_bd.sql

# Importar un dump SQL
mysql -u root -p nombre_bd < C:\ruta\backup_nombre_bd.sql

# Buscar ocurrencias de una cadena en los archivos del proyecto (recursivo)
Select-String -Path C:\xampp\htdocs\AFERGOLF\* -Pattern "TODO","FIXME" -SimpleMatch -Recurse

# Buscar en archivos específicos (ej. .php y .js) por patrones comunes
Get-ChildItem -Path C:\xampp\htdocs\AFERGOLF -Include *.php,*.js -Recurse | Select-String -Pattern "function","class"

# Mostrar propiedades de un archivo (ej. index.html)
Get-Item C:\xampp\htdocs\AFERGOLF\index.html | Format-List *

# Reiniciar Apache y MySQL usando net stop/start (si están instalados como servicios)
# Nota: los nombres de servicio pueden variar (Apache2.4, mysql, mysql57, etc.). Ejecuta PowerShell como administrador.
net stop Apache2.4
net start Apache2.4
net stop mysql
net start mysql
```

---

## 📖 Documentación

- La documentación técnica, diagramas y material de soporte se encuentra en la carpeta `/docs`.
