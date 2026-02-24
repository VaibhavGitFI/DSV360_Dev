import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

// MUI Components
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ButtonGroup,
  Skeleton,
  Input,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
  useTheme,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  InputAdornment,
  MenuItem,
  Autocomplete,
} from "@mui/material";

// MUI Icons
import {
  Close,
  Save,
  AccountCircle,
  Image,
  Delete,
  Edit,
  CloudUpload,
  PhotoCamera,
  Info,
  CheckCircle,
} from "@mui/icons-material";
import { useOutletContext } from "react-router-dom";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import UploadIcon from "@mui/icons-material/Upload";
import { blue } from "@mui/material/colors";
import KeyIcon from "@mui/icons-material/Key";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CountryCode from "../CountryCode.json";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import {updateAdminState, updateOrgData} from '.././redux/SuperAdmin/SuperAdminSlice'
 import { useDispatch, useSelector } from "react-redux";


function Profile() {
  const apps = [
    {
      name: "Google Drive",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR92xi0rYVQhCMh63Y7a_Gj7nFZJd93Uyf1Sg&s",
    },
    {
      name: "Zoom",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ47omlw20aFOIEEUNac8ZhEOBtGwie-i-5nw&s",
    },
    {
      name: "SAP",
      logo: "https://p7.hiclipart.com/preview/321/424/20/sap-se-logo-business-sap-anywhere-sap-s-4hana-business-thumbnail.jpg",
    },
    {
      name: "Gupshup",
      logo: "https://cdn-1.webcatalog.io/catalog/gupshup/gupshup-social-preview.png?v=1714782969322",
    },
    
  ];

     const dispatch=useDispatch();

  const { setUserProfile } = useOutletContext();
    const {data:AdminData }= useSelector((state) => state.AdminSlice);


  const [userInfo, setUserInfo] = useState({});
  const [skills, setSkills] = useState(userInfo.skills || ["Not Available"]);
  const theme = useTheme();

  const [newSkill, setNewSkill] = useState("");
  const [currUser, setCurrUser] = useState(null);
  const [showviewBtn, setShowviewBtn] = useState(false);
  const [isEditingProfileData, setIsEditingProfileData] = useState(false);

  const [isEditingProfileImage, setIsEditingProfileImg] = useState(false);

  const [skillModelOpen, setSkillModelOpen] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: userInfo.name || "",
    email: userInfo.email || "",
    countryCode: userInfo.countryCode || "",
    phone: userInfo.phone || "",
    address: userInfo.address || "",
    AboutME: userInfo.AboutME || "",
  });
  const [loading, setLoading] = useState(true);
  const [cvFile, setCvFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [orgData, setOrgData] = useState({
    colorCode: "",
  });

  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const handleSkillModelClose = () => setSkillModelOpen(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [badges, setBadges] = useState([]);
 const [isEditingColorModal, setIsEditingColorModal] = useState(false);

  


  useEffect(() => {
    const getUserDetail = async () => {
      const user = JSON.parse(localStorage.getItem("currUser"));
      setCurrUser(user);
      try {
        const response = await axios.get(
          `/server/time_entry_management_application_function/profile/data/${user.userid}`
        );

        const BadgesResponse = await axios.get(
          `/server/time_entry_management_application_function/badge/${user.userid}`
        );

        if (BadgesResponse.status == 200) {
          setBadges(BadgesResponse.data.data);
        }

        const data = response.data.data;
        const profileBase64 = localStorage.getItem("profileData");


        const coverBase64 = localStorage.getItem("coverData");

        const userSkills = data.Users.Skills
          ? data.Users.Skills.split(",").map((skill) => skill.trim())
          : [];
        setSkills(userSkills);


        
          setUserInfo({
          name: `${user.firstName} ${user.lastName}`,
          email: user.mailid,
          phone: data.Users.Phone,
          address: data.Users.Address,
          countryCode: data.Users.CountryCode,
          AboutME: data.Users.AboutME,
          profileImage: profileBase64,
          coverImage: coverBase64,
          role: user.role,
          skills: userSkills,
          resume: data.Users.Resume_Link,
        });

       
        
        
        if (data.Users.Resume_Link) {
        
          setShowviewBtn(true);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserDetail();
  }, []);

  useEffect(() => {
    setEditedInfo({
      name: userInfo.name || "",
      email: userInfo.email || "",
      countryCode: userInfo.countryCode || "",
      phone: userInfo.phone || "",
      address: userInfo.address || "",
      AboutME: userInfo.AboutME || "",
    });
  }, [userInfo]);
  const countryCodes = [
    "+1",
    "+44",
    "+91",
    "+61",
    "+81",
    "+49",
    "+33",
    "+86",
    "+7",
    "+971",
  ];

  //   useEffect(() => {
  //   if (userInfo.phone) {
  //     const phone = userInfo.phone;
  //     const matchedCode = countryCodes.find(code => phone.startsWith(code));
  //     console.log("match",matchedCode);
  //     if (matchedCode) {
  //       const localNumber = phone.replace(matchedCode, "");
  //       console.log("local numer is ",localNumber)

  //       setEditedInfo((prev) => ({
  //         ...prev,
  //         countryCode: matchedCode,   // "+91"
  //         phone: localNumber,         // "9876543210"
  //       }));
  //     } else {
  //       setEditedInfo((prev) => ({
  //       name: userInfo.name || "",
  //       email: userInfo.email || "",

  //       phone: userInfo.phone || "",
  //       address: userInfo.address || "",
  //       AboutME: userInfo.AboutME || "",
  //       }));
  //     }
  //   }
  // }, [userInfo]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleSaveCVWithLoader = () => {
    if (!cvFile) return;
    setLoading(true);
    // Simulate a save delay
    setTimeout(() => {
      setLoading(false);
      handleSaveCV();
    }, 2000);
  };

  const handleEditProfileDataClick = () => {
    setIsEditingProfileData(true);
  };
  const handleEditProfileImgClick = () => {
    setIsEditingProfileImg(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleInputColorCodeChange = (e) => {
  const { name, value } = e.target;

  // Ensure it always updates state correctly
  setOrgData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const handleCloseCvModal = () => {
    setIsCvModalOpen(false);
    setCvFile(null);
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
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

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("currUser"));
      if (!user || !user.userid) {
        handleAlert("error", "User not found. Please log in again.");
        return;
      }

      // Prepare and update profile details
      const updatedProfile = {
        Address: editedInfo.address,
        CountryCode: editedInfo.countryCode,
        Phone: editedInfo.phone,
        AboutME: editedInfo.AboutME,
        Skills: skills.join(", "), // Convert array to comma-separated string
      };

      const response = await fetch(
        `/server/time_entry_management_application_function/profile/update/${user.userid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Profile update failed.");
      }


      // Update local state
      setUserInfo((prev) => ({
        ...prev,
        ...{
          address: updatedProfile.Address,
          phone: updatedProfile.Phone,
          AboutME: updatedProfile.AboutME,
          countryCode: updatedProfile.CountryCode,
        },
        skills,
      }));

      handleAlert("success", "Profile Data Updated Successfully!");
      setIsEditingProfileData(false);

      // window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      handleAlert("error", "An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCV = async () => {
    const formData = new FormData();

    try {
      setLoading(true);

      if (cvFile) {
        formData.append("resume", cvFile, cvFile.name);
      }

      const response = await fetch(
        `/server/time_entry_management_application_function/resume/${currUser.userid}`,
        {
          method: "POST",
          body: formData,
        }
      );

      setLoading(false);
      handleCloseCvModal();
 
      if (response.ok === true) {
        setShowviewBtn(true);
        handleAlert("success", "Resume Uploaded successfully!");
      } else {
        handleAlert("error", "Resume Upload Failed.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error uploading profile:", error);
      alert("Error uploading profile.");
    }
  };

  const handleDisplayCV = async () => {
    try {
      const response = await axios.get(
        `/server/time_entry_management_application_function/resume/${currUser.userid}`
      );
   
      handleAlert("success", "Opening CV in a new tab...");

      setTimeout(() => {
        window.open(response.data.data, "_blank");
      }, 500);
    } catch (err) {
      console.error("Error displaying the CV:", err);
      handleAlert("error", "Error In Resume Fetching...");
    }
  };

  const handleCancel = () => {
    setEditedInfo({ ...userInfo });
    setProfileImage(null);
    setCoverImage(null);
    setIsEditingProfileData(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      // Split by commas and trim each skill
      const newSkills = newSkill.split(",").map((skill) => skill.trim());

      // Filter out empty strings and add new skills
      const validNewSkills = newSkills.filter(
        (skill) => skill && !skills.includes(skill)
      );

      if (validNewSkills.length > 0) {
        setSkills([...skills, ...validNewSkills]);
      }
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {}; // Create a new errors object

    if (!editedInfo.countryCode) {
      newErrors.countryCode = "Fill the country code ";
    }
    // Mobile Number Validation (10 digits, starts with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!editedInfo.phone || !mobileRegex.test(editedInfo.phone)) {
      newErrors.mobile =
        "Invalid mobile number. It should be 10 digits and start with 6-9.";
    }

    // About Me Validation (Optional, but must be 5-200 characters)
    if (
      editedInfo.AboutME &&
      (editedInfo.AboutME.length < 5 || editedInfo.AboutME.length > 200)
    ) {
      newErrors.aboutMe = "About Me should be between 5 to 200 characters.";
    }

    // Address Validation (Must be at least 10 characters)
    if (!editedInfo.address || editedInfo.address.length < 10) {
      newErrors.address = "Address must be at least 10 characters long.";
    }

    setErrors(newErrors); // Update state with errors

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSave();
    } else {
      console.log("Validation failed:", errors); // Debugging
    }
  };

  const uniqueThemeInstance = useTheme();

  const [uniqueProfileImagePreview, setUniqueProfileImagePreview] = useState(
    userInfo.profileImage
  );
  const [uniqueCoverImagePreview, setUniqueCoverImagePreview] = useState(
    userInfo.coverImage
  );
  const [uniqueIsLoadingState, setUniqueIsLoadingState] = useState(false);
  const [uniqueErrorMessages, setUniqueErrorMessages] = useState({});
  const uniqueProfileInputRefV1 = useRef(null);
  const uniqueCoverInputRefV1 = useRef(null);
  const uniqueProfileChangeRefV1 = useRef(null);
  const uniqueCoverChangeRefV1 = useRef(null);
    

    const handeChangeTheme = async(e) => {
    e.preventDefault();
    const orgID=AdminData.OrgID;


    if(!orgData.colorCode || !orgID){
      handleAlert("error","Required Field Missing");
      return;
    }

    try {
      const response = await axios.put(`/server/time_entry_management_application_function/org/${orgID}`, {
        Org_Theme: orgData.colorCode,
      });

      if(response.data.success){
        handleAlert("success","Theme color updated successfully");
        dispatch(updateAdminState(response.data.data));
        setIsEditingColorModal(false);
      }

    
    } catch (error) {
      console.error('Error updating theme color:', error);
      // Optional: show error notification here
    }
  };
  const uniqueValidateImageFileFunc = (fileToValidate, imageTypeLabel) => {
    if (!fileToValidate.type.startsWith("image/")) {
      return "Please upload an image file";
    }

    if (fileToValidate.size > 5 * 1024 * 1024) {
      return "File size exceeds 5MB limit";
    }

    return null;
  };

  const uniqueHandleImageChangeFunc = (eventObj, imageTypeLabel) => {
    const selectedFile = eventObj.target.files?.[0];
    if (!selectedFile) return;

    const validationError = uniqueValidateImageFileFunc(
      selectedFile,
      imageTypeLabel
    );
    if (validationError) {
      setUniqueErrorMessages({
        ...uniqueErrorMessages,
        [imageTypeLabel]: validationError,
      });
      return;
    }

    setUniqueErrorMessages({ ...uniqueErrorMessages, [imageTypeLabel]: "" });
    const uniqueFileReader = new FileReader();
    uniqueFileReader.onload = () => {
      if (imageTypeLabel === "profile") {
        setProfileImage(selectedFile);
        setUniqueProfileImagePreview(uniqueFileReader.result);
      } else {
        setCoverImage(selectedFile);
        setUniqueCoverImagePreview(uniqueFileReader.result);
      }
    };
    uniqueFileReader.readAsDataURL(selectedFile);
  };

  const uniqueHandleDropFunc = useCallback(
    (eventObj, imageTypeLabel) => {
      eventObj.preventDefault();
      eventObj.stopPropagation();

      const droppedFile = eventObj.dataTransfer.files?.[0];
      if (!droppedFile) return;

      const validationError = uniqueValidateImageFileFunc(
        droppedFile,
        imageTypeLabel
      );
      if (validationError) {
        setUniqueErrorMessages({
          ...uniqueErrorMessages,
          [imageTypeLabel]: validationError,
        });
        return;
      }

      setUniqueErrorMessages({ ...uniqueErrorMessages, [imageTypeLabel]: "" });
      const uniqueFileReader = new FileReader();
      uniqueFileReader.onload = () => {
        if (imageTypeLabel === "profile") {
          setProfileImage(droppedFile);
          setUniqueProfileImagePreview(uniqueFileReader.result);
        } else {
          setCoverImage(droppedFile);
          setUniqueCoverImagePreview(uniqueFileReader.result);
        }
      };
      uniqueFileReader.readAsDataURL(droppedFile);
    },
    [uniqueErrorMessages]
  );

  const uniqueHandleRemoveImageFunc = (imageTypeLabel) => {
    if (imageTypeLabel === "profile") {
      setProfileImage(null);
      setUniqueProfileImagePreview(null);
      if (uniqueProfileInputRefV1.current)
        uniqueProfileInputRefV1.current.value = "";
      if (uniqueProfileChangeRefV1.current)
        uniqueProfileChangeRefV1.current.value = "";
    } else {
      setCoverImage(null);
      setUniqueCoverImagePreview(null);
      if (uniqueCoverInputRefV1.current)
        uniqueCoverInputRefV1.current.value = "";
      if (uniqueCoverChangeRefV1.current)
        uniqueCoverChangeRefV1.current.value = "";
    }
    setUniqueErrorMessages({ ...uniqueErrorMessages, [imageTypeLabel]: "" });
  };

  const uniqueHandleDragOverFunc = (eventObj) => {
    eventObj.preventDefault();
    eventObj.stopPropagation();
  };

  const uniqueHandleCancelFunc = () => {
    setProfileImage(null);
    setCoverImage(null);
    setUniqueProfileImagePreview(null);
    setUniqueCoverImagePreview(null);
    setUniqueErrorMessages({});
    setIsEditingProfileImg(false);
  };

  const uniqueHandleSubmitFunc = async () => {
    // console.log(profileImage, coverImage);
    if (!profileImage && !coverImage) return;
    setUniqueIsLoadingState(true);
    setLoading(true);

    const user = JSON.parse(localStorage.getItem("currUser"));
    if (!user || !user.userid) {
      handleAlert("error", "User not found. Please log in again.");
      return;
    }
    const formData = new FormData();

    let profileUpdateSuccess = true;
    let coverUpdateSuccess = true;

    try {
      const uploadPromises = [];

      if (profileImage) {
        // console.log("profileImage", profileImage);
        formData.append("profile", profileImage, profileImage.name);

        uploadPromises.push(
          await axios
            .post(
              `/server/time_entry_management_application_function/userprofile/${user.userid}`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            )
            .then(async (response) => {
              if (response.status === 200) {
                setUserInfo((prev) => ({
                  ...prev,
                  profileImage: response.data.profileURL,
                }));
                setUserProfile(response.data.profileURL);
                setProfileImage(response.data.profileURL);
                localStorage.setItem("profileData", response.data.profileURL);
              } else {
                profileUpdateSuccess = false;
              }
            })
            .catch(() => {
              profileUpdateSuccess = false;
            })
        );
      }

      if (coverImage) {
        // console.log("coverImage", coverImage);
        formData.append("cover", coverImage, coverImage.name);
        uploadPromises.push(
          await axios
            .post(
              `/server/time_entry_management_application_function/usercover/${user.userid}`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            )
            .then(async (response) => {
              if (response.status === 200) {
                // console.log("response from cover photo", response.data);
                setUserInfo((prev) => ({
                  ...prev,
                  coverImage: response.data.coverURL,
                }));
                localStorage.setItem("coverData", response.data.coverURL);
              } else {
                coverUpdateSuccess = false;
              }
            })
            .catch(() => {
              coverUpdateSuccess = false;
            })
        );
      }

      const response = await Promise.all(uploadPromises);
      // console.log("response", response);

      uniqueHandleCancelFunc();

      if (!profileUpdateSuccess && !coverUpdateSuccess) {
        handleAlert("error", "Failed to update profile and cover images.");
        return;
      } else {
        handleAlert("success", "Updating profile and cover images successful.");
      }

      setTimeout(() => {
        // window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Image update error:", err);
      handleAlert("error", "An error occurred while updating images.");
    } finally {
      setLoading(false);
      setUniqueIsLoadingState(false);
    }
  };

  const uniqueFormatFileSizeFunc = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const [open, setOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    // console.log("Hello world");
    setOpen(true);
  };

  const handleSubmitPassword = async () => {
    if (newPassword !== confirmPassword) {
      handleAlert("error", "New password does not match");
      return;
    }

    try {
      const result = await window.catalyst.auth.changePassword(
        currentPassword,
        newPassword
      );
      // console.log("result", result);

      if (result?.status === 400 || result?.error) {
        handleAlert("error", result.message);
        return; // exit without resetting or closing
      }

      handleAlert("success", "Password changed successfully!");

      // Only clear and close if success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(false);
    } catch (error) {
      console.error("Password change failed:", error);
      handleAlert("error", "Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOpen(false);
  };

    const handleThemeColorChange = () => {
      setOrgData({colorCode :AdminData?.Org_Theme || ""})
    setIsEditingColorModal(true);
  };

 const handleCancelColorCode = () => {
  setIsEditingColorModal(false); // close the dialog
  setOrgData({ colorCode: "" }); // reset color field
};


  return (
    <Box sx={{ position: "relative", mb: 6 }}>
      {/* Enhanced Cover Image */}
      <Box
        sx={{
          position: "relative",
          height: 200, // Increased height
          backgroundImage: `url(${userInfo.coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))",
          },
        }}
      >
        {" "}
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-end" },
          justifyContent: "space-between",
          px: { xs: 2, sm: 4 },
          mt: -8,
        }}
      >
        {/* Profile Image with Enhanced Design */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-end" },
            zIndex: 5,
            mb: { xs: 2, sm: 0 },
          }}
        >
          {loading ? (
            <Skeleton variant="circular" width={160} height={160} />
          ) : (
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={userInfo.profileImage || ""}
                sx={{
                  width: 160,
                  height: 160,
                  border: "5px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 5,
                  right: 5,
                  backgroundColor: "primary.main",
                  color: "white",
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
                onClick={handleEditProfileImgClick}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Name and Bio with Enhanced Typography */}
          <Box  sx={{
    marginLeft: { xs: 0, sm: 3 }, // no margin on mobile
    marginTop: { xs: 2, sm: 6 },  // smaller margin on mobile
    textAlign: { xs: "center", sm: "left" }, // center text in mobile
  }}>
          {loading ? (
            <>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={30} />
            </>
          ) : (
            <>
              <Typography variant="h4"  sx={{
        fontWeight: 700,
        textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        color: "text.primary",
      }}   >{userInfo.name}</Typography>
                <Chip
      label={userInfo.role}
      color="primary"
      size="small"
      sx={{ fontWeight: 500 }}
    />

            </>
          )}
        </Box>
        </Box>

        {/* Edit Profile Button - Enhanced */}
        {/* <Button  variant="contained"  onClick={handlePasswordChange}>Change Password</Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditProfileDataClick}
          sx={{
            borderRadius: "30px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            px: 3,
            py: 1,
            backgroundColor: "primary.main",
            color: "white",
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "primary.dark",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              transform: "translateY(-2px)",
            },
            zIndex: 2,
            alignSelf: { xs: "center", sm: "flex-end" },
            mb: { xs: 0, sm: 2 },
            mt: { xs: 2, sm: 0 },
          }}
        >
          Edit Profile
        </Button> */}

        <Box
          sx={{
            display: "flex",
            gap: 2, // space between buttons
            flexWrap: "wrap", // allows wrapping on smaller screens
            justifyContent: { xs: "center", sm: "flex-start" }, // responsive alignment
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<KeyIcon />}
            onClick={handlePasswordChange}
            sx={{
              borderRadius: "30px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              px: 3,
              py: 1,
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                transform: "translateY(-2px)",
              },
              zIndex: 2,
            }}
          >
            Change Password
          </Button>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditProfileDataClick}
            sx={{
              borderRadius: "30px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              px: 3,
              py: 1,
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                transform: "translateY(-2px)",
              },
              zIndex: 2,
            }}
          >
            Edit Profile
          </Button>

           <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleThemeColorChange}
            sx={{
              borderRadius: "30px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              px: 3,
              py: 1,
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                transform: "translateY(-2px)",
              },
              zIndex: 2,
            }}
          >
            Update Theme Color
          </Button>      
        </Box>
      </Box>

      {/* Main Content Grid - Enhanced */}
     

            <Grid container spacing={3} sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
        {/* Left Column - About & Contact */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* About Me Card - Enhanced */}
          <Card
            sx={{
              mb: 3,
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: "primary.dark",
                  display: "flex",
                  alignItems: "center",
                  "&::before": {
                    content: '""',
                    display: "inline-block",
                    width: "4px",
                    height: "20px",
                    backgroundColor: "primary.main",
                    marginRight: "12px",
                    borderRadius: "2px",
                  },
                }}
              >
                About Me
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                {userInfo?.AboutME || "Not provided"}
              </Typography>
            </CardContent>
          </Card>

          {/* Contact Information Card - Enhanced */}
          <Card
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: "primary.dark",
                    display: "flex",
                    alignItems: "center",
                    "&::before": {
                      content: '""',
                      display: "inline-block",
                      width: "4px",
                      height: "20px",
                      backgroundColor: "primary.main",
                      marginRight: "12px",
                      borderRadius: "2px",
                    },
                  }}
                >
                  Contact Information
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          borderColor: "rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                          pl: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <EmailIcon
                            sx={{
                              mr: 1,
                              color: "primary.main",
                              fontSize: "1.2rem",
                            }}
                          />
                          Email
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderColor: "rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                        }}
                      >
                        <Typography sx={{ color: "text.secondary" }}>
                          {userInfo.email}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        sx={{
                          borderColor: "rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                          pl: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <PhoneIcon
                            sx={{
                              mr: 1,
                              color: "primary.main",
                              fontSize: "1.2rem",
                            }}
                          />
                          Phone
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderColor: "rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                        }}
                      >
                        <Typography sx={{ color: "text.secondary" }}>
                          {userInfo.countryCode + " " +userInfo.phone}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          borderColor: "rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                          pl: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LocationOnIcon
                            sx={{
                              mr: 1,
                              color: "primary.main",
                              fontSize: "1.2rem",
                            }}
                          />
                          Address
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderColor: "rgba(0, 0, 0, 0.06)",
                          py: 2.5,
                        }}
                      >
                        <Typography sx={{ color: "text.secondary" }}>
                          {userInfo.address}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Skills & CV */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Skills Card - Enhanced */}
          <Card
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
              },
              mb: 3,
              position: "relative",
            }}
          >
            {/* Decorative top accent bar */}
            <Box
              sx={{
                height: "6px",
                width: "100%",
                background:
                  "linear-gradient(90deg, primary.main, primary.light)",
              }}
            />

            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 700,
                  color: "primary.dark",
                  mb: 2,
                  "&::before": {
                    content: '""',
                    display: "inline-block",
                    width: "4px",
                    height: "20px",
                    backgroundColor: "primary.main",
                    marginRight: "12px",
                    borderRadius: "2px",
                  },
                }}
              >
                Skills
              </Typography>

              {/* Skill Chips with Enhanced Design */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mt: 2 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    sx={{
                      borderRadius: "12px",
                      py: 2.5,
                      fontWeight: 1000,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.15
                        ),
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                      "& .MuiChip-deleteIcon": {
                        color: "primary.main",
                        "&:hover": {
                          color: "error.main",
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* CV Buttons - Enhanced */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => setIsCvModalOpen(true)}
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: "12px",
                py: 1.5,
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                backgroundColor: "primary.main",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  transform: "translateY(-3px)",
                },
              }}
            >
              {showviewBtn ? "Update CV" : "Upload CV"}
            </Button>

            {showviewBtn && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleDisplayCV}
                startIcon={<CloudDownloadIcon />}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  borderColor: "primary.main",
                  borderWidth: "2px",
                  color: "primary.main",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "primary.dark",
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: "translateY(-3px)",
                  },
                }}
              >
                View CV
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={isCvModalOpen}
        onClose={handleCloseCvModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="primary"
            aria-label="upload"
            sx={{ mr: 1 }}
          >
            <UploadIcon />
          </IconButton>
          Upload CV
        </DialogTitle>

        <DialogContent sx={{ position: "relative" }}>
          {/* <Input
            type="file"
            onChange={handleFileChange}
            fullWidth
            disableUnderline
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              "&:hover": {
                borderColor: blue[500],
              },
                  cursor: "pointer",

            }}
          /> */}
          <input
  type="file"
  onChange={handleFileChange}
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    cursor: "pointer",
  }}
/>

          {cvFile && (
            <Typography variant="body2" sx={{ mt: 2, color: blue[700] }}>
              Selected: {cvFile.name}
            </Typography>
          )}

          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                mt: "-12px",
                ml: "-12px",
              }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCvModal} color="error" variant="outlined">
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSaveCVWithLoader}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save CV"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditingProfileData}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ overflow: "visible" }}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={editedInfo.name}
            // onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            disabled
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            value={editedInfo.email}
            // onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            disabled
          />
          {/* <TextField
            label="Phone"
            name="phone"
            fullWidth
            value={editedInfo.phone}
            onChange={handleInputChange}
            error={errors.mobile}
            helperText={errors.mobile}
            sx={{ marginBottom: 2 }}
          /> */}

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {/* Country Code Selector */}
            {/* <TextField
    select
    label="Code"
    name="countryCode"
    value={editedInfo.countryCode || ""} // default +91

    onChange={handleInputChange}
    sx={{ width: "120px" }}
  >
 
    {CountryCode.map((item) => (
    <MenuItem key={item.code} value={item.dial_code}>
    {item.flag} {item.dial_code} 
    </MenuItem>
  ))}
   
  </TextField> */}

            <Autocomplete
              disablePortal
              options={CountryCode}
              getOptionLabel={(option) => `${option.flag} ${option.dial_code}`}
              value={
                CountryCode.find(
                  (c) => c.dial_code === (editedInfo.countryCode || "")
                ) || null
              }
              onChange={(event, newValue) => {
                handleInputChange({
                  target: {
                    name: "countryCode",
                    value: newValue ? newValue.dial_code : "",
                  },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Code"
                  name="countryCode"
                  sx={{ width: "160px" }}
                  error={!!errors.countryCode}
                  helperText={errors.countryCode}
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option.dial_code === value.dial_code
              }
            />

            {/* Phone Number Input */}
            <TextField
              label="Phone"
              name="phone"
              fullWidth
              value={editedInfo.phone}
              onChange={handleInputChange}
              error={errors.mobile}
              helperText={errors.mobile}
            />
          </Box>

          <TextField
            label="Address"
            name="address"
            fullWidth
            value={editedInfo.address}
            error={errors.address}
            helperText={errors.address}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="AboutME"
            name="AboutME"
            fullWidth
            multiline
            rows={4}
            value={editedInfo.AboutME}
            onChange={handleInputChange}
            error={errors.aboutMe}
            helperText={errors.aboutMe}
            sx={{ marginBottom: 2 }}
          />

          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderRadius: "16px",
                    "&:hover": { backgroundColor: "primary.light" },
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                size="small"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skills (comma-separated)"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newSkill.trim()) {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                helperText="Enter multiple skills separated by commas"
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                sx={{
                  minWidth: "80px",
                  backgroundColor: "primary.main",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isEditingProfileImage}
        onClose={uniqueHandleCancelFunc}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(135deg, ${uniqueThemeInstance.palette.primary.light}, ${uniqueThemeInstance.palette.primary.main})`,
            color: "white",
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PhotoCamera sx={{ mr: 1.5 }} />
            <Typography variant="h6" component="h2" fontWeight={600}>
              Manage Profile Images
            </Typography>
          </Box>
          {!uniqueIsLoadingState && (
            <IconButton
              onClick={uniqueHandleCancelFunc}
              color="inherit"
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
              aria-label="Close dialog"
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2.5 }}>
          {/* Profile Picture Section */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountCircle
                  sx={{
                    color: uniqueThemeInstance.palette.primary.main,
                    mr: 1,
                  }}
                />
                <Typography variant="subtitle1" fontWeight={600}>
                  Profile Picture
                </Typography>
              </Box>
              {uniqueErrorMessages.profile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: uniqueThemeInstance.palette.error.main,
                    bgcolor: uniqueThemeInstance.palette.error.light,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <Info fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {uniqueErrorMessages.profile}
                  </Typography>
                </Box>
              )}
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: "2px dashed",
                borderColor: (theme) =>
                  uniqueErrorMessages.profile
                    ? theme.palette.error.main
                    : uniqueProfileImagePreview
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                borderRadius: 2,
                p: 2,
                transition: "all 0.3s",
                background: uniqueProfileImagePreview
                  ? "rgba(0,0,0,0.02)"
                  : "linear-gradient(145deg, rgba(255,255,255,0), rgba(0,0,0,0.02))",
                "&:hover": {
                  borderColor: "primary.main",
                  background: "rgba(0,0,0,0.03)",
                },
              }}
              onDrop={(e) => uniqueHandleDropFunc(e, "profile")}
              onDragOver={uniqueHandleDragOverFunc}
            >
              {!uniqueProfileImagePreview ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 3.5,
                  }}
                >
                  <CloudUpload
                    sx={{
                      fontSize: 48,
                      color: uniqueThemeInstance.palette.primary.main,
                      opacity: 0.7,
                      mb: 1.5,
                    }}
                  />
                  <Typography
                    variant="body1"
                    color="text.primary"
                    align="center"
                    fontWeight={500}
                    sx={{ mb: 1 }}
                  >
                    Drag & drop your profile image here
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mb: 2 }}
                  >
                    or select from your computer
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    color="primary"
                    startIcon={<PhotoCamera />}
                    sx={{
                      mb: 2,
                      px: 3,
                      py: 1,
                      borderRadius: 6,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    Browse Files
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) =>
                        uniqueHandleImageChangeFunc(e, "profile")
                      }
                      ref={uniqueProfileInputRefV1}
                    />
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "rgba(0,0,0,0.04)",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Info
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Recommended: Square JPG or PNG, max 5MB
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: uniqueThemeInstance.palette.primary.main,
                      mr: 2.5,
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <img
                      src={uniqueProfileImagePreview}
                      alt="Profile preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <CheckCircle
                        color="success"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body1" fontWeight={600}>
                        {profileImage?.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {profileImage &&
                        uniqueFormatFileSizeFunc(profileImage.size)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => uniqueHandleRemoveImageFunc("profile")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 6,
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        component="label"
                        color="primary"
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        sx={{
                          textTransform: "none",
                          borderRadius: 6,
                        }}
                      >
                        Change
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) =>
                            uniqueHandleImageChangeFunc(e, "profile")
                          }
                          ref={uniqueProfileChangeRefV1}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Cover Image Section */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Image
                  sx={{
                    color: uniqueThemeInstance.palette.primary.main,
                    mr: 1,
                  }}
                />
                <Typography variant="subtitle1" fontWeight={600}>
                  Cover Image
                </Typography>
              </Box>
              {uniqueErrorMessages.cover && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: uniqueThemeInstance.palette.error.main,
                    bgcolor: uniqueThemeInstance.palette.error.light,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <Info fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {uniqueErrorMessages.cover}
                  </Typography>
                </Box>
              )}
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: "2px dashed",
                borderColor: (theme) =>
                  uniqueErrorMessages.cover
                    ? theme.palette.error.main
                    : uniqueCoverImagePreview
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                borderRadius: 2,
                p: 2,
                transition: "all 0.3s",
                background: uniqueCoverImagePreview
                  ? "rgba(0,0,0,0.02)"
                  : "linear-gradient(145deg, rgba(255,255,255,0), rgba(0,0,0,0.02))",
                "&:hover": {
                  borderColor: "primary.main",
                  background: "rgba(0,0,0,0.03)",
                },
              }}
              onDrop={(e) => uniqueHandleDropFunc(e, "cover")}
              onDragOver={uniqueHandleDragOverFunc}
            >
              {!uniqueCoverImagePreview ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 3.5,
                  }}
                >
                  <CloudUpload
                    sx={{
                      fontSize: 48,
                      color: uniqueThemeInstance.palette.primary.main,
                      opacity: 0.7,
                      mb: 1.5,
                    }}
                  />
                  <Typography
                    variant="body1"
                    color="text.primary"
                    align="center"
                    fontWeight={500}
                    sx={{ mb: 1 }}
                  >
                    Drag & drop your cover image here
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mb: 2 }}
                  >
                    or select from your computer
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    color="primary"
                    startIcon={<PhotoCamera />}
                    sx={{
                      mb: 2,
                      px: 3,
                      py: 1,
                      borderRadius: 6,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    Browse Files
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => uniqueHandleImageChangeFunc(e, "cover")}
                      ref={uniqueCoverInputRefV1}
                    />
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "rgba(0,0,0,0.04)",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Info
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Recommended: JPG or PNG 1500x500px, max 5MB
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 140,
                      height: 70,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: uniqueThemeInstance.palette.primary.main,
                      mr: 2.5,
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <img
                      src={uniqueCoverImagePreview}
                      alt="Cover preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <CheckCircle
                        color="success"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body1" fontWeight={600}>
                        {coverImage?.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {coverImage && uniqueFormatFileSizeFunc(coverImage.size)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => uniqueHandleRemoveImageFunc("cover")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 6,
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        component="label"
                        color="primary"
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        sx={{
                          textTransform: "none",
                          borderRadius: 6,
                        }}
                      >
                        Change
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) =>
                            uniqueHandleImageChangeFunc(e, "cover")
                          }
                          ref={uniqueCoverChangeRefV1}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          {uniqueErrorMessages.submit && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: uniqueThemeInstance.palette.error.light,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Info color="error" sx={{ mr: 1 }} />
              <Typography variant="body2" color="error.dark">
                {uniqueErrorMessages.submit}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "rgba(0,0,0,0.02)",
            borderTop: "1px solid",
            borderColor: "divider",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={uniqueHandleCancelFunc}
            color="error"
            variant="outlined"
            disabled={uniqueIsLoadingState}
            startIcon={<Close />}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={uniqueHandleSubmitFunc}
            color="primary"
            variant="contained"
            disabled={uniqueIsLoadingState}
            startIcon={
              uniqueIsLoadingState ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save />
              )
            }
            sx={{
              px: 3,
              py: 1,
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              background: `linear-gradient(135deg, ${uniqueThemeInstance.palette.primary.main}, ${uniqueThemeInstance.palette.primary.dark})`,
            }}
          >
            {uniqueIsLoadingState ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* skill dialog */}
      <Dialog open={skillModelOpen} onClose={handleSkillModelClose}>
        <DialogTitle>Add a Skill</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter skill"
            variant="outlined"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkillModelClose}>Cancel</Button>
          <Button onClick={handleAddSkill} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Dialog
        open={displayCV}
        onClose={() => setDisplayCV(false)}
        fullWidth
        PaperProps={{
          sx: {
            width: "210mm",
            height: "297mm",
            maxWidth: "none",
            boxShadow: 5, // Add a subtle shadow
            borderRadius: 2, // Rounded corners
            border: "none", // No border
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            backgroundColor: "#f5f5f5", // Light background for the header
          }}
        >
          <Typography variant="h6">Resume</Typography>
          <IconButton
            edge="end"
            onClick={() => setDisplayCV(false)}
            aria-label="close"
            sx={{ color: (theme) => theme.palette.grey[700] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ height: "calc(297mm - 64px)", p: 0 }}>
          <Box sx={{ width: "100%", height: "100%" }}>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(cvURL)}&embedded=true`}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Resume"
              style={{ border: "none" }}
            />
          </Box>
        </DialogContent>
      </Dialog> */}

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

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 0,
          }}
        >
          <Typography variant="h6">🔒 Change Password</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ensure your new password is strong and secure.
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrent(!showCurrent)}
                      edge="end"
                    >
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNew ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPassword}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

        <Dialog
        open={isEditingColorModal}
        onClose={handleCancelColorCode}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Choose Update Theme Color </DialogTitle>
        <DialogContent sx={{ overflow: "visible" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
  <TextField
    label="Color Code"
    name="colorCode"
    variant="outlined"
    value={orgData.colorCode}
    onChange={handleInputColorCodeChange}
    error={!!errors.colorCode}
    helperText={errors.colorCode}
    sx={{ width: "100%" }}
  />

  <input
    type="color"
    value={orgData.colorCode || "#000000"}  // default fallback
    onChange={handleInputColorCodeChange}
    name="colorCode"
    style={{
      width: 40,
      height: 40,
      border: "none",
      cursor: "pointer",
    }}
  />
</Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelColorCode} color="error" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handeChangeTheme}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;

