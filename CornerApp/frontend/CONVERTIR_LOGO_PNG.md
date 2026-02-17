# 🔄 Convertir favicon.svg a logo.png

## ⚠️ Problema

El favicon.svg funciona en el navegador, pero cuando descargas la app en el celular, aparece otro logo porque los dispositivos móviles prefieren PNG sobre SVG para PWA.

## ✅ Solución

Necesitas convertir el `favicon.svg` (que tiene el formato de tablet) a PNG y reemplazar el `logo.png` actual.

## 📋 Pasos

### Opción 1: Herramienta Online (Más Fácil)

1. Ve a una de estas páginas:
   - https://svgtopng.com
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png

2. Sube el archivo:
   - `CornerApp/frontend/public/favicon.svg`

3. Configura:
   - Tamaño: 512x512 px (o mayor, como 1024x1024)
   - Formato: PNG
   - Fondo: Transparente

4. Descarga el PNG

5. Reemplaza el archivo:
   - Renombra el archivo descargado a `logo.png`
   - Reemplaza `CornerApp/frontend/public/logo.png` con el nuevo archivo

### Opción 2: Con Node.js (Si tienes las herramientas)

```bash
cd CornerApp/frontend/public
npm install -g svg2png-cli
svg2png favicon.svg --output logo.png --width 512 --height 512
```

### Opción 3: Con Inkscape (Si lo tienes instalado)

```bash
cd CornerApp/frontend/public
inkscape favicon.svg --export-filename=logo.png --export-width=512 --export-height=512
```

## 🔄 Después de convertir

1. Reemplaza `/public/logo.png` con el nuevo archivo
2. Recarga la app en el celular
3. **Desinstala la PWA anterior** (si ya estaba instalada)
4. **Reinstala la PWA** desde el navegador del celular
5. Verifica que el icono sea el logo de tablet

## 📝 Nota

El `logo.png` debe tener el mismo diseño que el `favicon.svg`:
- Formato de tablet/smartphone
- Dos puntos en la parte superior
- Texto "RiDi Express clientes" dentro
- Fondo transparente
