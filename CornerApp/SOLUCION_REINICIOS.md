# 🔧 Solución: Servidor se Reinicia Constantemente

## 🔍 Problema Identificado

El servidor de Vite se reinicia porque detecta cambios en `vite.config.ts`. Esto puede ser causado por:

1. **Auto-guardado del IDE** (Cursor/VS Code)
2. **Formatter/Linter** que guarda automáticamente
3. **OneDrive** sincronizando y modificando timestamps
4. **Procesos externos** modificando el archivo

---

## ✅ Soluciones

### Solución 1: Deshabilitar Auto-guardado en Cursor/VS Code

1. **Abre la configuración de Cursor/VS Code:**
   - Presiona `Ctrl + ,` (o `Cmd + ,` en Mac)
   - O ve a: File → Preferences → Settings

2. **Busca:** `files.autoSave`

3. **Cambia a:** `"off"` o `"afterDelay"` con un delay largo (ej: 60000ms)

4. **También busca:** `editor.formatOnSave`

5. **Desactívalo** para `vite.config.ts` específicamente:
   ```json
   "[typescript]": {
     "editor.formatOnSave": false
   }
   ```

### Solución 2: Configurar .vscode/settings.json

Crea o edita `.vscode/settings.json` en la raíz del proyecto:

```json
{
  "files.autoSave": "off",
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/dist/**": true,
    "**/.vite/**": true
  },
  "[typescript]": {
    "editor.formatOnSave": false
  },
  "[javascript]": {
    "editor.formatOnSave": false
  }
}
```

### Solución 3: Excluir vite.config.ts del Watch (No Recomendado)

No es posible excluir completamente `vite.config.ts` del watch porque Vite necesita detectar cambios en su configuración. Sin embargo, ya configuramos el watch para ignorar otros archivos.

### Solución 4: Verificar OneDrive

Si tu proyecto está en OneDrive, puede estar sincronizando y modificando timestamps:

1. **Verifica si OneDrive está sincronizando:**
   - Abre OneDrive
   - Ve a Settings → Sync and backup
   - Verifica qué carpetas están sincronizando

2. **Considera excluir la carpeta del proyecto** de la sincronización automática si no es necesario

---

## 🎯 Solución Recomendada

**La mejor solución es deshabilitar el auto-guardado en Cursor/VS Code:**

1. Presiona `Ctrl + Shift + P`
2. Escribe: `Preferences: Open Settings (JSON)`
3. Agrega:
   ```json
   {
     "files.autoSave": "off",
     "editor.formatOnSave": false
   }
   ```

O manualmente:
- `Ctrl + ,` → Busca "auto save" → Cambia a "off"
- `Ctrl + ,` → Busca "format on save" → Desactívalo

---

## 🔍 Verificar Qué Está Modificando el Archivo

Si quieres investigar qué está modificando `vite.config.ts`:

### En PowerShell:
```powershell
# Monitorear cambios en el archivo
Get-Content "C:\Users\senis\OneDrive\Escritorio\RestauranteNW\Restaurante\CornerApp\frontend\vite.config.ts" -Wait
```

### Verificar procesos que acceden al archivo:
```powershell
# Usar Process Monitor (procmon.exe) de Sysinternals si está instalado
# O simplemente cerrar procesos uno por uno para identificar el culpable
```

---

## 📋 Estado Actual

- ✅ Watch configurado para ignorar archivos innecesarios
- ✅ Errores de proxy silenciados
- ⚠️ Auto-guardado del IDE puede estar causando reinicios

---

## 💡 Nota

Los reinicios por cambios en `vite.config.ts` son **normales y necesarios** cuando realmente modificas la configuración. El problema es cuando se reinicia **sin que tú hayas hecho cambios**, lo cual indica que algo está modificando el archivo automáticamente.

La solución más efectiva es **deshabilitar el auto-guardado** en tu IDE.
