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

### Cambio en `js/app.js` (Líneas 163-176)

**ANTES:**
```javascript
const API_BASE_PATH = '/consentimientos-back/public/api/consentimientos';
const API_BASE_URL = `${window.location.origin}${API_BASE_PATH}`;
const RAZAS_API_URL = `${window.location.origin}/consentimientos-back/public/api/razas`;
```

**DESPUÉS:**
```javascript
// Detectar entorno y construir URL del backend
const getBackendOrigin = () => {
    const hostname = window.location.hostname;
    // Si es localhost o 127.0.0.1, usar el mismo origen (desarrollo local)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return window.location.origin;
    }
    // Si es producción, usar el dominio 'api'
    return 'http://api';
};

const BACKEND_ORIGIN = getBackendOrigin();
const API_BASE_PATH = '/consentimientos-back/public/api/consentimientos';
const API_BASE_URL = `${BACKEND_ORIGIN}${API_BASE_PATH}`;
const RAZAS_API_URL = `${BACKEND_ORIGIN}/consentimientos-back/public/api/razas`;
```

## Cómo Funciona

### En Desarrollo Local
```
Usuario accede a: http://localhost/consentimientos/
window.location.hostname = "localhost"
BACKEND_ORIGIN = "http://localhost"
RAZAS_API_URL = "http://localhost/consentimientos-back/public/api/razas"
✅ Funciona correctamente
```

### En Producción con Dominios Personalizados
```
Usuario accede a: http://www.universalpet.co/
window.location.hostname = "www.universalpet.co"
BACKEND_ORIGIN = "http://api"
RAZAS_API_URL = "http://api/consentimientos-back/public/api/razas"
✅ Funciona correctamente
```

## URLs Afectadas

Las siguientes URLs ahora apuntan correctamente al backend según el ambiente:

1. **Cargar razas dinámicas**:
   - Desarrollo: `http://localhost/consentimientos-back/public/api/razas`
   - Producción: `http://api/consentimientos-back/public/api/razas`

2. **Consultar consentimiento por teléfono**:
   - Desarrollo: `http://localhost/consentimientos-back/public/api/consentimientos/telefono/{telefono}`
   - Producción: `http://api/consentimientos-back/public/api/consentimientos/telefono/{telefono}`

3. **Guardar consentimiento (POST)**:
   - Desarrollo: `http://localhost/consentimientos-back/public/api/consentimientos`
   - Producción: `http://api/consentimientos-back/public/api/consentimientos`

## Versión
- **Versión anterior**: 1.1.0
- **Versión actual**: 1.1.1
- **Fecha**: 2026-08-13

## Pasos para Verificar en Producción

1. Accede a `http://www.universalpet.co` desde la tablet del cliente
2. Abre las DevTools (F12)
3. Ve a la pestaña **Console**
4. Verifica que veas: `Versión: 1.1.1`
5. Ve a la pestaña **Network**
6. Recarga la página (F5)
7. Busca las llamadas a `/api/razas` - deben mostrar estado 200
8. Busca las llamadas a `/consentimientos-back/...` - deben apuntar a `http://api`

## Si Sigue Sin Funcionar

1. **Limpiar caché del cliente**: Ctrl+Shift+Del → Eliminar todos los datos
2. **Recarga dura**: Ctrl+F5
3. **Verificar configuración XAMPP**: Los VirtualHosts deben estar correctamente configurados
4. **Probar manualmente la API**: Acceder a `http://api/consentimientos-back/public/api/razas` desde el navegador

---

**Documento técnico v1.0 | 2026-08-13**
