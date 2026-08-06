# Plan de trabajo: backend en Laravel API REST para persistencia de consentimientos

## Objetivo
Implementar una solución de persistencia para los consentimientos del formulario mediante un backend en Laravel que exponga una API REST, con MySQL como motor de base de datos, para que:
- los datos queden almacenados de forma durable,
- se puedan consultar desde la misma red local,
- y al diligenciar un nuevo consentimiento se pueda precargar automáticamente al ingresar la cédula.

## Contexto del problema
El proyecto ya está desplegado localmente en XAMPP y se accede desde una tablet. La información actual no es suficientemente persistente ni reutilizable para futuras funcionalidades como:
- consultar clientes anteriores,
- reutilizar datos ya registrados,
- evitar volver a diligenciar todo el formulario,
- y mejorar la experiencia operativa en tienda.

Como ya tienes experiencia en Laravel, conviene aprovechar esa base para construir un backend API REST que pueda evolucionar hacia una arquitectura más moderna y preparar el camino para migrar el frontend a Angular en el futuro.

## Alcance del feature
Se implementará una solución inicial con:
- un backend en Laravel,
- una API REST para operaciones CRUD sobre consentimientos,
- una base de datos MySQL,
- y lógica de consulta y precarga por cédula desde el formulario.

## Requisitos funcionales
1. Agregar el campo de cédula al formulario.
2. Colocar la cédula en una posición prioritaria del formulario, al inicio.
3. Crear un backend en Laravel con endpoints para consultar, crear y actualizar consentimientos.
4. Al salir del campo de cédula, consultar si existe un registro previo.
5. Si existe un registro, precargar el formulario con esa información.
6. Permitir editar y actualizar los datos cuando sea necesario.
7. Guardar la firma, si es posible, como base64 o como archivo asociado al registro.
8. Asegurar que la información quede disponible aunque se recargue la página o se cierre el navegador.

## Diseño propuesto
### Arquitectura sugerida
- Frontend actual: HTML + JavaScript.
- Backend: Laravel API REST.
- Base de datos: MySQL.
- Comunicación: solicitudes HTTP JSON desde el frontend al backend.

### Estructura de datos sugerida
Se creará una tabla principal llamada consentimientos con campos como:
- id
- cedula
- fecha
- hora
- precio
- nombre_mascota
- raza
- edad
- telefono
- nombre_dueno
- domicilio
- correo
- enfermedades
- observaciones
- antecedentes
- firma
- created_at
- updated_at

### Flujo de funcionamiento
1. El usuario escribe la cédula.
2. Al salir del campo, el frontend hace una petición al endpoint de búsqueda por cédula.
3. Laravel consulta la base de datos.
4. Si existe un registro, devuelve los datos y el formulario se precarga.
5. Si no existe, el formulario queda preparado para crear un registro nuevo.
6. Al guardar o actualizar, el formulario envía los datos al endpoint correspondiente y Laravel los persiste.

## Plan de implementación
### Fase 1: Preparación del entorno Laravel
- Crear un proyecto Laravel nuevo o integrar una estructura base en un subdirectorio del proyecto.
- Configurar la conexión a MySQL desde el archivo de entorno.
- Verificar que el entorno local pueda correr con XAMPP.

### Fase 2: Diseño de la base de datos
- Crear la tabla consentimientos.
- Definir tipos de datos apropiados para cada campo.
- Agregar un índice en cédula para búsquedas rápidas.
- Considerar una restricción de unicidad si se desea evitar duplicados por cédula.

### Fase 3: Implementación del backend
- Crear un modelo Consentimiento.
- Crear un controlador para operaciones de consulta, creación y actualización.
- Definir rutas en Laravel para endpoints tipo:
  - GET /api/consentimientos/{cedula}
  - POST /api/consentimientos
  - PUT /api/consentimientos/{id}

### Fase 4: Preparación del formulario
- Agregar el campo de cédula al HTML.
- Colocarlo al inicio del formulario.
- Ajustar el flujo para que al perder el foco se dispare la búsqueda.

### Fase 5: Integración frontend-backend
- Implementar JavaScript para:
  - capturar el evento de salida del foco del campo de cédula,
  - hacer la petición a la API,
  - recibir los datos y precargarlos en el formulario,
  - y guardar o actualizar cuando el usuario envíe el formulario.

### Fase 6: Persistencia de la firma
- Definir si la firma se almacenará como:
  - base64 en texto,
  - o como archivo asociado al registro.
- Para la primera fase, lo más práctico es guardarla como texto base64 en la tabla.

### Fase 7: Validación funcional
Probar los siguientes flujos:
1. Crear un nuevo consentimiento mediante la API.
2. Consultar el registro por cédula y verificar que se precargue.
3. Actualizar algunos campos y comprobar que se preserven los demás.
4. Verificar que el frontend consume correctamente la API.
5. Confirmar que los datos quedan realmente en MySQL.

## Recomendación de implementación inicial
Para evitar un cambio demasiado grande, la implementación debe hacerse en este orden:
1. Crear la base de datos y la tabla.
2. Implementar el backend Laravel con los endpoints básicos.
3. Integrar la búsqueda por cédula en el formulario.
4. Luego mejorar la experiencia de edición, firma y validaciones.

## Criterios de aceptación
- El usuario puede ingresar una cédula y al salir del campo se consulta la API.
- Si el registro existe, el formulario se precarga con los datos guardados.
- Si no existe, se puede crear un nuevo registro.
- Los datos se guardan de forma persistente en MySQL.
- La arquitectura queda preparada para futuras mejoras y para migrar el frontend a Angular.

## Notas futuras
Una vez validada esta solución, se puede avanzar hacia:
- autenticación y autorización,
- separación de módulos por dominio,
- y una migración progresiva del frontend hacia Angular o una SPA moderna.
