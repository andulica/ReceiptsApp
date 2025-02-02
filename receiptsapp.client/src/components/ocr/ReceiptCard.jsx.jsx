import React from "react";

function ReceiptCard({ receipt }) {
    const { id, supplier, purchaseDateTime } = receipt;

    const imageUrl = `/api/Receipt/${id}/image`;

    return (
        <div style={{ border: "1px solid #ccc", padding: 8, width: 250 }}>
            <p><strong>Supplier:</strong> {supplier || "Unknown Supplier"}</p>
            <p><strong>Date:</strong> {new Date(purchaseDateTime).toLocaleString()}</p>
            <img
                src={imageUrl}
                alt="Receipt"
                style={{ maxWidth: "100%", height: "auto", display: "block", marginTop: 8 }}
            />
        </div>
    );
}

export default ReceiptCard;