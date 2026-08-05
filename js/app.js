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

function setSubmitError(message) {
    const errorContainer = document.getElementById('submitError');
    if (!errorContainer) return;
    if (!message) {
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
        return;
    }
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}

function clearSubmitError() {
    setSubmitError('');
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

async function fetchConsentimientoByCedula(cedula) {
    if (!cedula) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(cedula)}`, {
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
            console.error('Backend error fetching consentimiento:', response.status, response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching consentimiento by cedula:', error);
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
        telefono: 'ownerPhone',
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
        const signatureImg = document.getElementById('pdfSignature');
        if (signatureImg) {
            signatureImg.src = data.firma;
        }
    }
}

function setCedulaStatus(message, isError = true) {
    const status = document.getElementById('cedulaStatus');
    if (!status) return;
    status.textContent = message || '';
    status.style.display = message ? 'block' : 'none';
    status.classList.toggle('text-danger', isError);
    status.classList.toggle('text-success', !isError);
}

function attachCedulaLookup() {
    const cedulaInput = document.getElementById('cedula');
    if (!cedulaInput) return;

    const clearStatus = () => setCedulaStatus('');
    cedulaInput.addEventListener('input', clearStatus);

    cedulaInput.addEventListener('blur', async (e) => {
        const cedula = e.target.value.trim();
        if (!cedula) {
            setCedulaStatus('');
            return;
        }

        const record = await fetchConsentimientoByCedula(cedula);
        if (record) {
            populateFormFromConsentimiento(record);
            setCurrentDateTime();
            // setCedulaStatus('Registro encontrado.', false);
        } else {
            setCedulaStatus('No existe un consentimiento registrado para esta cédula.');
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
        
        // Limpiar inputs que no son del form directamente si es necesario o resetear estado visual
        const otherInput = document.getElementById("otherBreedInput");
        if(otherInput) otherInput.style.display = "none";
    }
}

// Inicializar listeners
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateTime();
    attachCedulaLookup();

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

    return {
        cedula: document.getElementById('cedula').value.trim(),
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        precio: precioSanitizado,
        nombre_mascota: document.getElementById('petName').value,
        raza: document.getElementById('petBreed').value,
        otro_raza: document.getElementById('petBreed').value === 'Otro' ? document.getElementById('otherBreedInput').value : '',
        edad: document.getElementById('petAge').value,
        telefono: document.getElementById('ownerPhone').value,
        nombre_dueno: document.getElementById('ownerName').value,
        domicilio: document.getElementById('ownerAddress').value,
        correo: document.getElementById('ownerEmail').value,
        enfermedades: document.getElementById('petDiseases').value,
        observaciones: document.getElementById('petObservations').value,
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

            setSubmitError(validationMessage || 'Error guardando el consentimiento.');
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error guardando consentimiento:', error);
        setSubmitError('Error guardando el consentimiento. Revisa la consola para más detalles.');
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

document.getElementById('consentForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    clearSubmitError();
    setSubmitLoading(true);

    const payload = buildConsentimientoPayload();
    payload.hora = normalizeTimeValue(payload.hora);

    const savedRecord = await saveConsentimiento(payload);
    setSubmitLoading(false);

    if (!savedRecord) {
        return;
    }

    setSubmitError('Consentimiento guardado correctamente.');
    fillPdfContent(payload);

    const pdfContent = document.getElementById('pdfContent');
    pdfContent.style.display = 'block';
    const signatureImg = document.getElementById('pdfSignature');

    await waitForImageLoad(signatureImg);

    html2canvas(pdfContent, { scale: 2, logging: false, useCORS: true }).then(canvasResult => {
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
        pdf.save('consentimiento_informado.pdf');
        
        pdfContent.style.display = 'none';
    }).catch(error => {
        console.error('Error generando PDF:', error);
        setSubmitError('Ocurrió un error al generar el PDF.');
        pdfContent.style.display = 'none';
    });
});
