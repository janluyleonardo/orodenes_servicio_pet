const ownerNameInput = document.getElementById('ownerName');
    const ownerNameDisplay = document.getElementById('ownerNameDisplay');
    const pdfOwnerNameDisplay = document.getElementById('pdfOwnerNameDisplay');

    ownerNameInput.addEventListener('input', function() {
        console.log("registra cambio en el input");
        ownerNameDisplay.textContent = ownerNameInput.value;
        pdfOwnerNameDisplay.textContent = ownerNameInput.value;
    });