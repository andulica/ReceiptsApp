import React, { useState } from 'react';
import axios from 'axios';
import ImageCornerSelector from './ImageCornerSelector';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [showCornerSelector, setShowCornerSelector] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setOcrText(''); // Reset OCR text when a new file is uploaded
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append('File', selectedFile);

        try {
            // Adjust the URL to your ASP.NET Core backend endpoint
            const response = await axios.post('https://localhost:7051/api/Receipt', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setOcrText(response.data.ocrText); // Assuming the response has `ocrText`
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("An error occurred during the upload process.");
        }
    };

    const handleShowCornerSelector = () => {
        if (!selectedFile) {
            alert("Please upload an image first to proceed.");
            return;
        }
        setShowCornerSelector(true);
    };

    return (
        <div style={{ margin: '20px' }}>
            <h1>Receipt Scanner MVP</h1>

            {/* Image Upload Section */}
            <div>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload & OCR</button>
                <button onClick={handleShowCornerSelector}>Set Corners</button>
            </div>

            {/* OCR Text Output */}
            {ocrText && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Extracted Text</h2>
                    <pre>{ocrText}</pre>
                </div>
            )}

            {/* Corner Selector Section */}
            {showCornerSelector && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Image Corner Selector</h2>
                    <ImageCornerSelector apiEndpoint="http://localhost:5000/process_receipt" />
                </div>
            )}
        </div>
    );
}

export default App;
