import React from "react";
import { Box, List, ListItemButton, ListItemIcon } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";

const Sidebar = () => {
    return (
        <Box
            sx={{
                width: 80, 
                bgcolor: "background.paper",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 2,
            }}
        >
            <Box sx={{ mb: 2 }}>
                {/* TO DO: Logo for the app <img ... /> */}
            </Box>

            <List sx={{ flexGrow: 1 }}>
                <ListItemButton>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                </ListItemButton>
            </List>

            <Box sx={{ mb: 2 }}>
                <SettingsIcon />
            </Box>
        </Box>
    );
};

export default Sidebar;
