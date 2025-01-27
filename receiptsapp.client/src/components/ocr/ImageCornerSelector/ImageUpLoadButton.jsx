import React from "react";
import { Button } from "@mui/material";

export default function ImageUploadButton({ onImageSelected }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageSelected(file);
        }
    };

    return (
        <Button variant="contained" component="label">
            Choose File
            <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
            />
        </Button>
    );
}