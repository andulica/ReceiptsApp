import React, { useEffect, useState } from "react";

export default function StepDescriptions({ step }) {
    const stepTexts = [
        "Hoold your receipt so your phone's camera can see it clearly.",
        " Align the camera to capture the entire receipt in good lighting.",
        " Take the picture, upload it, and let us do the magic!",
        " That’s it! It’s that easy to track your expenses with ReceiptX."
    ];

    const [typedText, setTypedText] = useState("");

    useEffect(() => {
        if (step < 1 || step > stepTexts.length) {
            setTypedText("");
            return;
        }

        const fullText = stepTexts[step - 1];
        setTypedText("");
        let index = 0;

        const timer = setInterval(() => {
            if (index < fullText.length) {
                setTypedText((prev) => prev + fullText.charAt(index));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 50); // 50ms per character → ~20 chars/sec

        // Cleanup if step changes mid-typing
        return () => clearInterval(timer);
    }, [step]);

    const gradientHeadingStyle = {
        fontSize: "2rem",
        fontWeight: "bold",
        background: "linear-gradient(to right, #6E8E59 0%, #6E8E59 50%, #6E8E59 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "0.5rem",
    };

    const gradientTextStyle = {
        fontSize: "1.6rem",
        lineHeight: "1.5",
        background: "linear-gradient(to right, #6E8E59 0%, #6E8E59 50%, #6E8E59 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: 0,
    };

    const shouldShowHeading = step >= 1 && step <= 3;


    return (
        <div>
            {shouldShowHeading && (
                <h3 style={gradientHeadingStyle}>Step {step}</h3>
            )}
            <p style={gradientTextStyle}>
                {typedText}
            </p>
        </div>
    );
}