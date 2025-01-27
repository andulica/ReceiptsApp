import { useRef, useState } from "react";

export function useCornerSelector(imageDimensions, displayWidth, displayHeight) {
    const canvasRef = useRef(null);
    const [corners, setCorners] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);

    const getOriginalCoords = (e) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = imageDimensions.width / displayWidth;
        const scaleY = imageDimensions.height / displayHeight;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
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

    const clearCorners = () => {
        setCorners([]);
    };

    return {
        canvasRef,
        corners,
        setCorners,
        handleCanvasClick,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        clearCorners,
    };
}