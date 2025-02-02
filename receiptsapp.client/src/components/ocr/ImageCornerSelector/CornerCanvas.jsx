/* eslint-disable react/prop-types */
import React, { useEffect } from "react";

function CornerCanvas({
    imageSrc,
    corners,
    imageDimensions,
    displayWidth,
    displayHeight,
    canvasRef,
    onCanvasClick,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}) {
    useEffect(() => {
        if (!imageSrc) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            // Clear
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            // Draw scaled image
            ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

            // Draw lines between corners
            if (corners.length > 0) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
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

                // Draw corner circles
                corners.forEach((corner) => {
                    ctx.fillStyle = "blue";
                    ctx.beginPath();
                    ctx.arc(
                        corner.x * scaleX,
                        corner.y * scaleY,
                        5,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                });
            }
        };
    }, [imageSrc, corners, imageDimensions, displayWidth, displayHeight, canvasRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{ cursor: "crosshair" }}
            onClick={onCanvasClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        />
    );
}

export default CornerCanvas;