import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./Project/ProjectSlice";
import employeeReducer from "./Employee/EmployeeSlice"
import taskReducer from "./Tasks/TaskSlice"
import profileReducer from "./Profile/Profile"
import feedbackReducer from "./Feedback/Feedback"
import empProjectReducer  from "./EmpProject/EmpProjectSlice";
import empTaskReducer from "./EmpTask/EmpTaskSlice"
import clientReducer from "./Client/clientSlice"
import clientContactReducer from "./Client/contacts";
import issueReducer from "./Client/issueSlice"
import timeEntryReducer from "./TimeEntry/TimeEntrySlice";
import contactReducer from "./contacts/contactSlice";
import contactProjectReducer from "./contacts/contactProjectSlice";
import contactTaskReducer from "./contacts/contactTaskSlice";
import contactIssueReducer from "./contacts/contactIssueSlice";
import contactsReducer from "./contacts/contactsSlice";
import empIssuesReducer from "./EmpTask/EmpIssueSlice";
import AdminSlice from "./SuperAdmin/SuperAdminSlice";
import snackbarReducer from "./Snackbar/SnackbarSlice"
import attendanceReducer from "./People/attendanceSlice"
import UserSlice from "./userData/userDataSlice";
import timerReducer from "./TimeEntryTimer/timerSlice"
import userProfileReducer from "./userData/userProfileSlice"
export const rdxStore = configureStore({
    reducer: {
        projectReducer: projectReducer,
        employeeReducer:employeeReducer,
        taskReducer:taskReducer,
        profileReducer:profileReducer,
        feedbackReducer:feedbackReducer,
        empProjectReducer: empProjectReducer,
        empTaskReducer:empTaskReducer,
        clientReducer:clientReducer.reducer,
        clientContactReducer:clientContactReducer.reducer,
        issueReducer:issueReducer.reducer,
        timeEntryReducer:timeEntryReducer.reducer,
        contactReducer:contactReducer,
        contactProjectReducer: contactProjectReducer,
        contactTaskReducer:contactTaskReducer,
        contactIssueReducer:contactIssueReducer,
        contactsReducer:contactsReducer,
        empIssuesReducer:empIssuesReducer.reducer,
        AdminSlice:AdminSlice.reducer,
        snackbar: snackbarReducer,
         attendance: attendanceReducer,
         user:UserSlice.reducer,
     timer: timerReducer,
     userProfile:userProfileReducer,


       
    }
});
