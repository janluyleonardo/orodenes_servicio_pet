# Control de Versión - Consentimiento Informado Pet Shop

## 🔍 Verificar la Versión Actual

### Opción 1: Badge Visual (Más Fácil)
- Mira la **esquina superior derecha** del navegador
- Verás un cuadro azul con `v1.1.0` (o la versión actual)
- Si pasa el mouse, sale un tooltip explicando qué hacer si no cambia

### Opción 2: Consola del Navegador
1. Abre las herramientas de desarrollador: **F12** o **Ctrl+Shift+I**
2. Ve a la pestaña **Console**
3. Verás un cuadro con la información de versión:
   ```
   ╔════════════════════════════════════════╗
   ║  CONSENTIMIENTO INFORMADO - PET SHOP   ║
   ║  Versión: 1.1.0
   ║  Fecha de compilación: 2026-08-13
   ╚════════════════════════════════════════╝
   ```

### Opción 3: Verificar en la Tablet del Cliente
Puedes hacer que el cliente tome una foto de la esquina superior derecha y te la envíe para verificar qué versión está usando.

---

## 📝 Cómo Actualizar la Versión

Cuando hagas cambios y los subas al servidor:

### Paso 1: Edita `index.html`
Busca y actualiza estos 4 lugares:

**1.1** Línea 10 aprox (Comentario):
```html
<!-- Versión del proyecto: 1.2.0 (2026-08-14) -->
```

**1.2** Línea 11 aprox (Meta tag):
```html
<meta name="version" content="1.2.0">
```

**1.3** Línea 25 aprox (Badge visible):
```html
<div class="version-badge" title="...">
    <strong>v1.2.0</strong>
</div>
```

**1.4** Línea 295 aprox (Script de versión):
```javascript
const APP_VERSION = '1.2.0';
const BUILD_DATE = '2026-08-14';
```

### Paso 2: Actualiza el Cache Busting
Líneas 288-290 aprox:
```html
<script src="js/app.js?v=20260814-1"></script>
<script src="js/validacion_otro.js?v=20260814-1"></script>
<script src="js/auto-complete-name.js?v=20260814-1"></script>
```

El parámetro `?v=YYYYMMDD-N` fuerza que el navegador descargue los archivos nuevos, ignorando la copia en caché.

---

## ✅ Flujo de Actualización (Checklista)

1. ☐ Haz los cambios en los archivos JS/CSS
2. ☐ Actualiza la versión en los 4 lugares del `index.html`
3. ☐ Incrementa el número después de `?v=` en los scripts (ej: de 1 a 2)
4. ☐ Guarda los cambios en tu servidor/XAMPP
5. ☐ En tu computadora: abre el navegador y presiona **Ctrl+F5**
6. ☐ Verifica que el badge muestre la nueva versión
7. ☐ Abre la consola (F12) y confirma la versión

---

## 🚨 Si el Cliente No Ve los Cambios

1. **Pídele que haga Ctrl+F5** (recarga dura sin caché)
2. Si aún no funciona, que limpie el caché del navegador:
   - **Chrome**: Ctrl+Shift+Del → Eliminar datos de exploración → Todos los tiempos → Eliminar
   - **Firefox**: Ctrl+Shift+Del → Rango de tiempo: Todo → Eliminar
   - **Safari**: Histórico → Borrar historial

3. Asegúrate de que el servidor está sirviendo los nuevos archivos
   - Sube los cambios correctamente a XAMPP
   - Verifica en `c:\xampp\htdocs\consentimientos\` que los archivos estén actualizados

---

## 📋 Ejemplo de Actualización Completa

**Situación**: Arreglaste la carga de razas dinámicas

1. Edita `app.js` con los cambios
2. Actualiza en `index.html`:
   - Comentario: `<!-- Versión del proyecto: 1.2.0 (2026-08-14) -->`
   - Meta: `<meta name="version" content="1.2.0">`
   - Badge: `<strong>v1.2.0</strong>`
   - Script: `const APP_VERSION = '1.2.0';` y `const BUILD_DATE = '2026-08-14';`
   - Cache bust: `?v=20260814-1`
3. Recarga tu navegador con **Ctrl+F5**
4. Verifica que veas `v1.2.0` en la esquina superior derecha
5. Abre consola (F12) y confirma la versión
6. Comparte con el cliente o dile que limpie caché

---

## 💡 Consejo para Diagnóstico

Si la lista de razas no carga dinámicamente:
1. Abre F12 → Console
2. Busca mensajes de error en rojo
3. Abre F12 → Network
4. Recarga la página
5. Busca las llamadas a `app.js` y a cualquier API de razas
6. Verifica si hay errores 404 o de conexión

El badge de versión te dirá si tiene la versión correcta; si la tiene pero aún no funciona, es un problema de lógica en el código, no de caché.

---

**Última actualización**: 2026-08-13 | Versión actual: 1.1.0
