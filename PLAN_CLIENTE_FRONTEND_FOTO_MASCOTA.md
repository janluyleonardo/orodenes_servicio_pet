# Plan de trabajo para cliente - Frontend

## Objetivo
Permitir que desde la tablet se capture la foto de la mascota y que esta imagen quede visible en el formulario y en el consentimiento informado para identificar al animal al momento de precargar los datos.

## Alcance del ajuste
Se realizará la integración del flujo de captura y visualización de la foto en la interfaz actual del consentimiento, reutilizando la misma lógica de manejo de imágenes que ya se utiliza para la firma del dueño.

## Funcionalidades esperadas
- Captura de foto desde la tablet o dispositivo móvil.
- Vista previa inmediata de la imagen antes de guardar.
- Registro de la foto junto con el resto de los datos del consentimiento.
- Carga automática de la foto al buscar por teléfono.
- Inclusión de la imagen dentro del consentimiento informado en PDF.

## Flujo propuesto
1. El operador selecciona o toma la foto de la mascota.
2. La imagen se convierte a un formato compatible con la app.
3. La foto se integra al payload del consentimiento.
4. Al buscar un registro previo por teléfono, la foto se muestra nuevamente.
5. El PDF generado incluye la imagen para identificar al animal.

## Estimación de esfuerzo
- Tiempo estimado: 1 a 2 días hábiles.
- Complejidad: media.
- Motivo: ya existe un patrón funcional con la firma digital que puede reutilizarse.

## Riesgos y consideraciones
- Tamaño de la imagen puede afectar el almacenamiento.
- Compatibilidad de la cámara según navegador y dispositivo.
- Ajuste del diseño del PDF para no saturar el documento.
- Validación de la experiencia en tablet real.

## Criterios de aprobación
Este ajuste se considera aprobado cuando se cumplan estas condiciones:
- La foto puede tomarse desde la tablet sin errores.
- Se muestra una vista previa correcta antes de guardar.
- La foto se almacena junto con el consentimiento.
- Al buscar por teléfono, la imagen vuelve a aparecer.
- El PDF incluye la foto de la mascota en el documento final.

## Aprobación del cliente
Antes de iniciar la implementación, solicitamos la aprobación del siguiente alcance:

- [ ] Sí, autoriza este ajuste en frontend.
- [ ] Sí, autoriza la estimación de 1 a 2 días hábiles.
- [ ] Sí, desea continuar con la validación en tablet antes de cerrar el trabajo.

Nombre del cliente: ________________________________
Fecha: ________________________________
Firma: ________________________________

## Observación
La implementación se recomienda en una rama de prueba o de desarrollo antes de pasar a producción para validar la experiencia en la tablet del cliente.
