const OCRResultDisplay = ({ ocrText, onClear }) => {
    if (!ocrText) return null;

    return (
        <div style={{ marginTop: "20px" }}>
            <h2>Extracted Text</h2>
            <pre style={{ border: "1px solid #ccc", padding: "10px" }}>
                {ocrText}
            </pre>
            <button style={{ marginTop: "10px" }} onClick={onClear}>
                Clear
            </button>
        </div>
    );
};

export default OCRResultDisplay;