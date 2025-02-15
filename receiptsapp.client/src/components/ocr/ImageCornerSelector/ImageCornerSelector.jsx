import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, CircularProgress } from "@mui/material";
import ImageUploadButton from "./ImageUploadButton";
import CornerCanvas from "./CornerCanvas";
import { useCornerSelector } from "./useCornerSelector";
import { cropAndOcr } from "../../../services/ocrService";

const ImageCornerSelector = ({ onOcrResult, onNotification }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const displayWidth = 500;
    const displayHeight = 600;

    const {
        canvasRef,
        corners,
        setCorners,
        handleCanvasClick,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        clearCorners,
    } = useCornerSelector(imageDimensions, displayWidth, displayHeight);

    const handleImageSelected = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
                setImageSrc(event.target.result);
                setCorners([]);
                setMessage("");
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!imageSrc) {
            setMessage("Please upload an image first.");
            return;
        }
        if (corners.length !== 4) {
            setMessage("Please select exactly 4 corners.");
            return;
        }

        setLoading(true);
        try {
            await cropAndOcr({
                imageSrc,
                corners,
                onNotification,
                onOcrResult,
            });
            setMessage("Image uploaded successfully!");
        } catch (err) {
            console.error(err);
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ maxWidth: 650, margin: "20px auto" }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>1. Upload Image</Typography>
                <ImageUploadButton onImageSelected={handleImageSelected} />

                {imageSrc && (
                    <>
                        <Typography variant="h6" gutterBottom>2. Select 4 Corners</Typography>
                        <Box
                            sx={{
                                position: "relative",
                                display: "inline-block",
                                border: "1px solid #ccc",
                            }}
                        >
                            <CornerCanvas
                                imageSrc={imageSrc}
                                corners={corners}
                                imageDimensions={imageDimensions}
                                displayWidth={displayWidth}
                                displayHeight={displayHeight}
                                canvasRef={canvasRef}
                                onCanvasClick={handleCanvasClick}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            />
                        </Box>
                    </>
                )}
                {message && <Typography variant="body1" color="error">{message}</Typography>}
                {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
            </CardContent>

            {imageSrc && (
                <CardActions sx={{ justifyContent: "center", mb: 2 }}>
                    <Button variant="outlined" color="warning" onClick={clearCorners}>
                        Clear Corners
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit (Crop & OCR)
                    </Button>
                </CardActions>
            )}
        </Card>
    );
};

export default ImageCornerSelector;