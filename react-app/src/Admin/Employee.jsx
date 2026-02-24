import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Button, Autocomplete,CircularProgress,TextField, Card, CardContent, IconButton, TablePagination, Modal, MenuItem, Paper, alpha, useTheme, Avatar, Drawer, Select, InputLabel, Chip, Tooltip, Skeleton, FormControlLabel, Switch } from "@mui/material";
import * as XLSX from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControl from "@mui/material/FormControl";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";
import { Verified, GppMaybe, Phone } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import BadgeIcon from "@mui/icons-material/Badge";
import TaskIcon from "@mui/icons-material/Task";
import FolderIcon from "@mui/icons-material/Folder";
import { useDispatch, useSelector } from "react-redux";
import PeopleIcon from "@mui/icons-material/People";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { fetchEmployees,setEmployeeProfilePics,addEmployeetData, updateEmployeeReporter,} from "../redux/Employee/EmployeeSlice";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import SaveIcon from "@mui/icons-material/Save";

import ContactMailIcon from "@mui/icons-material/ContactMail";
import { SelectButton } from "primereact/selectbutton";
import { ExportTimeSheet } from "./ExportTimeSheet";

function Users() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  
    const [addLoading, setAddLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const[deleteLoading, setDeleteLoading] = useState(false);
const [isEditingManager, setIsEditingManager] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
const [profileData, setProfileData] = useState({
  EmpID: "",
  Location: "",
  Shift_start_time: "",
  Shift_end_time: "",
});



  const [currentEmployee, setCurrentEmployee] = useState({
    user_id:"",
    first_name: "",
    last_name: "",
    email_id: "",
    role_details: {
      role_name: "",
      role_id: "",
    },
  });
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    email_id: "",
    role_details: {
      role_name: "",
      role_id: "",
    },
  });

  const [value, setValue] = useState(null);
  // const items = [
  //   { name: "Admin", value: 1 },
  //   { name: "Client", value: 2 },
  //   { name: "Users", value: 3 },
  // ];

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [relatedEmployees, setRelatedEmployees] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  // const [sheetDrawer, setSheetDrawer] = useState(false);

  const [employeeData, setEmployeeData] = useState({
    first_name: "",
    last_name: "",
    email_id: "",
    role: "",
  });

  const [newRole, setNewRole] = useState({
    role_name: "",
    role_discription: "",
  });

  const [errors, setErrors] = useState({});

  const[roleDrawer, setRoleDrawer] = useState(false);


  const [startDate, setStartDate] = useState("");
   const [endDate, setEndDate] = useState("");


// const handleDownload = async () => {
//   try {
   

//     const TimeEntryResponse = await axios.get(
//       "/server/time_entry_management_application_function/user-timeentry",
//       {
//         params: {
//           startDate: startDate,
//           endDate: endDate,
//           userID: selectedEmployee.user_id,
//         },
//       }
//     );

   

//     const entries = TimeEntryResponse.data.data;

//     const worksheet = XLSX.utils.json_to_sheet(entries);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Task Time Entries");

//     XLSX.writeFile(workbook, "employee_data.xlsx");
//   } catch (error) {
//     console.error("Download error:", error);
//   }
// };

const [errorsTimeSheet, setErrorsTimeSheet] = useState({});

const validateFormTimesheet = () =>{
       let tempErrors = {};
   
    if (!startDate) tempErrors.startDate = "Start Date is required.";
    if (!endDate) tempErrors.endDate = "End Date is required.";
    if (
      startDate &&
      endDate &&
      startDate > endDate
    )
      tempErrors.endDate = "End Date must be after Start Date.";
   

    setErrorsTimeSheet(tempErrors);
    return Object.keys(tempErrors).length === 0;
}


// const dowloadExcel = () =>{
//     if (validateFormTimesheet()) {
//       handleDownload();
// }}

  const handleAlert = (type, label) => {
    setShow(false); // Hide alert first to trigger re-render

    setTimeout(() => {
      setalerttype(type);
      setAlertLabel(label);
      setShow(true);

      setTimeout(() => {
        setShow(false);
        setAlertLabel("");
      }, 2000); // Auto-hide after 2s
    }, 100); // Small delay ensures re-triggering
  };
  const { data: employeesData, profilePics } = useSelector(
    (state) => state.employeeReducer
  );
  const placeholderURL =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        //Fetch the list of employees
        if (!Array.isArray(employeesData) || employeesData.length === 0) {
          await dispatch(fetchEmployees()).unwrap(); // wait until data is fetched
        }

        // const userResponse = employee;

        const userEmployee = employeesData;
        const filteredEmployees = userEmployee.filter(
          (employee) => employee.role_details?.role_name !== "Contacts" && employee.role_details?.role_name !== "Super Admin"
        );

        // Set all employees initially with placeholder profile images
        const employeesWithPlaceholders = filteredEmployees.map((employee) => ({
          ...employee,
          profile_pic: placeholderURL,
          
        }));
        setEmployees(employeesWithPlaceholders);
        setLoading(false);

        // Fetch profile pictures for each employee
        // const updatedEmployees = await Promise.all(
        //   filteredEmployees.map(async (employee) => {
        //     const cachedPic = profilePics[employee.user_id];
        //     if (cachedPic) {
        //       return { ...employee, profile_pic: cachedPic };
        //     }

        //     try {
        //       const response = await axios.get(
        //         `/server/time_entry_management_application_function/userprofile/${employee.user_id}`
        //       );
        //       const pic = response.data.data || placeholderURL;

        //       // Cache the image in Redux
        //       // dispatch(
        //       //   setEmployeeProfilePics({
        //       //     userId: employee.user_id,
        //       //     profile_pic: pic,
        //       //   })
        //       // );

        //       return {
        //         ...employee,
        //         profile_pic: pic,
        //       };
        //     } catch (error) {
        //       console.error(
        //         `Error fetching profile for user ${employee.user_id}:`,
        //         error
        //       );
        //       return {
        //         ...employee,
        //         profile_pic: placeholderURL,
        //       };
        //     }
        //   })
        // );
        const updatedEmployees = filteredEmployees;

        // After all profiles are fetched, update the state with the full list of employees
        setEmployees(updatedEmployees);
      } catch (error) {
        console.error("Error fetching employees data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [employeesData, dispatch]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (selectedEmployee) {
        try {
          // Fetch projects
          const projectResponse = await axios.get(
            "/server/time_entry_management_application_function/projects"
          );

          // Filter projects for this employee
          const userProjects = projectResponse.data.data.filter(
            (project) => project.Assigned_To_Id === selectedEmployee.user_id
          );
          setEmployeeProjects(userProjects);

          // Fetch tasks
          const taskResponse = await axios.get(
            `/server/time_entry_management_application_function/emp/${selectedEmployee.user_id}`
          );
          // console.log("Task Response Data:", taskResponse.data.data);
          setEmployeeTasks(taskResponse.data.data || []);
        } catch (error) {
          console.error("Error fetching employee data:", error);
        }
      }
    };

    fetchEmployeeData();
  }, [selectedEmployee]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
 
  const handleEdit = (employee) => {
    // console.log("Userid",employee);
    setCurrentEmployee({
       user_id:employee.user_id,
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email_id: employee.email_id || "",
      role_details: {
        role_name: employee.role_details?.role_name || "",
        role_id: employee.role_details?.role_id || "",
      },
    });
    setEditModalOpen(true);
  };
  const handleDelete = async (userID) => {
    setSelectedUser(userID);

    try {
      const response = await axios.get(
        `/server/time_entry_management_application_function/employees/${userID}`
      );

      const Resdata = await axios.get(
        `/server/time_entry_management_application_function/employee`
      );
      const filteredEmployees = Resdata.data.users.filter(
        (emp) => emp.user_id !== userID
      );
      setRelatedTasks(response.data.data);
      setRelatedEmployees(filteredEmployees);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error("Error fetching related data:", error);
    }
  };
  const confirmDelete = async () => {
    if (assigned.length !== relatedTasks.length) {
      handleAlert("error", "Please assign all tasks before deleting the user.");
      return;
    }
    try {
      setDeleteLoading(true);
      await axios.post(
        `/server/time_entry_management_application_function/employee/${selectedUser}`,
        assigned
      );

      setEmployees(employees.filter((emp) => emp.user_id !== selectedUser));
      handleAlert("info", "User deleted successfully");
      setAssigned([]);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      handleAlert("error", "Error deleting user");
    }finally{
      setDeleteLoading(false);
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
  };

  const roleFilteredEmployees = roleFilter
    ? employees.filter((emp) => emp.role_details.role_name === roleFilter)
    : employees;

  const filteredEmployees = roleFilteredEmployees.filter((employee) =>
    (employee.first_name?.toLowerCase() || "").includes(
      searchQuery.toLowerCase()
    )
  );

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const toggleUserActive = async (userID, active) => {
     //  console.log(userID, active);
    try {
      const response = await axios.post(
        `/server/time_entry_management_application_function/employee/${active}/${userID}`
      );
      // const updatedEmployee = employees.map((employee) => {
      //   if (employee.user_id === userID) {
      //     employee.status = active === "ACTIVE" ? "DISABLED" : "ACTIVE";
      //   }
      //   return employee;
      // });
      const updatedEmployee = employees.map((employee) =>
        employee.user_id === userID
          ? { ...employee, status: active === "ACTIVE" ? "DISABLED" : "ACTIVE" }
          : employee
      );

      if (active !== "ACTIVE") {
        handleAlert("success", "Employee is Active now..");
      } else {
        handleAlert("error", "Employee is Inactive");
      }
      setEmployees(updatedEmployee);
    } catch (err) {
      console.error(err);
    }
  };
  // const handleEditChange = (event) => {
  //   const { name, value } = event.target;
  //   setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
  // };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
  
    if (name === "role") {
      const role_id = roleMapping[value];
      setCurrentEmployee((prev) => ({
        ...prev,
        role_details: {
          role_name: value,
          role_id: role_id,
        },
      }));
    } else {
      setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleUpdateEmployee = async () => {
   // console.log("Updating Employee:", currentEmployee);

    if (!currentEmployee?.user_id) {
      handleAlert("error", "Invalid Employee Data");
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await axios.post(
        `/server/time_entry_management_application_function/UpdateEmployee/${currentEmployee.user_id}`,
        {
          email_id: currentEmployee.email_id,
          last_name: currentEmployee.last_name,
          // org_id: "50026358236",
          role_id: currentEmployee.role_details?.role_id || "", // Handle undefined role_id
          first_name: currentEmployee.first_name,
        }
      );

      

     if (response.status === 200) {
  setEmployees((prevEmployees) =>
    prevEmployees.map((employee) =>
      employee.user_id === currentEmployee.user_id
        ? { 
            ...employee, 
            ...response.data.data // ✅ merge only updated fields
          }
        : employee
    )
  );



        handleAlert("success", "Employee updated successfully");
        setEditModalOpen(false);
        setCurrentEmployee({
          user_id:"",
      first_name: "",
      last_name:  "",
      email_id: "",
      role_details: {
        role_name: "",
        role_id:  "",
      },
        });
      } else {
        handleAlert(
          "error",
          response.data.message || "Failed to update employee"
        );
       }
    } catch (error) {
      console.error("Error updating employee:", error.response || error);
      handleAlert(
        "error",
        error.response?.data?.message || "Something went wrong!"
      );
    }finally{
      setAddLoading(false);
    }
  };
  const handleEditCancel = () => {
    setEditModalOpen(false);
    setCurrentEmployee({
      first_name: "",
      last_name: "",
      email_id: "",
      role_details: {
        role_name: "",
        role_id: "",
      },
    });
  };
  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };
  const roleMapping = {
    Intern: "17682000000035343",
    Developer: "17682000000035358",
    "Manager/Team Lead": "17682000000035348",
    "MIS Analyst": "17682000000434126",
    // Admin: "17682000000035329",
  //  "Team Lead": "17682000000035353",
    Sales:"17682000000659420",
    "Business Analyst": "17682000000035368",
    "Pre Sales": "17682000000659425"

    // Add more roles as necessary
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!newEmployee.first_name.trim())
      tempErrors.first_name = "First Name is required";
    //  if (!newEmployee.last_name.trim()) tempErrors.last_name = "Last Name is required";
    if (!newEmployee.email_id.trim()) {
      tempErrors.email_id = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(newEmployee.email_id)) {
      tempErrors.email_id = "Enter a valid email";
    }
    if (!newEmployee.role_details.role_name)
      tempErrors.role = "Role is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "role") {
      console.log(value, roleMapping[value]);
      setNewEmployee((prev) => ({
        ...prev,
        role_details: {
          role_name: value,
          role_id: roleMapping[value],
        },
      }));
      console.log("value and name", name, value);
    } else setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async () => {
    if (
      newEmployee.first_name &&
      newEmployee.email_id &&
      newEmployee.role_details?.role_id
    ) {
      console.log("Adding Employee:", newEmployee);

      try {
        setAddLoading(true);
        const response = await axios.post(
          "/server/time_entry_management_application_function/AddEmployees",
          {
            first_name: newEmployee.first_name,
            last_name: newEmployee.last_name,
            email_id: newEmployee.email_id,
          //  org_id: 50026358236,
            role_id: newEmployee.role_details.role_id,
          }
        );

       // console.log("API Response:", response.data);

        // Ensure user details are correctly received
        const userDetails = response.data?.data?.user_details;
        if (!userDetails) {
          throw new Error("User details not found in response.");
        }

        // Update employees state
        setEmployees((prev) => {
          const updatedEmployees = [...prev, userDetails];
        //  console.log("Updated Users List:", updatedEmployees);
          return updatedEmployees;
        });
        dispatch(addEmployeetData(userDetails));

        // Show success alert
        handleAlert("success", "Employee Added and confirmed.");

        // Close drawer & reset form
        setDrawerOpen(false);
        setNewEmployee({}); // Reset to an empty object
      } catch (error) {
        console.error("Error adding employee:", error);

        handleAlert(
          "error",
          error.response?.data?.message ||
            error.message ||
            "Something went wrong!"
        );
      }finally{
        setAddLoading(false);
      }
    } else {
      handleAlert("error", "Please fill all fields");
    }
    toggleDrawer(false);
  };

  const handleTaskInput = (index, event) => {
    const selectedEmployeeId = event.target.value;
    const selectedEmployee = relatedEmployees.find(
      (emp) => emp.user_id === selectedEmployeeId
    );

    const taskEntry = {
      assigned_To: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
      assigned_To_Id: selectedEmployee.user_id,
      Task_ID: index.Tasks.ROWID,
    };

    setAssigned((prevAssigned) => {
      const existingIndex = prevAssigned.findIndex(
        (task) => task.Task_ID === taskEntry.Task_ID
      );

      if (existingIndex !== -1) {
        // If same employee is selected again, remove the entry
        if (prevAssigned[existingIndex].assigned_To_Id === selectedEmployeeId) {
          return prevAssigned.filter((_, i) => i !== existingIndex);
        }
        // Otherwise, update the existing entry
        const updatedAssign = [...prevAssigned];
        updatedAssign[existingIndex] = taskEntry;
        return updatedAssign;
      }

      // Add new entry
      return [...prevAssigned, taskEntry];
    });
  };

  const handleProfileClick = (employee) => {
    console.log("selected+>", employee);
    setSelectedEmployee(employee);
    setProfileModalOpen(true);
  };

  const designationConfig = {
    Developer: {
      color: "#0288d1",
      backgroundColor: "#e1f5fe",
      borderColor: "#81d4fa",
    },
    Designer: {
      color: "#7b1fa2",
      backgroundColor: "#f3e5f5",
      borderColor: "#ce93d8",
    },
    Manager: {
      color: "#2e7d32",
      backgroundColor: "#e8f5e9",
      borderColor: "#a5d6a7",
    },
    "Team Lead": {
      color: "#ed6c02",
      backgroundColor: "#fff3e0",
      borderColor: "#ffb74d",
    },
  };

  const verificationConfig = {
    verified: {
      icon: Verified,
      label: "Verified",
      color: "#1b5e20",
      backgroundColor: "#e8f5e9",
      borderColor: "#a5d6a7",
      tooltipText: "Account Verified",
    },
    pending: {
      icon: GppMaybe,
      label: "Pending",
      color: "#e65100",
      backgroundColor: "#fff3e0",
      borderColor: "#ffb74d",
      tooltipText: "Verification Pending",
    },
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddEmployee(newEmployee);
   
    }
  };

  const handleReinvite = async (employee) => {
    try {
     // console.log("Reinvite", employee);

      const response = await axios.post(
        "/server/time_entry_management_application_function/reInviteEmployees",
        {
          first_name: employee.first_name,
          last_name: employee.last_name,
          email_id: employee.email_id,
          user_id: employee.user_id,
          role_id: employee.role_details.role_id,
        }
      );

      // console.log("Reinvite response:", response.data);
      if (response.status) {
        handleAlert("success", "send Reinvitation Successfully");
        
      }
      // You can show a success message here if needed
    } catch (error) {
      console.error("Error during reinvite:", error);
      handleAlert("error", "Reinvitation not send ");
      // You can show an error message to the user here
    }
  };


// const toggleSheetDrawer = (open) => {
//     setSheetDrawer(open);
//   };  

const handleroleDrawer = (open) =>{
     setRoleDrawer(open);
}

 const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRole = async () => {
    let tempErrors = {};
    if (!newRole.role_name.trim()) {
      tempErrors.role_name = "Role Name is required";
    }
    if (!newRole.role_discription.trim()) {
      tempErrors.role_discription = "Role Description is required";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length === 0) {
    //  console.log("New Role Submitted:", newRole);
      // 👉 Here you can call API with axios/fetch
      // await axios.post("/api/roles", newRole);

      // reset form
      setNewRole({ role_name: "", role_discription: "" });
      handleroleDrawer(false);
    }
  };


  
 useEffect(() => {
  if (selectedEmployee) {
    setIsEditingManager(false);

    const manager = employees.find(
      (emp) => emp.user_id === selectedEmployee.reporterId
    );

    setSelectedManager(manager || null);
  }
}, [selectedEmployee, employees]);


const handleAssignManager = (manager) => {
  // console.log("manager",manager);
  setSelectedManager(manager); // store full employee object
};


const handleAddReportingManager = async () => {
  if (!selectedManager) return;

  try {
    setLoading(true);

    // console.log("selec",selectedManager);

    const payload = {
      user_id: selectedEmployee.user_id,
      reporter_id: selectedManager.user_id,
      reporter_name: `${selectedManager.first_name} ${selectedManager.last_name}`,
      reporter_image: selectedManager.profile_pic,
    };

    const res = await axios.post(
      "/server/time_entry_management_application_function/reporterToUser",
      payload
    );

    if (res.status === 200 || res.status === 201) {
       const reporterPayload = {
    user_id: selectedEmployee.user_id,
    reporterId: selectedManager.user_id,
    reporterName: `${selectedManager.first_name} ${selectedManager.last_name}`,
    reporter_image: selectedManager.profile_pic,
  };

  dispatch(updateEmployeeReporter(reporterPayload))
   setSelectedEmployee((prev) => ({
    ...prev,
    reporterId: reporterPayload.reporterId,
    reporterName: reporterPayload.reporterName,
  }));
      handleAlert("success", "Reporting manager assigned successfully");
      

      setIsEditingManager(false);
    }
  } finally {
    setLoading(false);
  }
};



const handleEditClick = () => {
  setIsEditingManager(true);
};

// Profile editing handlers
const handleProfileEdit = () => {
  if (!selectedEmployee) return;

  console.log(selectedEmployee)

  setProfileData({
    EmpID: selectedEmployee.EmpID || "",
    Location: selectedEmployee.Location || "",
    Shift_start_time: selectedEmployee.Shift_start_time || "",
    Shift_end_time: selectedEmployee.Shift_end_time || "",
  });

  setIsEditingProfile(true);
};


const handleProfileFieldChange = (field, value) => {
  setProfileData(prev => ({
    ...prev,
    [field]: value
  }));
};
const handleProfileUpdate = async () => {
  if (!selectedEmployee?.user_id) {
    handleAlert("error", "Invalid Employee Data");
    return;
  }

  try {
    setProfileUpdateLoading(true);

    console.log("profileData",profileData)

    const response = await axios.post(
      `/server/time_entry_management_application_function/profile/update/${selectedEmployee.user_id}`,
      profileData
    );

    if (response.status === 200) {

      // ✅ update selectedEmployee
      setSelectedEmployee(prev => ({
        ...prev,
        ...profileData,
      }));

      // ✅ update employees list
      setEmployees(prev =>
        prev.map(emp =>
          emp.user_id === selectedEmployee.user_id
            ? { ...emp, ...profileData }
            : emp
        )
      );

      handleAlert("success", "Profile updated successfully");
      setIsEditingProfile(false);
    }
  } catch (err) {
    handleAlert("error", "Something went wrong");
  } finally {
    setProfileUpdateLoading(false);
  }
};


const handleProfileCancel = () => {
  setIsEditingProfile(false);
  setProfileData({
    EmpID: "",
    Location: "",
    Shift_start_time: "",
    Shift_end_time: ""
  });
};


  return (
    <Box sx={{ padding: 3 }}>
      <Snackbar
        open={show}
        onClose={() => setShow(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        TransitionComponent={SlideTransition}
      >
        <Alert severity={alerttype} onClose={() => setShow(false)}>
          {alertLabel}
        </Alert>
      </Snackbar>

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
            <PeopleIcon sx={{ color: "#fff" }} fontSize="large" />
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
            Users
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
            label="Search Users"
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
            Add Users
          </Button>

          {/* <Button
            variant="contained"
            color="primary"
           
            onClick={() => toggleSheetDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
            
          >
            Export Time 
          </Button> */}
           {/* <Button
            variant="contained"
            color="primary"
           
            onClick={() => handleroleDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
            
          >
            Add Role
          </Button> */}
        </Box>
      </Paper>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Skeleton
                      variant="circular"
                      width={50}
                      height={50}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ width: "100%" }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent>
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h5" color="text.secondary">
                No Users Found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                There are no employees to display.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {paginatedEmployees.map((employee) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={employee.user_id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "#e3f2fd"
                        : theme.palette.primary.dark,
                  },
                }}
                onClick={() => handleProfileClick(employee)}
              >
                <CardContent>
                  {/* Employee Header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={employee.profile_pic}
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 2,
                        border: "2px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      imgProps={{ loading: "lazy" }} // Add this line
                      // onClick={() => handleProfileClick(employee)}
                    />
                    <Box>
                      <Typography variant="h6">
                        {employee.first_name + " " + employee.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {"U" +
                          employee.user_id.substr(employee.user_id.length - 4)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Employee Details */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "nowrap",
                      overflow: "auto",
                      "&::-webkit-scrollbar": { display: "none" },
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <Chip
                      label={employee.role_details.role_name}
                      size="small"
                      sx={{
                        height: "24px",
                        flexShrink: 0,
                        backgroundColor:
                          designationConfig[employee.role_details.role_name]
                            ?.backgroundColor || "#f5f5f5",
                        color:
                          designationConfig[employee.role_details.role_name]
                            ?.color || "#757575",
                        border: `1px solid ${designationConfig[employee.role_details.role_name]?.borderColor || "#e0e0e0"}`,
                        "& .MuiChip-label": {
                          px: 1,
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                    <Tooltip
                      title={
                        employee.is_confirmed
                          ? "Account Verified"
                          : "Verification Pending"
                      }
                    >
                      <Chip
                        icon={
                          <Box
                            component={
                              employee.is_confirmed
                                ? verificationConfig.verified.icon
                                : verificationConfig.pending.icon
                            }
                            sx={{
                              fontSize: "0.875rem",
                              mr: "2px",
                              ml: "2px",
                            }}
                          />
                        }
                        label={employee.is_confirmed ? "Verified" : "Pending"}
                        size="small"
                        sx={{
                          height: "24px",
                          flexShrink: 0,
                          backgroundColor: employee.is_confirmed
                            ? verificationConfig.verified.backgroundColor
                            : verificationConfig.pending.backgroundColor,
                          color: employee.is_confirmed
                            ? verificationConfig.verified.color
                            : verificationConfig.pending.color,
                          border: `1px solid ${employee.is_confirmed ? verificationConfig.verified.borderColor : verificationConfig.pending.borderColor}`,
                          "& .MuiChip-label": {
                            px: 1,
                            fontSize: "0.75rem",
                          },
                        }}
                      />
                    </Tooltip>
                  </Box>
                </CardContent>

                <CardContent
                  sx={{
                    mt: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={employee.status === "ACTIVE"}
                          onChange={(e) => {
                            toggleUserActive(employee.user_id, employee.status);
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // this reliably stops parent clicks
                          }}
                        />
                      }
                      label={
                        employee.status === "ACTIVE" ? "Active" : "Inactive"
                      }
                    />
                  </Box>
                  <Box>
                    {!employee.is_confirmed && (
                      <IconButton
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReinvite(employee);
                        }}
                      >
                        <ContactMailIcon />
                      </IconButton>
                    )}

                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(employee);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(employee.user_id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <TablePagination
          component="div"
          rowsPerPageOptions={[6, 12, 24]}
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
           labelRowsPerPage="Users per page"
        />
      </Box>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={handleEditCancel}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%", // Reduced width to 60%
            maxHeight: "80vh", // Set max height to 80% of viewport height
            overflowY: "auto", // Add scroll if content exceeds max height
            padding: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Edit User Details
          </Typography>
          <TextField
            label="First_Name"
            name="first_name"
            fullWidth
            variant="outlined"
            value={currentEmployee.first_name}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Last_Name"
            name="last_name"
            fullWidth
            variant="outlined"
            value={currentEmployee.last_name}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Role"
            name="role"
            fullWidth
            variant="outlined"
            select
            value={currentEmployee.role_details.role_name}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.role}
            helperText={errors.role}
          >
            {Object.keys(roleMapping).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Email_Id"
            name="email_id"
            fullWidth
            variant="outlined"
            value={currentEmployee.email_id}
            onChange={handleEditChange}
            //  InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            disabled
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
              onClick={handleUpdateEmployee}
                        disabled={updateLoading}

            >
              {updateLoading ? (
                                            <CircularProgress size={24} color="inherit" />
                                          ) : (
                                            "Update"
                                          )}
            </Button>
            <Button variant="outlined" color="error" onClick={handleEditCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "30%",
            maxHeight: "70vh", // Increased height for better view
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Fixed Header */}
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              position: "sticky",
              top: 0,
              backgroundColor: "background.paper",
              zIndex: 2,
            }}
          >
            {relatedTasks.length === 0
              ? " No Tasked Pending ?"
              : "Task Assignation"}
          </Typography>

          {/* Scrollable Task List */}
          <Box sx={{ overflowY: "auto", maxHeight: "50vh", pr: 1 }}>
            {relatedTasks.map((index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                {/* Task TextField */}
                <TextField
                  label={`${index.Tasks.Task_Name}`}
                  fullWidth
                  variant="outlined"
                  disabled
                />

                {/* Employee Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Select Employee</InputLabel>
                  <Select onChange={(e) => handleTaskInput(index, e)}>
                    {relatedEmployees
                      .filter(
                        (employee) =>
                          employee.role_details.role_name !== "Admin" &&
                          employee.role_details.role_name !== "Super Admin"
                      )
                      .map((employee) => (
                        <MenuItem
                          key={employee.user_id}
                          value={employee.user_id}
                        >
                          {employee.first_name + " " + employee.last_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>

          {/* Buttons */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="error" onClick={confirmDelete}   disabled={deleteLoading}>
               {deleteLoading ? (
                                             <CircularProgress size={24} color="inherit" />
                                           ) : (
                                             "Confirm"
                                           )}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box
          sx={{
            width: 400,
            padding: 2,
            position: "relative",
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
              marginBottom: 2,
            backgroundColor: theme.palette.primary.main,
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <PersonAddAlt1Icon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New User
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
            label="First Name"
            name="first_name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.first_name}
            helperText={errors.first_name}
          />

          <TextField
            label="Last Name"
            name="last_name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            // error={!!errors.last_name}
            // helperText={errors.last_name}
          />

          <TextField
            label="Email"
            name="email_id"
            fullWidth
            variant="outlined"
            type="email"
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.email_id}
            helperText={errors.email_id}
          />

          <TextField
            label="Role"
            name="role"
            fullWidth
            variant="outlined"
            select
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.role}
            helperText={errors.role}
          >
            {Object.keys(roleMapping).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
              gap: 2,
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
            <Button
              variant="outlined"
              color="error"
              onClick={() => toggleDrawer(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Modal
        open={profileModalOpen}
        onClose={handleProfileModalClose}
        aria-labelledby="profile-modal-title"
      >
        <Box
          sx={(theme) => ({
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95%",
              sm: "90%",
              md: "80%",
              lg: "70%",
            },
            maxWidth: "1200px",
            maxHeight: "90vh",
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: 24,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          })}
        >
          {/* Header with avatar and name in single line */}
          <Box
            sx={(theme) => ({
              width: "100%",
              height: 100,
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              padding: "0 40px",
              position: "relative",
              overflow: "hidden",
              marginBottom: 2,
            })}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.common.black} 25%, transparent 25%, transparent 75%, ${theme.palette.common.black} 75%, ${theme.palette.common.black}), linear-gradient(45deg, ${theme.palette.common.black} 25%, transparent 25%, transparent 75%, ${theme.palette.common.black} 75%, ${theme.palette.common.black})`,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
            />

            {/* Profile content container */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                zIndex: 1,
              }}
            >
              <Avatar
                src={selectedEmployee.profile_pic}
                sx={{
                  width: 70,
                  height: 70,
                  border: (theme) => `3px solid ${theme.palette.common.white}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  color: (theme) => theme.palette.common.white,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {selectedEmployee
                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                  : ""}
              </Typography>
            </Box>
          </Box>

          {/* Updated Employee details container */}
          <Box
            sx={{
              p: 3,
              overflowY: "auto", // Make content scrollable
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // Two-column layout
              gap: 3,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "10px",
                "&:hover": {
                  background: "#666",
                },
              },
            }}
          >
            {/* Left column - Employee Info */}
            <Box>
              {/* Personal Information Section */}
              <Typography
                variant="h6"
                sx={(theme) => ({
                  mb: 2,
                  color: theme.palette.primary.main,
                })}
              >
                Personal Information
              </Typography>

              {/* Keep existing employee details boxes */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <PersonIcon
                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      Full Name
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      {selectedEmployee
                        ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                        : ""}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <EmailIcon
                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      Email Address
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      {selectedEmployee?.email_id || ""}
                    </Typography>
                  </Box>
                </Box>

                {/* <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <WorkIcon
                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      Role
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      {selectedEmployee?.role_details?.role_name || ""}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      Role
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      {selectedEmployee?.role_details?.role_name || ""}
                    </Typography>
                  </Box>
                </Box> */}
                <Box sx={{ display: "flex", flexDirection: "row", gap: 6, mb: 2 }}>
  {/* Role Section */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <WorkIcon sx={(theme) => ({ color: theme.palette.text.secondary })} />
    <Box>
      <Typography
        variant="caption"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
        })}
      >
        Role
      </Typography>
      <Typography
        variant="body1"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
        })}
      >
        {selectedEmployee?.role_details?.role_name || ""}
      </Typography>
    </Box>
  </Box>

  {/* Contact Number Section */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <PhoneIcon sx={(theme) => ({ color: theme.palette.text.secondary })} />
    <Box>
      <Typography
        variant="caption"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
        })}
      >
        Contact Number
      </Typography>
      <Typography
        variant="body1"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
        })}
      >
        {selectedEmployee?.phone || ""}
      </Typography>
    </Box>
  </Box>
</Box>

       
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <BadgeIcon
                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center", // Aligns items in a row
                      gap: 1, // Adds space between elements
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    >
                      Status
                    </Typography>
                    <Chip
                      label={selectedEmployee?.status || ""}
                      size="small"
                      color={
                        selectedEmployee?.status === "ACTIVE"
                          ? "success"
                          : "error"
                      }
                    />
                  </Box>
                </Box>

                {/* Verification Status */}
                 <Box sx={{ display: "flex", flexDirection: "row", gap: 6, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {selectedEmployee?.is_confirmed ? (
                    <Chip
                      icon={<Verified />}
                      label="Verified Account"
                      size="small"
                      sx={{
                        backgroundColor:
                          verificationConfig.verified.backgroundColor,
                        color: verificationConfig.verified.color,
                        border: `1px solid ${verificationConfig.verified.borderColor}`,
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<GppMaybe />}
                      label="Verification Pending"
                      size="small"
                      sx={{
                        backgroundColor:
                          verificationConfig.pending.backgroundColor,
                        color: verificationConfig.pending.color,
                        border: `1px solid ${verificationConfig.pending.borderColor}`,
                      }}
                    />
                  )}
                </Box>
{/*                
               <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    {selectedEmployee?.reporterName ? (
      <Chip
        label={`Reporting To: ${selectedEmployee.reporterName}`}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    ) : (
    
     <Autocomplete
  size="small"
  options={employees}
  getOptionLabel={(option) => option.first_name + " " + option.last_name}
  onChange={(event, value) => handleAssignManager(value)}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Reporting Manager"
      placeholder="Type name..."
    />
  )}
  sx={{ minWidth: 200 }}
/>

    )}
     <Button
              onClick={handleAddReportingManager}
              variant="contained"
              sx={(theme) => ({
                minWidth: "120px",
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              })}
            >
             submit
            </Button>
  </Box> */}

  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
  {selectedEmployee?.reporterName && !isEditingManager ? (
    <>
      <Chip
        label={`Reporting To: ${selectedEmployee.reporterName}`}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />

      <IconButton onClick={handleEditClick} size="small">
        <EditIcon />
      </IconButton>
    </>
  ) : (
    <>
 <Autocomplete
  size="small"
  options={employees}
  value={selectedManager}
  getOptionLabel={(option) =>
    option ? `${option.first_name} ${option.last_name}` : ""
  }
  isOptionEqualToValue={(option, value) =>
    option.user_id === value.user_id
  }
  onChange={(e, value) => handleAssignManager(value)}
  renderInput={(params) => (
    <TextField {...params} label="Select Reporting Manager" />
  )}
  sx={{ minWidth: 220 }}
/>


      <Button
        onClick={handleAddReportingManager}
        variant="contained"
        sx={(theme) => ({
          minWidth: "120px",
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        })}
        disabled={!selectedManager}
      >
        Submit
      </Button>
    </>
  )}
</Box>

  

               </Box>
               

              </Box>

              {/* New Profile Fields Section */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={(theme) => ({
                      color: theme.palette.primary.main,
                    })}
                  >
                    Work Information
                  </Typography>
                  {!isEditingProfile && (
                    <Tooltip title="Edit Work Information">
                      <IconButton 
                        onClick={handleProfileEdit}
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Employee ID Field */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <BadgeIcon sx={(theme) => ({ color: theme.palette.text.secondary })} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                        })}
                      >
                        Employee ID
                      </Typography>
                      {isEditingProfile ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={profileData.EmpID}
                          onChange={(e) => handleProfileFieldChange("EmpID", e.target.value)}
                          placeholder="Enter Employee ID"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                          })}
                        >
                          {selectedEmployee?.EmpID || "Not Assigned"}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Location Field */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <LocationOnIcon sx={(theme) => ({ color: theme.palette.text.secondary })} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                        })}
                      >
                        Office Location
                      </Typography>
                      {isEditingProfile ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={profileData.Location}
                          onChange={(e) => handleProfileFieldChange("Location", e.target.value)}
                          placeholder="Enter Office Location"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                          })}
                        >
                          {selectedEmployee?.Location || "Not Assigned"}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Shift Times Row */}
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 6 }}>
                    {/* Shift Start Time */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                      <AccessTimeIcon sx={(theme) => ({ color: theme.palette.text.secondary })} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                          })}
                        >
                          Shift Start Time
                        </Typography>
                        {isEditingProfile ? (
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            value={profileData.Shift_start_time}
                            onChange={(e) => handleProfileFieldChange("Shift_start_time", e.target.value)}
                            sx={{ mt: 0.5 }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                            })}
                          >
                            {selectedEmployee?.Shift_start_time || "Not Assigned"}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Shift End Time */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                      <AccessTimeFilledIcon sx={(theme) => ({ color: theme.palette.text.secondary })} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                          })}
                        >
                          Shift End Time
                        </Typography>
                        {isEditingProfile ? (
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            value={profileData.Shift_end_time}
                            onChange={(e) => handleProfileFieldChange("Shift_end_time", e.target.value)}
                            sx={{ mt: 0.5 }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                            })}
                          >
                            {selectedEmployee?.Shift_end_time || "Not Assigned"}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Edit Controls */}
                  {isEditingProfile && (
                    <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleProfileUpdate}
                        disabled={profileUpdateLoading}
                        startIcon={profileUpdateLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {profileUpdateLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleProfileCancel}
                        disabled={profileUpdateLoading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              </Box>

            {/* Right column - Projects and Tasks */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                Work Details
              </Typography>

              {/* Projects Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 600,
                  }}
                >
                  <FolderIcon sx={{ color: "#1976d2", fontSize: 20 }} />
                  Projects ({employeeProjects.length})
                </Typography>

                <Box
                  sx={(theme) => ({
                    maxHeight: "250px",
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: theme.palette.background.default,
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: theme.palette.grey[500],
                      borderRadius: "10px",
                      "&:hover": {
                        background: theme.palette.grey[600],
                      },
                    },
                  })}
                >
                  {employeeProjects.length > 0 ? (
                    employeeProjects.map((project) => (
                      <Box
                        key={project.ROWID}
                        sx={(theme) => ({
                          mb: 2,
                          p: 2,
                          borderRadius: "8px",
                          border: `1px solid ${theme.palette.divider}`,
                          backgroundColor: theme.palette.background.default,
                          "&:last-child": { mb: 0 },
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[4],
                          },
                        })}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#1976d2",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {project.Project_Name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={project.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                project.Status === "Open"
                                  ? "#e3f2fd"
                                  : project.Status === "Work In Process"
                                    ? "#fff3e0"
                                    : project.Status === "Close"
                                      ? "#e8f5e9"
                                      : "#f5f5f5",
                              color:
                                project.Status === "Open"
                                  ? "#1565c0"
                                  : project.Status === "Work In Process"
                                    ? "#e65100"
                                    : project.Status === "Close"
                                      ? "#2e7d32"
                                      : "#616161",
                              fontWeight: 500,
                              border: "1px solid",
                              borderColor:
                                project.Status === "Open"
                                  ? "#90caf9"
                                  : project.Status === "Work In Process"
                                    ? "#ffb74d"
                                    : project.Status === "Close"
                                      ? "#a5d6a7"
                                      : "#e0e0e0",
                            }}
                          />

                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {new Date(project.Start_Date).toLocaleDateString()}
                            {" - "}
                            {new Date(project.End_Date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "#666",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px dashed #ccc",
                      }}
                    >
                      <Typography variant="body2">
                        No projects assigned
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Tasks Section */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 600,
                  }}
                >
                  <TaskIcon sx={{ color: "#1976d2", fontSize: 20 }} />
                  Tasks ({employeeTasks.length})
                </Typography>

                <Box
                  sx={(theme) => ({
                    maxHeight: "250px",
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: theme.palette.background.default,
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: theme.palette.grey[500],
                      borderRadius: "10px",
                      "&:hover": {
                        background: theme.palette.grey[600],
                      },
                    },
                  })}
                >
                  {employeeTasks.length > 0 ? (
                    employeeTasks.map((task) => (
                      <Box
                        key={task.Tasks.ROWID}
                        sx={(theme) => ({
                          mb: 2,
                          p: 2,
                          borderRadius: "8px",
                          border: `1px solid ${theme.palette.divider}`,
                          backgroundColor: theme.palette.background.default,
                          "&:last-child": { mb: 0 },
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[4],
                          },
                        })}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#1976d2",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {task.Tasks.Task_Name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={task.Tasks.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                task.Tasks.Status === "Open"
                                  ? "#e3f2fd"
                                  : task.Tasks.Status === "In Progress"
                                    ? "#fff3e0"
                                    : task.Tasks.Status === "Completed"
                                      ? "#e8f5e9"
                                      : "#f5f5f5",
                              color:
                                task.Tasks.Status === "Open"
                                  ? "#1565c0"
                                  : task.Tasks.Status === "In Progress"
                                    ? "#e65100"
                                    : task.Tasks.Status === "Completed"
                                      ? "#2e7d32"
                                      : "#616161",
                              fontWeight: 500,
                              border: "1px solid",
                              borderColor:
                                task.Tasks.Status === "Open"
                                  ? "#90caf9"
                                  : task.Tasks.Status === "In Progress"
                                    ? "#ffb74d"
                                    : task.Tasks.Status === "Completed"
                                      ? "#a5d6a7"
                                      : "#e0e0e0",
                            }}
                          />

                          {/* <Typography
                            variant="caption"
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                            })}
                          >
                            Hours:{" "}
                            {task.Tasks.Time_Entry?.Hours ||
                              task.Time_Entry?.Hours ||
                              task.Hours ||
                              "N/x"}
                          </Typography> */}
                        </Box>

                        {task.Tasks.Description && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              mt: 1,
                              fontSize: "0.875rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {task.Tasks.Description}
                          </Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "#666",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px dashed #ccc",
                      }}
                    >
                      <Typography variant="body2">No tasks assigned</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Close button - update styling */}
          <Box
            sx={(theme) => ({
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: "right",
              mt: "auto",
            })}
          >
            <Button
              onClick={handleProfileModalClose}
              variant="contained"
              sx={(theme) => ({
                minWidth: "120px",
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              })}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>


        <Drawer
        anchor="right"
        open={roleDrawer}
        onClose={() => handleroleDrawer(false)}
      >
        <Box
          sx={{
            width: 400,
            padding: 2,
            position: "relative",
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
              marginBottom: 2,
            backgroundColor: theme.palette.primary.main,
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <PersonAddAlt1Icon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New Role
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={() => handleroleDrawer(false)}
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
          label="Role Name"
          name="role_name"
          fullWidth
          variant="outlined"
          value={newRole.role_name}
          onChange={handleRoleInputChange}
          sx={{ marginBottom: 2 }}
          error={!!errors.role_name}
          helperText={errors.role_name}
        />

        <TextField
          label="Role Description"
          name="role_discription"
          fullWidth
          variant="outlined"
          value={newRole.role_discription}
          onChange={handleRoleInputChange}
          sx={{ marginBottom: 2 }}
          error={!!errors.role_discription}
          helperText={errors.role_discription}
        />

       

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddRole}
              sx={{ width: 100 }}
            >
              Add
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleroleDrawer(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>


      {/* <ExportTimeSheet open = {sheetDrawer} toggleSheetDrawer={toggleSheetDrawer} /> */}
    </Box>
  );
}

export default Users;
