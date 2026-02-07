function toggleOtherBreed() {
    const select = document.getElementById("petBreed");
    const otherInput = document.getElementById("otherBreedInput");

    if (select.value === "Otro") {
        otherInput.style.display = "block";
        otherInput.required = true;
    } else {
        otherInput.style.display = "none";
        otherInput.required = false;
    }
}