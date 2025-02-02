import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const OCRResultDisplay = ({ open, onClose, ocrText }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Extracted Text
                </Typography>
                <Typography
                    variant="body1"
                    component="pre"
                    sx={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: "#f5f5f5",
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        minHeight: 100,
                    }}
                >
                    {ocrText || "No OCR text available"}
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onClose}
                    sx={{ mt: 2 }}
                >
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default OCRResultDisplay;