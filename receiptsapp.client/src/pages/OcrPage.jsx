import React from "react";
import ImageCornerSelector from "../components/ocr/ImageCornerSelector/ImageCornerSelector";

function OcrPage() {
    return (
        <div style={{ padding: 20 }}>
            <h2>OCR Page</h2>
            <ImageCornerSelector
                onOcrResult={(text) => console.log("OCR text:", text)}
                onNotification={(msg, type) => console.log(msg, type)}
            />
        </div>
    );
}

export default OcrPage;