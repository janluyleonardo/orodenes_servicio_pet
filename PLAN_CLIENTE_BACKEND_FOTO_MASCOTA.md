# Plan de trabajo para cliente - Backend

## Objetivo
Adecuar el backend para guardar y devolver la foto de la mascota dentro del registro del consentimiento informado, para que pueda ser reutilizada desde la interfaz y mostrarse al precargar información por teléfono.

## Alcance del ajuste
Se modificarán los endpoints y la estructura de almacenamiento del consentimiento para aceptar la foto de la mascota y devolverla junto con el resto de los datos.

## Funcionalidades esperadas
- Aceptar la foto enviada desde el frontend.
- Guardar la información de la imagen dentro del registro del consentimiento.
- Mantener compatibilidad con registros sin foto.
- Devolver la foto cuando se consultan datos por teléfono.
- Evitar errores con formatos o tamaños inválidos.

## Opción recomendada
Para mantener la solución simple y segura en el proyecto actual, se recomienda guardar la foto como dato en formato compatible con la estructura actual, similar a la firma digital.

## Estimación de esfuerzo
- Tiempo estimado: 0.5 a 1 día hábil si se guarda como base64 o dato compatible con la estructura actual.
- Tiempo estimado: 1 a 2 días hábiles si se decide manejar archivos físicos en disco.
- Complejidad: media.

## Tareas principales
1. Revisar la estructura del almacenamiento del consentimiento.
2. Añadir un campo para la foto de la mascota.
3. Validar el formato y la integridad de la imagen entrante.
4. Ajustar el endpoint de creación para guardar la información.
5. Ajustar el endpoint de consulta por teléfono para devolver la foto.
6. Validar compatibilidad con registros antiguos.
7. Ejecutar pruebas de guardado, lectura y manejo de imágenes vacías o inválidas.

## Riesgos y consideraciones
- Campo de almacenamiento no suficiente si se usa un formato demasiado grande.
- Compatibilidad del dato recibido desde frontend.
- Problemas al consultar registros antiguos sin foto.
- Validación de entradas para evitar corrupción de datos.

## Criterios de aprobación
Este ajuste se considera aprobado cuando se cumplan estas condiciones:
- El backend acepta la foto de la mascota en el registro.
- La foto se guarda sin romper el flujo actual del consentimiento.
- La consulta por teléfono devuelve la foto cuando existe.
- Los registros antiguos siguen funcionando correctamente.
- La API responde de forma estable ante datos vacíos o inválidos.

## Aprobación del cliente
Antes de iniciar la implementación, solicitamos la aprobación del siguiente alcance:

- [ ] Sí, autoriza este ajuste en backend.
- [ ] Sí, acepta la estimación de 0.5 a 1 día hábil con almacenamiento compatible.
- [ ] Sí, desea continuar con la validación de la solución en entorno de prueba antes de producción.

Nombre del cliente: ________________________________
Fecha: ________________________________
Firma: ________________________________

## Observación
Se recomienda implementar esta parte junto con el frontend en una rama de prueba para validar la integración completa antes de llevarlo a producción.
