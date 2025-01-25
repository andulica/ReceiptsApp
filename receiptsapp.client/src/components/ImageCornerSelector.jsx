import React, { useRef, useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
} from "@mui/material";

const ImageCornerSelector = ({ onOcrResult, onNotification }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [corners, setCorners] = useState([]);

    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);

    const displayWidth = 500;
    const displayHeight = 600;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
                setImageSrc(event.target.result);
                setCorners([]);
            };
        };
        reader.readAsDataURL(file);
    };

    
     //* Converts mouse event (x,y) into *original-image* coordinates,
     //* based on the scaled canvas size (displayWidth x displayHeight).
     
    const getOriginalCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = imageDimensions.width / displayWidth;
        const scaleY = imageDimensions.height / displayHeight;
        // (clientX - rect.left) is the click inside the canvas in display space.
        // Multiply by scale to map back to original image space.
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        return { x, y };
    };

    const handleCanvasClick = (e) => {
        if (corners.length >= 4) return;

        const { x, y } = getOriginalCoords(e);
        setCorners((prev) => [...prev, { x, y }]);
    };

    const handleMouseDown = (e) => {
        const { x, y } = getOriginalCoords(e);

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

        const { x, y } = getOriginalCoords(e);

        setCorners((prevCorners) =>
            prevCorners.map((corner, idx) =>
                idx === dragIndex ? { x, y } : corner
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
        if (!imageSrc) {
            onNotification("Please upload an image first.", "error");
            return;
        }
        if (corners.length !== 4) {
            onNotification("Please select exactly 4 corners.", "error");
            return;
        }

        // to do : need to implement a cropping logic for user in the case where he sets the corners in a different order
        const [c1, c2, c3, c4] = corners;


        const xs = corners.map((c) => c.x);
        const ys = corners.map((c) => c.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = cropWidth;
        offscreenCanvas.height = cropHeight;
        const offscreenCtx = offscreenCanvas.getContext("2d");

        const img = new Image();
        img.src = imageSrc;
        img.onload = async () => {
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

            offscreenCanvas.toBlob(async (blob) => {
                if (!blob) {
                    onNotification("Failed to create blob from crop.", "error");
                    return;
                }

                const formData = new FormData();
                formData.append("File", blob, "cropped_image.jpg");

                try {
                    const response = await fetch("https://localhost:7051/api/Receipt", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorMessage = await response.text();
                        console.error("Server response error:", errorMessage);
                        throw new Error("Failed to process the image.");
                    }

                    const result = await response.json();
                    onNotification("OCR request successful!", "success");

                    if (result && result.ocrText) {
                        onOcrResult(result.ocrText);
                    } else {
                        onNotification("No OCR text found in the response.", "info");
                    }
                } catch (error) {
                    console.error("Error in handleSubmit:", error);
                    onNotification(error.message, "error");
                }
            }, "image/jpeg");
        };
    };

    /**
     * Draw the scaled image and corners on the canvas.
     */
    useEffect(() => {
        if (!imageSrc) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            if (corners.length > 0) {
                ctx.beginPath();
                const scaleX = displayWidth / imageDimensions.width;
                const scaleY = displayHeight / imageDimensions.height;

                const firstCorner = corners[0];
                ctx.moveTo(firstCorner.x * scaleX, firstCorner.y * scaleY);

                for (let i = 1; i < corners.length; i++) {
                    const corner = corners[i];
                    ctx.lineTo(corner.x * scaleX, corner.y * scaleY);
                }
                if (corners.length === 4) {
                    ctx.lineTo(firstCorner.x * scaleX, firstCorner.y * scaleY);
                }
                ctx.stroke();
            }

            corners.forEach((corner) => {
                const scaleX = displayWidth / imageDimensions.width;
                const scaleY = displayHeight / imageDimensions.height;

                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.arc(
                    corner.x * scaleX,
                    corner.y * scaleY,
                    5, // radius
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        };
    }, [imageSrc, corners, imageDimensions]);

    return (
        <Card sx={{ maxWidth: 650, margin: "20px auto" }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    1. Upload Image
                </Typography>
                <Button
                    variant="contained"
                    component="label"
                    sx={{ mb: 2 }}
                >
                    Choose File
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                    />
                </Button>

                {imageSrc && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            2. Select 4 Corners
                        </Typography>
                        <Box
                            sx={{
                                position: "relative",
                                display: "inline-block",
                                border: "1px solid #ccc",
                                cursor: "crosshair",
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                            <canvas
                                ref={canvasRef}
                                width={displayWidth}
                                height={displayHeight}
                                onClick={handleCanvasClick}
                            />
                        </Box>

                    </>
                )}
            </CardContent>

            {imageSrc && (
                <CardActions sx={{ justifyContent: "center", mb: 2 }}>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleClearCorners}
                    >
                        Clear Corners
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Submit (Crop & OCR)
                    </Button>
                </CardActions>
            )}
        </Card>
    );
};

export default ImageCornerSelector;