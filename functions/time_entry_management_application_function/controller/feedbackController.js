"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const cors = require("cors");

const path = require("path");

app.use(express.json()); // To handle text data if sent as JSON
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cors());
const fileUpload = require("express-fileupload");
const catalyst = require("zcatalyst-sdk-node");
app.use(fileUpload());
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const os = require("os");
const fs = require("fs");
// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const getFeedback = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const feedBacktable = datastore.table("Feedback");
    const feedback = await feedBacktable.getAllRows();
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// const addFeedback = async (req, res) => {
//   try {
//     const catalystApp = req.catalystApp;
//     const datastore = catalystApp.datastore();
//     const feedBacktable = datastore.table("Feedback");
//     const rowData = req.body;
//     console.log(rowData);
//     const createdRecord = await feedBacktable.insertRow(rowData);
//     console.log("createdRecord", createdRecord);

//     res.status(200).json({
//       success: true,
//       data: createdRecord,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to add task",
//       error: error.message,
//     });
//   }
// };

// const addImages = async (req,res)=>{
//    const user_ID = req.params.user_ID;
//     console.log("Received profile update request for user:", user_ID);
  
//     if (!req.files || !req.files.profile) {
//       return res.status(400).json({
//         success: false,
//         message: "No profile file uploaded.",
//       });
//     }
  
//     const file = req.files.profile;
  
//     try {
//       const catalystApp = req.catalystApp;
//       const stratus = catalystApp.stratus();
//       const bucket = stratus.bucket("dsv365");
  
//       const timestamp = Date.now();
//       const uniqueFileName = `${timestamp}_${file.name}`;
//       const uploadPath = `dsv365/feedback/${uniqueFileName}`;
//       const tempFilePath = path.join(os.tmpdir(), file.name);
  
//       // Move file to temporary location
//       await file.mv(tempFilePath);
  
//       // Upload file to Catalyst Stratus
//       await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));
  
//       const uploadedObject = bucket.object(uploadPath);
//       const objectDetails = await uploadedObject.getDetails();
//       const profileURL = objectDetails.object_url;
  
//       console.log("File successfully uploaded to Catalyst Stratus:", profileURL);
  
//       // Update user's profile link in database
//       const zcql = catalystApp.zcql();
//       const updateQuery = `UPDATE Users SET Users.Profile_Link = '${profileURL}' WHERE User_ID = '${user_ID}'`;
  
//       // const updateResult = await zcql.executeZCQLQuery(updateQuery);
  
//       return res.status(200).json({
//         success: true,
//         message: "Profile updated successfully.",
//         profileURL,
//         result: profileURL,
//       });
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       return res.status(500).json({
//         success: false,
//         message: "An error occurred while updating the profile.",
//         error: error.message,
//       });
//     }
// }

// const addImages = async (req, res) => {
//   const user_ID = req.params.user_ID;
//   console.log("Received profile update request for user:", user_ID);

//   if (!req.files || !req.files.profile) {
//     return res.status(400).json({
//       success: false,
//       message: "No profile file uploaded.",
//     });
//   }

//   const catalystApp = req.catalystApp;
//   const stratus = catalystApp.stratus();
//   const bucket = stratus.bucket("dsv365");

//   const uploadedURLs = [];

//   // Ensure profile is always an array
//   const files = Array.isArray(req.files.profile)
//     ? req.files.profile
//     : [req.files.profile];

//   try {
//     for (const file of files) {
//       const timestamp = Date.now();
//       const uniqueFileName = `${timestamp}_${file.name}`;
//       const uploadPath = `dsv365/feedback/${uniqueFileName}`;
//       const tempFilePath = path.join(os.tmpdir(), file.name);

//       // Move file to temporary location
//       await file.mv(tempFilePath);

//       // Upload to Catalyst Stratus
//       await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

//       const uploadedObject = bucket.object(uploadPath);
//       const objectDetails = await uploadedObject.getDetails();
//       const profileURL = objectDetails.object_url;

//       console.log("Uploaded file URL:", profileURL);
//       uploadedURLs.push(profileURL);
//     }
//     console.log("uploaded url", uploadedURLs);

//     // Join URLs into a comma-separated string
//     const allImageURLs = uploadedURLs.join(",");
//     console.log("aall image", allImageURLs);

//     // Update DB with all image URLs
//     const zcql = catalystApp.zcql();
//     const updateQuery = `UPDATE Feedback SET Feedback.Images = '${allImageURLs}' WHERE User_ID = '${user_ID}'`;

//     await zcql.executeZCQLQuery(updateQuery);

//     return res.status(200).json({
//       success: true,
//       message: "Images uploaded successfully.",
//       imageLinks: uploadedURLs,
//       joinedLinks: allImageURLs,
//     });
//   } catch (error) {
//     console.error("Error uploading images:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while uploading images.",
//       error: error.message,
//     });
//   }
// };

const addImages = async (req, res) => {
  const user_ID = req.params.user_ID;
  console.log(`📥 Received image upload for User_ID: ${user_ID}`);

  if (!req.files || !req.files.profile) {
    return res.status(400).json({
      success: false,
      message: "No profile images uploaded.",
    });
  }

  const catalystApp = req.catalystApp;
  const stratus = catalystApp.stratus();
  const bucket = stratus.bucket("dsv365");

  const files = Array.isArray(req.files.profile)
    ? req.files.profile
    : [req.files.profile];

  const uploadedURLs = [];

  try {
    for (const file of files) {
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;
      const uploadPath = `dsv365/feedback/${uniqueFileName}`;
      const tempFilePath = path.join(os.tmpdir(), file.name);

      // Save temporarily & upload to Stratus
      await file.mv(tempFilePath);
      await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

      const uploadedObject = bucket.object(uploadPath);
      const objectDetails = await uploadedObject.getDetails();
      uploadedURLs.push(objectDetails.object_url);
    }

    const allImageURLs = uploadedURLs.join(",");
    console.log("✅ Uploaded URLs:", allImageURLs);

    // Update DB
    const zcql = catalystApp.zcql();

   
    const createdRecord = await table.insertRow(projectData);
    const updateQuery = `UPDATE Feedback SET Feedback.Images = '${allImageURLs}' WHERE User_ID = '${user_ID}'`;
    await zcql.executeZCQLQuery(updateQuery);

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully.",
      imageLinks: uploadedURLs,
      joinedLinks: allImageURLs,
    });
  } catch (error) {
    console.error("❌ Error uploading images:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while uploading images.",
      error: error.message,
    });
  }
};

const addFeedback = async (req, res) => {
  const { Name, Email, Message, User_ID } = req.body;
  const catalystApp = req.catalystApp;
  const zcql = catalystApp.zcql();


  const uploadedURLs = [];

  try {
    if (req.files && req.files.profile) {
      const stratus = catalystApp.stratus();
      const bucket = stratus.bucket("dsv365");
      console.log("one");
      const files = Array.isArray(req.files.profile)
        ? req.files.profile
        : [req.files.profile];
        console.log("Two");
      for (const file of files) {
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}_${file.name}`;
        const uploadPath = `dsv365/feedback/${uniqueFileName}`;
        const tempFilePath = path.join(os.tmpdir(), uniqueFileName);
        console.log("Three");
        await file.mv(tempFilePath);
        await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));
        
        const uploadedObject = bucket.object(uploadPath);
        const objectDetails = await uploadedObject.getDetails();
        uploadedURLs.push(objectDetails.object_url);
      }
    }
   
    const Images = uploadedURLs.join(",");

    const data = {
      Name: Name,
      Message: Message,
      Email: Email,
      User_ID: User_ID,
      Status: false, // boolean
      Images: Images, // comma-separated string
    };
    
    const datastore = catalystApp.datastore();
    const table = datastore.table("Feedback"); // Not "Projects"!
    const result = await table.insertRow(data);
   
    res.status(200).json({
      success: true,
      message: "Feedback and images submitted successfully.",
      data: result,
      uploadedImages: uploadedURLs,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Submission failed.",
      error: error.message,
    });
  }
};



module.exports = {
  getFeedback,
  addFeedback,
  addImages,
};
