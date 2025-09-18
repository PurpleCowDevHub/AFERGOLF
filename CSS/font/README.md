# Carpeta de Fuentes

Esta carpeta está destinada para almacenar todas las fuentes personalizadas del proyecto AFERGOLF.

## Formatos Recomendados:
- `.woff2` - Formato preferido para web (mejor compresión)
- `.woff` - Soporte para navegadores más antiguos
- `.ttf` - TrueType Font
- `.eot` - Para Internet Explorer

## Uso en CSS:
```css
@font-face {
    font-family: 'MiFuentePersonalizada';
    src: url('./font/mifuente.woff2') format('woff2'),
         url('./font/mifuente.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
```