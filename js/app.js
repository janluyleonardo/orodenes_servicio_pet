// Inicializar canvas para firma
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

// Configurar tamaño del canvas
function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    
    // Mantener la firma si existe (opcional, pero al redimensionar se borra el canvas)
    // Para simplificar, limpiamos, pero en una app real podríamos guardar/restaurar
    ctx.fillStyle = '#f8f9fa00'; // Transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Eventos para dibujar firma (Pointer Events para soporte táctil y ratón)
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);

// Funciones para dibujar
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Prevenir scroll en táctil
    
    // Obtener coordenadas relativas al canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#564ca0';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
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

// Función para limpiar todo (Reset)
function resetForm() {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos del formulario?')) {
        localStorage.removeItem('petShopFormData');
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
    loadFormData();
    
    // Autosave en inputs
    const inputs = document.querySelectorAll('#consentForm input, #consentForm select, #consentForm textarea');
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
        input.addEventListener('change', saveFormData);
    });

    // Botón de limpiar formulario
    const clearBtn = document.getElementById('clearFormBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', resetForm);
    }
});


// --- GENERACIÓN DE PDF ---
document.getElementById('consentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Actualizar el HTML oculto con los datos del formulario
    document.getElementById('pdfFecha').textContent = document.getElementById('fecha').value;
    document.getElementById('pdfHora').textContent = document.getElementById('hora').value;
    // Seleccionar el precio correctamente (usando el aria-label que tiene)
    const precioInput = document.querySelector('input[aria-label="Amount (to the nearest dollar)"]');
    document.getElementById('pdfPrecio').textContent = precioInput ? precioInput.value : '';
    
    document.getElementById('pdfPetName').textContent = document.getElementById('petName').value;
    document.getElementById('pdfPetBreed').textContent = document.getElementById('petBreed').value;
    document.getElementById('pdfPetAge').textContent = document.getElementById('petAge').value;
    document.getElementById('pdfPetPhone').textContent = document.getElementById('ownerPhone').value;
    document.getElementById('pdfOwnerName').textContent = document.getElementById('ownerName').value;
    document.getElementById('pdfOwnerAddress').textContent = document.getElementById('ownerAddress').value;
    document.getElementById('pdfOwnerEmail').textContent = document.getElementById('ownerEmail').value;
    
    document.getElementById('pdfOwnerNameDisplay').textContent = document.getElementById('ownerName').value;

    // 2. Asignar la firma
    const signatureImg = document.getElementById('pdfSignature');
    if (signatureImg) {
        signatureImg.src = canvas.toDataURL('image/png');
    }

    // 3. Mostrar temporalmente el contenido oculto
    const pdfContent = document.getElementById('pdfContent');
    pdfContent.style.display = 'block';
    
    // 4. Usar html2canvas para capturar el contenido
    html2canvas(pdfContent, { scale: 2, logging: false, useCORS: true }).then(canvasResult => {
        const imgData = canvasResult.toDataURL('image/png');

        // 5. Crear el PDF con jsPDF
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
        
        // 6. Ocultar nuevamente el contenido
        pdfContent.style.display = 'none';
        
        // Opcional: ofrecer limpiar el formulario después de guardar
        // if(confirm("PDF generado. ¿Deseas limpiar el formulario?")) { resetForm(); }
    });
});
