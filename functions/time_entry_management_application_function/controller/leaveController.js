const catalyst = require("zcatalyst-sdk-node");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { log } = require("console");

app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});


const getTeamLeaveApprovals = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const safeUserId = userId.replace(/'/g, "''");

    const teamQuery = `
      SELECT User_Id 
      FROM Users 
      WHERE ReporterID = '${safeUserId}'
    `;
    const teamResp = await zcql.executeZCQLQuery(teamQuery);

    if (!teamResp || teamResp.length === 0) {
      return res.status(200).json({ message: "No team members found" });
    }

    const teamIDs = teamResp
      .map(item => item?.Users?.User_Id)
      .filter(Boolean)
      .map(id => `'${id}'`)
      .join(",");

    if (!teamIDs) {
      return res.status(200).json({ message: "No valid team members found" });
    }

    const leaveQuery = `
      SELECT * 
      FROM Leave_Approvals 
      WHERE UserID IN (${teamIDs})
    `;
    const result = await zcql.executeZCQLQuery(leaveQuery);

    const formattedResult = result.map((item) => {
      return item.Leave_Approvals
    })

    return res.status(200).json({
      message: "Team leave approvals fetched successfully",
      data: formattedResult
    });

  } catch (error) {
    console.error("Error fetching team leave approvals:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


const getAllUserLeavesCnt = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Leave_Count");

    const records = await table.getAllRows();
    res
      .status(200)
      .json({ message: "Leave records fetched successfully", data: records });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getLeaveCntByUserID = async (req, res) => {
  try {
    const UserID = req.query.UserID;
    const Username = req.query.Username;

    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const query = `SELECT * FROM Leave_Count WHERE UserID = '${UserID}'`;
    const result = await zcql.executeZCQLQuery(query);

    if (result.length === 0) {
      const leaveData = {
        UserID,
        Username,
        Paid_Leave: "0",
        Sick_Leave: "0",
        Unpaid_Leave: "0",
        Total_Sick_Leave: "6",
        Total_Paid_Leave: "20"
      };

      const datastore = catalystApp.datastore();
      const table = datastore.table("Leave_Count");
      const createdRecord = await table.insertRow(leaveData);

      const totalPaid = Number(createdRecord.Total_Paid_Leave || 0);
      const totalSick = Number(createdRecord.Total_Sick_Leave || 0);
      const usedPaid = Number(createdRecord.Paid_Leave || 0);
      const usedUnpaid = Number(createdRecord.Unpaid_Leave || 0);
      const usedSick = Number(createdRecord.Sick_Leave || 0);

      const remainingPaid = totalPaid - usedPaid;
      const remainingSick = totalSick - usedSick;
      const remainingTotal = remainingPaid + remainingSick;

      res.status(201).json({
        message: "Record created successfully",
        data: {
          Remaining_Total_Leaves: String(remainingTotal),
          Remaining_Paid_Leaves: String(remainingPaid),
          Remaining_Sick_Leaves: String(remainingSick),
          Used_Paid_Leave: String(usedPaid),
          Used_Unpaid_Leave: String(usedUnpaid),
          Used_Sick_Leave: String(usedSick),
          Total_Sick_Leave: String(totalSick),
          Total_Paid_Leave: String(totalPaid)
        },
      });
    }

    const totalPaid = Number(result[0]?.Leave_Count.Total_Paid_Leave || 0);
    const totalSick = Number(result[0]?.Leave_Count.Total_Sick_Leave || 0);
    const usedPaid = Number(result[0]?.Leave_Count.Paid_Leave || 0);
    const usedUnpaid = Number(result[0]?.Leave_Count.Unpaid_Leave || 0);
    const usedSick = Number(result[0]?.Leave_Count.Sick_Leave || 0);
    const remainingPaid = totalPaid - usedPaid;
    const remainingSick = totalSick - usedSick;
    const remainingTotal = remainingPaid + remainingSick;


    res.status(200).json({
      message: "Record fetched successfully",
      data: {
        Remaining_Total_Leaves: String(remainingTotal),
        Remaining_Paid_Leaves: String(remainingPaid),
        Remaining_Sick_Leaves: String(remainingSick),
        Used_Paid_Leave: String(usedPaid),
        Used_Unpaid_Leave: String(usedUnpaid),
        Used_Sick_Leave: String(usedSick),
        Total_Sick_Leave: String(totalSick),
        Total_Paid_Leave: String(totalPaid)
      },
    });
  } catch (error) {
    console.error("Error fetching leave record:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { UserID } = req.params;
    const updateData = req.body;
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Leave_Count");

    const updatedRecord = await table.updateRow(UserID, updateData);
    if (!updatedRecord)
      return res.status(404).json({ message: "Record not found to update" });

    res
      .status(200)
      .json({ message: "Record updated successfully", data: updatedRecord });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const { UserID } = req.params;
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Leave_Count");

    const deletedRecord = await table.deleteRow(UserID);
    if (!deletedRecord)
      return res.status(404).json({ message: "Record not found to delete" });

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllLeaveApprovals = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `
            SELECT * 
            FROM Leave_Approvals 
            ORDER BY CREATEDTIME DESC
        `;

    const records = await zcql.executeZCQLQuery(query);
    const filterRecords = records.map((item) => {
      return item.Leave_Approvals;
    });
    res
      .status(200)
      .json({ message: "Records fetched successfully", data: filterRecords });
  } catch (error) {
    console.error("Error fetching leave approvals:", error);
    res
      .status(500)
      .json({ message: "Error fetching records", error: error.message });
  }
};

const getLeaveApprovalsByUser = async (req, res) => {
  try {
    const { UserID } = req.params; // Get UserID from route param
    console.log("Id", UserID);
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // ZCQL query to fetch user-wise leave approvals, latest first
    const query = `
            SELECT * 
            FROM Leave_Approvals 
            WHERE UserID = '${UserID}' 
            ORDER BY CREATEDTIME DESC
        `;

    const records = await zcql.executeZCQLQuery(query);

    if (!records.length) {
      return res
        .status(201)
        .json({ message: "No leave approvals found for this user" });
    }

    const filterRecords = records.map((item) => {
      return item.Leave_Approvals;
    });
    res
      .status(200)
      .json({ message: "Records fetched successfully", data: filterRecords });
  } catch (error) {
    console.error("Error fetching user leave approvals:", error);
    res
      .status(500)
      .json({ message: "Error fetching records", error: error.message });
  }
};

const deleteLeaveApproval = async (req, res) => {
  try {
    const { ROWID } = req.params;
    const catalystApp = req.catalystApp;
    const table = catalystApp.datastore().table("Leave_Approvals");

    await table.deleteRow(ROWID);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting record", error: error.message });
  }
};

const updateLeaveApproval = async (req, res) => {
  try {
    const { ROWID } = req.params;
    if (!ROWID) {
      res
        .status(400)
        .json({ message: "ROWID missing" });
    }

    const catalystApp = req.catalystApp;
    const table = catalystApp.datastore().table("Leave_Approvals");
    const rowData = await table.getRow(ROWID);
    if (rowData && rowData["Status"] === "Approved") {
      res
        .status(400)
        .json({ message: "Leave Already Approved can't update" });
    }
    const updates = req.body;
    updates["ROWID"] = ROWID;
    const updatedRecord = await table.updateRow(updates);
    res
      .status(200)
      .json({ message: "Record updated successfully", data: updatedRecord });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating record", error: error.message });
  }
};

const requestLeaves = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;

    const {
      UserID,
      Username,
      Leave_Type,
      Reason,
      Start_Date,
      End_Date,
      LeaveCnt,
    } = req.body;

    if (
      !UserID ||
      !Username ||
      !Leave_Type ||
      !LeaveCnt ||
      !Reason ||
      !Start_Date ||
      !End_Date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `SELECT * FROM Leave_Count WHERE UserID='${UserID}'`;
    const resp = await catalystApp.zcql().executeZCQLQuery(query);

    console.log("hihi", resp);

    if (!resp || resp.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Leave count record not found for this user.",
      });
    }

    const leaveData = resp[0].Leave_Count;
    let total = 0,
      used = 0;

    if (Leave_Type === "Paid_Leave") {
      total = leaveData.Total_Paid_Leave || 0;
      used = leaveData.Paid_Leave || 0;
    } else if (Leave_Type === "Sick_Leave") {
      total = leaveData.Total_Sick_Leave || 0;
      used = leaveData.Sick_Leave || 0;
    } else {
      total = Infinity;
    }

    total = parseInt(total);
    used = parseInt(used);

    if (used + parseInt(LeaveCnt) > total) {
      return res.status(409).json({
        success: false,
        message: `${Leave_Type} exceeds available limit. Please apply for unpaid leave.`,
      });
    }

    const table = catalystApp.datastore().table("Leave_Approvals");

    const record = {
      UserID,
      Username,
      Leave_Type,
      Reason,
      Start_Date,
      End_Date,
      Status: "Pending",
      LeaveCnt,
    };

    const insertedRecord = await table.insertRow(record);

    res.status(200).json({
      success: true,
      message: "Leave request submitted successfully",
      data: insertedRecord,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const leaveApproval = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const { ROWID } = req.params;
    const { Status, ActionByID, ActionBy, Cancellation_Reason } = req.body;

    if (!Status || !ActionByID || !ActionBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const table = catalystApp.datastore().table("Leave_Approvals");
    const record = await table.getRow(ROWID);

    if (!record) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const { UserID, Leave_Type, LeaveCnt } = record;
    const leaveCountQuery = `SELECT * FROM Leave_Count WHERE UserID='${UserID}'`;
    const resp = await catalystApp.zcql().executeZCQLQuery(leaveCountQuery);

    if (!resp || resp.length === 0) {
      return res.status(404).json({ message: "User leave balance not found" });
    }

    const leaveData = resp[0].Leave_Count;

    // ✅ Check if the user has enough leave balance before approving
    if (Status === "Approved") {
      let available = 0;
      let totalAvailable = 0;

      if (Leave_Type === "Paid_Leave") {
        available = parseInt(leaveData.Paid_Leave || "0");
        totalAvailable = parseInt(leaveData.Total_Paid_Leave || "0");
      } else if (Leave_Type === "Sick_Leave") {
        available = parseInt(leaveData.Sick_Leave || "0");
        totalAvailable = parseInt(leaveData.Total_Sick_Leave || "0");
      } else {
        available = parseInt(leaveData.Unpaid_Leave || "0");
        totalAvailable = Infinity; // Unpaid leaves usually have no limit
      }

      const requested = parseInt(LeaveCnt);

      if (Leave_Type !== "Unpaid_Leave" && requested > (totalAvailable - available)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${Leave_Type.replace("_", " ").toLowerCase()} balance.`,
        });
      }
    }

    // ✅ Proceed with updating approval record
    const updatedRecord = {
      ...record,
      Status,
      ActionByID,
      ActionBy,
    };

    // Update leave count if approved
    if (Status === "Approved") {
      let updatedLeaveData = { ...leaveData };

      if (Leave_Type === "Paid_Leave") {
        updatedLeaveData.Paid_Leave = (
          parseInt(leaveData.Paid_Leave || "0") + parseInt(LeaveCnt)
        ).toString();
      } else if (Leave_Type === "Sick_Leave") {
        updatedLeaveData.Sick_Leave = (
          parseInt(leaveData.Sick_Leave || "0") + parseInt(LeaveCnt)
        ).toString();
      } else {
        updatedLeaveData.Unpaid_Leave = (
          parseInt(leaveData.Unpaid_Leave || "0") + parseInt(LeaveCnt)
        ).toString();
      }

      const countTable = catalystApp.datastore().table("Leave_Count");
      await countTable.updateRow(updatedLeaveData);
    }

    if (Cancellation_Reason) {
      updatedRecord.Cancellation_Reason = Cancellation_Reason;
    }

    await table.updateRow(updatedRecord);

    res.status(200).json({
      success: true,
      message: `Leave request ${Status.toLowerCase()} successfully`,
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error in leave approval:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const dashboard = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const today = new Date().toISOString().split("T")[0];

    let query = `
            SELECT Leave_Type
            FROM Leave_Approvals
            WHERE Start_Date <= '${today}' AND End_Date >= '${today}'
        `;
    const result = await catalystApp.zcql().executeZCQLQuery(query);

    query = `select User_ID from Attendance_Logs where Day_Date='${today}'`;
    const presentUserID = await catalystApp.zcql().executeZCQLQuery(query);
    const distinctById = new Set(
      presentUserID.map((item) => item.Attendance_Logs.User_ID)
    ).size;

    // Initialize counters dynamically
    const leaveData = {
      date: today,
      total_present: distinctById,
      total_leave: result.length,
      Sick: 0,
      Paid: 0,
      Unpaid: 0,
    };

    for (const {
      Leave_Approvals: { Leave_Type },
    } of result) {
      const map = {
        Sick_Leave: "Sick",
        Paid_Leave: "Paid",
        Unpaid_Leave: "Unpaid",
      };
      leaveData[map[Leave_Type] || "Unpaid"]++;
    }

    res.status(200).json({
      message: "Today's leave count",
      data: leaveData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrMonthApprovLeave = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    let { userId, year, month } = req.query;

    // ----- Date handling -----
    const today = new Date();
    year = year ? Number(year) : today.getFullYear();
    month = month ? Number(month) - 1 : today.getMonth(); // 0-based

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({
        success: false,
        message: "Invalid year or month",
      });
    }

    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

    let leaveQuery = `
      SELECT Username, Leave_Type, Start_Date, End_Date
      FROM Leave_Approvals
      WHERE Status = 'Approved'
      AND (
        (Start_Date BETWEEN '${firstDay}' AND '${lastDay}')
        OR
        (End_Date BETWEEN '${firstDay}' AND '${lastDay}')
        OR
        (Start_Date <= '${firstDay}' AND End_Date >= '${firstDay}')
      )
    `;

    if (userId && typeof userId === "string" && userId.trim()) {
      const safeUserId = userId.replace(/'/g, "''");

      const teamQuery = `
        SELECT User_Id 
        FROM Users 
        WHERE ReporterID = '${safeUserId}'
      `;
      const teamResp = await zcql.executeZCQLQuery(teamQuery);

      const teamIDs = teamResp
        .map(item => item?.Users?.User_Id)
        .filter(Boolean)
        .map(id => `'${id.replace(/'/g, "''")}'`)
        .join(",");

      if (teamIDs.length > 0) {
        leaveQuery += ` AND UserID IN (${teamIDs})`;
      } else {
        // No team members, return empty list
        return res.status(200).json({
          success: true,
          total: 0,
          month: new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          data: [],
        });
      }
    }

    console.log("leaveQuery", leaveQuery);

    const result = await zcql.executeZCQLQuery(leaveQuery);
    const leaves = result.map(r => r.Leave_Approvals);

    return res.status(200).json({
      success: true,
      total: leaves.length,
      month: new Date(year, month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      data: leaves,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch approved leave requests",
      error: error.message,
    });
  }
};



module.exports = {
  getAllUserLeavesCnt,
  deleteLeave,
  getLeaveCntByUserID,
  updateLeave,
  leaveApproval,
  requestLeaves,
  dashboard,
  getAllLeaveApprovals,
  getLeaveApprovalsByUser,
  updateLeaveApproval,
  deleteLeaveApproval,
  getCurrMonthApprovLeave,
  getTeamLeaveApprovals
};
