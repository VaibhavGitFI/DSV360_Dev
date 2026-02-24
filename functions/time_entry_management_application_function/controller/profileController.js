"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const catalyst = require("zcatalyst-sdk-node");
const { error } = require("console");

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const updateProfile = async (req, res) => {
  const user_ID = req.params.user_ID;
  console.log("Received profile update request for user:", user_ID);

  if (!req.files || !req.files.profile) {
    return res.status(400).json({
      success: false,
      message: "No profile file uploaded.",
    });
  }

  const file = req.files.profile;

  try {
    const catalystApp = req.catalystApp;
    const stratus = catalystApp.stratus();
    const bucket = stratus.bucket("dsv365");

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${file.name}`;
    const uploadPath = `dsv365/profile/${uniqueFileName}`;
    const tempFilePath = path.join(os.tmpdir(), file.name);
    await file.mv(tempFilePath);

    // Upload file to Catalyst Stratus
    await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

    const uploadedObject = bucket.object(uploadPath);
    const objectDetails = await uploadedObject.getDetails();
    const profileURL = objectDetails.object_url;

    console.log("File successfully uploaded to Catalyst Stratus:", profileURL);

    // Update user's profile link in database
    const zcql = catalystApp.zcql();
    const updateQuery = `UPDATE Users SET Users.Profile_Link = '${profileURL}' WHERE User_Id = '${user_ID}'`;

    const updateResult = await zcql.executeZCQLQuery(updateQuery);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profileURL,
      result: updateResult,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile.",
      error: error.message,
    });
  }
};

const updateCover = async (req, res) => {
  const user_ID = req.params.user_ID;
  console.log("backend", user_ID);

  if (!req.files || !req.files.cover) {
    return res.status(400).json({
      success: false,
      message: "No profile file uploaded.",
    });
  }

  const file = req.files.cover;
  console.log("file", file)

  try {
    const catalystApp = req.catalystApp;
    const stratus = catalystApp.stratus();
    const bucket = stratus.bucket("dsv365");
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${file.name}`;
    const uploadPath = `dsv365/cover/${uniqueFileName}`;
    const tempFilePath = path.join(os.tmpdir(), file.name);
    // Move file to temporary location
    await file.mv(tempFilePath);

    // Upload file to Catalyst Stratus
    await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

    const uploadedObject = bucket.object(uploadPath);
    const objectDetails = await uploadedObject.getDetails();
    const coverURL = objectDetails.object_url;

    console.log("File successfully uploaded to Catalyst Stratus:", coverURL);

    const zcql = catalystApp.zcql();
    const query = `UPDATE Users SET Users.Cover_Link = '${coverURL}' WHERE Users.User_Id = '${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    res.status(200).json({
      success: "true",
      data: queryResp,
      coverURL
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
      error: err.message
    });
  }
};

const getProfile = async (req, res) => {
  const user_ID = req.params.user_ID;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT * FROM Users where Users.User_Id='${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);
    const profileURL = queryResp[0].Users;


    res.status(200).json({
      success: "true",
      data: profileURL,
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
    });
  }
};



const getCover = async (req, res) => {
  const user_ID = req.params.user_ID;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT Cover_Link FROM Users where Users.User_Id='${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);
    const coverURL = queryResp[0].Users.Cover_Link;

    res.status(200).json({
      success: "true",
      data: coverURL,
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
    });
  }
};

const updateProfileData = async (req, res) => {
  const id = req.params.id;
  console.log("Received userId:", id);

  console.log(req.body);
  const { Address, Phone, AboutME, Skills, CountryCode } = req.body;
  const data = req.body;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Step 1: Fetch the user from the Users table
    const query = `SELECT ROWID FROM Users WHERE User_Id = '${id}'`;
    const user = await zcql.executeZCQLQuery(query);

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const rowId = user[0].Users.ROWID;
    const userTable = catalystApp.datastore().table("Users");
    data["ROWID"] = rowId;

    const updateData = await userTable.updateRow(data);
    //     const updateQuery = `UPDATE Users 
    // SET Address = '${Address}', 
    //     Phone = '${Phone}', 
    //     AboutME = '${AboutME}', 
    //     Skills = '${Skills}',
    //     CountryCode = '${CountryCode}'
    // WHERE User_Id = '${id}'`;

    // const updateResponse = await zcql.executeZCQLQuery(updateQuery);

    console.log("Update successful:", updateData);

    // Send a success response with the updated data
    res.status(200).json({
      success: true,
      data: updateData,
    });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Could not update profile.",
    });
  }
};
const getProfileData = async (req, res) => {
  const id = req.params.id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const query = `SELECT * FROM Users WHERE User_Id = '${id}'`;
    const user = await zcql.executeZCQLQuery(query);
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    console.log("Error fetching profile data:", error);
  }
};


// const batchProfileData = async (req, res) => {
//   const employeeData = req.body;

//   try {
//     const catalystApp = req.catalystApp;
//     const zcql = catalystApp.zcql();

//     // 1. Collect all user_ids
//     const userIds = employeeData.map(emp => `'${emp.user_id}'`).join(',');

//     // 2. Query all profiles at once using IN clause
//     const query = `SELECT User_Id, Profile_Link ,Phone,ReporterID,ReporterName,ReporterImage	FROM Users WHERE User_Id IN (${userIds})`;
//     const queryResp = await zcql.executeZCQLQuery(query);

//     // 3. Build a map of user_id => profile_link
//     const profileMap = {};
//     const phoneMap = {};

//     queryResp.forEach(entry => {
//       const { User_Id, Profile_Link ,Phone,ReporterID,ReporterName,ReporterImage} = entry.Users;
//       profileMap[User_Id] = Profile_Link;
//       profileMap[ReporterID]=ReporterID,
//       profileMap[ReporterName]=ReporterName,
//       profileMap[ReporterImage]=ReporterImage,
//       phoneMap[User_Id] = Phone;
//     });

//     // 4. Merge profile links into employeeData
//     const updatedEmployees = employeeData.map(emp => ({
//       ...emp,
//       profile_pic: profileMap[emp.user_id] || null, // fallback to null or default if not found
//       phone : phoneMap[emp.user_id]
//     }));

//     res.status(200).json({
//       success: true,
//       data: updatedEmployees,
//     });
//   } catch (error) {
//     console.error("Batch profile error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch profile pics",
//       error: error.message,
//     });
//   }
// };


const batchProfileData = async (req, res) => {
  const employeeData = req.body;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // 1. Collect all user_ids
    const userIds = employeeData.map(emp => `'${emp.user_id}'`).join(',');

    // 2. Query all profiles at once using IN clause
    const query = `SELECT *	FROM Users WHERE User_Id IN (${userIds})`;
    const queryResp = await zcql.executeZCQLQuery(query);

    // 3. Build a map of user_id => profile_link
    const profileMap = {};
    const phoneMap = {};

    queryResp.forEach(entry => {
      const { User_Id, Profile_Link, Phone, ReporterID, ReporterName, ReporterImage, EmpID, TeamID, TeamName, Shift_Start_Time, Shift_End_Time, Location } = entry.Users;
      profileMap[User_Id] = {
        profile_pic: Profile_Link,
        reporter_id: ReporterID,
        reporter_name: ReporterName,
        reporter_profile: ReporterImage,
        team_id: TeamID,
        team_name: TeamName,
        emp_id: EmpID,
        shift_start_time: Shift_Start_Time,
        shift_end_time: Shift_End_Time,
        location: Location,

      };
      phoneMap[User_Id] = Phone;
    });




    // Merge data
    const updatedEmployees = employeeData.map(emp => {
      const profile = profileMap[emp.user_id] || {};

      return {
        ...emp,
        profile_pic: profile.profile_pic || null,
        reporter_id: profile.reporter_id || null,
        reporter_name: profile.reporter_name || null,
        reporter_profile: profile.reporter_profile || null,
        emp_id: profile.emp_id || null,
        team_id: profile.team_id || null,
        team_name: profile.team_name || null,
        phone: phoneMap[emp.user_id] || null,
        shift_start_time: profile.shift_start_time || null,
        shift_end_time: profile.shift_end_time || null,
        location: profile.location || null,
      };
    });


    console.log("profile", updatedEmployees);


    res.status(200).json({
      success: true,
      data: updatedEmployees,
    });
  } catch (error) {
    console.error("Batch profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile pics",
      error: error.message,
    });
  }
};


module.exports = {
  updateProfile,
  updateCover,
  getProfile,
  getCover,
  updateProfileData,
  getProfileData,
  batchProfileData
};
