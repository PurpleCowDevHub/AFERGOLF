/**
 * ===========================================================
 * AFERGOLF – Colores dinámicos del avatar
 * Extrae los colores dominantes de la imagen de perfil
 * y los aplica como gradiente al borde del avatar
 * ===========================================================
 */

class AvatarColorExtractor {
    constructor() {
        this.defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    /**
     * Extrae los colores dominantes de una imagen
     * @param {HTMLImageElement} img - Elemento de imagen
     * @param {number} colorCount - Cantidad de colores a extraer
     * @returns {Array} Array de colores en formato [r, g, b]
     */
    extractColors(img, colorCount = 2) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tamaño pequeño para mejor rendimiento
        const size = 50;
        canvas.width = size;
        canvas.height = size;

        try {
            ctx.drawImage(img, 0, 0, size, size);
            const imageData = ctx.getImageData(0, 0, size, size);
            const pixels = imageData.data;
            
            return this.getProminentColors(pixels, colorCount);
        } catch (e) {
            console.warn('No se pudieron extraer colores (posible CORS):', e);
            return null;
        }
    }

    /**
     * Obtiene los colores más prominentes de los píxeles
     * @param {Uint8ClampedArray} pixels - Datos de píxeles
     * @param {number} colorCount - Cantidad de colores
     * @returns {Array} Colores prominentes
     */
    getProminentColors(pixels, colorCount) {
        const colorMap = {};
        
        // Agrupar colores similares
        for (let i = 0; i < pixels.length; i += 4) {
            const r = Math.round(pixels[i] / 32) * 32;
            const g = Math.round(pixels[i + 1] / 32) * 32;
            const b = Math.round(pixels[i + 2] / 32) * 32;
            const a = pixels[i + 3];
            
            // Ignorar píxeles transparentes y muy claros/oscuros
            if (a < 125) continue;
            const brightness = (r + g + b) / 3;
            if (brightness < 30 || brightness > 225) continue;
            
            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Ordenar por frecuencia y tomar los más comunes
        const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorCount * 3) // Tomar más para tener variedad
            .map(entry => entry[0].split(',').map(Number));

        if (sortedColors.length < 2) {
            return null;
        }

        // Seleccionar dos colores que tengan buen contraste
        const primary = sortedColors[0];
        let secondary = sortedColors[1];
        
        // Buscar un color con mejor contraste si es posible
        for (let i = 1; i < sortedColors.length; i++) {
            if (this.getColorDistance(primary, sortedColors[i]) > 80) {
                secondary = sortedColors[i];
                break;
            }
        }

        return [primary, secondary];
    }

    /**
     * Calcula la distancia entre dos colores
     */
    getColorDistance(color1, color2) {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    /**
     * Convierte RGB a string CSS
     */
    rgbToString(rgb) {
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    /**
     * Hace el color más vibrante
     */
    saturateColor(rgb, amount = 1.3) {
        const max = Math.max(...rgb);
        const min = Math.min(...rgb);
        const mid = (max + min) / 2;
        
        return rgb.map(c => {
            const diff = c - mid;
            return Math.min(255, Math.max(0, Math.round(mid + diff * amount)));
        });
    }

    /**
     * Aplica el gradiente a un elemento avatar
     * @param {HTMLElement} avatarElement - Elemento del avatar
     * @param {HTMLImageElement} img - Imagen de perfil
     */
    applyToAvatar(avatarElement, img) {
        if (!avatarElement || !img) return;

        // Esperar a que la imagen cargue
        const processImage = () => {
            const colors = this.extractColors(img);
            
            if (colors && colors.length >= 2) {
                // Saturar los colores para hacerlos más vibrantes
                const color1 = this.saturateColor(colors[0]);
                const color2 = this.saturateColor(colors[1]);
                
                const gradient = `linear-gradient(135deg, ${this.rgbToString(color1)} 0%, ${this.rgbToString(color2)} 100%)`;
                avatarElement.style.background = gradient;
                
                // Actualizar la sombra también
                const shadowColor = `rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 0.3)`;
                avatarElement.style.boxShadow = `0 4px 15px ${shadowColor}`;
                
                console.log('✨ Colores del avatar aplicados:', gradient);
            } else {
                // Usar gradiente por defecto
                avatarElement.style.background = this.defaultGradient;
                avatarElement.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }
        };

        if (img.complete && img.naturalHeight !== 0) {
            processImage();
        } else {
            img.addEventListener('load', processImage);
            img.addEventListener('error', () => {
                avatarElement.style.background = this.defaultGradient;
            });
        }
    }

    /**
     * Inicializa todos los avatares en la página
     */
    initAll() {
        // Avatar principal de la página
        const mainAvatar = document.querySelector('.avatar');
        const mainAvatarImg = document.getElementById('avatarImage');
        if (mainAvatar && mainAvatarImg) {
            this.applyToAvatar(mainAvatar, mainAvatarImg);
        }

        // Avatar del modal
        const modalAvatar = document.querySelector('.avatar-edit');
        const modalAvatarImg = document.getElementById('modalAvatarImage');
        if (modalAvatar && modalAvatarImg) {
            this.applyToAvatar(modalAvatar, modalAvatarImg);
        }
    }
}

// Instancia global
window.avatarColorExtractor = new AvatarColorExtractor();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que my_account.js cargue la imagen
    setTimeout(() => {
        window.avatarColorExtractor.initAll();
    }, 500);
});

// Exportar para uso manual
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarColorExtractor;
}
