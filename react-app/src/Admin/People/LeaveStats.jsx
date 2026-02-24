import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import DashboardCards from "./DashboardCards";
import { fetchEmployees } from "../../redux/Employee/EmployeeSlice";

const LeaveStats = () => {
  const dispatch = useDispatch();
  const employeesData = useSelector(
    (state) => state.employeeReducer.data
  );

  const [data, setData] = useState([]);
  const [leaves, setLeaves] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (!employeesData || employeesData.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!employeesData || employeesData.length === 0) return;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          "/server/time_entry_management_application_function/dashboard"
        );

        const apiData = response.data.data;
        setLeaves(apiData);

      setData([
          {
            title: "Total CheckIn",
            used: apiData.total_present,
            total: employeesData.length,
            gradient: "linear-gradient(135deg, #6C63FF, #7A7DFF)",
            meteric: "available",
          },
          {
            title: "Total Leaves",
            used: apiData.total_leave,
            total: employeesData.length,
            gradient: "linear-gradient(135deg, #00C49A, #00D4B3)",
            meteric: "unavailable",
          },
          {
            title: "Leave Without Pay",
            used: apiData.Unpaid,
            total: employeesData.length,
            gradient: "linear-gradient(135deg, #FF6B6B, #FF8585)",
            meteric: "unavailable",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [employeesData]);

  return (
    <DashboardCards
      data={data}
      leaveBreakdown={{
        Paid: leaves?.Paid,
        Sick: leaves?.Sick,
        Unpaid: leaves?.Unpaid,
      }}
      loading={loading}
    />
  );
};

export default LeaveStats;
