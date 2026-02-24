import React, { useEffect, useState,useRef } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Skeleton,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Snackbar,
  alpha,
  useTheme,
  Alert,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Dialog, DialogContent } from "@mui/material";
import { CircularProgress } from "@mui/material";


const Feedback = () => {
  const [openImage, setOpenImage] = useState(null);

  const handleImageClick = (url) => {
    setOpenImage(url);
  };

  const handleClose = () => {
    setOpenImage(null);
  };

  const theme = useTheme();
  const [userid, setUserid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const[isLoading, setIsLoading] = useState(false);

    const messageRef = useRef(null); // 👈 reference for autofocus


  useEffect(() => {
    const fetch = async () => {
      const userData = await JSON.parse(localStorage.getItem("currUser"));
      setUserid(userData.userid);
      setName(userData.firstName + " " + userData.lastName);
      setEmail(userData.mailid);

      const response = await axios.get(
        "/server/time_entry_management_application_function/feedback"
      );

      // console.log("response", response.data.data);

      const feedbackData = response.data.data.filter(
        (feedback) => feedback.User_ID === userData.userid
      );

      if (response.status === 200) {
        setFeedback(feedbackData);
      }
      setLoading(false);
    };

    fetch();
  }, []);

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!message.trim()) {
      setError("Message cannot be empty.");
      messageRef.current?.focus(); // 👈 automatically focuses the message field
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("Name", name.trim());
    formData.append("Email", email.trim());
    formData.append("Message", message.trim());
    formData.append("User_ID", userid);

    // Append up to 3 images
    images.forEach((image) => {
      formData.append("profile", image); // 'profile' should match backend field
    });

    try {
      const response = await axios.post(
        `/server/time_entry_management_application_function/feedback`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        // console.log("Response:", response.data);
        setFeedback([response.data.data, ...feedback]);
        handleAlert("success", "Feedback submitted successfully");
        setMessage("");
        setImages([]);
       setError(""); // clear any previous error

      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      handleAlert("error", "Failed to submit feedback. Please try again.");
    }finally{
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
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
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              width: "100%",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Icon + Heading */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 50,
                  height: 50,
                }}
              >
                <RateReviewIcon sx={{ color: "#fff" }} />
              </Avatar>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 1, sm: 0 },
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                Feedback Form
              </Typography>
            </Box>
          </Box>

         
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              disabled
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              disabled
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Message"
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
              value={message}
               inputRef={messageRef} // 👈 ref added
                 onChange={(e) => {
          setMessage(e.target.value);
          if (error) setError(""); // 👈 clear error when typing
        }}
              // onChange={(e) => setMessage(e.target.value)}
              error={!!error}
              helperText={error}
            />

            {/* Image Upload Section */}
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Upload up to 3 images:
              </Typography>
              <Button variant="outlined" component="label">
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files);
                    const total = images.length + selectedFiles.length;

                    if (total > 3) {
                      alert("You can upload a maximum of 3 images.");
                      e.target.value = ""; // ✅ reset input value

                      return;
                    }

                    setImages((prevImages) => [
                      ...prevImages,
                      ...selectedFiles,
                    ]);
                     e.target.value = ""; // ✅ reset input value

                  }}
                />
              </Button>

              {/* Preview Thumbnails */}
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "row", gap: 2 }}
              >
                {images.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 300,
                      height: "auto",
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "#fff",
                        border: "1px solid #ccc",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            <Button variant="contained" color="primary" type="submit" disabled={isLoading}>
             {isLoading ? (
    <CircularProgress size={24} />
  ) : (
    "Submit"
  )}
            </Button>
          </form>
        </Box>
      </Paper>

      {feedback.length ? (
        // <>
        //   <Box sx={{ textAlign: "center", marginBottom: 3 }}>
        //     <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        //       Your's Feedback
        //     </Typography>
        //   </Box>

        //   <Grid container spacing={3}>
        //     {loading
        //       ? Array.from(new Array(6)).map((_, index) => (
        //           <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
        //             <Card
        //               component={Paper}
        //               elevation={3}
        //               sx={{
        //                 padding: 2,
        //                 borderRadius: 3,
        //                 height: 200,
        //               }}
        //             >
        //               <CardContent>
        //                 <Skeleton variant="circular" width={40} height={40} />
        //                 <Skeleton
        //                   variant="text"
        //                   width="80%"
        //                   height={30}
        //                   sx={{ marginTop: 1 }}
        //                 />
        //                 <Skeleton variant="text" width="60%" height={20} />
        //                 <Skeleton
        //                   variant="rectangular"
        //                   width="100%"
        //                   height={60}
        //                   sx={{ marginTop: 2 }}
        //                 />
        //                 <Skeleton
        //                   variant="text"
        //                   width="50%"
        //                   height={15}
        //                   sx={{ marginTop: 2 }}
        //                 />
        //               </CardContent>
        //             </Card>
        //           </Grid>
        //         ))
        //       : feedback.map((item) => (
        //           <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
        //             <Card
        //               component={Paper}
        //               elevation={4}
        //               sx={{
        //                 borderRadius: 3,
        //                 height: 220,
        //                 display: "flex",
        //                 flexDirection: "column",
        //                 justifyContent: "space-between",
        //                 transition: "transform 0.3s ease-in-out",
        //                 "&:hover": { transform: "scale(1.05)" },
        //                 padding: "5px",
        //               }}
        //             >
        //               <CardContent
        //                 sx={{
        //                   display: "flex",
        //                   flexDirection: "column",
        //                   height: "100%",
        //                   padding: 1,
        //                   justifyContent: "space-between",
        //                 }}
        //               >
        //                 <Box
        //                   sx={{
        //                     display: "flex",
        //                     alignItems: "center",
        //                     gap: 2,
        //                     marginBottom: 1,
        //                   }}
        //                 >
        //                   <Avatar>{item.Name.charAt(0).toUpperCase()}</Avatar>
        //                   <Box>
        //                     <Typography
        //                       variant="h6"
        //                       color="primary"
        //                       sx={{ fontWeight: "bold" }}
        //                     >
        //                       {item.Name}
        //                     </Typography>
        //                     <Typography variant="body2" color="textSecondary">
        //                       {item.Email}
        //                     </Typography>
        //                   </Box>
        //                 </Box>

        //                 <Typography
        //                   variant="body1"
        //                   sx={{
        //                     marginBottom: 1,
        //                     overflowY: "auto", // Enables vertical scrolling
        //                     maxHeight: "6em", // Adjust this as needed
        //                     display: "-webkit-box",
        //                     WebkitLineClamp: 4, // Limit to 4 lines
        //                     WebkitBoxOrient: "vertical", // Necessary for line clamp
        //                     flexGrow: 1, // Allows this area to take up available space
        //                     // width: '100%', // Ensure it doesn't overflow horizontally
        //                     // wordWrap: 'break-word', // Breaks long words that may overflow horizontally
        //                     // overflowX: 'hidden'
        //                   }}
        //                 >
        //                   {item.Message}
        //                 </Typography>

        //                 <Box
        //                   sx={{
        //                     display: "flex",

        //                     justifyContent: "space-between",
        //                     alignItems: "center",
        //                     marginTop: "auto", // pushes the date and status to the bottom
        //                   }}
        //                 >
        //                   <Chip
        //                     label={new Date(item.MODIFIEDTIME).toLocaleString()}
        //                     color="primary"
        //                     variant="outlined"
        //                   />
        //                   <Chip
        //                     label={
        //                       item.Status === "true"
        //                         ? "Fixed"
        //                         : "Will Fixed Soon"
        //                     }
        //                     sx={{
        //                       backgroundColor:
        //                         item.Status === "true" ? "lightgreen" : "",
        //                     }}
        //                   />
        //                 </Box>
        //               </CardContent>
        //             </Card>
        //           </Grid>
        //         ))}
        //   </Grid>
        // </>

        <>
          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              Your Feedback
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(6)).map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Card
                      component={Paper}
                      elevation={3}
                      sx={{
                        padding: 2,
                        borderRadius: 3,
                        height: 200,
                      }}
                    >
                      <CardContent>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={30}
                          sx={{ marginTop: 1 }}
                        />
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={60}
                          sx={{ marginTop: 2 }}
                        />
                        <Skeleton
                          variant="text"
                          width="50%"
                          height={15}
                          sx={{ marginTop: 2 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : feedback.map((item) => {
                  const imageUrls = item.Images ? item.Images.split(",") : [];
                  // console.log("imagesUrl", imageUrls);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                      <Card
                        component={Paper}
                        elevation={4}
                        sx={{
                          borderRadius: 3,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          transition:
                            "transform 0.3s ease-in-out, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-5px)",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                          },
                          // borderTop: "3px solid",
                          borderColor:
                            item.Status === "true"
                              ? "success.main"
                              : "warning.main",
                        }}
                      >
                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            padding: 2,
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                marginBottom: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor:"primary.main",
                                  width: 48,
                                  height: 48,
                                  fontSize: "1.2rem",
                                  
                                }}
                              >
                                {item.Name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="h6"
                                  color="text.primary"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {item.Name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {item.Email}
                                </Typography>
                              </Box>
                            </Box>
                            {/* 
                    <Typography
                      variant="body1"
                      sx={{
                        marginY: 2,
                        color: 'text.secondary',
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.Message}
                    </Typography> */}
                            <Tooltip
                              title={
                                <Typography
                                  sx={{ fontSize: "0.8rem" /* or 16px */ }}
                                >
                                  {item.Message}
                                </Typography>
                              }
                              placement="top"
                              arrow
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  marginY: 2,
                                  color: "text.secondary",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.Message}
                              </Typography>
                            </Tooltip>

                            {imageUrls.length > 0 && (
                              <Box
                                sx={{
                                  marginY: 1,
                                  display: "flex",
                                  gap: 1,
                                  overflowX: "auto",
                                  pb: 1,
                                  "& img": {
                                    borderRadius: 1,
                                    height: 80,
                                    width: "auto",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    cursor: "pointer",
                                  },
                                }}
                              >
                                {imageUrls.slice(0, 3).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.trim()}
                                    alt={`Feedback ${idx + 1}`}
                                    loading="lazy"
                                    onClick={() => handleImageClick(img.trim())}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 2,
                              pt: 1,
                              borderTop: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Chip
                              icon={<AccessTimeIcon fontSize="small" />}
                              label={new Date(
                                item.MODIFIEDTIME
                              ).toLocaleDateString()}
                              variant="outlined"
                              size="small"
                            />
                            <Chip
                              icon={
                                item.Status === "true" ? (
                                  <CheckCircleOutlineIcon fontSize="small" />
                                ) : (
                                  <PendingActionsIcon fontSize="small" />
                                )
                              }
                              label={
                                item.Status === "true"
                                  ? "Resolved"
                                  : "In Progress"
                              }
                              color={
                                item.Status === "true" ? "success" : "warning"
                              }
                              size="small"
                              sx={{
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
          </Grid>
        </>
      ) : (
        <></>
      )}

      {/* Snackbar component to display alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={!!openImage} onClose={handleClose} maxWidth="md">
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              color: "red",
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={openImage}
            alt="Zoomed"
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              maxHeight: "80vh",
              transition: "transform 0.3s ease-in-out",
              transform: "scale(1.05)",
              backgroundColor: "#000",
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Feedback;
