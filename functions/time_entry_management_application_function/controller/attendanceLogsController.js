const { log } = require("console");
const catalyst = require("zcatalyst-sdk-node");
const tableName = "Attendance_Logs";


function getFormattedDateTime() {
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const parts = formatter.formatToParts(new Date());

  const lookup = {};
  parts.forEach(({ type, value }) => {
    lookup[type] = value;
  });

  return `${lookup.year}-${lookup.month}-${lookup.day} ${lookup.hour}:${lookup.minute}:${lookup.second}`;
}



function getTotalMinutes(checkIn, checkOut) {
  const inTime = new Date(checkIn.replace(" ", "T"));
  const outTime = new Date(checkOut.replace(" ", "T"));

  const diffMs = outTime - inTime; // difference in milliseconds
  const diffMinutes = Math.floor(diffMs / (1000 * 60)); // convert to minutes

  return diffMinutes;
}

// Get latest status
const getStatus=async(req, res)=> {
  try {
    const userId = req.params.userId;
    const catalystApp = req.catalystApp;

    const query = `
      SELECT * FROM Attendance_Logs 
      WHERE Attendance_Logs.User_ID = '${userId}' 
      ORDER BY Attendance_Logs.CREATEDTIME DESC 
      LIMIT 1
    `;

    const response = await catalystApp.zcql().executeZCQLQuery(query);

    if (response.length > 0) {
      const latestLog = response[0].Attendance_Logs;

      console.log(latestLog.Check_Out);
      

      if (latestLog.Check_In && !latestLog.Check_Out) {
        return res.status(200).json({
          isCheckIn: true,
          Check_In: latestLog.Check_In,
          ROWID:latestLog.ROWID
        });
      }
    }

    res.status(200).json({ isCheckIn: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const checkIn=async(req, res)=> {
  try {
    const catalystApp = req.catalystApp;
    const data  = req.body;

    if (!data.User_ID || !data.Username || !data.CIN_Location_Long || !data.CIN_Location_Lat || !data.Day_Date) {
    return res.status(400).json({
        success: false,
        message: "Required fields are missing."
    });
}



    // Make sure user isn't already checked in
    const query = `
      SELECT * FROM Attendance_Logs 
      WHERE Attendance_Logs.User_ID = '${data.User_ID}' 
      ORDER BY Attendance_Logs.CREATEDTIME DESC 
      LIMIT 1
    `;
    
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    if (response.length > 0) {
      const latestLog = response[0].Attendance_Logs;
      if (latestLog.Check_In && !latestLog.Check_Out) {
        return res.status(400).json({ message: "User already checked in" });
      }
    }

    data.Check_In=getFormattedDateTime();
    const attendanceTable = catalystApp.datastore().table(tableName);
    const row = await attendanceTable.insertRow(data);

    res.status(201).json({ message: "Checked in successfully", row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const checkOut=async(req, res)=> {
  try {
    const catalystApp = req.catalystApp;
    const attendanceTable = catalystApp.datastore().table(tableName);
    const data = req.body;

    // Validate required fields
    if (!data.ROWID || !data.Check_In || !data.COUT_Location_Lat || !data.COUT_Location_Long) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing."
      });
    }

    // Check if the record exists and its checkout status
    const query = `SELECT Check_Out, Check_In FROM Attendance_Logs WHERE ROWID='${data.ROWID}'`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    if (!response || response.length === 0 || !response[0].Attendance_Logs) {
      return res.status(404).json({ success: false, message: "Attendance record not found." });
    }

    const latestLog = response[0].Attendance_Logs;

    if (latestLog.Check_Out) {
      return res.status(400).json({ success: false, message: "User already checked out." });
    }

    // Calculate checkout time and total minutes
    const checkOutTime = getFormattedDateTime();
    const checkInTime = latestLog.Check_In;
    const totalMinutes = getTotalMinutes(checkInTime, checkOutTime);

    // Remove Check_In from update data
    delete data.Check_In;

    // Add Check_Out and Total_Time
    data.Check_Out = checkOutTime;
    data.Total_Time = totalMinutes;

    // Update the row
    const updatedRow = await attendanceTable.updateRow(data);

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      row: updatedRow
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

// const getAttendanceLogsByDayAndUser=async(req,res)=>{
//   try {
//     const catalystApp = req.catalystApp;
//     const Start_date = req.query.Start_date;
//     const End_date = req.query.End_date;
//     const UserID = req.query.UserID;

//     if (!Start_date || !End_date) {
//       return res.status(400).json({ error: "Missing Start_date, End_date, or UserID" });
//     }

//     // ZCQL query
//     const zcqlQuery = (UserID)?
//     `
//       SELECT Check_In,Check_Out,Day_Date,Username,Total_Time
//       FROM Attendance_Logs
//       WHERE User_ID = '${UserID}' 
//         AND Day_Date >= '${Start_date}' 
//         AND Day_Date <= '${End_date}'
//       ORDER BY Day_Date DESC
//     `:`
//       SELECT Check_In,Check_Out,Day_Date,Username,Total_Time 
//       FROM Attendance_Logs
//       WHERE  Day_Date >= '${Start_date}' 
//         AND Day_Date <= '${End_date}'
//       ORDER BY Day_Date DESC
//     `;


//     const zcql = catalystApp.zcql();
//     const result = await zcql.executeZCQLQuery(zcqlQuery);
//     const filterData=result.map((item) => {return item.Attendance_Logs});

//     return res.status(200).json({
//       success:true,
//       message:`Logs from ${Start_date} to ${End_date}`,
//       data:filterData
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });

//   }
// }

const getAttendanceLogsByDayAndUser = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const { Start_date, End_date } = req.query;
    const {UserID}=req.body;

    if (!Start_date || !End_date) {
      return res.status(400).json({
        error: "Missing Start_date or End_date"
      });
    }

    // 🔹 Always treat UserID as array
    let userIds = [];

    if (UserID) {
      if (Array.isArray(UserID)) {
        userIds = UserID;
      } else {
        // supports "123" or "123,456"
        userIds = UserID.split(",").map(id => id.trim());
      }
    }

    // 🔹 Build condition dynamically
    let userCondition = "";
    if (userIds.length > 0) {
      const formattedIds = userIds.map(id => `'${id}'`).join(",");
      userCondition = `AND User_ID IN (${formattedIds})`;
    }

    const zcqlQuery = `
      SELECT Check_In, Check_Out, Day_Date, Username, Total_Time
      FROM Attendance_Logs
      WHERE Day_Date >= '${Start_date}'
        AND Day_Date <= '${End_date}'
        ${userCondition}
      ORDER BY Day_Date DESC
    `;

    const zcql = catalystApp.zcql();
    const result = await zcql.executeZCQLQuery(zcqlQuery);

    const filterData = result.map(item => item.Attendance_Logs);

    return res.status(200).json({
      success: true,
      message: `Logs from ${Start_date} to ${End_date}`,
      data: filterData
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};


const getAttendanceLogsByUser=async(req,res)=>{
  try {
    const catalystApp = req.catalystApp;
    const UserID = req.query.UserID;

    if (!UserID) {
      return res.status(400).json({ error: "Missing UserID" });
    }

    const zcqlQuery = 
    `
      SELECT * 
      FROM Attendance_Logs
      WHERE User_ID = '${UserID}' ORDER BY Day_Date DESC
    `;

    const zcql = catalystApp.zcql();
    const result = await zcql.executeZCQLQuery(zcqlQuery);
    const filterData=result.map((item) => {return item.Attendance_Logs});

    return res.status(200).json({ success:true ,message:`Logs for ${UserID}`, data: filterData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}


module.exports = {
  getStatus,
  checkIn,
  checkOut,
  getAttendanceLogsByDayAndUser,
  getAttendanceLogsByUser
};
