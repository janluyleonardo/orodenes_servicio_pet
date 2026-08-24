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

### Versión 1.1.1
```javascript
const getBackendOrigin = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return window.location.origin;
    }
    return 'http://api';  // ❌ No funciona con IP
};
```

### Versión 1.1.2
```javascript
const getBackendConfig = () => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return { /* rutas largas */ };
    }
    
    return {
        origin: 'http://api.universalpet.co',  // ❌ No funciona con IP
        apiPath: '/api/consentimientos',
        razasPath: '/api/razas'
    };
};
```

### Versión 1.1.3 (Actual) ✅
```javascript
const getBackendConfig = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Caso 1: Desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            origin: window.location.origin,
            apiPath: '/consentimientos-back/public/api/consentimientos',
            razasPath: '/consentimientos-back/public/api/razas'
        };
    }
    
    // Caso 2: Acceso por IP desde tablet ✅ NUEVO
    const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (isIPAddress) {
        return {
            origin: `${protocol}//${hostname}`,  // ✅ Usa misma IP
            apiPath: '/consentimientos-back/public/api/consentimientos',
            razasPath: '/consentimientos-back/public/api/razas'
        };
    }
    
    // Caso 3: Acceso por dominio
    return {
        origin: 'http://api.universalpet.co',
        apiPath: '/api/consentimientos',
        razasPath: '/api/razas'
    };
};
```

## Cómo Funciona

### En Desarrollo Local (v1.1.0, 1.1.1, 1.1.2, 1.1.3)
```
Usuario accede a: http://localhost/consentimientos/
window.location.hostname = "localhost"
BACKEND_ORIGIN = "http://localhost"
RAZAS_API_URL = "http://localhost/consentimientos-back/public/api/razas"
✅ Funciona correctamente
```

### En Tablet con IP (v1.1.3 NUEVO) ✅
```
Usuario accede a: http://192.168.1.92/consentimientos/
window.location.hostname = "192.168.1.92"
Se detecta como IP → isIPAddress = true
BACKEND_ORIGIN = "http://192.168.1.92"
RAZAS_API_URL = "http://192.168.1.92/consentimientos-back/public/api/razas"
✅ Funciona correctamente (SOLUCIONADO en v1.1.3)
```

### En Computador con Dominio (v1.1.2, 1.1.3)
```
Usuario accede a: http://www.universalpet.co/
window.location.hostname = "www.universalpet.co"
Se detecta como Dominio (no es IP, no es localhost)
BACKEND_ORIGIN = "http://api.universalpet.co"
RAZAS_API_URL = "http://api.universalpet.co/api/razas"
✅ Funciona correctamente
```

## URLs Afectadas

### En Desarrollo Local (Igual en v1.1.0, 1.1.1, 1.1.2, 1.1.3)
1. **Cargar razas**: `http://localhost/consentimientos-back/public/api/razas`
2. **Consultar por teléfono**: `http://localhost/consentimientos-back/public/api/consentimientos/telefono/{telefono}`
3. **Guardar consentimiento**: `http://localhost/consentimientos-back/public/api/consentimientos` (POST)

### En Tablet con IP (v1.1.3) ✅
1. **Cargar razas**: `http://192.168.1.92/consentimientos-back/public/api/razas`
2. **Consultar por teléfono**: `http://192.168.1.92/consentimientos-back/public/api/consentimientos/telefono/{telefono}`
3. **Guardar consentimiento**: `http://192.168.1.92/consentimientos-back/public/api/consentimientos` (POST)

### En Producción con Dominio (v1.1.2, 1.1.3)
1. **Cargar razas**: `http://api.universalpet.co/api/razas`
2. **Consultar por teléfono**: `http://api.universalpet.co/api/consentimientos/telefono/{telefono}`
3. **Guardar consentimiento**: `http://api.universalpet.co/api/consentimientos` (POST)

## Versión
- **Versión 1.1.0**: URLs hardcodeadas para localhost
- **Versión 1.1.1**: Detección automática de ambiente (localhost vs api)
- **Versión 1.1.2**: URLs configuradas para `api.universalpet.co` con rutas cortas
- **Versión 1.1.3**: Soporte para acceso por IP desde tablet (192.168.1.92)
- **Fecha**: 2026-08-13

## Pasos para Verificar

### En Tablet con IP (v1.1.3)
1. Accede a `http://192.168.1.92/consentimientos` desde la tablet
2. Abre las DevTools (F12)
3. Ve a **Console**
4. Verifica que veas: `Versión: 1.1.3`
5. Ve a **Network**
6. Recarga la página (F5)
7. Busca las llamadas a `/consentimientos-back/public/api/razas`
   - ✅ Debe apuntar a `http://192.168.1.92/consentimientos-back/public/api/razas`
   - ✅ Debe mostrar estado 200

### En Computador con Dominio Personalizado (v1.1.2, 1.1.3)
1. Accede a `http://www.universalpet.co` desde la computadora del cliente
2. Abre las DevTools (F12)
3. Ve a **Console**
4. Verifica que veas: `Versión: 1.1.3` o `1.1.2`
5. Ve a **Network**
6. Recarga la página (F5)
7. Busca las llamadas a `/api/razas`
   - ✅ Debe apuntar a `http://api.universalpet.co/api/razas`
   - ✅ Debe mostrar estado 200

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

### Para la Tablet (IP 192.168.1.92)
1. **Verificar versión**: Debe mostrar `v1.1.3` en esquina superior derecha
2. **Recarga dura**: Ctrl+F5 (o en tablet: deslizar hacia abajo en Chrome y tocar recarga)
3. **Limpiar caché**: Ctrl+Shift+Del → Eliminar todos los datos
4. **Verificar DevTools** (F12):
   - Console: Busca errores en rojo
   - Network: Verifica que las URLs apunten a `192.168.1.92`
5. **Probar manualmente**: 
   - Accede a `http://192.168.1.92/consentimientos-back/public/api/razas` desde el navegador
   - Debe retornar un JSON con las razas
6. **Verificar red**:
   - La tablet y la computadora del cliente ¿están en la misma red?
   - ¿Hay algún firewall bloqueando?

### Para el Computador del Cliente (Dominio www.universalpet.co)
1. **Verificar versión**: Debe mostrar `v1.1.3` en esquina superior derecha
2. **Recarga dura**: Ctrl+F5
3. **Verificar VirtualHost**: 
   - ¿El cliente tiene configurado `api.universalpet.co` en el VirtualHost?
   - ¿Está registrado en el archivo hosts?
4. **Probar manualmente**: 
   - Accede a `http://api.universalpet.co/api/razas` desde el navegador
   - Debe retornar un JSON con las razas
5. **Verificar CORS**: El backend Laravel debe permitir el origen

---

**Documento técnico v1.3 | 2026-08-13**
