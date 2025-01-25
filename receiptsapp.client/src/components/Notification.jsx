import React from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const Notification = ({ message, type }) => {
    if (!message) return null;

    let severity;
    if (type === "success") severity = "success";
    else if (type === "error") severity = "error";
    else if (type === "info") severity = "info";
    else severity = "warning"; // fallback

    return (
        <Stack sx={{ width: "100%", mb: 2 }} spacing={2}>
            <Alert severity={severity}>
                {message}
            </Alert>
        </Stack>
    );
};

export default Notification;