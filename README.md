# 🌐 AFERGOLF - Sitio Web Oficial  

Este proyecto corresponde al **diseño y desarrollo del sitio web oficial de AFERGOLF**, empresa especializada en venta, reparación y fitting profesional de palos de golf, con más de 15 años de trayectoria.

El objetivo del proyecto es ofrecer una **experiencia digital integral**, que permita a los clientes actuales y potenciales:  

- Conocer la marca y su oferta de valor.  
- Explorar el catálogo de productos y servicios.  
- Realizar reservas y solicitudes en línea.  
- Contactar de forma ágil al negocio.  
- Posicionar la marca en buscadores y redes sociales.  

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
-**HTML5**
-**CSS3**
-**JavaScript (Vanilla)**

**Backend:**
-**PHP** (con XAMPP)
-**MySQL** (integrado en XAMPP)
-**Apache Server** (integrado en XAMPP)

**Herramientas de desarrollo:**
-**XAMPP** (servidor local con Apache, MySQL, PHP)
-**phpMyAdmin** (gestión de base de datos)

**Futuras integraciones:**  
-**Autenticación de usuarios** (PHP Sessions, JWT)  
-**Integración de pasarelas de pago** (PayU, Mercado Pago)
-**API REST** para comunicación frontend-backend  

---

## 📂 Estructura del Proyecto  

```bash
AFERGOLF/
├── index.html                    # Página principal
├── README.md                     # Documentación del proyecto
│
├── FRONT/                        # Frontend del sitio web
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
├── BACK/                         # Backend PHP
│   ├── Proximamente...
│
└── DOCS/                         # Documentación técnica
    ├── Documento técnico de AFERGOLF.pdf
    ├── database_schema.sql       # Esquema de BD
    └── ...
```

---

## � Requisitos del Sistema

**Para desarrollo local:**

- **XAMPP** (versión 7.4 o superior)
  - Apache 2.4+
  - MySQL 5.7+ o MariaDB 10.4+
  - PHP 7.4+ o 8.0+
  - phpMyAdmin (incluido en XAMPP)

---

## �🚀 Instalación y Configuración

### 1. **Preparar el entorno**

```powershell
# Descargar e instalar XAMPP desde https://www.apachefriends.org/
# Ejecutar XAMPP Control Panel como administrador
```

### 2. **Clonar el repositorio** (omitan este paso chicos)

```powershell
git clone https://github.com/PurpleCowDevHub/AFERGOLF.git
cd AFERGOLF
```

### 3. **Configurar XAMPP**

- Abrir **XAMPP Control Panel**
- Iniciar los servicios **Apache** y **MySQL**
- Verificar que funcionen en `http://localhost/` y `http://localhost/phpmyadmin/`

### 4. **Configurar el proyecto**

```powershell
# Copiar el proyecto a la carpeta de XAMPP
# Por defecto: C:\xampp\htdocs\AFERGOLF\
copy . C:\xampp\htdocs\AFERGOLF\
```

### 5. **Acceder al sitio**

- **Frontend**: `http://localhost/AFERGOLF/`
- **Panel Admin**: `http://localhost/phpmyadmin/`

---

## 🔧 Desarrollo Local

**Estructura de trabajo:**
-Frontend: Editar archivos en `front/`
-Backend: Desarrollar APIs en `back/`
-Base de datos: Gestionar desde phpMyAdmin

**Comandos útiles:**

```powershell
# Ver logs de Apache (errores PHP)
Get-Content C:\xampp\apache\logs\error.log -Tail 10

# Reiniciar servicios XAMPP si es necesario
# (usar XAMPP Control Panel)
```

---

## 📖 Documentación

- La documentación técnica, diagramas y material de soporte se encuentra en la carpeta `/docs`.
