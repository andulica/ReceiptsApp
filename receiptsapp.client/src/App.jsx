import { useState } from "react";
import Notification from "./components/Notification";
import OCRResultDisplay from "./components/OCRResultDisplay";
import ImageCornerSelector from "./components/ImageCornerSelector";

function App() {
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [ocrText, setOcrText] = useState("");

    const handleNotification = (message, type = "info") => {
        setNotification({ message, type });
    };

    const handleOcrResult = (text) => {
        setOcrText(text);
    };

    const clearOcrText = () => {
        setOcrText("");
    };

    return (
        <div style={{ margin: "20px" }}>
            <h1>Receipt Scanner MVP</h1>

            <Notification message={notification.message} type={notification.type} />

            <ImageCornerSelector
                onOcrResult={handleOcrResult}
                onNotification={handleNotification}
            />

            <OCRResultDisplay ocrText={ocrText} onClear={clearOcrText} />
        </div>
    );
}

export default App;