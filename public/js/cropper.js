let cropper = null;
window.newImages = [];
window.croppedImageBlob = null;

document.addEventListener("DOMContentLoaded", function () {

    const categoryInput = document.getElementById("categoryImage");
    const productInput = document.getElementById("productImage");

    const cropModal = document.getElementById("cropModal");
    const cropImage = document.getElementById("cropImage");
    const cropBtn = document.getElementById("cropBtn");
    const closeBtn = document.getElementById("closeCropModal");

    const dropZone = document.getElementById("dropZone");
    const previewContainer = document.getElementById("previewContainer");

    let mode = null; // "category" or "product"

    function openCrop(file, type) {

        const reader = new FileReader();

        reader.onload = function (e) {

            cropImage.src = e.target.result;
            cropModal.style.display = "flex";

            if (cropper) cropper.destroy();

            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1
            });

            mode = type;
        };

        reader.readAsDataURL(file);
    }

    // CATEGORY
    if (categoryInput) {
        categoryInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (!file) return;
            openCrop(file, "category");
        });
    }

    // PRODUCT (single image per selection)
    if (productInput) {

        productInput.addEventListener("change", function (e) {

            const file = e.target.files[0];
            if (!file) return;

            openCrop(file, "product");

            productInput.value = "";
        });
    }
    

    cropBtn.addEventListener("click", function () {

        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 500,
            height: 500
        });

        canvas.toBlob(function (blob) {

            if (mode === "category") {

                window.croppedImageBlob = blob;

                dropZone.innerHTML = "";

                const img = document.createElement("img");
                img.src = URL.createObjectURL(blob);
                img.classList.add("uploaded-preview");

                dropZone.appendChild(img);
            }

            if (mode === "product") {

                window.newImages.push(blob);

                const previewItem = document.createElement("div");
                previewItem.classList.add("preview-item");

                const img = document.createElement("img");
                img.src = URL.createObjectURL(blob);

                const removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.classList.add("remove-btn");
                removeBtn.innerHTML = "&times;";

                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);

                previewContainer.appendChild(previewItem);

                if ((window.newImages.length + window.existingImages.length) >= 5) {
                    dropZone.style.display = "none";
                }
            }

            cropModal.style.display = "none";
            cropper.destroy();

        }, "image/jpeg");
    });

    closeBtn.addEventListener("click", function () {
        cropModal.style.display = "none";
        if (cropper) cropper.destroy();
    });

    previewContainer.addEventListener("click", function (e) {

    const btn = e.target.closest(".remove-btn");
    if (!btn) return;

    const previewItem = btn.closest(".preview-item");
    const publicId = previewItem.dataset.publicid;

    // If existing image
    if (publicId) {

        window.existingImages = window.existingImages.filter(
            img => img.publicId !== publicId
        );

    } else {

        const index = Array.from(previewContainer.children)
            .indexOf(previewItem);

        window.newImages.splice(index - window.existingImages.length, 1);
    }

    previewItem.remove();

    if (previewContainer.children.length < 5) {
        dropZone.style.display = "flex";
    }
});

});