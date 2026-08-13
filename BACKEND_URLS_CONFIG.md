# Documentación Técnica: Configuración de URLs Backend

## Situación
Se configuró un ambiente de producción con dominios personalizados en XAMPP:
- **Frontend**: `www.universalpet.co` → `C:\xampp\htdocs\consentimientos\`
- **Backend**: `api` → `C:\xampp\htdocs\consentimientos-back\public\`

## Problema Identificado
Las URLs de las API estaban hardcodeadas para usar `window.location.origin`, lo que causaba que:
- Cuando el usuario accedía desde `www.universalpet.co`
- Las llamadas AJAX intentaban conectar a `http://www.universalpet.co/consentimientos-back/...`
- En lugar de `http://api/consentimientos-back/...`

Resultado: La lista de razas no cargaba y no se precargaban los datos anteriores.

## Solución Implementada

### Cambio Anterior (v1.1.1)
En `js/app.js` (Líneas 163-176):
```javascript
const getBackendOrigin = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return window.location.origin;
    }
    return 'http://api';  // ❌ Dominio incorrecto
};
```

### Cambio Actual (v1.1.2) ✅
```javascript
const getBackendConfig = () => {
    const hostname = window.location.hostname;
    
    // Ambiente de desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            origin: window.location.origin,
            apiPath: '/consentimientos-back/public/api/consentimientos',
            razasPath: '/consentimientos-back/public/api/razas'
        };
    }
    
    // Ambiente de producción con dominio personalizado
    return {
        origin: 'http://api.universalpet.co',
        apiPath: '/api/consentimientos',
        razasPath: '/api/razas'
    };
};

const BACKEND_CONFIG = getBackendConfig();
const BACKEND_ORIGIN = BACKEND_CONFIG.origin;
const API_BASE_URL = `${BACKEND_ORIGIN}${BACKEND_CONFIG.apiPath}`;
const RAZAS_API_URL = `${BACKEND_ORIGIN}${BACKEND_CONFIG.razasPath}`;
```

## Cómo Funciona

### En Desarrollo Local (v1.1.0, v1.1.1, v1.1.2)
```
Usuario accede a: http://localhost/consentimientos/
window.location.hostname = "localhost"
BACKEND_ORIGIN = "http://localhost"
RAZAS_API_URL = "http://localhost/consentimientos-back/public/api/razas"
✅ Funciona correctamente
```

### En Producción v1.1.1 (Versión Anterior)
```
Usuario accede a: http://www.universalpet.co/
BACKEND_ORIGIN = "http://api"
RAZAS_API_URL = "http://api/consentimientos-back/public/api/razas"
⚠️ Funcionaba pero con rutas largas
```

### En Producción v1.1.2 (Versión Actual) ✅
```
Usuario accede a: http://www.universalpet.co/
BACKEND_ORIGIN = "http://api.universalpet.co"
RAZAS_API_URL = "http://api.universalpet.co/api/razas"
API_BASE_URL = "http://api.universalpet.co/api/consentimientos"
✅ Funciona con rutas cortas y dominio completo
```

## URLs Afectadas

### En Desarrollo Local (Igual en v1.1.0, 1.1.1, 1.1.2)
1. **Cargar razas**: `http://localhost/consentimientos-back/public/api/razas`
2. **Consultar por teléfono**: `http://localhost/consentimientos-back/public/api/consentimientos/telefono/{telefono}`
3. **Guardar consentimiento**: `http://localhost/consentimientos-back/public/api/consentimientos` (POST)

### En Producción (v1.1.1)
1. **Cargar razas**: `http://api/consentimientos-back/public/api/razas`
2. **Consultar por teléfono**: `http://api/consentimientos-back/public/api/consentimientos/telefono/{telefono}`
3. **Guardar consentimiento**: `http://api/consentimientos-back/public/api/consentimientos` (POST)

### En Producción (v1.1.2) ✅ ACTUAL
1. **Cargar razas**: `http://api.universalpet.co/api/razas`
2. **Consultar por teléfono**: `http://api.universalpet.co/api/consentimientos/telefono/{telefono}`
3. **Guardar consentimiento**: `http://api.universalpet.co/api/consentimientos` (POST)

## Versión
- **Versión 1.1.0**: URLs hardcodeadas para localhost
- **Versión 1.1.1**: Detección automática de ambiente (localhost vs api)
- **Versión 1.1.2**: URLs configuradas para `api.universalpet.co` con rutas cortas
- **Fecha**: 2026-08-13

## Pasos para Verificar en Producción (v1.1.2)

1. Accede a `http://www.universalpet.co` desde la tablet del cliente
2. Abre las DevTools (F12)
3. Ve a la pestaña **Console**
4. Verifica que veas: `Versión: 1.1.2`
5. Ve a la pestaña **Network**
6. Recarga la página (F5)
7. Busca las llamadas a las APIs:
   - ✅ Debe apuntar a `http://api.universalpet.co/api/razas`
   - ✅ Debe apuntar a `http://api.universalpet.co/api/consentimientos` (POST)
   - ✅ Las respuestas deben mostrar estado 200

## Configuración del VirtualHost del Cliente

Para que funcione correctamente, el cliente debe tener configurado en XAMPP:

**Para el frontend** (www.universalpet.co):
```apache
<VirtualHost *:80>
    DocumentRoot "C:\xampp\htdocs\consentimientos\"
    ServerName www.universalpet.co
</VirtualHost>
```

**Para el backend** (api.universalpet.co):
```apache
<VirtualHost *:80>
    DocumentRoot "C:\xampp\htdocs\consentimientos-back\public\"
    ServerName api.universalpet.co
</VirtualHost>
```

**En el archivo hosts** (C:\Windows\System32\drivers\etc\hosts):
```
127.0.0.1 www.universalpet.co
127.0.0.1 api.universalpet.co
```

## Si Sigue Sin Funcionar

1. **Verificar versión**: Mira la esquina superior derecha - debe mostrar `v1.1.2`
2. **Limpiar caché del cliente**: Ctrl+Shift+Del → Eliminar todos los datos
3. **Recarga dura**: Ctrl+F5
4. **Verificar DevTools**: F12 → Console → Busca errores de red
5. **Verificar VirtualHost**: 
   - ¿El cliente tiene configurado `api.universalpet.co` en el VirtualHost?
   - ¿Está registrado en el archivo hosts?
6. **Probar manualmente la API**: 
   - Acceder a `http://api.universalpet.co/api/razas` desde el navegador
   - Debe retornar un JSON con las razas
7. **Verificar CORS**: Si las llamadas retornan errores CORS, el backend Laravel debe permitir el origen

---

**Documento técnico v1.2 | 2026-08-13**
