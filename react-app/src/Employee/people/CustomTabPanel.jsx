import React from "react";
import { Box } from "@mui/material";

const CustomTabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

export default CustomTabPanel;
