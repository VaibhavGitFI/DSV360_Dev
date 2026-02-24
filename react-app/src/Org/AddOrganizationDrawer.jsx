import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import BusinessIcon from "@mui/icons-material/Business";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonAddIcon from "@mui/icons-material/PersonAdd"; 
import axios from "axios";

// Constants for organization selection
const NEW_ORG_OPTION = "NEW_ORGANIZATION";
const SELECT_ORG_PLACEHOLDER = "";

const AddAdminDrawer = ({ open, onClose, onAdd, organizations }) => {
  // State for all form data
  const [formData, setFormData] = useState({
    adminFirstName: "", 
    adminLastName: "", 
    adminEmail: "",    
    selectedOrgId: SELECT_ORG_PLACEHOLDER, 
    // Organization fields
    orgName: "",        
    orgEmail: "",       
    colorCode: "",     
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isNewOrg = formData.selectedOrgId === NEW_ORG_OPTION;
  const isOrgSelected = formData.selectedOrgId && formData.selectedOrgId !== NEW_ORG_OPTION;

  // 🎯 EFFECT: Autofill fields when an existing organization is selected
  useEffect(() => {
    if (isOrgSelected) {
      // Find the selected organization using OrgID
      const selectedOrg = organizations.find(org => org.OrgID === formData.selectedOrgId);
      
      if (selectedOrg) {
        setFormData(prev => ({
          ...prev,
          orgName: selectedOrg.Org_Name || "",
          colorCode: selectedOrg.Org_Theme || "",
        }));
        // Use Org_Logo for preview
        setLogoPreview(selectedOrg.Org_Logo || null); 
      }
    } else if (!isNewOrg) {
        // Clear org fields if switching to placeholder/empty state
        setFormData(prev => ({
            ...prev,
            orgName: "",
            colorCode: "",
            logo: null,
          }));
        setLogoPreview(null);
    }
  }, [formData.selectedOrgId, isOrgSelected, isNewOrg, organizations]);


  // --- Snackbar Handlers ---
  const handleAlert = (severity, message) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const SlideTransition = (props) => {
    return <Slide {...props} direction="down" />;
  };
  // -------------------------

  // --- Input Change Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOrgSelectionChange = (e) => {
    const orgId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      selectedOrgId: orgId,
    }));
    setErrors({}); // Clear validation errors on selection change
  };

  const handleLogoChange = (e) => {
    // Only allow logo change if creating a new organization
    if (!isNewOrg) return; 
    
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, logo: "Only image files are allowed" }));
        return;
      }
      setErrors((prev) => ({ ...prev, logo: "" }));
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    setLogoPreview(null);
  };
  // -------------------------

  // --- Validation and Submit ---
  const validate = () => {
    const newErrors = {};

    // Validate Admin fields
    if (!formData.adminFirstName.trim()) newErrors.adminFirstName = "Admin First Name is required";
    if (!formData.adminLastName.trim()) newErrors.adminLastName = "Admin Last Name is required"; 
    
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Enter a valid admin email address";
    }

    // Validate Organization selection
    if (!formData.selectedOrgId) {
      newErrors.selectedOrgId = "Please select an organization or choose to create a new one";
    }

    // Validate New Organization fields (Conditional: ONLY if creating new)
    if (isNewOrg) {
      if (!formData.orgName.trim()) newErrors.orgName = "Organization name is required";
      if (!formData.colorCode.trim()) newErrors.colorCode = "Color code is required";
      if (!formData.logo) newErrors.logo = "Logo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      selectedOrgId: SELECT_ORG_PLACEHOLDER,
      orgName: "",
      orgEmail: "",
      colorCode: "",
      logo: null,
    });
    setLogoPreview(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const dataPayload = {
      // Admin Fields
      admin_first_name: formData.adminFirstName,
      admin_last_name: formData.adminLastName, 
      admin_email: formData.adminEmail,
      org_is_new: isNewOrg, 
    };

    if (isNewOrg) {
      // New Organization Fields for creation
      dataPayload.org_name = formData.orgName;
      dataPayload.org_color = formData.colorCode;
    } else {
        // 🎯 Existing Organization ID sent as org_id
        dataPayload.org_id = formData.selectedOrgId;
    }

    const requestFormData = new FormData();
    // 1. Append JSON payload
    requestFormData.append("data", JSON.stringify(dataPayload));
    
    // 2. Only append logo if creating a new organization
    if (isNewOrg && formData.logo) {
      requestFormData.append("logo", formData.logo);
    }

    try {
      const response = await axios.post(
        "/server/time_entry_management_application_function/addAdmin",
        requestFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        handleAlert("success", isNewOrg ? "Organization and Admin Added successfully" : "Admin Added successfully");
  
  // This line correctly passes the new data back to the parent component's onAdd function.
      if (onAdd) onAdd(response.data.data); 
}

      resetForm();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error Adding Admin/Organization";
      handleAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };
  // -------------------------

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          sx={{
            width: 400,
            padding: 2,
            maxHeight: "90vh",
            overflowY: "auto",
            marginTop: "70px",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #1976d2,#1976d2)",
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <PersonAddIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New Admin
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={onClose}
                sx={{
                  color: "#fff",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Admin Fields */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
            Admin Details
          </Typography>
          <TextField
            label="Admin First Name"
            name="adminFirstName"
            fullWidth
            variant="outlined"
            value={formData.adminFirstName}
            onChange={handleInputChange}
            error={!!errors.adminFirstName}
            helperText={errors.adminFirstName}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Admin Last Name"
            name="adminLastName"
            fullWidth
            variant="outlined"
            value={formData.adminLastName}
            onChange={handleInputChange}
            error={!!errors.adminLastName}
            helperText={errors.adminLastName}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Admin Email"
            name="adminEmail"
            fullWidth
            variant="outlined"
            value={formData.adminEmail}
            onChange={handleInputChange}
            error={!!errors.adminEmail}
            helperText={errors.adminEmail}
            sx={{ marginBottom: 3 }}
          />

          {/* Organization Selection Dropdown */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Organization
          </Typography>
          <FormControl fullWidth error={!!errors.selectedOrgId} sx={{ marginBottom: 3 }}>
            <InputLabel id="org-select-label">Select or Create Organization</InputLabel>
            <Select
              labelId="org-select-label"
              id="org-select"
              value={formData.selectedOrgId}
              label="Select or Create Organization"
              onChange={handleOrgSelectionChange}
              name="selectedOrgId"
            >
              <MenuItem value={NEW_ORG_OPTION}>
                <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>
                  <BusinessIcon sx={{ mr: 1 }} /> **Create New Organization**
                </Box>
              </MenuItem>
              <Divider />
              {/* 🎯 FIXED Dropdown Rendering */}
              {organizations.map((org) => (
                // console.log("hih",org)
                <MenuItem key={org.OrgID} value={org.OrgID}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img 
                            src={org.Org_Logo} 
                            alt={`${org.Org_Name} logo`} 
                            style={{ width: 24, height: 24, marginRight: 8, borderRadius: 4, objectFit: 'cover' }}
                        />
                        {org.Org_Name}
                    </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.selectedOrgId && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                {errors.selectedOrgId}
              </Typography>
            )}
          </FormControl>

          {/* New/Selected Organization Fields (Conditional) */}
          {(isNewOrg || isOrgSelected) && (
            <Box 
                sx={{ 
                    border: isNewOrg ? "1px dashed #ccc" : "1px solid #ddd", 
                    p: 2, 
                    borderRadius: 1, 
                    mb: 3,
                    opacity: isOrgSelected ? 0.7 : 1, // Visual cue for disabled fields
                }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: isNewOrg ? "primary.main" : "text.secondary" }}>
                {isNewOrg ? "New Organization Details" : "Selected Organization Details"}
              </Typography>
              
              {/* Organization Name Field (Disabled if existing org is selected) */}
              <TextField
                label="Organization Name"
                name="orgName"
                fullWidth
                variant="outlined"
                value={formData.orgName}
                onChange={handleInputChange}
                error={!!errors.orgName}
                helperText={errors.orgName}
                disabled={isOrgSelected} 
                sx={{ marginBottom: 2 }}
              />
              
              {/* Color Code Field (Disabled if existing org is selected) */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <TextField
                  label="Color Code"
                  name="colorCode"
                  variant="outlined"
                  value={formData.colorCode}
                  onChange={handleInputChange}
                  error={!!errors.colorCode}
                  helperText={errors.colorCode}
                  disabled={isOrgSelected} 
                  sx={{ width: "100%" }}
                />
                <input
                  type="color"
                  value={formData.colorCode || "#000000"} 
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "colorCode", value: e.target.value },
                    })
                  }
                  disabled={isOrgSelected} 
                  style={{
                    minWidth: 40,
                    height: 40,
                    border: "none",
                    cursor: isOrgSelected ? "default" : "pointer",
                    background: "transparent",
                  }}
                />
              </Box>

              {/* Logo Upload (Hidden/Disabled if existing org is selected) */}
              <Box sx={{ marginBottom: 2 }}>
                {isNewOrg && (
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFileIcon />}
                        sx={{ marginBottom: 1 }}
                    >
                        Upload Logo
                        <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                    </Button>
                )}
                
                {errors.logo && isNewOrg && (
                  <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
                    {errors.logo}
                  </Typography>
                )}
                
                {/* Displaying logo preview for both scenarios */}
                {(logoPreview) && (
                    <Box
                        sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1,
                            border: "1px solid #ccc",
                            borderRadius: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <img
                                src={logoPreview}
                                alt="Organization Logo"
                                style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                }}
                            />
                            {/* Display file name for new org, or 'Existing Logo' text for old org */}
                            <Typography variant="body2">{formData.logo?.name || (isOrgSelected ? "Existing Logo" : "")}</Typography>
                        </Box>
                        {isNewOrg && (
                            <IconButton color="error" onClick={handleRemoveLogo} size="small">
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || !formData.selectedOrgId}
              sx={{ width: 100, position: "relative" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Add Admin"}
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Snackbar is unchanged */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            "&.MuiAlert-filledSuccess": { backgroundColor: "#2ecc71" }, 
            "&.MuiAlert-filledError": { backgroundColor: "#f44336" },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddAdminDrawer;