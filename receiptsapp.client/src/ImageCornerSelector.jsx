import React, { useRef, useState, useEffect } from "react";

const ImageCornerSelector = ({ apiEndpoint }) => {
    const [image, setImage] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [corners, setCorners] = useState([]);
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    setImage(event.target.result);
                    setImageDimensions({ width: img.width, height: img.height });
                    setCorners([]); 
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCanvasClick = (e) => {
        if (corners.length >= 4) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) * imageDimensions.width) / canvas.width;
        const y = ((e.clientY - rect.top) * imageDimensions.height) / canvas.height;

        setCorners((prevCorners) => [...prevCorners, { x, y }]);
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) * imageDimensions.width) / canvas.width;
        const y = ((e.clientY - rect.top) * imageDimensions.height) / canvas.height;

        const index = corners.findIndex(
            (corner) => Math.hypot(corner.x - x, corner.y - y) < 10
        );

        if (index !== -1) {
            setIsDragging(true);
            setDragIndex(index);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) * imageDimensions.width) / canvas.width;
        const y = ((e.clientY - rect.top) * imageDimensions.height) / canvas.height;

        setCorners((prevCorners) =>
            prevCorners.map((corner, index) =>
                index === dragIndex ? { x, y } : corner
            )
        );
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragIndex(null);
    };

    const handleClearCorners = () => {
        setCorners([]);
    };

    const handleSubmit = async () => {
        if (!image || corners.length !== 4) {
            alert("Please upload an image and select exactly 4 corners.");
            return;
        }

        const canvas = canvasRef.current;

        // Sort corners (top-left, top-right, bottom-right, bottom-left)
        const [tl, tr, br, bl] = corners;

        const width = Math.hypot(tr.x - tl.x, tr.y - tl.y);
        const height = Math.hypot(bl.x - tl.x, bl.y - tl.y);

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const offscreenCtx = offscreenCanvas.getContext("2d");

        const img = new Image();
        img.src = image;

        img.onload = async () => {
            offscreenCtx.drawImage(
                canvas,
                tl.x,
                tl.y,
                width,
                height,
                0,
                0,
                width,
                height
            );

            offscreenCanvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append("image", blob, "cropped_image.jpg");

                try {
                    // Send the cropped image to the backend
                    const response = await fetch(apiEndpoint, {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorMessage = await response.text();
                        console.error("Error response from server:", errorMessage);
                        throw new Error("Failed to process the image.");
                    }

                    const processedBlob = await response.blob();
                    const processedUrl = URL.createObjectURL(processedBlob);

                    const link = document.createElement("a");
                    link.href = processedUrl;
                    link.download = "processed_image.jpg";
                    link.click();
                    URL.revokeObjectURL(processedUrl);
                } catch (error) {
                    console.error("Error in handleSubmit:", error);
                    alert(error.message);
                }
            }, "image/jpeg");
        };
    };

    useEffect(() => {
        if (image) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = image;

            img.onload = () => {
                // Set canvas size to match image dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // Draw lines between corners
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                if (corners.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(corners[0].x, corners[0].y);
                    for (let i = 1; i < corners.length; i++) {
                        ctx.lineTo(corners[i].x, corners[i].y);
                    }
                    if (corners.length === 4) {
                        ctx.lineTo(corners[0].x, corners[0].y); // Close the polygon
                    }
                    ctx.stroke();
                }

                // Draw corner points
                corners.forEach((corner) => {
                    ctx.fillStyle = "blue";
                    ctx.beginPath();
                    ctx.arc(corner.x, corner.y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                });
            };
        }
    }, [image, corners]);

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Image Corner Selector</h1>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {image && (
                <div
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        style={{ border: "1px solid black" }}
                        onClick={handleCanvasClick}
                    />
                </div>
            )}

            {image && (
                <div style={{ marginTop: "10px" }}>
                    <button onClick={handleClearCorners}>Clear Corners</button>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default ImageCornerSelector;