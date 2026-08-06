// Inicializar canvas para firma
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = touch?.clientX ?? event.clientX;
    const clientY = touch?.clientY ?? event.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function setSubmitMessage(message, type = 'error') {
    const messageContainer = document.getElementById('submitMessage');
    const footer = document.getElementById('appMessageFooter');
    const footerMessage = document.getElementById('footerMessageText');
    const footerButton = document.getElementById('clearFooterMessage');
    if (!messageContainer || !footer || !footerMessage || !footerButton) return;

    const isError = type !== 'success';
    messageContainer.textContent = message;
    messageContainer.style.display = message ? 'block' : 'none';
    messageContainer.classList.toggle('text-danger', isError);
    messageContainer.classList.toggle('text-success', !isError);

    if (!message) {
        footer.classList.add('d-none');
        footerMessage.textContent = '';
        return;
    }

    footerMessage.textContent = message;
    footer.classList.remove('d-none');
    footer.classList.toggle('bg-danger', isError);
    footer.classList.toggle('bg-success', !isError);
    footer.classList.toggle('text-white', true);
}

function clearSubmitMessage() {
    setSubmitMessage('');
}

function setSubmitLoading(isLoading) {
    const submitButton = document.getElementById('submitButton');
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Guardando...' : 'Generar PDF';
}

function normalizeTimeValue(value) {
    if (!value) return value;
    return value.length >= 5 ? value.slice(0, 5) : value;
}

function normalizePhoneValue(value) {
    if (!value) return '';
    return String(value).replace(/[^0-9]/g, '').trim();
}

// Configurar tamaño del canvas
function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Eventos para dibujar firma (Pointer Events para soporte táctil y ratón)
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// Funciones para dibujar
function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const point = getCanvasPoint(e);

    if (e.pointerId !== undefined && canvas.setPointerCapture) {
        canvas.setPointerCapture(e.pointerId);
    }

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#564ca0';
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getCanvasPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
}

function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    if (e?.pointerId !== undefined && canvas.releasePointerCapture) {
        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (error) {
            // Ignorar si el pointer no fue capturado
        }
    }
    ctx.beginPath();
}

// Limpiar firma
document.getElementById('clearSignature').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
});

// --- PERSISTENCIA DE DATOS Y UTILIDADES ---

// Guardar datos en localStorage
function saveFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('#consentForm input, #consentForm select, #consentForm textarea');
    inputs.forEach(input => {
        // Ignorar el input de archivo o botón si hubiera
        if (input.type === 'file' || input.type === 'submit' || input.type === 'button') return;
        
        if (input.type === 'checkbox' || input.type === 'radio') {
            formData[input.id] = input.checked;
        } else {
            formData[input.id] = input.value;
        }
    });
    localStorage.setItem('petShopFormData', JSON.stringify(formData));
}

const API_BASE_PATH = '/consentimientos-back/public/api/consentimientos';
const API_BASE_URL = `${window.location.origin}${API_BASE_PATH}`;

// IDs de todos los campos que se bloquean hasta completar la búsqueda por teléfono
const LOCKABLE_FIELDS = [
    'ownerName', 'petName', 'petBreed', 'otherBreedInput', 'petAge',
    'ownerAddress', 'ownerEmail', 'petDiseases', 'petObservations',
    'anxiety', 'aggressiveness', 'precio', 'clearSignature', 'submitButton', 'clearFormBtn',
    'setCurrentTimeBtn'
];

function setFieldsLocked(locked) {
    LOCKABLE_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = locked;
    });
    // El canvas de firma también se bloquea visualmente
    if (canvas) {
        canvas.style.pointerEvents = locked ? 'none' : 'auto';
        canvas.style.opacity = locked ? '0.4' : '1';
    }
}

function setPhoneLoading(isLoading) {
    const phoneInput = document.getElementById('ownerPhone');
    const statusEl = document.getElementById('telefonoStatus');
    if (!phoneInput) return;

    if (isLoading) {
        phoneInput.disabled = true;
        if (statusEl) {
            statusEl.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Buscando...';
            statusEl.classList.remove('text-danger', 'text-success');
            statusEl.classList.add('text-secondary');
            statusEl.style.display = 'block';
        }
    } else {
        phoneInput.disabled = false;
    }
}

async function fetchConsentimientoByTelefono(telefono) {
    if (!telefono) return null;

    try {
        const endpoint = `${API_BASE_URL}/telefono/${encodeURIComponent(telefono)}`;
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            console.error('Backend error fetching consentimiento by telefono:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        // La API retorna un array; tomamos el primer elemento
        return Array.isArray(data) ? (data[0] ?? null) : data;
    } catch (error) {
        console.error('Error fetching consentimiento by telefono:', error);
        return null;
    }
}

function populateFormFromConsentimiento(data) {
    if (!data) return;

    const fieldMap = {
        cedula: 'cedula',
        fecha: 'fecha',
        precio: 'precio',
        nombre_mascota: 'petName',
        raza: 'petBreed',
        otro_raza: 'otherBreedInput',
        edad: 'petAge',
        // 'telefono' se omite: el campo ya tiene el valor que escribió el usuario
        // y rellenarlo programáticamente dispararía el listener que re-bloquea el formulario
        nombre_dueno: 'ownerName',
        domicilio: 'ownerAddress',
        correo: 'ownerEmail',
        enfermedades: 'petDiseases',
        observaciones: 'petObservations'
    };

    Object.entries(fieldMap).forEach(([apiKey, inputId]) => {
        const input = document.getElementById(inputId);
        if (input && data[apiKey] !== undefined && data[apiKey] !== null) {
            input.value = data[apiKey];
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('change'));
        }
    });

    if (data.raza === 'Otro' && data.otro_raza) {
        const otherInput = document.getElementById('otherBreedInput');
        otherInput.style.display = 'block';
        otherInput.value = data.otro_raza;
        otherInput.required = true;
    }

    if (data.firma && typeof data.firma === 'string' && data.firma.startsWith('data:image/')) {
        // 1. Cargar en el img oculto del PDF preview
        const signatureImg = document.getElementById('pdfSignature');
        if (signatureImg) {
            signatureImg.src = data.firma;
        }

        // 2. Pintar la firma guardada en el canvas visible para que el usuario
        //    la vea y quede incluida correctamente al generar el PDF
        const img = new Image();
        img.onload = () => {
            resizeCanvas();
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
        };
        img.src = data.firma;
    }
}

function setTelefonoStatus(message, isError = true) {
    const status = document.getElementById('telefonoStatus');
    if (!status) return;
    status.textContent = message || '';
    status.style.display = message ? 'block' : 'none';
    status.classList.toggle('text-danger', isError);
    status.classList.toggle('text-success', !isError);
}

function attachTelefonoLookup() {
    const phoneInput = document.getElementById('ownerPhone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', () => {
        setTelefonoStatus('');
        // Vuelve a bloquear si el usuario modifica el teléfono después de una búsqueda
        setFieldsLocked(true);
    });

    phoneInput.addEventListener('blur', async (e) => {
        const telefono = e.target.value.trim();
        if (!telefono) {
            setTelefonoStatus('');
            setFieldsLocked(true);
            return;
        }

        setPhoneLoading(true);
        setFieldsLocked(true);

        const record = await fetchConsentimientoByTelefono(telefono);

        setPhoneLoading(false);
        setFieldsLocked(false);

        if (record) {
            populateFormFromConsentimiento(record);
            setCurrentDateTime();
            setTelefonoStatus('✓ Datos cargados del registro anterior.', false);
        } else {
            setTelefonoStatus('Sin registro previo. Complete los campos manualmente.');
        }
    });
}

// Cargar datos de localStorage
function loadFormData() {
    const savedData = localStorage.getItem('petShopFormData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            for (const id in formData) {
                const input = document.getElementById(id);
                if (input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = formData[id];
                    } else {
                        input.value = formData[id];
                    }
                    // Disparar eventos para actualizar UI dependiente
                    input.dispatchEvent(new Event('change'));
                    input.dispatchEvent(new Event('input'));
                }
            }
        } catch (e) {
            console.error("Error cargando datos:", e);
        }
    } else {
        // Si no hay datos, establecer fecha/hora actual por defecto
        setDefaultDateTime();
    }
}

function setDefaultDateTime() {
    const now = new Date();
    const dateInput = document.getElementById('fecha');
    const timeInput = document.getElementById('hora');
    
    // Formato YYYY-MM-DD
    if (dateInput && !dateInput.value) {
        dateInput.value = now.toISOString().split('T')[0];
    }
    
    // Formato HH:MM
    if (timeInput && !timeInput.value) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
}

function setCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeInput = document.getElementById('hora');
    if (timeInput) {
        timeInput.value = `${hours}:${minutes}`;
    }
}

function setCurrentDateTime() {
    const now = new Date();
    const dateInput = document.getElementById('fecha');
    const timeInput = document.getElementById('hora');

    if (dateInput) {
        dateInput.value = now.toISOString().split('T')[0];
    }
    if (timeInput) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
}

// Función para limpiar todo (Reset)
function resetForm() {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos del formulario?')) {
        document.getElementById('consentForm').reset();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        setDefaultDateTime();
        setTelefonoStatus('');
        setFieldsLocked(true);  // Volver a bloquear campos al limpiar

        // Limpiar inputs que no son del form directamente si es necesario o resetear estado visual
        const otherInput = document.getElementById("otherBreedInput");
        if(otherInput) otherInput.style.display = "none";
    }
}

// Inicializar listeners
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateTime();
    setFieldsLocked(true);  // Bloquear todo excepto teléfono al iniciar
    attachTelefonoLookup();

    const setTimeBtn = document.getElementById('setCurrentTimeBtn');
    if (setTimeBtn) {
        setTimeBtn.addEventListener('click', setCurrentTime);
    }

    // Botón de limpiar formulario
    const clearBtn = document.getElementById('clearFormBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', resetForm);
    }
});


// --- GENERACIÓN DE PDF ---
function buildConsentimientoPayload() {
    const precioInput = document.querySelector('input[aria-label="Amount (to the nearest dollar)"]');
    const precioRaw = precioInput ? precioInput.value.trim() : '';
    const precioSanitizado = precioRaw.replace(/[^0-9.,]/g, '').trim();
    const antecedentesLista = [];

    if (document.getElementById('anxiety')?.checked) antecedentesLista.push('Ansiedad');
    if (document.getElementById('aggressiveness')?.checked) antecedentesLista.push('Agresividad');
    const safeVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return '';
        if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
        return (el.value || '').toString();
    };

    const cedulaVal = safeVal('cedula');
    const petBreedVal = safeVal('petBreed');
    const otherBreedVal = petBreedVal === 'Otro' ? safeVal('otherBreedInput') : '';

    return {
        cedula: (cedulaVal || '').toString().trim(),
        fecha: safeVal('fecha'),
        hora: safeVal('hora'),
        precio: precioSanitizado,
        nombre_mascota: safeVal('petName'),
        raza: petBreedVal,
        otro_raza: otherBreedVal,
        edad: safeVal('petAge'),
        telefono: safeVal('ownerPhone'),
        nombre_dueno: safeVal('ownerName'),
        domicilio: safeVal('ownerAddress'),
        correo: safeVal('ownerEmail'),
        enfermedades: safeVal('petDiseases'),
        observaciones: safeVal('petObservations'),
        antecedentes: antecedentesLista.join(', '),
        ansiedad: document.getElementById('anxiety')?.checked ?? false,
        agresividad: document.getElementById('aggressiveness')?.checked ?? false,
        firma: canvas.toDataURL('image/png')
    };
}

async function saveConsentimiento(data) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            cache: 'no-store',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch (jsonError) {
                errorBody = await response.text();
            }

            console.error('Error guardando consentimiento:', response.status, response.statusText, errorBody);

            let validationMessage = '';
            if (typeof errorBody === 'object' && errorBody !== null) {
                if (errorBody.message) {
                    validationMessage = errorBody.message;
                }
                if (errorBody.errors) {
                    const fieldErrors = Object.values(errorBody.errors).flat();
                    if (fieldErrors.length > 0) {
                        validationMessage = fieldErrors.join(' ');
                    }
                }
                if (!validationMessage) {
                    validationMessage = JSON.stringify(errorBody);
                }
            } else {
                validationMessage = String(errorBody);
            }

            setSubmitMessage(validationMessage || 'Error guardando el consentimiento.', 'error');
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error guardando consentimiento:', error);
        setSubmitMessage('Error guardando el consentimiento. Revisa la consola para más detalles.', 'error');
        return null;
    }
}

function fillPdfContent(data) {
    const precioInput = document.querySelector('input[aria-label="Amount (to the nearest dollar)"]');
    document.getElementById('pdfCedula').textContent = data.cedula || '';
    document.getElementById('pdfFecha').textContent = data.fecha || '';
    document.getElementById('pdfHora').textContent = data.hora || '';
    document.getElementById('pdfPrecio').textContent = data.precio || (precioInput ? precioInput.value : '');
    document.getElementById('pdfPetName').textContent = data.nombre_mascota || '';
    document.getElementById('pdfPetBreed').textContent = data.raza === 'Otro' ? data.otro_raza || 'Otro' : data.raza || '';
    document.getElementById('pdfPetAge').textContent = data.edad || '';
    document.getElementById('pdfPetPhone').textContent = data.telefono || '';
    document.getElementById('pdfOwnerName').textContent = data.nombre_dueno || '';
    document.getElementById('pdfOwnerAddress').textContent = data.domicilio || '';
    document.getElementById('pdfOwnerEmail').textContent = data.correo || '';
    document.getElementById('pdfOwnerNameDisplay').textContent = data.nombre_dueno || '';

    const signatureImg = document.getElementById('pdfSignature');
    if (signatureImg && data.firma && data.firma.startsWith('data:image/')) {
        signatureImg.src = data.firma;
    }
}

function showSuccess(message) {
    setSubmitMessage(message, 'success');
}

function waitForImageLoad(img) {
    return new Promise(resolve => {
        if (!img) {
            resolve();
            return;
        }
        if (img.complete && img.naturalWidth !== 0) {
            resolve();
            return;
        }
        img.onload = () => resolve();
        img.onerror = () => resolve();
    });
}

function sanitizePdfFileName(value) {
    return String(value || '')
        .trim()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
}

function getConsentimientoPdfFileName(data) {
    const parts = [
        sanitizePdfFileName(data.cedula || document.getElementById('cedula')?.value || ''),
        sanitizePdfFileName(data.nombre_mascota || document.getElementById('petName')?.value || ''),
        sanitizePdfFileName(data.nombre_dueno || document.getElementById('ownerName')?.value || '')
    ].filter(Boolean);

    if (parts.length === 0) {
        return 'consentimiento.pdf';
    }

    return `consentimiento_${parts.join('_')}.pdf`;
}

document.getElementById('consentForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    clearSubmitMessage();
    setSubmitLoading(true);

    let payload;
    try {
        payload = buildConsentimientoPayload();
        payload.hora = normalizeTimeValue(payload.hora);

        const savedRecord = await saveConsentimiento(payload);
        if (!savedRecord) {
            return;
        }

        showSuccess('Consentimiento guardado correctamente.');
        fillPdfContent(payload);

        const pdfContent = document.getElementById('pdfContent');
        if (pdfContent) pdfContent.style.display = 'block';
        const signatureImg = document.getElementById('pdfSignature');

        await waitForImageLoad(signatureImg);

        try {
            const canvasResult = await html2canvas(pdfContent, { scale: 2, logging: false, useCORS: true });
            const imgData = canvasResult.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [216, 356] // Oficio
            });
            
            const imgWidth = 216;
            const imgHeight = (canvasResult.height * imgWidth) / canvasResult.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            const fileName = getConsentimientoPdfFileName(payload);
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generando PDF:', error);
            setSubmitMessage('Ocurrió un error al generar el PDF.', 'error');
        } finally {
            const pdfContent = document.getElementById('pdfContent');
            if (pdfContent) pdfContent.style.display = 'none';
        }

    } catch (err) {
        console.error('Error en el proceso de guardado/generación:', err);
        setSubmitMessage('Ocurrió un error. Revisa la consola para más detalles.', 'error');
    } finally {
        setSubmitLoading(false);
    }
});

const footerClearBtn = document.getElementById('clearFooterMessage');
if (footerClearBtn) {
    footerClearBtn.addEventListener('click', clearSubmitMessage);
}
