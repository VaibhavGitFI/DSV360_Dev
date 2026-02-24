import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Chip,
  Avatar,
  MenuItem,
  Select,
  alpha,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Dialog,
  DialogContent,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ForumIcon from "@mui/icons-material/Forum";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";

import { fetchFeedback } from "../redux/Feedback/Feedback";

import { useSelector, useDispatch } from "react-redux";
const Feedback = () => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [sortOrder, setSortOrder] = useState("");
  const [openImage, setOpenImage] = useState(null);
  const dispatch = useDispatch();
  const { data: feedbackData, isLoading } = useSelector(
    (state) => state.feedbackReducer
  );

  const handleImageClick = (url) => {
    setOpenImage(url);
  };
  const handleClose = () => {
    setOpenImage(null);
  };

  useEffect(() => {
    if (!Array.isArray(feedbackData) || feedbackData.length === 0) {
      dispatch(fetchFeedback());
    }
  }, [dispatch]);

  const filteredFeedback = feedbackData?.filter((item) =>
    statusFilter ? item.Status.toString() === statusFilter : true
  );

  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    return sortOrder === "ASC"
      ? new Date(a.MODIFIEDTIME) - new Date(b.MODIFIEDTIME)
      : new Date(b.MODIFIEDTIME) - new Date(a.MODIFIEDTIME);
  });

  return (
    <div>
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
            gap: 3,
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
              <ForumIcon sx={{ color: "#fff", fontSize: 30 }} />
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
              User's Feedbacks
            </Typography>
          </Box>

          {/* Right Side: Filters */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <FormControl fullWidth sx={{ minWidth: { sm: 150 } }}>
              <TextField
                label="Status"
                name="status"
                variant="outlined"
                select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Fixed</MenuItem>
                <MenuItem value="false">Will Fix Soon</MenuItem>
              </TextField>
            </FormControl>

            <FormControl fullWidth sx={{ minWidth: { sm: 150 } }}>
              <TextField
                label="View Mode"
                name="viewMode"
                variant="outlined"
                select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <MenuItem value="card">Card View</MenuItem>
                <MenuItem value="table">Table View</MenuItem>
              </TextField>
            </FormControl>

            <FormControl fullWidth sx={{ minWidth: { sm: 150 } }}>
              <TextField
                label="Date"
                name="date"
                variant="outlined"
                select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="ASC">ASC</MenuItem>
                <MenuItem value="DESC">DESC</MenuItem>
              </TextField>
            </FormControl>
          </Box>
        </Paper>

        <div>
          {viewMode === "card" ? (
            isLoading ? (
              <Grid container spacing={3}>
                {Array.from(new Array(6)).map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Card
                      component={Paper}
                      elevation={3}
                      sx={{
                        padding: 2,
                        borderRadius: 3,
                        height: "100%", // Make sure the card takes up the full height of the container
                        display: "flex",
                        flexDirection: "column", // Ensure card content is stacked vertically
                        justifyContent: "space-between",
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
                ))}
              </Grid>
            ) : sortedFeedback.length === 0 ? (
              <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                No feedback found
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {sortedFeedback.map((item) => (
                  //   <Grid item xs={12} sm={6} md={4} key={item.id}>
                  //   <Card
                  //     component={Paper}
                  //     elevation={4}
                  //     sx={{
                  //       borderRadius: 3,
                  //       height: 220, // Explicit height to maintain uniformity
                  //       display: "flex",
                  //       flexDirection: "column",
                  //       justifyContent: "space-between",
                  //       transition: "transform 0.3s ease-in-out",
                  //       "&:hover": { transform: "scale(1.05)" },
                  //       padding: "5px",
                  //     }}
                  //   >
                  //     <CardContent
                  //       sx={{
                  //         display: "flex",
                  //         flexDirection: "column",
                  //         height: "100%",
                  //         padding: 1,
                  //         justifyContent: "space-between", // Ensure content is spread evenly
                  //       }}
                  //     >
                  //       <Box
                  //         sx={{
                  //           display: "flex",
                  //           alignItems: "center",
                  //           gap: 2,
                  //           marginBottom: 1,
                  //         }}
                  //       >
                  //         <Avatar>{item.Name.charAt(0).toUpperCase()}</Avatar>
                  //         <Box>
                  //           <Typography
                  //             variant="h6"
                  //             color="primary"
                  //             sx={{ fontWeight: "bold" }}
                  //           >
                  //             {item.Name}
                  //           </Typography>
                  //           <Typography
                  //             variant="body2"
                  //             color="textSecondary"
                  //             sx={{ wordBreak: "break-all" }}
                  //           >
                  //             {item.Email}
                  //           </Typography>
                  //         </Box>
                  //       </Box>

                  //       <Typography
                  //         variant="body1"
                  //         sx={{
                  //           marginBottom: 1,
                  //           overflowY: "auto", // Enable scrolling for overflowed content
                  //           maxHeight: "6em", // Max height for the message
                  //           display: "-webkit-box",
                  //           WebkitLineClamp: 4, // Limit message to 4 lines
                  //           WebkitBoxOrient: "vertical",
                  //           flexGrow: 1, // Allow this area to grow and fill the space
                  //         }}
                  //       >
                  //         {item.Message}
                  //       </Typography>

                  //       <Box
                  //         sx={{
                  //           display: "flex",
                  //           justifyContent: "space-between",
                  //           alignItems: "center",
                  //           marginTop: "auto", // Pushes the date and status to the bottom
                  //         }}
                  //       >
                  //         <Chip
                  //           label={new Date(
                  //             item.MODIFIEDTIME
                  //           ).toLocaleString()}
                  //           color="primary"
                  //           variant="outlined"
                  //         />
                  //         <Chip
                  //           label={item.Status ? "Fixed" : "Will Fix Soon"}
                  //           sx={{
                  //             backgroundColor: item.Status
                  //               ? "lightgreen"
                  //               : "#D3D3D3",
                  //             color: item.Status ? "green" : "initial",
                  //           }}
                  //         />
                  //       </Box>
                  //     </CardContent>
                  //   </Card>
                  // </Grid>

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
                        borderColor:
                          item.Status === true || item.Status === "true"
                            ? "success.main"
                            : "warning.main",
                        borderTop: "3px solid",
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
                          {/* Avatar and Name */}
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
                                bgcolor: "primary.main",
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

                          {/* Message with Tooltip */}
                          <Tooltip
                            title={
                              <Typography sx={{ fontSize: "0.8rem" }}>
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

                          {/* Optional Images */}
                          {item.Images && item.Images.split(",").length > 0 && (
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
                              {item.Images.split(",")
                                .slice(0, 3)
                                .map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.trim()}
                                    alt={`Issue Image ${idx + 1}`}
                                    onClick={() => handleImageClick(img.trim())}
                                  />
                                ))}
                            </Box>
                          )}
                        </Box>

                        {/* Footer: Date + Status + Actions */}
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
                              item.Status === true || item.Status === "true" ? (
                                <CheckCircleOutlineIcon fontSize="small" />
                              ) : (
                                <PendingActionsIcon fontSize="small" />
                              )
                            }
                            label={
                              item.Status === true || item.Status === "true"
                                ? "Resolved"
                                : "In Progress"
                            }
                            color={
                              item.Status === true || item.Status === "true"
                                ? "success"
                                : "warning"
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          ) : isLoading ? (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              Loading...
            </Typography>
          ) : sortedFeedback.length === 0 ? (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              No feedback found
            </Typography>
          ) : (
            // <TableContainer component={Paper}>
            //   <Table>
            //   <TableHead>
            //               <TableRow sx={{ backgroundColor: "#1976d2" }}>
            //                 <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
            //                   Name
            //                 </TableCell>
            //                 <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
            //                   Email
            //                 </TableCell>
            //                 <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
            //                   Message
            //                 </TableCell>
            //                 <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
            //                   Date{" "}
            //                 </TableCell>
            //                 <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
            //                   Status
            //                 </TableCell>
            //               </TableRow>
            //             </TableHead>
            //             <TableBody>
            //               {sortedFeedback.map((item) => (
            //                 <TableRow key={item.id}>
            //                   <TableCell>{item.Name}</TableCell>
            //                   <TableCell>{item.Email}</TableCell>
            //                   <TableCell>{item.Message}</TableCell>
            //                   <TableCell>
            //                     {new Date(item.MODIFIEDTIME).toLocaleString()}
            //                   </TableCell>
            //                   <TableCell>
            //                     <Chip
            //                       label={item.Status ? "Fixed" : "Will Fix Soon"}
            //                       sx={{
            //                         backgroundColor: item.Status
            //                           ? "lightgreen"
            //                           : "#D3D3D3",
            //                         color: item.Status ? "green" : "initial",
            //                       }}
            //                     />
            //                   </TableCell>
            //                 </TableRow>
            //               ))}
            //             </TableBody>
            //   </Table>
            // </TableContainer>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1976d2" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Message
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Images
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedFeedback.map((item) => {
                    const hasImages =
                      item.Images && item.Images.trim().length > 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.Name}</TableCell>
                        <TableCell>{item.Email}</TableCell>
                        <TableCell>
  {item.Message && item.Message.length > 100 ? (
    <Tooltip title={item.Message}>
      <Typography
        variant="body2"
        noWrap
        sx={{
          maxWidth: 120,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        {item.Message}
      </Typography>
    </Tooltip>
  ) : (
    <>{item.Message}</>
  )}
</TableCell>

                        <TableCell>
                          {new Date(item.MODIFIEDTIME).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.Status ? "Fixed" : "Will Fix Soon"}
                            sx={{
                              backgroundColor: item.Status
                                ? "lightgreen"
                                : "#D3D3D3",
                              color: item.Status ? "green" : "initial",
                            }}
                          />
                        </TableCell>
                        {/* <TableCell>
                <Tooltip title={hasImages ? "View Images" : "No Images"}>
                  <span>
                    <IconButton
                      onClick={() => handleImageClick(item.Images)}
                      disabled={!hasImages}
                      color="primary"
                    >
                      <ImageIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell> */}

                        <TableCell>
                          {item.Images &&
                          item.Images.split(",").filter(
                            (img) => img.trim() !== ""
                          ).length > 0 ? (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {item.Images.split(",")
                                .map((img) => img.trim())
                                .filter((img) => img !== "")
                                .slice(0, 3)
                                .map((img, index) => (
                                  <img
                                    key={index}
                                    src={img}
                                    alt={`img-${index}`}
                                    style={{
                                      height: 40,
                                      width: "auto",
                                      borderRadius: 4,
                                      border: "1px solid #ccc",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => handleImageClick(img)}
                                  />
                                ))}
                            </Box>
                          ) : (
                            <Chip label="No Images" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </Box>

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
    </div>
  );
};

export default Feedback;
