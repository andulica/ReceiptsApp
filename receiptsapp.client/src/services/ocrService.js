export async function cropAndOcr({ imageSrc, corners, endpointUrl = "https://localhost:7051/api/Receipt" }) {
    if (!imageSrc) {
        throw new Error("No image source provided.");
    }
    if (!corners || corners.length !== 4) {
        throw new Error("Please provide exactly 4 corners.");
    }

    // 1. Compute bounding box
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    // 2. Draw to an offscreen canvas
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            // Create an offscreen canvas
            const offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = cropWidth;
            offscreenCanvas.height = cropHeight;

            const offscreenCtx = offscreenCanvas.getContext("2d");
            offscreenCtx.drawImage(
                img,
                minX,
                minY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            // Convert canvas to blob
            offscreenCanvas.toBlob(async (blob) => {
                if (!blob) {
                    return reject(new Error("Failed to create blob from crop."));
                }

                // 3. Send the cropped image to the backend
                const formData = new FormData();
                formData.append("File", blob, "cropped_image.jpg");

                try {
                    const response = await fetch(endpointUrl, {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorMessage = await response.text();
                        console.error("Server response error:", errorMessage);
                        return reject(new Error("Failed to process the image."));
                    }

                    const result = await response.json();
                    // result.ocrText is expected from your backend
                    resolve(result);
                } catch (error) {
                    console.error("Error in cropAndOcr:", error);
                    reject(error);
                }
            }, "image/jpeg");
        };

        img.onerror = (err) => {
            reject(new Error("Failed to load the image: " + err.message));
        };
    });
}