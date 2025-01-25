import React from "react";
import { Box, Typography, Avatar, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const TopBar = () => {
    return (
        <Box
            sx={{
                height: 60,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                px: 2,
                justifyContent: "space-between",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#1f2d2c",
                    borderRadius: 2,
                    p: "0 8px",
                }}
            >
                <SearchIcon sx={{ color: "text.secondary" }} />
                <TextField
                    variant="standard"
                    placeholder="Search payment"
                    InputProps={{ disableUnderline: true }}
                    sx={{ ml: 1, color: "text.secondary" }}
                />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1" color="text.primary">
                    Hi Stefan!
                </Typography>
                <Avatar alt="Stefan" src="https://i.pravatar.cc/40?img=3" />
            </Box>
        </Box>
    );
};

export default TopBar;