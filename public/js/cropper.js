let cropper = null;
let croppedBlob = null;
window.croppedImageBlob = null;

document.addEventListener("DOMContentLoaded", function () {

    const imageInput = document.getElementById("categoryImage");
    const cropModal = document.getElementById("cropModal");
    const cropImage = document.getElementById("cropImage");
    const cropBtn = document.getElementById("cropBtn");
    const closeBtn = document.getElementById("closeCropModal");
    const dropZone = document.getElementById("dropZone");

    if (!imageInput) return;

    imageInput.addEventListener("change", function (e) {

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (event) {

            cropImage.src = event.target.result;

            cropModal.style.display = "flex";

            if (cropper) cropper.destroy();

            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1
            });
        };

        reader.readAsDataURL(file);
    });

    cropBtn.addEventListener("click", function () {

        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 500,
            height: 500
        });

        canvas.toBlob(function (blob) {

            croppedBlob = blob;
            window.croppedImageBlob = blob;

            // Remove previous preview if exists
                const oldPreview = dropZone.querySelector(".uploaded-preview");
                if (oldPreview) oldPreview.remove();

                // Hide upload UI
                dropZone.querySelector(".upload-icon").style.display = "none";
                dropZone.querySelector(".upload-text").style.display = "none";
                dropZone.querySelector(".upload-support").style.display = "none";
                dropZone.querySelector(".btn-browse-files").style.display = "none";

                // Create new image element
                const img = document.createElement("img");
                img.src = URL.createObjectURL(blob);
                img.classList.add("uploaded-preview");

                dropZone.appendChild(img);

            cropModal.style.display = "none";

            cropper.destroy();
        }, "image/jpeg");
    });

    closeBtn.addEventListener("click", function () {
        cropModal.style.display = "none";
        if (cropper) cropper.destroy();
    });

});