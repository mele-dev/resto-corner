# 🔑 Configurar Authtoken de ngrok

ngrok ahora requiere una cuenta verificada y authtoken para funcionar.

---

## 📝 Paso 1: Crear Cuenta en ngrok

1. Ve a https://dashboard.ngrok.com/signup
2. **Regístrate** con:
   - Email
   - Contraseña
   - O usa Google/GitHub para registro rápido

3. **Verifica tu email** (revisa tu bandeja de entrada)

---

## 🔑 Paso 2: Obtener tu Authtoken

1. Una vez que hayas iniciado sesión, ve a:
   https://dashboard.ngrok.com/get-started/your-authtoken

2. **Copia tu authtoken** (es una cadena larga que parece: `2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`)

---

## ⚙️ Paso 3: Configurar el Authtoken

Abre PowerShell o CMD y ejecuta:

```powershell
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

**Reemplaza `TU_AUTHTOKEN_AQUI`** con el token que copiaste.

Ejemplo:
```powershell
ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## ✅ Paso 4: Verificar Configuración

Ejecuta:
```powershell
ngrok config check
```

Deberías ver algo como:
```
Authtoken saved to configuration file: C:\Users\TU_USUARIO\AppData\Local\ngrok\ngrok.yml
```

---

## 🚀 Paso 5: Probar ngrok

Ahora puedes usar ngrok:

```powershell
# Exponer puerto 5000
ngrok http 5000

# Exponer puerto 8080 (tu backend)
ngrok http 8080

# Exponer puerto 3000 (tu frontend)
ngrok http 3000
```

---

## 💡 Notas Importantes

- **Cuenta gratuita**: ngrok ofrece un plan gratuito con:
  - URLs estables (no cambian cada vez)
  - Sin límite de tiempo
  - Límite de requests (suficiente para desarrollo/testing)
  
- **El authtoken es personal**: No lo compartas públicamente

- **Una vez configurado**: No necesitas volver a configurarlo (a menos que cambies de cuenta)

---

## 🆘 Si Tienes Problemas

### Error: "authtoken invalid"
- Verifica que copiaste el token completo
- Asegúrate de que no haya espacios antes o después
- Vuelve a obtener el token desde el dashboard

### Error: "account not verified"
- Revisa tu email y verifica tu cuenta
- Revisa la carpeta de spam

### No encuentro el authtoken
- Ve directamente a: https://dashboard.ngrok.com/get-started/your-authtoken
- O en el dashboard, busca "Your Authtoken" en el menú

---

## 📋 Resumen Rápido

1. ✅ Crear cuenta: https://dashboard.ngrok.com/signup
2. ✅ Obtener token: https://dashboard.ngrok.com/get-started/your-authtoken
3. ✅ Configurar: `ngrok config add-authtoken TU_TOKEN`
4. ✅ Probar: `ngrok http 8080`
