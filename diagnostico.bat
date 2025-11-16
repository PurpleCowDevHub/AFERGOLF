@echo off
REM Script de verificación del sistema AFERGOLF
REM Abre automáticamente las herramientas de diagnóstico en el navegador

echo ============================================
echo AFERGOLF - Sistema de Fotos de Perfil
echo ============================================
echo.
echo Se abrirán las herramientas de diagnóstico en tu navegador...
echo.

REM Abrir página de diagnóstico
start http://localhost/AFERGOLF/back/diagnostico.html

echo.
echo Si ves errores en el navegador, intenta ejecutar la migración:
echo http://localhost/AFERGOLF/back/migrations/
echo.
pause
