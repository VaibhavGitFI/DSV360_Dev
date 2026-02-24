import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Box } from "@mui/material";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, setEmployeeProfilePics } from "./redux/Employee/EmployeeSlice";
import { fetchAdmin } from "./redux/SuperAdmin/SuperAdminSlice";
import { UserDataActions } from "./redux/userData/userDataSlice";
import { fetchUserProfile } from "./redux/userData/userProfileSlice";

import Layout1 from "./Admin/Layout1";
import EmpLayout from "./Employee/Layout1";
import Layout from "./Org/Layout";
import CustomerLayout from "./Client/Layout1";

import Dashboard from "./Org/Dashboard";
import Organizations from "./Org/Organizations";
import Billing from "./Org/Billing";
import Settings from "./Org/Settings";

import Project from "./Admin/Project";
import Task from "./Admin/Task";
import Feedback from "./Admin/Feedback";
import Employees from "./Admin/Employee";
import Profile from "./Admin/Profile";
import EnhancedDashboard from "./Admin/EnhancedDashboard";
import { Issues } from "./Admin/Issue";
import { Client } from "./Admin/Client";
import { ClientStaff } from "./Admin/ClientStaff";
import Badges from "./Admin/Badges";
import Teams from "./Admin/Teams";
import AdminPeople from "./Admin/People/People";
import ChatInterface from "./ChatBot/ChatInterface";
import ExpenseDashboard from "./expense/ExpenseDashboard";
import { TimeEntry } from "./Admin/TimeEntry";
import Sprints from "./Admin/Sprints";
import EmpSprints from "./Employee/Sprints";

import EmpEnhancedDashboard from "./Employee/EnhancedDashboard";
import EmpProject from "./Employee/Project";
import EmpTask from "./Employee/Task";
import EmpProfile from "./Employee/Profile";
import Emp from "./Employee/Employee";
import { EmpTimeEntry } from "./Employee/TimeEntry";
import EmpFeedback from "./Employee/Feedback";
import People from "./Employee/people/People";
import { EmpIssues } from "./Employee/EmpIssues";
import Expense from "./ExpenseTracker/Expense";

import ContactDashboard from "./Client/ContactDashboard";
import ContactTask from "./Client/ContactTask";
import ContactProjects from "./Client/Project";
import ContactIssues from "./Client/Issue";
import Contacts from "./Client/Contacts";
import ContactProfile from "./Client/Profile";
import Calender from "./Admin/Calender";

import Login from "./Admin/Login";

// ✅ ADD THIS IMPORT
import { AppStateProvider } from "./context/AppStateContext";

function App() {
  const dispatch = useDispatch();

  const [userRole, setUserRole] = useState(null);
  const [currUser, setCurrUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") || "false");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: employeesData, profilePics } = useSelector((state) => state.employeeReducer);

  useEffect(() => {
    const fetchProfileAndCover = async (userId, orgId) => {
      try {
        const organisationAction = await dispatch(fetchAdmin(orgId));
        const Organisation = organisationAction.payload;

        const profileResponse = await dispatch(fetchUserProfile(userId)).unwrap();

        // keep your cover call as-is
        await axios.get(`/server/time_entry_management_application_function/usercover/${userId}`);

        localStorage.setItem("Org", Organisation.Org_Name);
        localStorage.setItem(
          "logo",
          Organisation.Org_Logo ||
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
        );
        localStorage.setItem("color", Organisation.Org_Theme || "#1976d2");

        localStorage.setItem(
          "profileData",
          profileResponse?.Profile_Link ||
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
        );

        localStorage.setItem(
          "coverData",
          profileResponse?.Cover_Link ||
            "https://media.licdn.com/dms/image/v2/D563DAQHzNlFsRnMJDg/image-scale_191_1128/image-scale_191_1128/0/1699936674657/fi_digital_services_cover?e=2147483647&v=beta&t=ra0dfMKNg51crI9H1y9cKrtDrSfsOhgON6X_f2Gli7g"
        );
      } catch (err) {
        console.error("Failed to fetch profile or cover:", err);
      }
    };

    const checkAuth = async () => {
      try {
        const result = await window.catalyst.auth.isUserAuthenticated();

        if (!result || !result.content) {
          throw new Error("Session expired");
        }

        const userDetail = {
          userid: result.content.user_id,
          firstName: result.content.first_name,
          lastName: result.content.last_name,
          mailid: result.content.email_id,
          timeZone: result.content.time_zone,
          createdTime: result.content.created_time,
          role: result.content.role_details.role_name,
          roleId: result.content.role_details.role_id,
          user_type: result.content.user_type,
          org_id: result.content.org_id,
        };

        localStorage.setItem("currUser", JSON.stringify(userDetail));
        dispatch(UserDataActions.setUserData(userDetail));

        setCurrUser(userDetail);
        setUserRole(userDetail.role);
        setIsAuthenticated(true);

        fetchProfileAndCover(userDetail.userid, userDetail.org_id);

      } catch (error) {
        console.error("Session expired or auth failed:", error);

        localStorage.clear();
        setIsAuthenticated(false);

        window.location.href = "/__catalyst/auth/login";
      } finally {
        setIsCheckingAuth(false);
      }
    };

    setDarkMode(localStorage.getItem('darkMode') || "false");
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (userRole === "Client Contacts") return;

    const fetchData = async () => {
      try {
        const employeeResponse = await dispatch(fetchEmployees()).unwrap();

        const result = await axios.post(
          "/server/time_entry_management_application_function/batchProfile",
          employeeResponse
        );

        const updatedEmployees = result.data.data;
        dispatch(setEmployeeProfilePics(updatedEmployees));
      } catch (error) {
        console.error("Error fetching employees or profiles", error);
      }
    };

    fetchData();
  }, [dispatch, userRole, isAuthenticated]);

  if (isCheckingAuth) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: darkMode === "true" ? "black" : "white",
        }}
      >
        <h1
          style={{
            fontSize: "50px",
            fontWeight: "700",
            color: "#1a237e",
            letterSpacing: "2px",
            textShadow: "2px 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          DSV-360
        </h1>
        <div className="loader" style={{ marginTop: "50px" }}></div>
      </div>
    );
  }

  if (!currUser) {
    window.location.href = "/__catalyst/auth/login";
    return null;
  }

  const isContactRole = userRole === "Contacts" || userRole === "Client Contacts";

  return (
    // ✅ IMPORTANT: Wrap routes so Sprints can use useAppState()
    <AppStateProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="TimeEntry/:id" element={<TimeEntry />} />
        <Route path="EmpTimeEntry/:id" element={<EmpTimeEntry />} />

        {userRole === "Super Admin" ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Box sx={{ p: 3 }}>404 Page Not Found</Box>} />
          </Route>
        ) : userRole === "Admin" ? (
          <Route path="/" element={<Layout1 />}>
            <Route index element={<EnhancedDashboard />} />
            <Route path="projects" element={<Project currUser={currUser} />} />
            <Route path="task" element={<Task />} />
            <Route path="employees" element={<Employees />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bug" element={<Issues />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="client" element={<Client />} />
            <Route path="clientStaff" element={<ClientStaff />} />
            <Route path="badges" element={<Badges />} />
            <Route path="peoples" element={<AdminPeople />} />
            <Route path="aiBot" element={<ChatInterface />} />
            <Route path="teams" element={<Teams />} />
            <Route path="sprints" element={<Sprints />} />
            <Route path="expense" element={<ExpenseDashboard />} />
            <Route path="*" element={<Box sx={{ p: 3 }}>404 Page Not Found</Box>} />
            <Route path="calendar" element={<Calender />} />

          </Route>
        ) : isContactRole ? (
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<ContactDashboard />} />
            <Route path="projects" element={<ContactProjects currUser={currUser} />} />
            <Route path="task" element={<ContactTask />} />
            <Route path="bug" element={<ContactIssues />} />
            <Route path="Contacts" element={<Contacts />} />
            <Route path="profile" element={<ContactProfile />} />
            <Route path="*" element={<Box sx={{ p: 3 }}>404 Page Not Found</Box>} />
          </Route>
        ) : (
          <Route path="/" element={<EmpLayout />}>
            <Route index element={<EmpEnhancedDashboard />} />
            <Route path="projects" element={<EmpProject currUser={currUser} />} />
            <Route path="task" element={<EmpTask />} />
            <Route path="bug" element={<EmpIssues />} />
            <Route path="employees" element={<Emp />} />
            <Route path="profile" element={<EmpProfile />} />
            <Route path="feedback" element={<EmpFeedback />} />
            <Route path="people" element={<People />} />
            <Route path="ai-bot" element={<ChatInterface />} />
            <Route path="expense" element={<Expense />} />
            <Route path="sprints" element={<EmpSprints />} />
            <Route path="*" element={<Box sx={{ p: 3 }}>404 Page Not Found</Box>} />
          </Route>
        )}
      </Routes>
    </AppStateProvider>
  );
}

export default App;
