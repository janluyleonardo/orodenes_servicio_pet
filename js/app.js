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
    ctx.fillStyle = '#f8f9fa00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Eventos para dibujar firma
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Funciones para dibujar
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#564ca0';
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

// Limpiar firma
document.getElementById('clearSignature').addEventListener('click', () => {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Generar PDF
document.getElementById('consentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Actualizar el HTML oculto con los datos del formulario
    document.getElementById('pdfFecha').textContent = document.getElementById('fecha').value;
    document.getElementById('pdfHora').textContent = document.getElementById('hora').value;
    document.getElementById('pdfPrecio').textContent = document.querySelector('input[aria-label="Amount (to the nearest dollar)"]').value;
    document.getElementById('pdfPetName').textContent = document.getElementById('petName').value;
    document.getElementById('pdfPetBreed').textContent = document.getElementById('petBreed').value;
    document.getElementById('pdfPetAge').textContent = document.getElementById('petAge').value;
    document.getElementById('pdfPetPhone').textContent = document.getElementById('ownerPhone').value;
    document.getElementById('pdfOwnerName').textContent = document.getElementById('ownerName').value;
    document.getElementById('pdfOwnerAddress').textContent = document.getElementById('ownerAddress').value;
    document.getElementById('pdfOwnerEmail').textContent = document.getElementById('ownerEmail').value;
    // Asigna TODOS los campos necesarios
    console.log(document.getElementById('pdfPrecio').textContent);

    // 2. Asignar la firma
    const canvas = document.getElementById('signatureCanvas');
    document.getElementById('pdfSignature').src = canvas.toDataURL('image/png');

    // 3. Mostrar temporalmente el contenido oculto
    const pdfContent = document.getElementById('pdfContent');
    pdfContent.style.display = 'block';
    
    // 5. Usar html2canvas para capturar el contenido
    html2canvas(document.getElementById('pdfContent'), { scale: 2, logging: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        // 5. Crear el PDF con jsPDF
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait', // o 'landscape' si prefieres horizontal
            unit: 'mm',
            format: [216, 356] // Tamaño oficio en milímetros (ancho x alto)
        });
        const imgWidth = 216; // Ancho de la página A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('consentimiento_informado.pdf');
        
        // 6. Ocultar nuevamente el contenido
        pdfContent.style.display = 'none';
    });
});

