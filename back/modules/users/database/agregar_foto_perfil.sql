-- Script para agregar columna de foto de perfil a la tabla usuarios
-- Ejecutar en phpMyAdmin o en MySQL

ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL DEFAULT NULL AFTER ciudad;

-- Si la columna ya existe, usar este comando alternativo:
-- ALTER TABLE usuarios MODIFY COLUMN foto_perfil VARCHAR(255) NULL DEFAULT NULL AFTER ciudad;
