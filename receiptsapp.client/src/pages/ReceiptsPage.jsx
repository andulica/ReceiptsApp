import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CardMedia,
    Grid,
    Button
} from "@mui/material";
import OCRResultDisplay from "../components/ocr/OCRResultDisplay";

function ReceiptsPage() {
    const [receipts, setReceipts] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [ocrTexts, setOcrTexts] = useState({});
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const res = await fetch("https://localhost:7051/api/Receipt", {
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to fetch receipts");

                const data = await res.json();
                console.log("Fetched receipts:", data);

                setReceipts(data);
                const urls = {};
                const ocrData = {};
                await Promise.all(
                    data.map(async (receipt) => {
                        try {
                            const imgUrl = await fetchImage(receipt.id);
                            urls[receipt.id] = imgUrl;
                            ocrData[receipt.id] = receipt.ocrText || "No OCR text available";
                        } catch (e) {
                            console.error(`Error fetching image for receipt ${receipt.id}`, e);
                        }
                    })
                );

                setImageUrls(urls);
                setOcrTexts(ocrData);
            } catch (error) {
                console.error("Error fetching receipts:", error);
            }
        };

        fetchReceipts();
    }, []);

    const fetchImage = async (receiptId) => {
        const response = await fetch(`https://localhost:7051/api/Receipt/${receiptId}/image`, {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch image");
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    };

    const handleOpenModal = (receiptId) => {
        setSelectedReceiptId(receiptId);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <div>
            <Grid container spacing={2}>
                {receipts.map((receipt) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={receipt.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">
                                    {receipt.supplier || "Unknown Supplier"}
                                </Typography>
                            </CardContent>
                            <CardMedia
                                component="img"
                                alt="Receipt"
                                image={imageUrls[receipt.id]}
                                sx={{ maxHeight: 300, objectFit: "contain" }}
                            />
                            <CardContent>
                                {/* See the Text Button */}
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleOpenModal(receipt.id)}
                                >
                                    See the Text
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* OCR Modal */}
            <OCRResultDisplay
                open={modalOpen}
                onClose={handleCloseModal}
                ocrText={selectedReceiptId ? ocrTexts[selectedReceiptId] : ""}
            />
        </div>
    );
}

export default ReceiptsPage;