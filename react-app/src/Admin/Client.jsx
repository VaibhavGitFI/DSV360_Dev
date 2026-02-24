import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  TablePagination,
  Modal,
  MenuItem,
  Drawer,
  Skeleton,
  Avatar,
  CardMedia,
  Paper,
  alpha,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CardHeader,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Slide from "@mui/material/Slide";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import DeleteIcon from "@mui/icons-material/Delete";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import axios from "axios";
import Person4Icon from "@mui/icons-material/Person4";
import { useDispatch, useSelector } from "react-redux";
import { fetchClientData } from "../redux/Client/clientSlice";
import { styled } from "@mui/system";
import { clientActions } from "../redux/Client/clientSlice";
import BusinessIcon from "@mui/icons-material/Business";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";

const CardActions = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "10px",
});

export const Client = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [newClient, setNewClient] = useState({
    client_name: "",
    website: "",
    status: "",
    client_type: "",
    email: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [contactDetails, setContactDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientToDelete, setclientToDelete] = useState(null);
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.clientReducer);
  const [isLoading, setisLoading] = useState(false);
  const [open, setOpen] = useState(false);

    const [addLoading, setAddLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const[deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });



  useEffect(() => {
    const fetchData = async () => {
      setisLoading(true);
      await dispatch(fetchClientData());
      setisLoading(false);
    };

    if (!Array.isArray(data) || data.length === 0) {
      fetchData();
    }
 
  }, []);

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleOpenDrawer = async (event, ROWID) => {
  //  console.log("event", event.target);
    setLoading(true);
    setOpen(true);

    try {
      const response = await axios.get(
        `/server/time_entry_management_application_function/contact/${ROWID}`
      );

      setContactDetails(response.data.data);
    } catch (err) {
      console.error("Error fetching contact details:", err);
      setContactDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    setContactDetails([]);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };
  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  const handleAddClient = async () => {
    try {
      setAddLoading(true)
      const response = await axios.post(
        "/server/time_entry_management_application_function/createClient",
        {
          Org_Name: newClient.client_name,
          Status: newClient.status,
          Email: newClient.email, // Already comma-separated string of names
          Org_Img: newClient.imageUrl, // Ensure it's a comma-separated string of IDs
          Website: newClient.website,
          Org_Type: newClient.client_type,
        }
      );
      if (response.status === 201) {
        handleAlert("success", "Client  Added and confirmed.");
        dispatch(clientActions.addClientData(response.data.data));
      }
    } catch (error) {
      console.error("Failed to add project:", error);
    }finally{
      setAddLoading(false);
      toggleDrawer(false);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddClient(newClient);
      // toggleDrawer(false);
    }
  };
  const handleCancel = () => {
    setNewClient({
      name: "",
      status: "",
      startDate: "",
      endDate: "",
      description: "",
      assignedTo: "",
    });
    toggleDrawer(false);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredClient = data.filter(
    (stf) =>
      // return(
      stf.Org_Name &&
      stf.Org_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedClient = filteredClient.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!newClient.client_name)
      newErrors.client_name = "client name is required";
    if (!newClient.website) newErrors.website = "website  is required";

    if (!newClient.status) newErrors.status = "Status is required";
    if (!newClient.client_type)
      newErrors.client_type = "Organization type  is required";
    if (!newClient.email) newErrors.email = "email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  const handleEdit = (data) => {
    setCurrentClient(data);

    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    setCurrentClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClient = async () => {
    const ROWID = currentClient.ROWID;
  setUpdateLoading(true);
    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function//updateClient/${ROWID}`,
      {
        Org_Name: currentClient.Org_Name,
        Status: currentClient.Status,
        Email: currentClient.Email,
        Website: currentClient.Website,

        Org_Type: currentClient.Org_Type,
      }
    );

    if (updateResponse.status === 200) {
      dispatch(clientActions.updateClientData(currentClient));
      setUpdateLoading(false);
      handleAlert("success", "Issue updated and confirmed.");
    }
    setCurrentClient("");
    setEditModalOpen(false);
  };
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  
  };
  const handleDeleteClick = (data) => {
    setclientToDelete(data);
   // console.log(clientToDelete);
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
       const id = clientToDelete.ROWID;
      const response = await axios.delete(
        `/server/time_entry_management_application_function/org/${id}`
      );
         if(response.data.success === false ){
          handleAlert("error",response.data.message);
          setDeleteConfirmOpen(false);
        }
       if(response.status === 200 && response.data.success){
      handleAlert("success", "Issue  Deleted and confirmed.");
      dispatch(clientActions.deleteClientData(clientToDelete.ROWID));
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
       }
    } catch (error) {
      handleAlert("error", "something went wrong");
      console.error("Error deleting issue:", error);
    }
  };

  return (
    <>
      <Box sx={{ padding: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.08
            )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Left Side: Avatar + Typography */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 50,
                height: 50,
              }}
            >
              <ApartmentIcon sx={{ color: "#fff" }} fontSize="large" />
            </Avatar>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Accounts
            </Typography>
          </Box>

          {/* Right Side: Search Bar + Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", md: "auto" },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              label="Search Accounts"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{
                width: { xs: "100%", sm: "60%", md: "250px" },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => toggleDrawer(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Add Accounts
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3} justifyContent="center">
          {isLoading ? (
            [...Array(6)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 4,
                    overflow: "hidden",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        gap: 2,
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={60}
                        height={60}
                        sx={{ flexShrink: 0 }}
                      />
                      <Box sx={{ width: "100%" }}>
                        <Skeleton variant="text" width="70%" height={28} />
                        <Skeleton variant="text" width="50%" height={22} />
                      </Box>
                    </Box>
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="rectangular" height={36} width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : filteredClient.length === 0 ? (
            <Grid size={12}>
              <Person4Icon
                sx={{ display: "block", margin: "0 auto", fontSize: 100 }}
              />
              <Typography variant="h6" color="text.secondary" align="center">
                No Such Client Found
              </Typography>
            </Grid>
          ) : (
            paginatedClient.map((data, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                {/* Your original card here */}
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 4,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: 8,
                    },
                    overflow: "hidden",
                    backgroundColor: theme.palette.background.paper,
                  }}
                  onClick={(e) => handleOpenDrawer(e, data.ROWID)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                      gap: 2,
                    }}
                  >
                    <Avatar
                      alt={data.Org_Name}
                      src="https://w7.pngwing.com/pngs/309/823/png-transparent-business-service-system-industry-information-business-blue-text-service.png"
                      sx={{
                        width: 60,
                        height: 60,
                        border: `2px solid ${theme.palette.primary.main}`,
                        boxShadow: 1,
                      }}
                    />
                    <Typography
                      variant="h5"
                      component="div"
                      fontWeight="bold"
                      sx={{ fontSize: "1.5rem" }}
                    >
                      {data.Org_Name}
                    </Typography>
                  </Box>

                  <CardContent sx={{ pt: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Type:</strong> {data.Org_Type}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Status:</strong> {data.Status}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Email:</strong> {data.Email}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Website:</strong>{" "}
                      {data.Website ? (
                        <a
                          href={`https://${data.Website.replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: theme.palette.primary.main }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {data.Website}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>ROWID:</strong>{" "}
                      {"C" + data.ROWID.substr(data.ROWID.length - 4)}
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ ml: "auto" }}>
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click
                          handleDeleteClick(data);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click
                          handleEdit(data);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <TablePagination
            component="div"
            rowsPerPageOptions={[6, 12, 24]}
            count={filteredClient.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => toggleDrawer(false)}
        >
          <Box
            sx={{
              width: 400,
              padding: 2,
              maxHeight: "90vh",
              overflowY: "auto",
              marginTop: "70px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                px: 2,
                py: 1.5,
                borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
                boxShadow: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", color: "#fff" }}
              >
                <AccountCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Add New Account
                </Typography>
              </Box>
              <Tooltip title="Close">
                <IconButton
                  onClick={() => toggleDrawer(false)}
                  sx={{
                    color: "#fff",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.2)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              label="Client Name"
              name="client_name"
              fullWidth
              variant="outlined"
              value={newClient.client_name}
              onChange={handleInputChange}
              error={!!errors.client_name}
              helperText={errors.client_name}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="website"
              name="website"
              fullWidth
              variant="outlined"
              value={newClient.website}
              onChange={handleInputChange}
              error={!!errors.website}
              helperText={errors.website}
              sx={{ marginBottom: 2 }}
            />

            <TextField
              label="Status"
              name="status"
              fullWidth
              variant="outlined"
              select
              value={newClient.status}
              onChange={handleInputChange}
              error={!!errors.status}
              helperText={errors.status}
              sx={{ marginBottom: 2 }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="DeActivate">DeActivate</MenuItem>
              
            </TextField>

            <TextField
              label="Organization Type"
              name="client_type"
              fullWidth
              variant="outlined"
              select
              value={newClient.client_type}
              onChange={handleInputChange}
              error={!!errors.client_type}
              helperText={errors.client_type}
              sx={{ marginBottom: 2 }}
            >
              <MenuItem value="Non-Profit">Non-Profit</MenuItem>
              <MenuItem value="Private Company">Private Company</MenuItem>
              <MenuItem value="Public Company">Public Company</MenuItem>
              <MenuItem value="Government Organization">
                Government Organization
              </MenuItem>
              <MenuItem value="Startup">Startup</MenuItem>
            </TextField>

            <TextField
              label="email"
              name="email"
              fullWidth
              variant="outlined"
              value={newClient.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ marginBottom: 2 }}
            />

           

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ width: 100 }}
                 disabled={addLoading}
              >
                {addLoading ? (
                                               <CircularProgress size={24} color="inherit" />
                                             ) : (
                                               "Add"
                                             )}
              </Button>
              <Button variant="outlined" color="error" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Drawer>
        <Modal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          aria-labelledby="edit-task-modal"
          aria-describedby="modal-for-editing-task"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: theme.palette.background.paper,
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography id="edit-task-modal" variant="h6" sx={{ mb: 2 }}>
              Edit Client Details
            </Typography>

            {currentClient && (
              <>
                <TextField
                  label="Client Name"
                  name="Org_Name"
                  fullWidth
                  value={currentClient.Org_Name}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="website"
                  name="Website"
                  fullWidth
                  value={currentClient.Website}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Status"
                  name="Status"
                  fullWidth
                  variant="outlined"
                  select
                  value={currentClient.Status}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                >
                   <MenuItem value="Active">Active</MenuItem>
                   <MenuItem value="DeActivate">DeActivate</MenuItem>
                </TextField>

                <TextField
                  label="Organization Type"
                  name="Org_Type"
                  fullWidth
                  variant="outlined"
                  select
                  value={currentClient.Org_Type}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                  <MenuItem value="Private Company">Private Company</MenuItem>
                  <MenuItem value="Public Company">Public Company</MenuItem>
                  <MenuItem value="Government Organization">
                    Government Organization
                  </MenuItem>
                  <MenuItem value="Startup">Startup</MenuItem>
                </TextField>

                <TextField
                  label="email"
                  name="Email"
                  fullWidth
                  type="email"
                  value={currentClient.Email}
                  onChange={handleEditInputChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  disabled={updateLoading}

                />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateClient}
                  >
                   {updateLoading ? (
                                                  <CircularProgress size={24} color="inherit" />
                                                ) : (
                                                  "Update"
                                                )}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCloseEditModal}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        <Drawer anchor="right" open={open} onClose={handleCloseDrawer}>
          <Box
            sx={{
              width: 400,
              p: 2,
              mt: "70px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                boxShadow: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", color: "#fff" }}
              >
                <AccountCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Client Contact Detail
                </Typography>
              </Box>
              <Tooltip title="Close">
                <IconButton
                  onClick={handleCloseDrawer}
                  sx={{
                    color: "#fff",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.2)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} sx={{ mb: 3 }}>
                  <CardHeader title={<Skeleton width="40%" />} />
                  <CardContent>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} height={20} sx={{ mb: 1 }} />
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : contactDetails.length ? (
              contactDetails.map((contact, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 3,
                    boxShadow: 5,
                    borderRadius: 3,
                    backgroundColor: "background.paper",
                    borderLeft: "6px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <CardHeader
                    title={`Contact ${index + 1}`}
                    sx={{
                      backgroundColor: "primary.main",
                      color: "common.white",
                      py: 2,
                      pl: 3,
                      fontWeight: "bold",
                    }}
                  />
                  <CardContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="primary" />
                        <Typography variant="body1" color="text.primary">
                          <strong>Name:</strong>{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.secondary", fontWeight: 500 }}
                          >
                            {contact.First_Name + " " + contact.Last_Name ||
                              "N/A"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon color="primary" />
                        <Typography variant="body1" color="text.primary">
                          <strong>Email:</strong>{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.secondary", fontWeight: 500 }}
                          >
                            {contact.Email || "N/A"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <BadgeIcon color="primary" />
                        <Typography variant="body1" color="text.primary">
                          <strong>UserID:</strong>{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.secondary", fontWeight: 500 }}
                          >
                            {contact.UserID || "N/A"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon color="primary" />
                        <Typography variant="body1" color="text.primary">
                          <strong>Organization:</strong>{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.secondary", fontWeight: 500 }}
                          >
                            {contact.Org_Name || "N/A"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon color="primary" />
                        <Typography variant="body1" color="text.primary">
                          <strong>Phone:</strong>{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.secondary", fontWeight: 500 }}
                          >
                            {contact.Phone || "N/A"}
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography>No contact details found.</Typography>
            )}
          </Box>
        </Drawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={SlideTransition}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: "100%",
              "&.MuiAlert-standardSuccess": {
                backgroundColor: "#4caf50",
                color: "#fff",
              },
              "&.MuiAlert-standardError": {
                backgroundColor: "#f44336",
                color: "#fff",
              },
              "& .MuiAlert-icon": {
                color: "#fff",
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              width: "100%",
              maxWidth: "500px",
              borderRadius: "8px",
            },
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
            {"Delete Client"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete Client {"  "}
              <strong>{clientToDelete?.Org_Name}</strong> ?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={handleDeleteCancel}
              variant="outlined"
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              autoFocus
                disabled={addLoading}

            >
                {deleteLoading ? (
                                                <CircularProgress size={24} color="inherit" />
                                              ) : (
                                                "Delete"
                                              )}        
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
