# Migraciones de Base de Datos - AFERGOLF

Este directorio contiene los scripts de migración para la base de datos de AFERGOLF.

## Migraciones Disponibles

### add_foto_perfil.php
Agrega la columna `foto_perfil` a la tabla `usuarios` si no existe.

**Ejecutar la migración:**
1. Abre tu navegador y ve a: `http://localhost/AFERGOLF/back/migrations/`
2. Haz clic en "Ejecutar Migración"
3. El sistema verificará si la columna existe y la creará si es necesario

**Detalles técnicos:**
- Tabla: `usuarios`
- Nueva columna: `foto_perfil VARCHAR(255) NULL DEFAULT NULL`
- Posición: Después de la columna `ciudad`
- Tipo de dato: VARCHAR(255) - almacena la ruta relativa de la imagen
- Valor por defecto: NULL

**Valores de ejemplo:**
- `assets/img/profiles/profile_1_1730000000.jpg`
- `assets/img/profiles/profile_5_1730000100.png`
- NULL (para usuarios sin foto de perfil)

## Estructura de Directorios

```
migrations/
├── index.html              # Página para ejecutar migraciones
├── add_foto_perfil.php     # Script de migración
└── README.md               # Este archivo
```

## Notas Importantes

- Las migraciones son **idempotentes**: puedes ejecutarlas múltiples veces sin problemas
- El sistema valida que la columna no exista antes de crearla
- Los perfiles de usuario se almacenan en: `/front/assets/img/profiles/`
- Los nombres de archivo siguen el patrón: `profile_{user_id}_{timestamp}.{extension}`
