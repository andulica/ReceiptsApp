import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import {
    Dashboard as DashboardIcon,
    Camera as CameraIcon,
    BarChart as BarChartIcon,
} from "@mui/icons-material";

export default function SidebarNav() {
    return (
        <Box
            sx={{
                width: 250,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                minHeight: "calc(100vh - 64px)",
            }}
        >
            <List>
                <ListItemButton>
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <CameraIcon />
                    </ListItemIcon>
                    <ListItemText primary="Receipts" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <BarChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton>
            </List>
        </Box>
    );
}