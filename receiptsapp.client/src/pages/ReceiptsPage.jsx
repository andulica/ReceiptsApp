import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CardMedia,
    Grid,
    Button,
    Toolbar
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
                const res = await fetch("https://localhost:7051/api/receipts", {
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
        const response = await fetch(`https://localhost:7051/api/receipts/${receiptId}/image`, {
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

    const handleDelete = async (receiptId) => {
        // Optional: Confirm user wants to delete
        if (!window.confirm("Are you sure you want to delete this receipt?")) {
            return;
        }

        try {
            const response = await fetch(
                `https://localhost:7051/api/receipts/${receiptId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete receipt.");
            }

            // If the delete was successful, remove the receipt from local state
            setReceipts((prevReceipts) =>
                prevReceipts.filter((r) => r.id !== receiptId)
            );

            // Also remove the corresponding image URL from state (optional)
            setImageUrls((prevUrls) => {
                const { [receiptId]: _, ...others } = prevUrls;
                return others;
            });

            // Same for OCR text if needed
            setOcrTexts((prevTexts) => {
                const { [receiptId]: _, ...others } = prevTexts;
                return others;
            });
        } catch (error) {
            console.error("Delete error:", error);
            // Optionally show an error message to the user
        }
    };

    return (
        <div>
            <Toolbar />
            <Toolbar />
            <Toolbar />
            <Grid container spacing={4}>
                {receipts.map((receipt) => (
                    <Grid item lg={2} key={receipt.id}>
                        <Card sx={{
                            width: 250,
                            height: 250,
                            objectFit: "cover",
                        }}      >
                            <CardContent>
                                <Typography variant="subtitle1">
                                    {receipt.supplier || "Unknown Supplier"}
                                </Typography>
                            </CardContent>
                            <CardMedia
                                component="img"
                                alt="Receipt"
                                image={imageUrls[receipt.id]}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    objectFit: "cover",
                                }}                            />
                            <CardContent>
                                {/* See the Text Button */}
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleOpenModal(receipt.id)}
                                >
                                    See the Text
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDelete(receipt.id)}
                                >
                                    Delete
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