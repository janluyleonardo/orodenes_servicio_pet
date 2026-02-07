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
    ctx.fillStyle = '#f8f9fa';
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
    ctx.strokeStyle = '#000';
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
document.getElementById('consentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Capturar datos del formulario
    const petName = document.getElementById('petName').value;
    const petBreed = document.getElementById('petBreed').value;
    // ... (Captura todos los campos)

    // Convertir canvas a imagen
    const canvasImg = await html2canvas(canvas);
    const imgData = canvasImg.toDataURL('image/png');

    // Agregar contenido al PDF
    doc.text(`Nombre del perrito: ${petName}`, 10, 10);
    doc.text(`Raza: ${petBreed}`, 10, 20);
    // ... (Agrega todos los campos)

    // Agregar firma al PDF
    doc.addImage(imgData, 'PNG', 10, 100, 100, 50);

    // Descargar PDF
    doc.save('consentimiento_informado.pdf');
});
